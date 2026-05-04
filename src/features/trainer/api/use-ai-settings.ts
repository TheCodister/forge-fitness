"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";

export type AiSettingsData = {
  provider: "openai" | "anthropic" | "google";
  model: string;
  maskedApiKey: string;
} | null;

type UpsertPayload = {
  provider: "openai" | "anthropic" | "google";
  model: string;
  apiKey: string;
};

export function useAiSettings() {
  return useQuery({
    queryKey: ["ai-settings"],
    queryFn: () => apiFetch<AiSettingsData>("/api/ai/settings"),
  });
}

export function useUpsertAiSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertPayload) =>
      apiFetch<AiSettingsData>("/api/ai/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ai-settings"] });
    },
  });
}
