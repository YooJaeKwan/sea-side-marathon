import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// POST /api/posts/[id]/wave — toggle wave
export async function POST(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: postId } = await params

    const existing = await prisma.wave.findUnique({
        where: { postId_userId: { postId, userId: session.user.id } },
    })

    if (existing) {
        await prisma.wave.delete({ where: { id: existing.id } })
        return NextResponse.json({ waved: false })
    } else {
        await prisma.wave.create({
            data: { postId, userId: session.user.id },
        })
        return NextResponse.json({ waved: true })
    }
}
