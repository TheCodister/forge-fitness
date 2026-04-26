import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/http";
import { loginSchema, signupSchema } from "@/lib/schemas/auth";
import {
  clearSessionCookie,
  getSessionFromCookies,
  setSessionCookie,
  signSessionToken,
} from "@/lib/auth/session";

export async function signupUser(input: unknown) {
  const parsed = signupSchema.parse(input);

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new ApiError(409, "EMAIL_IN_USE", "An account with that email already exists.");
  }

  const passwordHash = await bcrypt.hash(parsed.password, 10);

  const user = await prisma.user.create({
    data: {
      displayName: parsed.displayName,
      email: parsed.email,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      createdAt: true,
    },
  });

  const token = await signSessionToken({
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
  });

  await setSessionCookie(token);

  return user;
}

export async function loginUser(input: unknown) {
  const parsed = loginSchema.parse(input);

  const user = await prisma.user.findUnique({
    where: { email: parsed.email },
  });

  if (!user) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }

  const passwordMatches = await bcrypt.compare(parsed.password, user.passwordHash);

  if (!passwordMatches) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }

  const token = await signSessionToken({
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
  });

  await setSessionCookie(token);

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt,
  };
}

export async function logoutUser() {
  await clearSessionCookie();
}

export async function getCurrentUser() {
  const session = await getSessionFromCookies();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      createdAt: true,
    },
  });

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "You must be logged in to access this resource.");
  }

  return user;
}
