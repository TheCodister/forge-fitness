import fastifyOauth2, { type OAuth2Namespace } from "@fastify/oauth2";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { env } from "../config.js";
import { setAuthCookie } from "../plugins/auth.js";
import { upsertOAuthUser } from "../services/auth.js";

declare module "fastify" {
  interface FastifyInstance {
    googleOAuth2?: OAuth2Namespace;
  }
}

type GoogleUserInfo = {
  id: string;
  email: string;
  verified_email?: boolean;
  name?: string;
  picture?: string;
};

// Registered under app.ts only when GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
// + GOOGLE_CALLBACK_URL are all set. Provides:
//   GET /auth/google           → redirect to Google consent (added by plugin)
//   GET /auth/google/callback  → exchange code, upsert user, cookie, redirect
export const googleOAuthRoutes: FastifyPluginAsyncZod = async (app) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    app.log.warn(
      "Google OAuth env not fully set (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_CALLBACK_URL); skipping /auth/google routes",
    );
    return;
  }

  await app.register(fastifyOauth2, {
    name: "googleOAuth2",
    scope: ["openid", "email", "profile"],
    credentials: {
      client: {
        id: env.GOOGLE_CLIENT_ID,
        secret: env.GOOGLE_CLIENT_SECRET,
      },
      auth: fastifyOauth2.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: "/auth/google",
    callbackUri: env.GOOGLE_CALLBACK_URL,
  });

  app.get("/auth/google/callback", async (request, reply) => {
    if (!app.googleOAuth2) {
      return reply.status(500).send({
        message: "Google OAuth not configured.",
        code: "OAUTH_NOT_CONFIGURED",
      });
    }

    const { token } =
      await app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!res.ok) {
      request.log.error({ status: res.status }, "google userinfo fetch failed");
      return reply.status(502).send({
        message: "Failed to fetch Google profile.",
        code: "OAUTH_USERINFO_FAILED",
      });
    }
    const profile = (await res.json()) as GoogleUserInfo;

    if (!profile.email) {
      return reply.status(400).send({
        message: "Google account has no email.",
        code: "OAUTH_MISSING_EMAIL",
      });
    }

    const user = await upsertOAuthUser({
      provider: "google",
      providerAccountId: profile.id,
      email: profile.email.toLowerCase(),
      name: profile.name ?? null,
      image: profile.picture ?? null,
    });

    const jwt = await reply.jwtSign({ sub: user.id }, { expiresIn: env.JWT_TTL_SECONDS });
    setAuthCookie(reply, jwt);

    return reply.redirect(env.POST_LOGIN_REDIRECT_URL);
  });
};
