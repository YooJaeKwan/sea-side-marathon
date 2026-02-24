import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: user.id as string },
                        select: { isOnboarded: true },
                    })
                    token.isOnboarded = dbUser?.isOnboarded ?? false
                } catch {
                    token.isOnboarded = false
                }
            }
            if (trigger === "update") {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        select: { name: true, image: true, isOnboarded: true },
                    })
                    if (dbUser) {
                        token.name = dbUser.name
                        token.picture = dbUser.image
                        token.isOnboarded = dbUser.isOnboarded
                    }
                } catch {
                    // ignore
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ; (session as any).isOnboarded = token.isOnboarded ?? false
            return session
        },
    },
})
