import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// DELETE /api/posts/[id] — delete own post
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: postId } = await params

    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { userId: true },
    })

    if (!post) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (post.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.post.delete({ where: { id: postId } })

    return NextResponse.json({ deleted: true })
}
