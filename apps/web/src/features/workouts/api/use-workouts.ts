"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/fetcher";
import type { WorkoutSession } from "@/types/domain";

type SessionPayload = {
  templateId?: string | null;
  name: string;
  scheduledAt: string;
  comments?: string | null;
  exercises?: Array<{
    exerciseId: string;
    sortOrder: number;
    plannedSets: number;
    plannedReps: number;
    plannedWeight: number;
    actualSets?: number | null;
    actualReps?: number | null;
    actualWeight?: number | null;
    notes?: string | null;
  }>;
  status?: WorkoutSession["status"];
};

export function useWorkoutSessions(query?: string) {
  const path = query ? `/api/workout-sessions?${query}` : "/api/workout-sessions";
  return useQuery({
    queryKey: ["workout-sessions", query ?? ""],
    queryFn: () => apiFetch<WorkoutSession[]>(path),
  });
}

export function useWorkoutSession(id: string) {
  return useQuery({
    queryKey: ["workout-session", id],
    queryFn: () => apiFetch<WorkoutSession>(`/api/workout-sessions/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateWorkoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SessionPayload) =>
      apiFetch<WorkoutSession>("/api/workout-sessions", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workout-sessions"] });
    },
  });
}

export function useUpdateWorkoutSession(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<SessionPayload>) =>
      apiFetch<WorkoutSession>(`/api/workout-sessions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workout-sessions"] });
      void queryClient.invalidateQueries({ queryKey: ["workout-session", id] });
      void queryClient.invalidateQueries({ queryKey: ["summary-report"] });
      void queryClient.invalidateQueries({ queryKey: ["progress-report"] });
    },
  });
}

export function useDeleteWorkoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/workout-sessions/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workout-sessions"] });
      void queryClient.invalidateQueries({ queryKey: ["summary-report"] });
      void queryClient.invalidateQueries({ queryKey: ["progress-report"] });
    },
  });
}
