"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Exercise } from "@/types/domain";

type Props = {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExerciseDetailDialog({ exercise, open, onOpenChange }: Props) {
  if (!exercise) return null;

  const instructions = exercise.instructions ?? [];
  const secondary = exercise.secondaryMuscles ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{exercise.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {exercise.gifUrl && (
            <div className="flex justify-center rounded-2xl border border-white/10 bg-black/40 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={exercise.gifUrl}
                alt={exercise.name}
                className="h-64 w-auto rounded-xl object-contain"
                loading="lazy"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge className="border-orange-500/30 bg-orange-500/10 text-orange-300">
              {exercise.category}
            </Badge>
            <Badge className="border-white/10 bg-white/5 text-zinc-300">
              {exercise.muscleGroup.replace("_", " ")}
            </Badge>
            {exercise.targetMuscle && (
              <Badge className="border-white/10 bg-white/5 text-zinc-300">
                Target: {exercise.targetMuscle}
              </Badge>
            )}
            {exercise.equipment && (
              <Badge className="border-white/10 bg-white/5 text-zinc-300">
                {exercise.equipment}
              </Badge>
            )}
          </div>

          {secondary.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-400">Secondary muscles</p>
              <div className="flex flex-wrap gap-2">
                {secondary.map((m) => (
                  <Badge key={m} className="border-white/5 bg-white/5 text-xs text-zinc-400">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {instructions.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-medium text-zinc-400">Instructions</p>
              <ol className="space-y-3">
                {instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-300">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-xs font-semibold text-orange-400">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {instructions.length === 0 && exercise.description && (
            <p className="text-sm text-zinc-400">{exercise.description}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
