"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/fetcher";
import type { Exercise } from "@/types/domain";

export const EXERCISES_PAGE_SIZE = 24;

type ExerciseQuery = {
  search?: string;
  muscleGroup?: string;
  category?: string;
  page?: number;
};

export function useExercises(query?: ExerciseQuery) {
  const page = query?.page ?? 0;
  const params = new URLSearchParams();
  if (query?.search) params.set("search", query.search);
  if (query?.muscleGroup) params.set("muscleGroup", query.muscleGroup);
  if (query?.category) params.set("category", query.category);
  params.set("limit", String(EXERCISES_PAGE_SIZE));
  params.set("offset", String(page * EXERCISES_PAGE_SIZE));

  return useQuery({
    queryKey: ["exercises", query],
    queryFn: () => apiFetch<Exercise[]>(`/api/exercises?${params.toString()}`),
    placeholderData: (prev) => prev,
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: ["exercises", id],
    queryFn: () => apiFetch<Exercise>(`/api/exercises/${id}`),
    enabled: !!id,
  });
}
