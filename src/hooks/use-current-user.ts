"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/fetcher";
import type { AppUser } from "@/types/domain";

export function useCurrentUser() {
  return useQuery<{ user: AppUser | null }>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const data = await apiFetch<{ user: (Omit<AppUser, "createdAt"> & { createdAt: string }) | null }>("/api/auth/me");
      return { user: data.user ? { ...data.user, createdAt: new Date(data.user.createdAt) } : null };
    },
    staleTime: 60_000,
    retry: false,
  });
}
