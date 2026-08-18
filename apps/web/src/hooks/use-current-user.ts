"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch, ClientApiError } from "@/lib/api/fetcher";
import type { AppUser } from "@/types/domain";

type MeResponse = { user: AppUser | null };

export function useCurrentUser() {
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async (): Promise<MeResponse> => {
      try {
        return await apiFetch<MeResponse>("/auth/me");
      } catch (error) {
        if (error instanceof ClientApiError && error.status === 401) {
          return { user: null };
        }
        throw error;
      }
    },
    staleTime: 60_000,
  });

  return {
    data: query.data ?? { user: null },
    isLoading: query.isLoading,
  };
}
