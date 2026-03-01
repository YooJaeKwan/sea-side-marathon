import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// POST /api/posts/[id]/like — toggle like
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: postId } = await params
    const body = await req.json().catch(() => ({}))
    const type = body.type || "❤️" // Default to heart if no type provided

    const existingLike = await prisma.like.findUnique({
        where: {
            postId_userId: {
                postId,
                userId: session.user.id,
            },
        },
    })

    if (existingLike) {
        if (existingLike.type === type) {
            // Un-react if same type
            await prisma.like.delete({
                where: { id: existingLike.id },
            })
            return NextResponse.json({ reacted: false, type: null })
        } else {
            // Update to new reaction type
            await prisma.like.update({
                where: { id: existingLike.id },
                data: { type },
            })
            return NextResponse.json({ reacted: true, type })
        }
    } else {
        // Create new reaction
        await prisma.like.create({
            data: {
                postId,
                userId: session.user.id,
                type,
            },
        })
        return NextResponse.json({ reacted: true, type })
    }
}
