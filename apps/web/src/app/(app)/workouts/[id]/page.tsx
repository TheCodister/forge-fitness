"use client";

import { PageHeader } from "@/components/shared/page-header";

// TODO(task-8): fetch workout session client-side via React Query and render
// <WorkoutForm session={session} />. Kept as a stub while the auth backend
// swap lands; the previous server-side data fetch relied on Prisma access
// from the Next server, which is going away with static export.
export default function WorkoutDetailPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Workout" description="Loading…" />
    </div>
  );
}
