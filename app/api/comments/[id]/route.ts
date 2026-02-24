import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// DELETE /api/comments/[id] — delete own comment
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: commentId } = await params

    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { userId: true },
    })

    if (!comment) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (comment.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.comment.delete({ where: { id: commentId } })

    return NextResponse.json({ deleted: true })
}
