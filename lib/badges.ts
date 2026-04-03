import { prisma } from "@/lib/prisma"

export interface EarnedBadge {
    id: string
    name: string
    description: string
    icon: string
    earnedAt: Date
}

const BADGE_DEFINITIONS = [
    // --- Total certification count badges ---
    { name: "시작이 반", description: "첫 번째 인증글을 작성했습니다.", icon: "🌱" },
    { name: "두 번째 발걸음", description: "2회 인증 달성! 다시 나왔네요!", icon: "👣" },
    { name: "세 번이면 습관", description: "3회 인증! 습관이 되어가요.", icon: "🔰" },
    { name: "네 잎 클로버", description: "4회 인증! 행운이 함께해요.", icon: "🍀" },
    { name: "하이파이브", description: "5회 인증 달성! ✋", icon: "🖐️" },
    { name: "여섯 번째 도전", description: "6회 인증! 꾸준하시네요.", icon: "🎲" },
    { name: "럭키세븐", description: "7회 인증! 행운의 숫자.", icon: "🎰" },
    { name: "팔방미인", description: "8회 인증! 다재다능한 러너.", icon: "🎪" },
    { name: "아홉 걸음", description: "9회 인증! 정상이 가까워요.", icon: "🧗" },
    { name: "두 자릿수", description: "10회 인증 돌파! 🎉", icon: "🔟" },
    { name: "열다섯 번의 도전", description: "15회 인증! 대단합니다.", icon: "🎖️" },
    { name: "스무 고개", description: "20회 인증! 고개를 넘었어요.", icon: "🗻" },
    { name: "25번째 발자국", description: "25회 인증! 발자국이 선명합니다.", icon: "🐾" },
    { name: "서른 번의 열정", description: "30회 인증! 열정 가득.", icon: "🔥" },
    { name: "35번째 습관", description: "35회 인증! 의지의 달인.", icon: "💪" },
    { name: "불혹의 러너", description: "40회 인증! 흔들림 없는 러너.", icon: "🧘" },

    // --- Consecutive day streak badges ---
    { name: "다시 오늘도", description: "2일 연속 인증! 시작이 좋습니다.", icon: "🔄" },
    { name: "꾸준함의 상징", description: "3일 연속으로 인증에 성공했습니다.", icon: "🔥" },
    { name: "습관의 시작", description: "4일 연속 인증! 습관이 되어가고 있어요.", icon: "💫" },
    { name: "평일 완주", description: "5일 연속 인증! 한 주를 채웠어요.", icon: "🏅" },
    { name: "멈출 수 없는 발걸음", description: "6일 연속 인증! 대단해요.", icon: "🦶" },
    { name: "러닝 머신", description: "7일 연속으로 인증에 성공했습니다.", icon: "⚡" },
    { name: "주말도 달린다", description: "8일 연속 인증! 쉬는 날도 없네요.", icon: "🌈" },
    { name: "러닝 중독자", description: "9일 연속 인증! 중독 수준.", icon: "💉" },
    { name: "열흘의 기적", description: "10일 연속 인증! 대기록!", icon: "✨" },
    { name: "보름 연속", description: "15일 연속 인증! 반달이 떴어요.", icon: "🌕" },
    { name: "20일 연속 전설", description: "20일 연속 인증! 전설이 됩니다.", icon: "🏆" },
    { name: "25일 연속 신화", description: "25일 연속 인증! 신화를 쓰고 있어요.", icon: "🐉" },
    { name: "철인 28호", description: "한 달(28일) 연속 인증의 대기록!", icon: "🦾" },

    // --- Weekly 3+ runs badge ---
    { name: "이번 주 열심러너", description: "한 주에 3회 이상 러닝 인증!", icon: "🗓️" },

    // --- Comeback badge ---
    { name: "돌아온 러너", description: "5일 이상 쉬었다가 다시 인증! 돌아온 것을 환영합니다.", icon: "🦅" },

    // --- Distance badges ---
    { name: "영종도 앰배서더", description: "누적 거리 50km를 달성했습니다.", icon: "🌊" },
    { name: "울트라 러너", description: "누적 거리 100km를 달성했습니다.", icon: "👑" },
    { name: "지구 한 바퀴 꿈나무", description: "누적 거리 200km를 돌파했습니다!", icon: "🌍" },

    // --- Time-based badges ---
    { name: "새벽 공기 수집가", description: "오전 6시 이전에 러닝을 인증했습니다.", icon: "🌅" },
    { name: "심야의 질주", description: "오후 10시 이후에 열정적인 러닝을 인증했습니다.", icon: "🌛" },

    // --- Social badges ---
    { name: "주말의 전사", description: "토요일과 일요일 모두 인증에 성공했습니다.", icon: "⚔️" },
    { name: "베스트 메이트", description: "동료들로부터 좋아요를 10번 받았습니다.", icon: "🙌" },
    { name: "인기쟁이", description: "게시글에 좋아요가 30개 쌓였습니다.", icon: "💖" },
    { name: "마당발", description: "다른 러너들의 글에 댓글을 20개 남겼습니다.", icon: "🗨️" },
    { name: "폭우를 뚫고", description: "'비'가 오는 날에도 멈추지 않는 열정!", icon: "☔" },

    // --- Category badges ---
    { name: "해안도로 수호자", description: "10km 부문에서 5회 이상 인증했습니다.", icon: "🛡️" },
    { name: "하프 마스터", description: "5km 부문에서 10회 이상 인증했습니다.", icon: "🎯" },
    { name: "티 타임 리더", description: "Tea 부문 참여자 중 소통왕(댓글 10개)!", icon: "🍵" },
    { name: "페이스 메이커", description: "5명 이상의 러너에게 좋아요를 보냈습니다.", icon: "🏃" },
    { name: "오늘의 주인공", description: "오늘 하루 가장 먼저 인증글을 올렸습니다.", icon: "⭐" },
    { name: "성장하는 러너", description: "지난달보다 주행 거리가 늘어났습니다!", icon: "📈" }
]

