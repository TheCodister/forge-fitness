"use client";

import { Badge } from "@/components/ui/badge";
import type { Exercise } from "@/types/domain";

type ExerciseCardProps = {
  exercise: Exercise;
  onClick?: (exercise: Exercise) => void;
};

export function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(exercise)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-left transition hover:border-orange-400/30 hover:bg-orange-500/5"
    >
      <div className="flex h-44 items-center justify-center bg-black/60 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={exercise.gifUrl!}
          alt={exercise.name}
          className="h-full w-full object-contain"
          loading="eager"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-sm font-medium leading-snug text-white group-hover:text-orange-200">
          {exercise.name}
        </p>
        <div className="flex flex-wrap gap-1">
          <Badge className="border-orange-500/20 bg-orange-500/10 px-1.5 py-0 text-xs text-orange-300">
            {exercise.muscleGroup.replace("_", " ")}
          </Badge>
          {exercise.equipment && (
            <Badge className="border-white/10 bg-white/5 px-1.5 py-0 text-xs text-zinc-400">
              {exercise.equipment}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
