"use client";

import { useParams } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { WorkoutForm } from "@/features/workouts/components/workout-form";
import { useWorkoutSession } from "@/features/workouts/api/use-workouts";

export function WorkoutDetailClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { data, isLoading, error } = useWorkoutSession(id);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Workout" description="Loading…" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-8">
        <PageHeader title="Workout" description="Not found." />
      </div>
    );
  }

  return <WorkoutForm session={data} />;
}
