import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/http";
import { signupSchema } from "@/lib/schemas/auth";
import { authOptions } from "@/lib/auth/auth-options";

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
      name: parsed.name,
      email: parsed.email,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return user;
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
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
