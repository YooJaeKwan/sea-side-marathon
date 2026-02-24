import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/ranking — ranking by certification days this month
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

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
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
                select: { distance: true, createdAt: true },
            },
        },
    })

    const ranking = users
        .map((user) => {
            // Count unique days with posts
            const uniqueDays = new Set(user.posts.map((p) => p.createdAt.getDate()))
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
