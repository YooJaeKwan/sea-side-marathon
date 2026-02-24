import type { NextAuthConfig } from "next-auth"
import Kakao from "next-auth/providers/kakao"

export const authConfig = {
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

            if (!isLoggedIn) {
                return false
            }
            return true
        },
    },
} satisfies NextAuthConfig
