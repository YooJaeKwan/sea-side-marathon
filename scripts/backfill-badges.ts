/**
 * Backfill script: Award badges retroactively to all onboarded users.
 * Run with: npx tsx scripts/backfill-badges.ts
 */

import { prisma } from "../lib/prisma"
import { awardBadges, ensureBadgesExist } from "../lib/badges"

async function main() {
    console.log("[Backfill] Starting badge backfill for all users...")

    // Ensure all badge definitions exist
    await ensureBadgesExist()

    // Fetch all onboarded users
    const users = await prisma.user.findMany({
        where: { isOnboarded: true },
        select: { id: true, name: true }
    })

    console.log(`[Backfill] Found ${users.length} onboarded users.`)

    let totalNewBadges = 0

    for (const user of users) {
        try {
            const newBadges = await awardBadges(user.id)
            if (newBadges.length > 0) {
                console.log(`  ✅ ${user.name}: ${newBadges.length} new badges → ${newBadges.map(b => b.name).join(", ")}`)
                totalNewBadges += newBadges.length
            } else {
                console.log(`  ⏭️  ${user.name}: no new badges`)
            }
        } catch (err) {
            console.error(`  ❌ ${user.name}: error`, err)
        }
    }

    console.log(`\n[Backfill] Complete! Total new badges awarded: ${totalNewBadges}`)
    await prisma.$disconnect()
}

main().catch(e => {
    console.error("[Backfill] Fatal error:", e)
    prisma.$disconnect()
    process.exit(1)
})