/**
 * Ensures that the Badge table is populated and up-to-date.
 * Uses upsert-style logic: adds any new badges that don't exist yet.
 */
export async function ensureBadgesExist() {
    const existingBadges = await prisma.badge.findMany({ select: { name: true } })
    const existingNames = new Set(existingBadges.map(b => b.name))

    const newBadges = BADGE_DEFINITIONS.filter(b => !existingNames.has(b.name))

    if (newBadges.length > 0) {
        console.log(`[Badges] Adding ${newBadges.length} new badge definitions...`)
        for (const b of newBadges) {
            await prisma.badge.create({ data: b })
        }
        console.log(`[Badges] Done adding new badges.`)
    }
}

function getKSTHour(date: Date) {
    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000)
    return kstDate.getUTCHours()
}

function getKSTDateString(date: Date) {
    const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000)
    return kst.getUTCFullYear() + "-" + (kst.getUTCMonth() + 1) + "-" + kst.getUTCDate()
}

function parseDate(s: string) {
    const [y, m, d] = s.split("-").map(Number)
    return new Date(Date.UTC(y, m - 1, d)).getTime()
}

/**
 * Calculate the maximum consecutive day streak from a sorted array of unique KST date strings.
 * Also returns whether there was a comeback (gap >= 5 days between consecutive posts).
 */
function analyzeStreaks(sortedUniqueDates: string[]): { maxStreak: number; hasComeback: boolean } {
    if (sortedUniqueDates.length === 0) return { maxStreak: 0, hasComeback: false }
    if (sortedUniqueDates.length === 1) return { maxStreak: 1, hasComeback: false }

    let maxStreak = 1
    let currentStreak = 1
    let hasComeback = false

    for (let i = 1; i < sortedUniqueDates.length; i++) {
        const prevTime = parseDate(sortedUniqueDates[i - 1])
        const currTime = parseDate(sortedUniqueDates[i])
        const gapDays = (currTime - prevTime) / (1000 * 60 * 60 * 24)

        if (gapDays === 1) {
            currentStreak++
            if (currentStreak > maxStreak) maxStreak = currentStreak
        } else {
            currentStreak = 1
            if (gapDays >= 5) {
                hasComeback = true
            }
        }
    }

    return { maxStreak, hasComeback }
}

/**
 * Check if any ISO week has 3+ certification days.
 */
