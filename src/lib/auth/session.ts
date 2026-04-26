import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "@/lib/constants";
import {
  sessionDurationInSeconds,
  signSessionToken,
  verifySessionToken,
} from "@/lib/auth/token";

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDurationInSeconds,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export { signSessionToken, verifySessionToken };
