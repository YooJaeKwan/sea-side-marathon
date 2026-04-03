import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const yearParam = searchParams.get("year")
    const monthParam = searchParams.get("month")

    // Use KST for date boundaries
    const now = new Date()
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)

    const kstYear = yearParam ? parseInt(yearParam, 10) : kstNow.getUTCFullYear()
    const kstMonth = monthParam ? parseInt(monthParam, 10) - 1 : kstNow.getUTCMonth()

    // Check if this is the final ranking period (April 2026 = 4/1 ~ 5/16)
    const isFinalPeriod = kstYear === 2026 && kstMonth === 3 // month is 0-indexed, so 3 = April

    let startOfMonthKST: Date
    let endOfMonthKST: Date

    if (isFinalPeriod) {
        // Fixed period: 2026-04-01 ~ 2026-05-16 KST
        startOfMonthKST = new Date(Date.UTC(2026, 3, 1)) // April 1
        endOfMonthKST = new Date(Date.UTC(2026, 4, 16, 23, 59, 59, 999)) // May 16
    } else {
        startOfMonthKST = new Date(Date.UTC(kstYear, kstMonth, 1))
        endOfMonthKST = new Date(Date.UTC(kstYear, kstMonth + 1, 0, 23, 59, 59, 999))
    }

    // Convert back to UTC for Prisma filter
    const startOfMonthUTC = new Date(startOfMonthKST.getTime() - 9 * 60 * 60 * 1000)
    const endOfMonthUTC = new Date(endOfMonthKST.getTime() - 9 * 60 * 60 * 1000)

    // Get all users with their posts, comments, and badges
    const users = await prisma.user.findMany({
        where: { isOnboarded: true },
        select: {
            id: true,
            name: true,
            initials: true,
            image: true,
            posts: {
                select: { distance: true, duration: true, createdAt: true },
                orderBy: { createdAt: "asc" }
            },
            comments: {
                where: {
                    createdAt: {
                        gte: startOfMonthUTC,
                        lte: endOfMonthUTC,
                    },
                },
                select: { postId: true, post: { select: { userId: true } } },
            },
            likes: {
                where: {
                    createdAt: {
                        gte: startOfMonthUTC,
                        lte: endOfMonthUTC,
                    },
                },
                select: { postId: true, post: { select: { userId: true } } },
            },
            badges: {
                select: { id: true, badgeId: true, earnedAt: true },
            }
        },
    })

    const processedUsers = users.map((user) => {
        let attendanceDays = 0
        let currentTotalKm = 0
        let currentTotalMinutes = 0
        let currentMaxDistance = 0
        let currentMaxMinutes = 0

        let pastTotalKm = 0
        let pastMaxDistance = 0
        let pastMaxMinutes = 0

        let allTimeTotalKm = 0
        let allTimeTotalMinutes = 0

        const validKstDays = new Set<number>()
        const currentKstDaysSet = new Set<number>()
        const pastKstDaysSet = new Set<number>()

        user.posts.forEach((p) => {
            const isCurrentMonth = p.createdAt >= startOfMonthUTC && p.createdAt <= endOfMonthUTC
            const isPast = p.createdAt < startOfMonthUTC

            const kst = new Date(p.createdAt.getTime() + 9 * 60 * 60 * 1000)
            const dayCode = kst.getUTCFullYear() * 10000 + (kst.getUTCMonth() + 1) * 100 + kst.getUTCDate()

            const parts = p.duration.split(":")
            const h = parseInt(parts[0] || "0", 10)
            const m = parseInt(parts[1] || "0", 10)
            const mins = h * 60 + m

            // Accumulate all-time totals
            allTimeTotalKm += p.distance
            allTimeTotalMinutes += mins

            if (isPast) {
                pastKstDaysSet.add(dayCode)
                pastTotalKm += p.distance
                if (p.distance > pastMaxDistance) pastMaxDistance = p.distance
                if (mins > pastMaxMinutes) pastMaxMinutes = mins
            } else if (isCurrentMonth) {
                currentKstDaysSet.add(dayCode)
                currentTotalKm += p.distance
                currentTotalMinutes += mins
                if (p.distance > currentMaxDistance) currentMaxDistance = p.distance
                if (mins > currentMaxMinutes) currentMaxMinutes = mins

                if (p.distance >= 2 || mins >= 20) {
                    validKstDays.add(dayCode)
                }
            }
        })

        attendanceDays = validKstDays.size

        // Calculate weeks with >= 2 runs for PAST
        const pastWeekCounts: Record<string, number> = {}
        Array.from(pastKstDaysSet).forEach(dayCode => {
            const y = Math.floor(dayCode / 10000)
            const m = Math.floor((dayCode % 10000) / 100) - 1
            const d = dayCode % 100
            const date = new Date(Date.UTC(y, m, d))
            date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
            const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
            const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
            const weekKey = `${date.getUTCFullYear()}-W${weekNo}`
            pastWeekCounts[weekKey] = (pastWeekCounts[weekKey] || 0) + 1
        })
        let pastWeeksWithTwoRuns = 0
        Object.values(pastWeekCounts).forEach(count => {
            if (count >= 2) pastWeeksWithTwoRuns++
        })

        // Calculate weeks with >= 2 runs for TOTAL (Past + Current)
        const totalWeekCounts: Record<string, number> = {}
        const allKstDaysSet = new Set([...Array.from(pastKstDaysSet), ...Array.from(currentKstDaysSet)])
        Array.from(allKstDaysSet).forEach(dayCode => {
            const y = Math.floor(dayCode / 10000)
            const m = Math.floor((dayCode % 10000) / 100) - 1
            const d = dayCode % 100
            const date = new Date(Date.UTC(y, m, d))
            date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
            const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
            const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
            const weekKey = `${date.getUTCFullYear()}-W${weekNo}`
            totalWeekCounts[weekKey] = (totalWeekCounts[weekKey] || 0) + 1
        })
        let totalWeeksWithTwoRuns = 0
        Object.values(totalWeekCounts).forEach(count => {
            if (count >= 2) totalWeeksWithTwoRuns++
        })

        // Cheer logic
        let cheerCount = 0

        user.comments.forEach(c => {
            if (c.post.userId !== user.id) {
                cheerCount++
            }
        })
        user.likes.forEach(l => {
            if (l.post.userId !== user.id) {
                cheerCount++
            }
        })

        // Determine candidate statuses
        const challengeConditions: string[] = []
        if (isFinalPeriod) {
            // Final period criteria: cumulative 30km from April, weekly 2x for 3 weeks
            if (currentTotalKm >= 30) {
                challengeConditions.push("누적 30km 달성")
            }

            // Calculate weeks with >= 2 runs for the current period only
            const currentWeekCounts: Record<string, number> = {}
            Array.from(currentKstDaysSet).forEach(dayCode => {
                const y = Math.floor(dayCode / 10000)
                const m = Math.floor((dayCode % 10000) / 100) - 1
                const d = dayCode % 100
                const date = new Date(Date.UTC(y, m, d))
                date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
                const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
                const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
                const weekKey = `${date.getUTCFullYear()}-W${weekNo}`
                currentWeekCounts[weekKey] = (currentWeekCounts[weekKey] || 0) + 1
            })
            let currentWeeksWithTwoRuns = 0
            Object.values(currentWeekCounts).forEach(count => {
                if (count >= 2) currentWeeksWithTwoRuns++
            })
            if (currentWeeksWithTwoRuns >= 3) {
                challengeConditions.push("주 2회 3주 유지")
            }
        } else {
            // Legacy monthly criteria
            if (pastMaxDistance < 5 && currentMaxDistance >= 5) {
                challengeConditions.push("첫 5km 완주")
            }
            if (pastTotalKm < 20 && (pastTotalKm + currentTotalKm) >= 20) {
                challengeConditions.push("누적 20km")
            }
            if (pastWeeksWithTwoRuns < 3 && totalWeeksWithTwoRuns >= 3) {
                challengeConditions.push("첫 주 2회 3주")
            }
            if (pastMaxMinutes < 30 && currentMaxMinutes >= 30) {
                challengeConditions.push("첫 30분 달리기")
            }
        }

        const isChallengeCandidate = challengeConditions.length > 0
        const badgeCount = user.badges.length

        const totalHours = Math.floor(currentTotalMinutes / 60)
        const remainMins = currentTotalMinutes % 60
        const totalTimeStr = totalHours > 0 ? `${totalHours}시간 ${remainMins}분` : `${remainMins}분`

        const allTimeHours = Math.floor(allTimeTotalMinutes / 60)
        const allTimeRemainMins = allTimeTotalMinutes % 60
        const allTimeTimeStr = allTimeHours > 0 ? `${allTimeHours}시간 ${allTimeRemainMins}분` : `${allTimeRemainMins}분`

        return {
            id: user.id,
            name: user.name,
            initials: user.initials || user.name.slice(0, 2).toUpperCase(),
            avatar: user.image || "",
            attendanceDays,
            totalKm: Math.round(currentTotalKm * 10) / 10,
            totalMinutes: currentTotalMinutes,
            totalTimeStr,
            isChallengeCandidate,
            challengeConditions,
            cheerCount,
            badgeCount,
            allTimeTotalKm: Math.round(allTimeTotalKm * 10) / 10,
            allTimeTotalMinutes,
            allTimeTimeStr,
            hasAnyCert: user.posts.length > 0
        }
    })

    // 1. Attendance Ranking (Sort: attendanceDays desc, totalMinutes desc)
    const attendance = [...processedUsers]
        .filter(u => u.attendanceDays > 0)
        .sort((a, b) => b.attendanceDays - a.attendanceDays || b.totalMinutes - a.totalMinutes)
        .map((u, i) => ({
            rank: i + 1,
            name: u.name,
            initials: u.initials,
            avatar: u.avatar,
            value: `${u.attendanceDays}회`,
            subValue: `${u.totalKm}km · ${u.totalTimeStr}`
        }))

    // 2. Challenge Candidates
    const challenge = processedUsers
        .filter(u => u.isChallengeCandidate)
        .map(u => ({
            id: u.id,
            name: u.name,
            initials: u.initials,
            avatar: u.avatar,
            conditions: u.challengeConditions
        }))

    // 3. Badge Ranking (Sort: badgeCount desc, allTimeTotalMinutes desc) — all-time stats
    const badge = [...processedUsers]
        .filter(u => u.badgeCount > 0)
        .sort((a, b) => b.badgeCount - a.badgeCount || b.allTimeTotalMinutes - a.allTimeTotalMinutes)
        .map((u, i) => ({
            rank: i + 1,
            name: u.name,
            initials: u.initials,
            avatar: u.avatar,
            value: `${u.badgeCount}개`,
            subValue: `${u.allTimeTotalKm}km · ${u.allTimeTimeStr}`
        }))

    // 4. Cheer Ranking (Sort: cheerCount desc)
    const cheer = [...processedUsers]
        .filter(u => u.cheerCount > 0 && u.name !== "달려라햄찌")
        .sort((a, b) => b.cheerCount - a.cheerCount)
        .map((u, i) => ({ rank: i + 1, name: u.name, initials: u.initials, avatar: u.avatar, value: `${u.cheerCount}회` }))

    // 5. Random Candidates (at least 1 cert in the current period)
    const random = processedUsers
        .filter(u => u.attendanceDays > 0)
        .map(u => ({ id: u.id, name: u.name, initials: u.initials, avatar: u.avatar }))

    return NextResponse.json({
        attendance,
        challenge,
        badge,
        cheer,
        random
    })
}
