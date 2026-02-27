import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

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

    // Get all users with their posts and comments this month
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
            }
        },
    })

    const processedUsers = users.map((user) => {
        let attendanceDays = 0
        let totalKm = 0
        let totalMinutes = 0
        let maxDistance = 0
        let maxMinutes = 0

        // Parse unique KST days for attendance validation
        const validKstDays = new Set<number>()
        const allKstDaysSet = new Set<number>()

        user.posts.forEach((p) => {
            const kst = new Date(p.createdAt.getTime() + 9 * 60 * 60 * 1000)
            const dayCode = kst.getUTCFullYear() * 10000 + (kst.getUTCMonth() + 1) * 100 + kst.getUTCDate()
            allKstDaysSet.add(dayCode)

            totalKm += p.distance
            if (p.distance > maxDistance) maxDistance = p.distance

            const parts = p.duration.split(":")
            const h = parseInt(parts[0] || "0", 10)
            const m = parseInt(parts[1] || "0", 10)
            const mins = h * 60 + m
            totalMinutes += mins
            if (mins > maxMinutes) maxMinutes = mins

            // Attendance condition: >= 2km OR >= 20 mins
            if (p.distance >= 2 || mins >= 20) {
                validKstDays.add(dayCode)
            }
        })

        attendanceDays = validKstDays.size

        // Calculate weeks with >= 2 runs (Challenge logic)
        // Group all posts by ISO week to check consistency
        const weekCounts: Record<string, number> = {}
        const kstDaysArray = Array.from(allKstDaysSet)
        kstDaysArray.forEach(dayCode => {
            const y = Math.floor(dayCode / 10000)
            const m = Math.floor((dayCode % 10000) / 100) - 1
            const d = dayCode % 100
            const date = new Date(Date.UTC(y, m, d))

            // ISO week calculation
            date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
            const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
            const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
            const weekKey = `${date.getUTCFullYear()}-W${weekNo}`

            weekCounts[weekKey] = (weekCounts[weekKey] || 0) + 1
        })

        let weeksWithTwoRuns = 0
        Object.values(weekCounts).forEach(count => {
            if (count >= 2) weeksWithTwoRuns++
        })

        // Cheer logic
        const uniqueUsersCommentedOn = new Set<string>()
        user.comments.forEach(c => {
            if (c.post.userId !== user.id) {
                uniqueUsersCommentedOn.add(c.post.userId)
            }
        })

        // Determine candidate statuses
        const isCompletionCandidate = maxDistance >= 5
        const isChallengeCandidate = maxDistance >= 5 || totalKm >= 20 || maxMinutes >= 30 || weeksWithTwoRuns >= 3

        return {
            id: user.id,
            name: user.name,
            initials: user.initials || user.name.slice(0, 2).toUpperCase(),
            avatar: user.image || "",
            attendanceDays,
            totalKm: Math.round(totalKm * 10) / 10,
            totalMinutes,
            isChallengeCandidate,
            isCompletionCandidate,
            cheerScore: uniqueUsersCommentedOn.size, // primary sort
            cheerCount: user.comments.length, // secondary sort
            hasAnyCert: user.posts.length > 0
        }
    })

    // 1. Attendance Ranking (Sort: attendanceDays desc, totalMinutes desc)
    const attendance = [...processedUsers]
        .filter(u => u.attendanceDays > 0)
        .sort((a, b) => b.attendanceDays - a.attendanceDays || b.totalMinutes - a.totalMinutes)
        .map((u, i) => ({ rank: i + 1, name: u.name, initials: u.initials, avatar: u.avatar, value: `${u.attendanceDays}회` }))

    // 2. Challenge Candidates
    const challenge = processedUsers
        .filter(u => u.isChallengeCandidate)
        .map(u => ({ id: u.id, name: u.name, initials: u.initials, avatar: u.avatar }))

    // 3. Completion Candidates
    const completion = processedUsers
        .filter(u => u.isCompletionCandidate)
        .map(u => ({ id: u.id, name: u.name, initials: u.initials, avatar: u.avatar }))

    // 4. Cheer Ranking (Sort: cheerScore desc, cheerCount desc)
    const cheer = [...processedUsers]
        .filter(u => u.cheerScore > 0)
        .sort((a, b) => b.cheerScore - a.cheerScore || b.cheerCount - a.cheerCount)
        .map((u, i) => ({ rank: i + 1, name: u.name, initials: u.initials, avatar: u.avatar, value: `${u.cheerScore}명 (${u.cheerCount}회)` }))

    // 5. Random Candidates
    const random = processedUsers
        .filter(u => u.hasAnyCert)
        .map(u => ({ id: u.id, name: u.name, initials: u.initials, avatar: u.avatar }))

    return NextResponse.json({
        attendance,
        challenge,
        completion,
        cheer,
        random
    })
}
