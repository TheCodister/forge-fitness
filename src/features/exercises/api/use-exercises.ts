"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/fetcher";
import type { Exercise } from "@/types/domain";

export function useExercises() {
  return useQuery({
    queryKey: ["exercises"],
    queryFn: () => apiFetch<Exercise[]>("/api/exercises"),
  });
}
