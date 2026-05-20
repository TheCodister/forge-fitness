"use client";

import { useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ExerciseDetailDialog } from "@/features/exercises/components/exercise-detail-dialog";
import type { Exercise, WorkoutTemplate } from "@/types/domain";

type Props = {
  template: WorkoutTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TemplateExercisesDialog({ template, open, onOpenChange }: Props) {
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex h-[80vh] max-w-xl flex-col border-white/10 bg-zinc-950 text-white">
          <DialogHeader>
            <DialogTitle>{template.name} — Exercises</DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
            {template.exercises.length === 0 && (
              <div className="flex h-32 items-center justify-center text-sm text-zinc-500">
                No exercises in this template.
              </div>
            )}

            {template.exercises.map((te, i) => {
              const ex = te.exercise;
              return (
                <button
                  key={te.id ?? i}
                  type="button"
                  disabled={!ex}
                  onClick={() => ex && setDetailExercise(ex)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-orange-400/30 hover:bg-orange-500/10 disabled:cursor-default disabled:opacity-50"
                >
                  {ex?.gifUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ex.gifUrl}
                      alt={ex.name}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-white/5" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {ex?.name ?? "Unknown exercise"}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {ex && (
                        <Badge className="border-orange-500/20 bg-orange-500/10 px-1.5 py-0 text-xs text-orange-300">
                          {ex.muscleGroup.replace("_", " ")}
                        </Badge>
                      )}
                      {ex?.equipment && (
                        <Badge className="border-white/10 bg-white/5 px-1.5 py-0 text-xs text-zinc-400">
                          {ex.equipment}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right text-xs text-zinc-500">
                    <p>{te.targetSets}×{te.targetReps}</p>
                    {te.targetWeight > 0 && <p>{te.targetWeight} kg</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <ExerciseDetailDialog
        exercise={detailExercise}
        open={!!detailExercise}
        onOpenChange={(open) => { if (!open) setDetailExercise(null); }}
      />
    </>
  );
}
