import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// POST /api/posts/[id]/react — toggle a specific reactionType
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: postId } = await params
    const body = await req.json()
    const { type } = body // "HEART", "THUMBS_UP", "HAHA"

    if (!["HEART", "THUMBS_UP", "HAHA"].includes(type)) {
        return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 })
    }

    const userId = session.user.id

    const existing = await prisma.reaction.findUnique({
        where: {
            postId_userId_type: { postId, userId, type }
        },
    })

    if (existing) {
        await prisma.reaction.delete({
            where: { id: existing.id }
        })
        return NextResponse.json({ reacted: false, type })
    } else {
        await prisma.reaction.create({
            data: { postId, userId, type },
        })
        return NextResponse.json({ reacted: true, type })
    }
}
