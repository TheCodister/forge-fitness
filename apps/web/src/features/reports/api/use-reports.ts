"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/fetcher";
import type { ProgressEntry, SummaryReport } from "@/types/domain";

export function useSummaryReport() {
  return useQuery({
    queryKey: ["summary-report"],
    queryFn: () => apiFetch<SummaryReport>("/reports/summary"),
  });
}

export function useProgressReport() {
  return useQuery({
    queryKey: ["progress-report"],
    queryFn: () => apiFetch<ProgressEntry[]>("/reports/progress"),
  });
}
