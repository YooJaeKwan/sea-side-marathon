import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/me — current user profile + stats
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            realName: true,
            email: true,
            image: true,
            initials: true,
            isOnboarded: true,
            category: true,
        },
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate stats from posts
    const posts = await prisma.post.findMany({
        where: { userId: session.user.id },
        select: { distance: true, duration: true, createdAt: true },
        orderBy: { createdAt: "desc" },
    })

    const totalKm = posts.reduce((sum, p) => sum + p.distance, 0)
    const totalRuns = posts.length

    // Parse durations to total minutes
    const timeBuckets = { 새벽: 0, 오전: 0, 오후: 0, 저녁: 0, 심야: 0 }
    const dayBuckets = [0, 0, 0, 0, 0, 0, 0] // Sun=0, Mon=1, ..., Sat=6

    let totalMinutes = 0
    for (const p of posts) {
        // Parse durations to total minutes
        const parts = p.duration.split(":")
        const h = parseInt(parts[0] || "0")
        const m = parseInt(parts[1] || "0")
        totalMinutes += h * 60 + m

        // Assuming KST for local analysis
        const kstTime = new Date(p.createdAt.getTime() + 9 * 60 * 60 * 1000)

        // Day of week
        dayBuckets[kstTime.getUTCDay()]++

        // Time bucket
        const hour = kstTime.getUTCHours()
        if (hour >= 4 && hour < 9) timeBuckets["새벽"]++
        else if (hour >= 9 && hour < 12) timeBuckets["오전"]++
        else if (hour >= 12 && hour < 18) timeBuckets["오후"]++
        else if (hour >= 18 && hour < 22) timeBuckets["저녁"]++
        else timeBuckets["심야"]++
    }

    const totalHours = Math.floor(totalMinutes / 60)
    const remainMins = totalMinutes % 60
    const totalTime = `${String(totalHours).padStart(2, "0")}:${String(remainMins).padStart(2, "0")}`

    // Find preferred time
    let preferredTime = "분석 중"
    let maxTimeCount = 0
    Object.entries(timeBuckets).forEach(([time, count]) => {
        if (count > maxTimeCount && count > 0) {
            maxTimeCount = count
            preferredTime = time
        }
    })

    // Find preferred day
    const DAYS_KR = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
    let preferredDay = "분석 중"
    let maxDayCount = 0
    dayBuckets.forEach((count, idx) => {
        if (count > maxDayCount && count > 0) {
            maxDayCount = count
            preferredDay = DAYS_KR[idx]
        }
    })

    // Average pace
    let avgPace = "-"
    if (totalKm > 0 && totalMinutes > 0) {
        const paceMinPerKm = totalMinutes / totalKm
        const paceMin = Math.floor(paceMinPerKm)
        const paceSec = Math.round((paceMinPerKm - paceMin) * 60)
        avgPace = `${paceMin}'${String(paceSec).padStart(2, "0")}"`
    }

    // Streak: consecutive days with posts ending today or yesterday
    let streakDays = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const postDates = [...new Set(posts.map((p) => {
        const d = new Date(p.createdAt)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
    }))].sort((a, b) => b - a)

    if (postDates.length > 0) {
        // Check if the latest post is today or yesterday
        const diffMs = today.getTime() - postDates[0]
        const diffDays = diffMs / (1000 * 60 * 60 * 24)
        if (diffDays <= 1) {
            streakDays = 1
            for (let i = 1; i < postDates.length; i++) {
                const gap = Math.round((postDates[i - 1] - postDates[i]) / (1000 * 60 * 60 * 24))
                if (gap === 1) {
                    streakDays++
                } else {
                    break
                }
            }
        }
    }

    return NextResponse.json({
        ...user,
        stats: {
            totalKm: Math.round(totalKm * 10) / 10,
            totalTime,
            avgPace,
            totalRuns,
            streakDays,
            preferredTime,
            preferredDay,
            dayBuckets
        },
    })
}

// PATCH /api/me — update profile (onboarding)
export async function PATCH(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, realName, initials, isOnboarded, category } = body

    const data: Record<string, unknown> = {}
    if (name) data.name = name
    if (realName) data.realName = realName
    if (initials) data.initials = initials
    if (isOnboarded !== undefined) data.isOnboarded = isOnboarded
    if (category) data.category = category

    const user = await prisma.user.update({
        where: { id: session.user.id },
        data,
    })

    return NextResponse.json(user)
}
