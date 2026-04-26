"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/fetcher";
import type { AppUser } from "@/types/domain";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiFetch<{ user: AppUser | null }>("/api/auth/me"),
  });
}
