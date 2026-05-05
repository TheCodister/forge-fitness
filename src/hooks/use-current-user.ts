"use client";

import { useSession } from "next-auth/react";

import type { AppUser } from "@/types/domain";

export function useCurrentUser() {
  const { data: session, status } = useSession();

  const user: AppUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
        createdAt: new Date(),
      }
    : null;

  return {
    data: user ? { user } : { user: null },
    isLoading: status === "loading",
  };
}
