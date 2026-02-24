import { prisma } from "@/lib/prisma"

export interface EarnedBadge {
    id: string
    name: string
    description: string
    icon: string
    earnedAt: Date
}

export async function awardBadges(userId: string): Promise<EarnedBadge[]> {
    // 1. Fetch user data for badge calculation
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            posts: {
                include: {
                    _count: { select: { likes: true, waves: true } },
                }
            },
            comments: true,
            likes: true, // likes given
            waves: true, // waves given
        }
    })

    if (!user) return []

    // 2. Fetch all available badges
    const allBadges = await prisma.badge.findMany()

    // 3. Simple stats
    const totalKm = user.posts.reduce((sum: number, p: any) => sum + (p.distance || 0), 0)
    const totalLikesReceived = user.posts.reduce((sum: number, p: any) => sum + (p._count?.likes || 0), 0)
    const totalWavesReceived = user.posts.reduce((sum: number, p: any) => sum + (p._count?.waves || 0), 0)
    const times = user.posts.map((p: any) => new Date(p.createdAt).getHours())

    // 4. Calculate which badges should be awarded
    const earnedBadgeNames: string[] = []

    if (user.posts.length >= 1) earnedBadgeNames.push("시작이 반")
    if (totalKm >= 50) earnedBadgeNames.push("영종도 앰배서더")
    if (totalKm >= 100) earnedBadgeNames.push("울트라 러너")
    if (totalKm >= 200) earnedBadgeNames.push("지구 한 바퀴 꿈나무")
    if (times.some((h: number) => h < 6)) earnedBadgeNames.push("새벽 공기 수집가")
    if (times.some((h: number) => h >= 22)) earnedBadgeNames.push("심야의 질주")
    if (totalWavesReceived >= 10) earnedBadgeNames.push("베스트 메이트")
    if (totalLikesReceived >= 30) earnedBadgeNames.push("인기쟁이")
    if (user.comments.length >= 20) earnedBadgeNames.push("마당발")
    if (user.posts.some((p: any) => p.content?.includes("비"))) earnedBadgeNames.push("폭우를 뚫고")

    // Streak Calculation
    let streakDays = 0
    if (user.posts.length > 0) {
        const todayAtMidnight = new Date()
        todayAtMidnight.setHours(0, 0, 0, 0)
        const postDates = [...new Set(user.posts.map((p: any) => {
            const d = new Date(p.createdAt)
            d.setHours(0, 0, 0, 0)
            return d.getTime()
        }))].sort((a: any, b: any) => b - a)

        const diffMs = todayAtMidnight.getTime() - postDates[0]
        const diffDays = diffMs / (1000 * 60 * 60 * 24)
        if (diffDays <= 1) {
            streakDays = 1
            for (let i = 1; i < postDates.length; i++) {
                const gap = (postDates[i - 1] - postDates[i]) / (1000 * 60 * 60 * 24)
                if (gap === 1) streakDays++
                else break
            }
        }
    }

    if (streakDays >= 3) earnedBadgeNames.push("꾸준함의 상징")
    if (streakDays >= 7) earnedBadgeNames.push("러닝 머신")
    if (streakDays >= 28) earnedBadgeNames.push("철인 28호")

    // Check if first post of the day (globally)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const firstPostToday = await prisma.post.findFirst({
        where: { createdAt: { gte: todayStart } },
        orderBy: { createdAt: "asc" },
        select: { userId: true }
    })
    if (firstPostToday?.userId === userId) earnedBadgeNames.push("오늘의 주인공")

    if (user.category === "10km" && user.posts.length >= 5) earnedBadgeNames.push("해안도로 수호자")
    if (user.category === "5km" && user.posts.length >= 10) earnedBadgeNames.push("하프 마스터")
    if (user.category === "Tea" && user.comments.length >= 10) earnedBadgeNames.push("티 타임 리더")

    if (user.likes.length + user.waves.length >= 5) earnedBadgeNames.push("페이스 메이커")

    // 5. Save newly earned badges and collect them
    const alreadyEarned = await prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true }
    })
    const alreadyEarnedIds = new Set(alreadyEarned.map(ub => ub.badgeId))

    const newlyEarnedBadges: EarnedBadge[] = []
    const toAward = allBadges.filter(b => earnedBadgeNames.includes(b.name) && !alreadyEarnedIds.has(b.id))

    for (const badge of toAward) {
        const created = await prisma.userBadge.create({
            data: { userId, badgeId: badge.id },
            include: { badge: true }
        })
        newlyEarnedBadges.push({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            earnedAt: created.earnedAt
        })
    }

    return newlyEarnedBadges
}
