import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Kakao from "next-auth/providers/kakao"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Kakao({
            clientId: process.env.KAKAO_CLIENT_ID!,
            clientSecret: process.env.KAKAO_CLIENT_SECRET || "kakao",
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth: session, request }) {
            const isLoggedIn = !!session?.user
            const { pathname } = request.nextUrl

            // Not logged in → always redirect to /login
            if (!isLoggedIn) {
                return false // NextAuth redirects to pages.signIn (/login)
            }

            return true
        },
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id
                // Check onboarding status for new sign-in
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
