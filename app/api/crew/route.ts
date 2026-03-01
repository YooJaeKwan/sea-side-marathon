import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            realName: true,
            initials: true,
            image: true,
            category: true,
        },
        orderBy: { name: "asc" }
    })

    const formatted = users.map((user) => ({
        id: user.id,
        name: user.name,
        realName: user.realName || "",
        initials: user.initials || user.name.slice(0, 2).toUpperCase(),
        avatar: user.image || "",
        category: user.category || "",
    }))

    return NextResponse.json(formatted)
}
