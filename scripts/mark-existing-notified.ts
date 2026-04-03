import { prisma } from "../lib/prisma"

async function main() {
    const result = await prisma.$executeRawUnsafe(
        `UPDATE "UserBadge" SET "notified" = false`
    )
    console.log(`Reset ${result} badges to notified=false`)
    await prisma.$disconnect()
}

main().catch(e => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
})
