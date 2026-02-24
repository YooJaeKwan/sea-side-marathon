export { auth as middleware } from "@/auth"

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api/auth (NextAuth routes)
         * - login (login page)
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico, public assets
         */
        "/((?!api/auth|login|_next/static|_next/image|favicon\\.ico|icon-.*|apple-icon|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp).*)",
    ],
}
