import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

import { env } from "../config.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    userId: string;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string };
    user: { sub: string };
  }
}

export const COOKIE_NAME = "ff_token";

export function setAuthCookie(reply: FastifyReply, token: string) {
  reply.setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SECURE ? "none" : "lax",
    path: "/",
    domain: env.COOKIE_DOMAIN || undefined,
    maxAge: env.JWT_TTL_SECONDS,
  });
}

export function clearAuthCookie(reply: FastifyReply) {
  reply.clearCookie(COOKIE_NAME, {
    path: "/",
    domain: env.COOKIE_DOMAIN || undefined,
  });
}

export const authPlugin = fp(async function authPlugin(app: FastifyInstance) {
  app.decorate("authenticate", async (request, reply) => {
    try {
      const payload = await request.jwtVerify<{ sub: string }>();
      request.userId = payload.sub;
    } catch {
      return reply.status(401).send({ message: "Unauthorized.", code: "UNAUTHORIZED" });
    }
  });
});
