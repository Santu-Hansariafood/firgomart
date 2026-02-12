import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(req: NextRequest) {
  const url = req.nextUrl
  const host = (req.headers.get("host") || "").toLowerCase()
  const isAdminHost = host.startsWith("admin.")
  
  if (!isAdminHost) return NextResponse.next()

  const path = url.pathname
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path === "/favicon.ico" ||
    path.startsWith("/robots") ||
    path.startsWith("/sitemap")
  ) {
    return NextResponse.next()
  }

  if (path === "/") {
    url.pathname = "/admin"
    return NextResponse.rewrite(url)
  }

  if (path === "/login") {
    url.pathname = "/admin-login"
    return NextResponse.rewrite(url)
  }

  if (path.startsWith("/admin")) {
    return NextResponse.next()
  }

  url.pathname = `/admin${path}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
}

