"use client";

import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { useWorkoutSessions } from "@/features/workouts/api/use-workouts";
import { cn } from "@/lib/utils";
import { WorkoutSessionCard } from "./workout-session-card";

export function WorkoutList() {
  const { data: sessions } = useWorkoutSessions();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workout Sessions"
        description="Track pending sessions, edit details, and mark completed work so your reports stay honest."
        actions={
          <Link
            href="/workouts/new"
            className={cn(
              buttonVariants({
                className: "bg-orange-500 text-black hover:bg-orange-400",
              }),
            )}
          >
            Schedule workout
          </Link>
        }
      />

      <div className="grid gap-4">
        {sessions?.map((session) => (
          <WorkoutSessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
