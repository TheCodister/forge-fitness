import { randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";
import type { FastifyPluginAsync } from "fastify";

import { clearSessionCookie, optionalUser, setSessionCookie } from "../auth";
import { clientIp, frontendUrl } from "../config";
import {
  exchangeGoogleCode,
  fetchGoogleProfile,
  findOrCreateGoogleUser,
  GOOGLE_CALLBACK_PATH,
  googleAuthorizationUrl,
} from "../services/google-oauth";
import { prisma } from "../database/prisma";
import { ApiError } from "../lib/api-error";
import { loginSchema, signupSchema } from "../schemas/auth";
import { assertRateLimit } from "../security/rate-limit";

type GoogleCallbackQuery = {
  code?: string;
  state?: string;
};

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/api/auth/signup", async (request, reply) => {
    const parsed = signupSchema.parse(request.body);
    assertRateLimit(`auth:signup:ip:${clientIp(request)}`, {
      maxRequests: 5,
      windowMs: 10 * 60_000,
      message: "Too many signup attempts. Please try again shortly.",
    });
    assertRateLimit(`auth:signup:email:${parsed.email}`, {
      maxRequests: 3,
      windowMs: 60 * 60_000,
      message: "Too many signup attempts for this email. Please try again later.",
    });

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: { id: true },
    });
    if (existingUser) {
      throw new ApiError(409, "EMAIL_IN_USE", "An account with that email already exists.");
    }

    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        passwordHash: await bcrypt.hash(parsed.password, 10),
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    return reply.status(201).send(user);
  });

  app.post("/api/auth/login", async (request, reply) => {
    const parsed = loginSchema.parse(request.body);
    assertRateLimit(`auth:login:ip:${clientIp(request)}`, {
      maxRequests: 20,
      windowMs: 10 * 60_000,
      message: "Too many login attempts. Please try again shortly.",
    });
    assertRateLimit(`auth:login:email:${parsed.email}`, {
      maxRequests: 10,
      windowMs: 10 * 60_000,
      message: "Too many login attempts. Please try again shortly.",
    });

    const user = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (!user?.passwordHash || !await bcrypt.compare(parsed.password, user.passwordHash)) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
    }

    setSessionCookie(reply, user.id);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        createdAt: user.createdAt,
      },
    };
  });

  app.post("/api/auth/logout", async (_request, reply) => {
    clearSessionCookie(reply);
    return reply.status(204).send();
  });

  app.get("/api/auth/me", async (request) => ({ user: await optionalUser(request) }));

  app.get("/api/auth/google", async (_request, reply) => {
    const state = randomBytes(24).toString("hex");
    reply.setCookie("forge_oauth_state", state, {
      path: GOOGLE_CALLBACK_PATH,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
    });
    return reply.redirect(googleAuthorizationUrl(state));
  });

  app.get<{ Querystring: GoogleCallbackQuery }>(GOOGLE_CALLBACK_PATH, async (request, reply) => {
    const { code, state } = request.query;
    if (!code || !state || state !== request.cookies.forge_oauth_state) {
      return reply.redirect(frontendUrl("/login?error=oauth_state"));
    }

    const tokens = await exchangeGoogleCode(code);
    if (!tokens) return reply.redirect(frontendUrl("/login?error=oauth_exchange"));

    const profile = await fetchGoogleProfile(tokens.access_token);
    if (!profile) return reply.redirect(frontendUrl("/login?error=oauth_profile"));

    const user = await findOrCreateGoogleUser(profile);
    setSessionCookie(reply, user.id);
    reply.clearCookie("forge_oauth_state", { path: GOOGLE_CALLBACK_PATH });
    return reply.redirect(frontendUrl("/dashboard"));
  });
};
