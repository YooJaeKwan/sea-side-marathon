import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/ranking — ranking by certification days this month (KST aware)
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use KST for "Month" boundaries
    const now = new Date()
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)

    const kstYear = kstNow.getUTCFullYear()
    const kstMonth = kstNow.getUTCMonth()

    const startOfMonthKST = new Date(Date.UTC(kstYear, kstMonth, 1))
    const endOfMonthKST = new Date(Date.UTC(kstYear, kstMonth + 1, 0, 23, 59, 59, 999))

    // Convert back to UTC for Prisma filter
    const startOfMonthUTC = new Date(startOfMonthKST.getTime() - 9 * 60 * 60 * 1000)
    const endOfMonthUTC = new Date(endOfMonthKST.getTime() - 9 * 60 * 60 * 1000)

    // Get all users with their posts this month
    const users = await prisma.user.findMany({
        where: { isOnboarded: true },
        select: {
            id: true,
            name: true,
            initials: true,
            image: true,
            posts: {
                where: {
                    createdAt: {
                        gte: startOfMonthUTC,
                        lte: endOfMonthUTC,
                    },
                },
                select: { distance: true, createdAt: true },
            },
        },
    })

    const ranking = users
        .map((user) => {
            // Count unique days with posts (in KST)
            const uniqueDays = new Set(user.posts.map((p) => {
                const kst = new Date(p.createdAt.getTime() + 9 * 60 * 60 * 1000)
                return kst.getUTCDate()
            }))
            const totalKm = user.posts.reduce((sum, p) => sum + p.distance, 0)

            return {
                name: user.name,
                initials: user.initials || user.name.slice(0, 2).toUpperCase(),
                avatar: user.image || "",
                certDays: uniqueDays.size,
                totalKm: Math.round(totalKm * 10) / 10,
            }
        })
        .filter((u) => u.certDays > 0)
        .sort((a, b) => b.certDays - a.certDays || b.totalKm - a.totalKm)
        .map((u, i) => ({ ...u, rank: i + 1 }))

    return NextResponse.json(ranking)
}
