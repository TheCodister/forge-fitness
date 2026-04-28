import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { WorkoutForm } from "@/features/workouts/components/workout-form";
import { getCurrentUser } from "@/lib/server/auth";
import { getWorkoutSession } from "@/lib/server/workouts";
import type { WorkoutSession } from "@/types/domain";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    notFound();
  }

  const session = await getWorkoutSession(user.id, id).catch(() => null);

  if (!session) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader title={session.name} description="Update timing, comments, status, or recorded exercise results." />
      <WorkoutForm session={session as unknown as WorkoutSession} />
    </div>
  );
}
