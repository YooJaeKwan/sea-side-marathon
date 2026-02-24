import { PrismaClient } from "@prisma/client"
import { PrismaNeonHttp } from "@prisma/adapter-neon"

const globalForPrisma = globalThis as unknown as {
    prisma_v2: PrismaClient | undefined
}

function createPrismaClient() {
    const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {})
    return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma_v2 ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v2 = prisma
