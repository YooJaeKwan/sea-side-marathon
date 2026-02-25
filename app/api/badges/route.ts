import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { awardBadges, ensureBadgesExist } from "@/lib/badges"

export const dynamic = "force-dynamic"

// GET /api/badges — all badges + user's earned ones (+ auto-award logic)
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // 1. Ensure badges exist in master table
    await ensureBadgesExist()

    // 2. Award badges (updates DB and returns newly earned)
    await awardBadges(userId)

    // 3. Fetch all available badges
    const allBadges = await prisma.badge.findMany()

    // 4. Return all badges with earned status
    const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true, earnedAt: true }
    })

    const earnedMap = new Map(userBadges.map(ub => [ub.badgeId, ub.earnedAt]))

    const formatted = allBadges.map((badge) => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        earned: earnedMap.has(badge.id),
        earnedDate: earnedMap.get(badge.id)?.toISOString() || null,
    }))

    return NextResponse.json(formatted)
}
