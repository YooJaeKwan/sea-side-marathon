import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// POST /api/posts/[id]/like — toggle like
export async function POST(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: postId } = await params

    const existingLike = await prisma.like.findUnique({
        where: {
            postId_userId: {
                postId,
                userId: session.user.id,
            },
        },
    })

    if (existingLike) {
        await prisma.like.delete({
            where: { id: existingLike.id },
        })
        return NextResponse.json({ liked: false })
    } else {
        await prisma.like.create({
            data: {
                postId,
                userId: session.user.id,
            },
        })
        return NextResponse.json({ liked: true })
    }
}
