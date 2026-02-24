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

// PATCH /api/posts/[id] — edit own post
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: postId } = await params
    const body = await req.json()
    const { duration, distance, content, imageUrl } = body

    const existingPost = await prisma.post.findUnique({
        where: { id: postId },
        select: { userId: true },
    })

    if (!existingPost) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (existingPost.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    let pace = undefined
    if (duration !== undefined || distance !== undefined) {
        // Recalculate pace if either changed
        const d = distance !== undefined ? distance : (await prisma.post.findUnique({ where: { id: postId }, select: { distance: true } }))?.distance || 0
        const dur = duration !== undefined ? duration : (await prisma.post.findUnique({ where: { id: postId }, select: { duration: true } }))?.duration || "00:00"

        const [h, m] = dur.split(":").map(Number)
        const totalMin = (h || 0) * 60 + (m || 0)

        if (d > 0 && totalMin > 0) {
            const p = totalMin / d
            pace = `${Math.floor(p)}'${String(Math.round((p % 1) * 60)).padStart(2, "0")}"`
        } else {
            pace = ""
        }
    }

    const updated = await prisma.post.update({
        where: { id: postId },
        data: {
            duration,
            distance,
            pace,
            content,
            imageUrl
        }
    })

    return NextResponse.json(updated)
}
