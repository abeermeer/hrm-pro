import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("authjs.session-token")
  const isLoggedIn = !!sessionCookie
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard")
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(request.nextUrl.pathname)

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/forgot-password"],
}
