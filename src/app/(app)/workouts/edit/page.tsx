"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { WorkoutForm } from "@/features/workouts/components/workout-form";
import { useWorkoutSession } from "@/features/workouts/api/use-workouts";

function WorkoutEditor() {
  const id = useSearchParams().get("id") ?? "";
  const { data: session, isLoading, error } = useWorkoutSession(id);
  if (!id) return <p className="text-zinc-400">No workout was selected.</p>;
  if (isLoading) return <p className="text-zinc-400">Loading workout…</p>;
  if (error || !session) return <p className="text-red-400">This workout could not be loaded.</p>;
  return <div className="space-y-8"><PageHeader title={session.name} description="Update timing, comments, status, or recorded exercise results." /><WorkoutForm session={session} /></div>;
}

export default function WorkoutEditPage() {
  return <Suspense fallback={<p className="text-zinc-400">Loading workout…</p>}><WorkoutEditor /></Suspense>;
}
