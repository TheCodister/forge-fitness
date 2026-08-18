"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProgressReport, useSummaryReport } from "@/features/reports/api/use-reports";

export function ReportsOverview() {
  const { data: summary } = useSummaryReport();
  const { data: progress } = useProgressReport();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Review consistency, total volume, and which lifts are moving the fastest."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Completed"
          value={`${summary?.completedSessions ?? 0}`}
          hint="Finished sessions available for analysis."
        />
        <StatCard
          label="Current streak"
          value={`${summary?.currentStreak ?? 0} days`}
          hint="How consistently you are keeping the habit alive."
        />
        <StatCard
          label="Total volume"
          value={`${Math.round(summary?.totalVolume ?? 0).toLocaleString()} kg`}
          hint="Aggregate training load from finished sessions."
        />
      </div>

      <Card className="border-white/10 bg-zinc-950/70 text-white">
        <CardHeader>
          <CardTitle>Exercise progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {progress?.length ? (
            progress.map((entry) => (
              <div
                key={entry.exerciseId}
                className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 md:grid-cols-4"
              >
                <div>
                  <div className="font-medium">{entry.exerciseName}</div>
                  <div className="text-sm text-zinc-400">
                    Last trained {new Date(entry.lastPerformedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm text-zinc-300">Best weight: {entry.bestWeight} kg</div>
                <div className="text-sm text-zinc-300">
                  Best volume: {Math.round(entry.bestVolume).toLocaleString()} kg
                </div>
                <div className="text-sm text-zinc-300">
                  Sessions completed: {entry.totalSessions}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-400">Complete workouts to populate progress analytics.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
