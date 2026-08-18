import { loginSchema, signupSchema } from "@forge/shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

import { env } from "../config.js";
import { ApiError } from "../lib/errors.js";
import { assertRateLimit, getClientIp } from "../lib/rate-limit.js";
import { clearAuthCookie, setAuthCookie } from "../plugins/auth.js";
import { getUserById, signupUser, verifyCredentials } from "../services/auth.js";

const publicUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  createdAt: z.date().or(z.string()),
});

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/signup",
    {
      schema: {
        body: signupSchema,
        response: { 201: publicUserSchema },
      },
    },
    async (request, reply) => {
      const ip = getClientIp(request);
      if (ip !== "unknown") {
        assertRateLimit(`auth:signup:ip:${ip}`, {
          maxRequests: 5,
          windowMs: 10 * 60 * 1000,
          message: "Too many signup attempts. Please try again shortly.",
        });
      }

      assertRateLimit(`auth:signup:email:${request.body.email}`, {
        maxRequests: 3,
        windowMs: 60 * 60 * 1000,
        message: "Too many signup attempts for this email. Please try again later.",
      });

      const user = await signupUser(request.body);
      const token = await reply.jwtSign({ sub: user.id }, { expiresIn: env.JWT_TTL_SECONDS });
      setAuthCookie(reply, token);
      return reply.status(201).send(user);
    },
  );

  app.post(
    "/login",
    {
      schema: {
        body: loginSchema,
        response: { 200: publicUserSchema },
      },
    },
    async (request, reply) => {
      const ip = getClientIp(request);
      if (ip !== "unknown") {
        assertRateLimit(`auth:login:ip:${ip}`, {
          maxRequests: 20,
          windowMs: 10 * 60 * 1000,
          message: "Too many login attempts. Please try again shortly.",
        });
      }

      assertRateLimit(`auth:login:email:${request.body.email}`, {
        maxRequests: 10,
        windowMs: 10 * 60 * 1000,
        message: "Too many login attempts. Please try again shortly.",
      });

      const user = await verifyCredentials(request.body);
      if (!user) {
        throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
      }

      const token = await reply.jwtSign({ sub: user.id }, { expiresIn: env.JWT_TTL_SECONDS });
      setAuthCookie(reply, token);
      return user;
    },
  );

  app.post("/logout", async (_request, reply) => {
    clearAuthCookie(reply);
    return reply.status(204).send();
  });

  app.get(
    "/me",
    {
      onRequest: [app.authenticate],
      schema: {
        response: { 200: z.object({ user: publicUserSchema.nullable() }) },
      },
    },
    async (request) => {
      const user = await getUserById(request.userId);
      return { user };
    },
  );
};
