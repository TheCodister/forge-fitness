"use client";

import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSummaryReport } from "@/features/reports/api/use-reports";
import { useWorkoutSessions } from "@/features/workouts/api/use-workouts";
import { cn } from "@/lib/utils";

export function DashboardOverview() {
  const { data: summary } = useSummaryReport();
  const { data: sessions } = useWorkoutSessions("status=scheduled");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="See your training rhythm at a glance, then jump straight into planning or editing the next session."
        actions={
          <div className="flex gap-3">
            <Link
              href="/workouts/new"
              className={cn(
                buttonVariants({ className: "bg-orange-500 text-black hover:bg-orange-400" }),
              )}
            >
              Schedule workout
            </Link>
            <Link
              href="/templates/new"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  className: "border-white/10 bg-transparent text-white hover:bg-white/5",
                }),
              )}
            >
              Create template
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Completed sessions"
          value={`${summary?.completedSessions ?? 0}`}
          hint="Finished workouts in your history."
        />
        <StatCard
          label="Upcoming sessions"
          value={`${summary?.upcomingSessions ?? 0}`}
          hint="Scheduled sessions still ahead."
        />
        <StatCard
          label="Total volume"
          value={`${Math.round(summary?.totalVolume ?? 0).toLocaleString()} kg`}
          hint="Computed from recorded sets, reps, and weight."
        />
        <StatCard
          label="Current streak"
          value={`${summary?.currentStreak ?? 0} days`}
          hint="Consecutive days with completed training."
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <Card className="border-white/10 bg-zinc-950/70 text-white">
          <CardHeader>
            <CardTitle>Upcoming workouts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions?.length ? (
              sessions.slice(0, 5).map((session) => (
                <Link
                  key={session.id}
                  href={`/workouts/${session.id}`}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-orange-400/30 hover:bg-orange-500/10"
                >
                  <div>
                    <div className="font-medium">{session.name}</div>
                    <div className="text-sm text-zinc-400">
                      {new Date(session.scheduledAt).toLocaleString()}
                    </div>
                  </div>
                  <Badge className="bg-orange-500/15 text-orange-300">{session.status}</Badge>
                </Link>
              ))
            ) : (
              <p className="text-sm text-zinc-400">No scheduled workouts yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/70 text-white">
          <CardHeader>
            <CardTitle>Recent completions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary?.recentSessions?.length ? (
              summary.recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="font-medium">{session.name}</div>
                  <div className="text-sm text-zinc-400">
                    {session.completedAt
                      ? new Date(session.completedAt).toLocaleString()
                      : "Completed"}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">Complete a workout to see it here.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
