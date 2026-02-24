import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { awardBadges } from "@/lib/badges"

// GET /api/posts — fetch all posts with user, comments, likes, waves
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { id: true, name: true, initials: true, image: true, category: true } },
            comments: {
                orderBy: { createdAt: "asc" },
                include: {
                    user: { select: { name: true, initials: true } },
                },
            },
            likes: { select: { userId: true } },
            _count: { select: { likes: true, comments: true } },
        },
    })

    const formatted = posts.map((post) => ({
        id: post.id,
        user: {
            id: post.userId,
            name: post.user.name,
            initials: post.user.initials || post.user.name.slice(0, 2).toUpperCase(),
            avatar: post.user.image || "",
            category: post.user.category || "",
        },
        duration: post.duration,
        distance: post.distance,
        pace: post.pace,
        comment: post.content,
        photo: post.imageUrl,
        likes: post._count.likes,
        comments: post.comments.map((c) => ({
            id: c.id,
            user: {
                name: c.user.name,
                initials: c.user.initials || c.user.name.slice(0, 2).toUpperCase(),
            },
            text: c.text,
            createdAt: c.createdAt.toISOString(),
        })),
        createdAt: post.createdAt.toISOString(),
        liked: post.likes.some((l) => l.userId === session.user!.id),
    }))

    return NextResponse.json(formatted)
}

// POST /api/posts — create a new running post
export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { duration, distance, pace, content, imageUrl } = body

    if (!duration || !distance) {
        return NextResponse.json({ error: "duration and distance are required" }, { status: 400 })
    }

    const post = await prisma.post.create({
        data: {
            userId: session.user.id,
            duration,
            distance: parseFloat(distance),
            pace: pace || "",
            content: content || null,
            imageUrl: imageUrl || null,
        },
    })

    // Award badges and get newly earned ones
    const newBadges = await awardBadges(session.user.id)

    return NextResponse.json({ ...post, newBadges }, { status: 201 })
}
