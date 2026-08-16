import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";

import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/http";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
};

const COOKIE_NAME = "forge_session";
const SESSION_SECONDS = 30 * 24 * 60 * 60;

function cookieOptions() {
  const secure = process.env.NODE_ENV === "production";
  return {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: (process.env.COOKIE_SAME_SITE === "none" ? "none" : "lax") as "none" | "lax",
    maxAge: SESSION_SECONDS,
    domain: process.env.COOKIE_DOMAIN || undefined,
  };
}

export async function registerAuth(app: FastifyInstance) {
  // NEXTAUTH_SECRET keeps existing local installations working during the
  // migration. New deployments should set JWT_SECRET explicitly.
  const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret || (process.env.NODE_ENV === "production" && secret.length < 32)) {
    throw new Error(
      "JWT_SECRET must be set (and at least 32 characters in production). " +
      "NEXTAUTH_SECRET is accepted as a migration fallback.",
    );
  }

  await app.register(fastifyJwt, {
    secret,
    cookie: { cookieName: COOKIE_NAME, signed: false },
    sign: { expiresIn: SESSION_SECONDS },
  });
}

export function setSessionCookie(reply: FastifyReply, userId: string) {
  const token = reply.server.jwt.sign({ sub: userId });
  reply.setCookie(COOKIE_NAME, token, cookieOptions());
}

export function clearSessionCookie(reply: FastifyReply) {
  reply.clearCookie(COOKIE_NAME, cookieOptions());
}

export async function requireUser(request: FastifyRequest): Promise<AuthUser> {
  try {
    await request.jwtVerify();
  } catch {
    throw new ApiError(401, "UNAUTHORIZED", "You must be logged in to access this resource.");
  }

  const subject = (request.user as { sub?: string }).sub;
  if (!subject) {
    throw new ApiError(401, "UNAUTHORIZED", "You must be logged in to access this resource.");
  }

  const user = await prisma.user.findUnique({
    where: { id: subject },
    select: { id: true, email: true, name: true, image: true, createdAt: true },
  });
  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Your session is no longer valid.");
  }
  return user;
}

export async function optionalUser(request: FastifyRequest) {
  try {
    return await requireUser(request);
  } catch {
    return null;
  }
}
