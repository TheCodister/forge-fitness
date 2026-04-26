import { type NextRequest, NextResponse } from "next/server";

import { verifySessionToken } from "@/lib/auth/token";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

const protectedRoutePrefixes = ["/dashboard", "/workouts", "/templates", "/reports"];
const guestOnlyPrefixes = ["/login", "/signup"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(sessionCookie);

  if (matchesPrefix(pathname, protectedRoutePrefixes) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (matchesPrefix(pathname, guestOnlyPrefixes) && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/workouts/:path*", "/templates/:path*", "/reports/:path*", "/login", "/signup"],
};
