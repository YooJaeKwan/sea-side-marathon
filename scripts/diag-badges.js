require("dotenv").config()
const { PrismaClient } = require("@prisma/client")
const { PrismaNeonHttp } = require("@prisma/adapter-neon")

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log("Checking badges table...")
    const allBadges = await prisma.badge.findMany()
    console.log(`Found ${allBadges.length} badges.`)
    if (allBadges.length > 0) {
        console.log("First 3 badges:", allBadges.slice(0, 3).map(b => b.name))
    }

    console.log("Checking userBadge table...")
    const userBadges = await prisma.userBadge.findMany({ take: 5 })
    console.log(`Found ${userBadges.length} user-earned badges in total (first 5).`)
}

main()
    .catch(e => {
        console.error("DIAGNOSTIC FAILED:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
