import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes - must have session cookie
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("next-auth.session-token") || request.cookies.get("__Secure-next-auth.session-token");
    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
