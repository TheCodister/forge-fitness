import { prisma } from "../database/prisma";
import { ApiError } from "../lib/api-error";

type GoogleTokens = {
  access_token: string;
};

export type GoogleProfile = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
};

export const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";
const DEFAULT_REDIRECT_URI = "http://localhost:4000/api/auth/google/callback";

function credentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new ApiError(503, "GOOGLE_AUTH_DISABLED", "Google sign-in is not configured.");
  }
  return {
    clientId,
    clientSecret,
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? DEFAULT_REDIRECT_URI,
  };
}

export function googleAuthorizationUrl(state: string) {
  const { clientId, redirectUri } = credentials();
  const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "openid email profile");
  authorize.searchParams.set("state", state);
  return authorize.toString();
}

export async function exchangeGoogleCode(code: string) {
  const { clientId, clientSecret, redirectUri } = credentials();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!response.ok) return null;
  return response.json() as Promise<GoogleTokens>;
}

export async function fetchGoogleProfile(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  return response.json() as Promise<GoogleProfile>;
}

export async function findOrCreateGoogleUser(profile: GoogleProfile) {
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: profile.sub,
      },
    },
    include: { user: true },
  });
  if (existingAccount) return existingAccount.user;

  const user = await prisma.user.upsert({
    where: { email: profile.email.toLowerCase() },
    update: { name: profile.name, image: profile.picture, emailVerified: new Date() },
    create: {
      email: profile.email.toLowerCase(),
      name: profile.name,
      image: profile.picture,
      emailVerified: new Date(),
    },
  });
  await prisma.account.create({
    data: {
      userId: user.id,
      type: "oauth",
      provider: "google",
      providerAccountId: profile.sub,
    },
  });
  return user;
}
