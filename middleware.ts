import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");

  if (url.pathname === "/" && code) {
    const next = url.searchParams.get("next") || "/feed";
    const dest = new URL("/auth/callback", url.origin);
    dest.searchParams.set("code", code);
    dest.searchParams.set("next", next);
    return NextResponse.redirect(dest);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};