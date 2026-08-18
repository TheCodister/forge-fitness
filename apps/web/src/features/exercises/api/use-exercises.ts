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

type ExerciseImageListResponse = {
  images: Array<{
    exerciseId: string;
    imageUrl: string;
  }>;
  total: number;
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
    queryFn: async () => {
      const exercises = await apiFetch<Exercise[]>(`/api/exercises?${params.toString()}`);
      const exerciseIds = Array.from(
        new Set(
          exercises
            .map((exercise) => exercise.exerciseDbId)
            .filter((id): id is string => !!id)
        )
      );

      if (exerciseIds.length === 0) {
        return exercises;
      }

      const imageParams = new URLSearchParams({
        exerciseIds: exerciseIds.join(","),
      });
      const imageResponse = await apiFetch<ExerciseImageListResponse>(
        `/api/exercises/image?${imageParams.toString()}`
      );

      const imageByExerciseId = new Map(
        imageResponse.images.map((image) => [image.exerciseId, image.imageUrl])
      );

      return exercises.map((exercise) => {
        if (!exercise.exerciseDbId) {
          return exercise;
        }

        const imageUrl = imageByExerciseId.get(exercise.exerciseDbId);
        if (!imageUrl) {
          return exercise;
        }

        return {
          ...exercise,
          gifUrl: imageUrl,
        };
      });
    },
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
