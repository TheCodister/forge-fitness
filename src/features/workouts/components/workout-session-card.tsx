"use client";

import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteWorkoutSession } from "@/features/workouts/api/use-workouts";
import { cn } from "@/lib/utils";
import type { WorkoutSession } from "@/types/domain";

interface WorkoutSessionCardProps {
  session: WorkoutSession;
}

export function WorkoutSessionCard({ session }: WorkoutSessionCardProps) {
  const deleteSession = useDeleteWorkoutSession();

  return (
    <Card className="border-white/10 bg-zinc-950/70 text-white">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{session.name}</CardTitle>
          <p className="mt-2 text-sm text-zinc-400">
            {new Date(session.scheduledAt).toLocaleString()}
          </p>
        </div>
        <Badge className="bg-orange-500/15 text-orange-300">
          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-400">
          {session.comments || "No session notes added yet."}
        </p>
        <div className="flex gap-3">
          <Link
            href={`/workouts/${session.id}`}
            className={cn(
              buttonVariants({
                className: "bg-orange-500 text-black hover:bg-orange-400",
              }),
            )}
          >
            Edit
          </Link>
          <Button
            type="button"
            variant="outline"
            className="border-white/10 bg-transparent text-white hover:bg-white/5"
            onClick={async () => {
              await deleteSession.mutateAsync(session.id);
              toast.success("Workout deleted.");
            }}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
