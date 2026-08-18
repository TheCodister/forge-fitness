"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/fetcher";
import type { WorkoutTemplate } from "@/types/domain";

type TemplatePayload = {
  name: string;
  description?: string | null;
  isArchived?: boolean;
  exercises: Array<{
    exerciseId: string;
    sortOrder: number;
    targetSets: number;
    targetReps: number;
    targetWeight: number;
    restSeconds?: number | null;
    notes?: string | null;
  }>;
};

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: () => apiFetch<WorkoutTemplate[]>("/workout-templates"),
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ["templates", id],
    queryFn: () => apiFetch<WorkoutTemplate>(`/workout-templates/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TemplatePayload) =>
      apiFetch<WorkoutTemplate>("/workout-templates", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useUpdateTemplate(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<TemplatePayload>) =>
      apiFetch<WorkoutTemplate>(`/workout-templates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["templates"] });
      void queryClient.invalidateQueries({ queryKey: ["templates", id] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/workout-templates/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
