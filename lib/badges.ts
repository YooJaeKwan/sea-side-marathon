import { prisma } from "@/lib/prisma"

export interface EarnedBadge {
    id: string
    name: string
    description: string
    icon: string
    earnedAt: Date
}

const BADGE_DEFINITIONS = [
    { name: "시작이 반", description: "첫 번째 인증글을 작성했습니다.", icon: "🌱" },
    { name: "꾸준함의 상징", description: "3일 연속으로 인증에 성공했습니다.", icon: "🔥" },
    { name: "러닝 머신", description: "7일 연속으로 인증에 성공했습니다.", icon: "⚡" },
    { name: "철인 28호", description: "한 달(28일) 연속 인증의 대기록!", icon: "🦾" },
    { name: "영종도 앰배서더", description: "누적 거리 50km를 달성했습니다.", icon: "🌊" },
    { name: "울트라 러너", description: "누적 거리 100km를 달성했습니다.", icon: "👑" },
    { name: "지구 한 바퀴 꿈나무", description: "누적 거리 200km를 돌파했습니다!", icon: "🌍" },
    { name: "새벽 공기 수집가", description: "오전 6시 이전에 러닝을 인증했습니다.", icon: "🌅" },
    { name: "심야의 질주", description: "오후 10시 이후에 열정적인 러닝을 인증했습니다.", icon: "🌛" },
    { name: "주말의 전사", description: "토요일과 일요일 모두 인증에 성공했습니다.", icon: "⚔️" },
    { name: "베스트 메이트", description: "동료들로부터 좋아요를 10번 받았습니다.", icon: "🙌" },
    { name: "인기쟁이", description: "게시글에 좋아요가 30개 쌓였습니다.", icon: "💖" },
    { name: "마당발", description: "다른 러너들의 글에 댓글을 20개 남겼습니다.", icon: "🗨️" },
    { name: "폭우를 뚫고", description: "'비'가 오는 날에도 멈추지 않는 열정!", icon: "☔" },
    { name: "해안도로 수호자", description: "10km 부문에서 5회 이상 인증했습니다.", icon: "🛡️" },
    { name: "하프 마스터", description: "5km 부문에서 10회 이상 인증했습니다.", icon: "🎯" },
    { name: "티 타임 리더", description: "Tea 부문 참여자 중 소통왕(댓글 10개)!", icon: "🍵" },
    { name: "페이스 메이커", description: "5명 이상의 러너에게 좋아요를 보냈습니다.", icon: "🏃" },
    { name: "오늘의 주인공", description: "오늘 하루 가장 먼저 인증글을 올렸습니다.", icon: "⭐" },
    { name: "성장하는 러너", description: "지난달보다 주행 거리가 늘어났습니다!", icon: "📈" }
]

/**
 * Ensures that the Badge table is populated. 
 * This is a safety measure for production environments where seeding might be skipped.
 */
export async function ensureBadgesExist() {
    const count = await prisma.badge.count()
    if (count === 0) {
        console.log("[Badges] Badge table is empty. Auto-seeding...")
        for (const b of BADGE_DEFINITIONS) {
            await prisma.badge.create({ data: b })
        }
        console.log("[Badges] Auto-seeding complete.")
    }
}

function getKSTHour(date: Date) {
    // Server is likely in UTC. KST is UTC+9.
    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000)
    return kstDate.getUTCHours()
}

