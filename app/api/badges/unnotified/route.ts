import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/badges/unnotified — fetch unnotified badges for current user
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const unnotified = await prisma.userBadge.findMany({
        where: {
            userId: session.user.id,
            notified: false,
        },
        include: {
            badge: true,
        },
        orderBy: { earnedAt: "asc" },
    })

    const formatted = unnotified.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        earnedAt: ub.earnedAt.toISOString(),
    }))

    return NextResponse.json(formatted)
}

// POST /api/badges/unnotified — mark all unnotified badges as notified
export async function POST() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use raw SQL to avoid Neon HTTP adapter transaction limitation
    await prisma.$executeRawUnsafe(
        `UPDATE "UserBadge" SET "notified" = true WHERE "userId" = $1 AND "notified" = false`,
        session.user.id
    )

    return NextResponse.json({ ok: true })
}
