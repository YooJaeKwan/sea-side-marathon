import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// POST /api/posts/[id]/comments — add comment
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: postId } = await params
    const { text } = await req.json()

    if (!text?.trim()) {
        return NextResponse.json({ error: "text is required" }, { status: 400 })
    }

    const comment = await prisma.comment.create({
        data: {
            postId,
            userId: session.user.id,
            text: text.trim(),
        },
    })

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, initials: true, image: true },
    })

    return NextResponse.json({
        id: comment.id,
        userId: comment.userId,
        user: {
            name: user?.name ?? "사용자",
            initials: user?.initials || (user?.name ?? "??").slice(0, 2).toUpperCase(),
            avatar: user?.image || "",
        },
        text: comment.text,
        createdAt: comment.createdAt.toISOString(),
    }, { status: 201 })
}
