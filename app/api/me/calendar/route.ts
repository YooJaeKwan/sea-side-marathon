import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/me/calendar?year=2026&month=2 — get run dates for a month
export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()))
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1))

    // Get start and end of month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const posts = await prisma.post.findMany({
        where: {
            userId: session.user.id,
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: { createdAt: true },
    })

    // Extract unique day numbers
    const runDates = [...new Set(posts.map((p) => p.createdAt.getDate()))]

    return NextResponse.json({ year, month, runDates })
}
