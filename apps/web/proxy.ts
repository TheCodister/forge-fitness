import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

const protectedRoutePrefixes = ["/dashboard", "/workouts", "/templates", "/reports", "/trainer"];
const guestOnlyPrefixes = ["/login", "/signup"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (matchesPrefix(pathname, protectedRoutePrefixes) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (matchesPrefix(pathname, guestOnlyPrefixes) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/workouts/:path*", "/templates/:path*", "/reports/:path*", "/trainer/:path*", "/login", "/signup"],
};
