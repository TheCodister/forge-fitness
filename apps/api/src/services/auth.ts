import bcrypt from "bcryptjs";

import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  image: true,
  createdAt: true,
} as const;

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
};

export async function signupUser(input: { name: string; email: string; password: string }) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new ApiError(409, "EMAIL_IN_USE", "An account with that email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
    select: publicUserSelect,
  });
}

export async function verifyCredentials(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { ...publicUserSelect, passwordHash: true },
  });

  if (!user || !user.passwordHash) return null;

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) return null;

  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });
}