function hasWeeklyThreeRuns(sortedUniqueDates: string[]): boolean {
    const weekCounts: Record<string, number> = {}

    for (const dateStr of sortedUniqueDates) {
        const time = parseDate(dateStr)
        const date = new Date(time)
        // ISO week calculation
        date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
        const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
        const weekKey = `${date.getUTCFullYear()}-W${weekNo}`
        weekCounts[weekKey] = (weekCounts[weekKey] || 0) + 1
    }

    return Object.values(weekCounts).some(count => count >= 3)
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
                },
                orderBy: { createdAt: "asc" }
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

    // 3. Basic stats
    const totalPosts = user.posts.length
    const totalKm = user.posts.reduce((sum: number, p: any) => sum + (p.distance || 0), 0)
    const totalLikesReceived = user.posts.reduce((sum: number, p: any) => sum + (p._count?.likes || 0), 0)

    // KST hours for time-based badges
    const kstHours = user.posts.map((p: any) => getKSTHour(new Date(p.createdAt)))

    // Unique KST dates for streak analysis, sorted ascending
    const postDateStrings = [...new Set(user.posts.map((p: any) => getKSTDateString(new Date(p.createdAt))))]
    postDateStrings.sort((a, b) => parseDate(a) - parseDate(b))

    // Analyze streaks and comebacks
    const { maxStreak, hasComeback } = analyzeStreaks(postDateStrings)

    // Check weekly 3+ runs
    const hasWeekly3 = hasWeeklyThreeRuns(postDateStrings)

    // 4. Calculate which badges should be awarded
    const earnedBadgeNames: string[] = []

    // --- Total certification count badges ---
    if (totalPosts >= 1) earnedBadgeNames.push("시작이 반")
    if (totalPosts >= 2) earnedBadgeNames.push("두 번째 발걸음")
    if (totalPosts >= 3) earnedBadgeNames.push("세 번이면 습관")
    if (totalPosts >= 4) earnedBadgeNames.push("네 잎 클로버")
    if (totalPosts >= 5) earnedBadgeNames.push("하이파이브")
    if (totalPosts >= 6) earnedBadgeNames.push("여섯 번째 도전")
    if (totalPosts >= 7) earnedBadgeNames.push("럭키세븐")
    if (totalPosts >= 8) earnedBadgeNames.push("팔방미인")
    if (totalPosts >= 9) earnedBadgeNames.push("아홉 걸음")
    if (totalPosts >= 10) earnedBadgeNames.push("두 자릿수")
    if (totalPosts >= 15) earnedBadgeNames.push("열다섯 번의 도전")
    if (totalPosts >= 20) earnedBadgeNames.push("스무 고개")
    if (totalPosts >= 25) earnedBadgeNames.push("25번째 발자국")
    if (totalPosts >= 30) earnedBadgeNames.push("서른 번의 열정")
    if (totalPosts >= 35) earnedBadgeNames.push("35번째 습관")
    if (totalPosts >= 40) earnedBadgeNames.push("불혹의 러너")

    // --- Consecutive day streak badges (historical maxStreak) ---
    if (maxStreak >= 2) earnedBadgeNames.push("다시 오늘도")
    if (maxStreak >= 3) earnedBadgeNames.push("꾸준함의 상징")
    if (maxStreak >= 4) earnedBadgeNames.push("습관의 시작")
    if (maxStreak >= 5) earnedBadgeNames.push("평일 완주")
    if (maxStreak >= 6) earnedBadgeNames.push("멈출 수 없는 발걸음")
    if (maxStreak >= 7) earnedBadgeNames.push("러닝 머신")
    if (maxStreak >= 8) earnedBadgeNames.push("주말도 달린다")
    if (maxStreak >= 9) earnedBadgeNames.push("러닝 중독자")
    if (maxStreak >= 10) earnedBadgeNames.push("열흘의 기적")
    if (maxStreak >= 15) earnedBadgeNames.push("보름 연속")
    if (maxStreak >= 20) earnedBadgeNames.push("20일 연속 전설")
    if (maxStreak >= 25) earnedBadgeNames.push("25일 연속 신화")
    if (maxStreak >= 28) earnedBadgeNames.push("철인 28호")

    // --- Weekly 3+ runs ---
    if (hasWeekly3) earnedBadgeNames.push("이번 주 열심러너")

    // --- Comeback ---
    if (hasComeback) earnedBadgeNames.push("돌아온 러너")

    // --- Distance badges ---
    if (totalKm >= 50) earnedBadgeNames.push("영종도 앰배서더")
    if (totalKm >= 100) earnedBadgeNames.push("울트라 러너")
    if (totalKm >= 200) earnedBadgeNames.push("지구 한 바퀴 꿈나무")

    // --- Time-based badges ---
    if (kstHours.some((h: number) => h < 6)) earnedBadgeNames.push("새벽 공기 수집가")
    if (kstHours.some((h: number) => h >= 22)) earnedBadgeNames.push("심야의 질주")

    // --- Social badges ---
    if (totalLikesReceived >= 30) earnedBadgeNames.push("인기쟁이")
    if (user.comments.length >= 20) earnedBadgeNames.push("마당발")
    if (user.posts.some((p: any) => p.content?.includes("비"))) earnedBadgeNames.push("폭우를 뚫고")

    // Check likes received >= 10
    if (totalLikesReceived >= 10) earnedBadgeNames.push("베스트 메이트")

    // Check if first post of the day (globally in KST)
    const now = new Date()
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    const kstTodayStart = new Date(Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()))
    const utcTodayStart = new Date(kstTodayStart.getTime() - 9 * 60 * 60 * 1000)

    const firstPostToday = await prisma.post.findFirst({
        where: { createdAt: { gte: utcTodayStart } },
        orderBy: { createdAt: "asc" },
        select: { userId: true }
    })
    if (firstPostToday?.userId === userId) earnedBadgeNames.push("오늘의 주인공")

    // Weekend warrior: check Saturday (day 6) and Sunday (day 0) posts
    const kstPostDays = user.posts.map((p: any) => {
        const kst = new Date(new Date(p.createdAt).getTime() + 9 * 60 * 60 * 1000)
        return kst.getUTCDay()
    })
    if (kstPostDays.includes(0) && kstPostDays.includes(6)) earnedBadgeNames.push("주말의 전사")

    // Category badges
    if (user.category === "10km" && totalPosts >= 5) earnedBadgeNames.push("해안도로 수호자")
    if (user.category === "5km" && totalPosts >= 10) earnedBadgeNames.push("하프 마스터")
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