export async function awardBadges(userId: string): Promise<EarnedBadge[]> {
    console.log(`[Badges] Awarding badges for user: ${userId}`)

    // Safety check: ensure badges exist in DB
    await ensureBadgesExist()

    // 1. Fetch user data for badge calculation
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            posts: {
                include: {
                    _count: {
                        select: {
                            likes: true,
                            comments: true
                        }
                    },
                }
            },
            comments: true,
            likes: true, // likes GIVEN by this user
        }
    })

    if (!user) {
        console.warn(`[Badges] User not found: ${userId}`)
        return []
    }

    // 2. Fetch all available badges
    const allBadges = await prisma.badge.findMany()

    // 3. Simple stats
    const totalKm = user.posts.reduce((sum: number, p: any) => sum + (p.distance || 0), 0)
    const totalLikesReceived = user.posts.reduce((sum: number, p: any) => sum + (p._count?.likes || 0), 0)

    // Use KST hours for time-based badges
    const kstHours = user.posts.map((p: any) => getKSTHour(new Date(p.createdAt)))

    // 4. Calculate which badges should be awarded
    const earnedBadgeNames: string[] = []

    if (user.posts.length >= 1) earnedBadgeNames.push("시작이 반")
    if (totalKm >= 50) earnedBadgeNames.push("영종도 앰배서더")
    if (totalKm >= 100) earnedBadgeNames.push("울트라 러너")
    if (totalKm >= 200) earnedBadgeNames.push("지구 한 바퀴 꿈나무")

    if (kstHours.some((h: number) => h < 6)) earnedBadgeNames.push("새벽 공기 수집가")
    if (kstHours.some((h: number) => h >= 22)) earnedBadgeNames.push("심야의 질주")

    if (totalLikesReceived >= 30) earnedBadgeNames.push("인기쟁이")
    if (user.comments.length >= 20) earnedBadgeNames.push("마당발")
    if (user.posts.some((p: any) => p.content?.includes("비"))) earnedBadgeNames.push("폭우를 뚫고")

    // Streak Calculation (Using KST dates)
    let streakDays = 0
    if (user.posts.length > 0) {
        const getKSTDateString = (date: Date) => {
            const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000)
            return kst.getUTCFullYear() + "-" + (kst.getUTCMonth() + 1) + "-" + kst.getUTCDate()
        }

        const todayKST = getKSTDateString(new Date())
        const postDateStrings = [...new Set(user.posts.map((p: any) => getKSTDateString(new Date(p.createdAt))))].sort((a, b) => b.localeCompare(a))

        // Check streak
        const parseDate = (s: string) => {
            const [y, m, d] = s.split("-").map(Number)
            return new Date(Date.UTC(y, m - 1, d)).getTime()
        }

        const latestPostTime = parseDate(postDateStrings[0])
        const todayTime = parseDate(todayKST)
        const diffDays = (todayTime - latestPostTime) / (1000 * 60 * 60 * 24)

        if (diffDays <= 1) {
            streakDays = 1
            for (let i = 1; i < postDateStrings.length; i++) {
                const gap = (parseDate(postDateStrings[i - 1]) - parseDate(postDateStrings[i])) / (1000 * 60 * 60 * 24)
                if (gap === 1) streakDays++
                else break
            }
        }
    }

    if (streakDays >= 3) earnedBadgeNames.push("꾸준함의 상징")
    if (streakDays >= 7) earnedBadgeNames.push("러닝 머신")
    if (streakDays >= 28) earnedBadgeNames.push("철인 28호")

    // Check if first post of the day (globally in KST)
    const now = new Date()
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    const kstTodayStart = new Date(Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()))
    // Convert KST start back to UTC for query
    const utcTodayStart = new Date(kstTodayStart.getTime() - 9 * 60 * 60 * 1000)

    const firstPostToday = await prisma.post.findFirst({
        where: { createdAt: { gte: utcTodayStart } },
        orderBy: { createdAt: "asc" },
        select: { userId: true }
    })
    if (firstPostToday?.userId === userId) earnedBadgeNames.push("오늘의 주인공")

    if (user.category === "10km" && user.posts.length >= 5) earnedBadgeNames.push("해안도로 수호자")
    if (user.category === "5km" && user.posts.length >= 10) earnedBadgeNames.push("하프 마스터")
    if (user.category === "Tea" && user.comments.length >= 10) earnedBadgeNames.push("티 타임 리더")

    if (user.likes.length >= 5) earnedBadgeNames.push("페이스 메이커")

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
            data: { userId, badgeId: badge.id }
        })
        newlyEarnedBadges.push({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            earnedAt: created.earnedAt
        })
    }

    console.log(`[Badges] Finished awarding badges. New: ${newlyEarnedBadges.length}`)
    return newlyEarnedBadges
}
