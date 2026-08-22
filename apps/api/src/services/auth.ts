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

// Find or create a user for an OAuth provider identity. Links the provider
// account to an existing user if the email already matches.
export async function upsertOAuthUser(input: {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string | null;
  image: string | null;
}): Promise<PublicUser> {
  const linkedAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: input.provider,
        providerAccountId: input.providerAccountId,
      },
    },
    include: { user: { select: publicUserSelect } },
  });
  if (linkedAccount?.user) return linkedAccount.user;

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: publicUserSelect,
  });
  if (existing) {
    await prisma.account.create({
      data: {
        userId: existing.id,
        type: "oauth",
        provider: input.provider,
        providerAccountId: input.providerAccountId,
      },
    });
    return existing;
  }

  return prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      image: input.image,
      emailVerified: new Date(),
      accounts: {
        create: {
          type: "oauth",
          provider: input.provider,
          providerAccountId: input.providerAccountId,
        },
      },
    },
    select: publicUserSelect,
  });
}
