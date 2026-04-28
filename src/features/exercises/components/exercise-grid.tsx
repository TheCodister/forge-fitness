"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useExercises, EXERCISES_PAGE_SIZE } from "@/features/exercises/api/use-exercises";
import { ExerciseDetailDialog } from "@/features/exercises/components/exercise-detail-dialog";
import type { Exercise } from "@/types/domain";

const MUSCLE_GROUPS = [
  { value: "", label: "All" },
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "legs", label: "Legs" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "core", label: "Core" },
  { value: "full_body", label: "Full Body" },
];

export function ExerciseGrid() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  function handleMuscleGroup(value: string) {
    setMuscleGroup(value);
    setPage(0);
  }

  const { data: exercises, isLoading, isFetching } = useExercises({
    search: debouncedSearch || undefined,
    muscleGroup: muscleGroup || undefined,
    page,
  });

  const hasNext = (exercises?.length ?? 0) === EXERCISES_PAGE_SIZE;
  const hasPrev = page > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search exercises..."
            className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-zinc-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {MUSCLE_GROUPS.map((mg) => (
            <button
              key={mg.value}
              type="button"
              onClick={() => handleMuscleGroup(mg.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                muscleGroup === mg.value
                  ? "bg-orange-500 text-black"
                  : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {mg.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl bg-white/5" />
          ))}
        </div>
      )}

      {!isLoading && exercises?.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-zinc-500">
          No exercises found.
        </div>
      )}

      {!isLoading && exercises && exercises.length > 0 && (
        <div className={`space-y-6 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {exercises.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => { setSelected(exercise); setDialogOpen(true); }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-left transition hover:border-orange-400/30 hover:bg-orange-500/5"
              >
                <div className="flex h-44 items-center justify-center bg-black/60 p-4">
                  {exercise.gifUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={exercise.gifUrl}
                      alt={exercise.name}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full rounded-xl bg-white/5" />
                  )}
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
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              className="border-white/10 bg-transparent text-white hover:bg-white/5 disabled:opacity-30"
              disabled={!hasPrev}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <span className="text-sm text-zinc-500">Page {page + 1}</span>
            <Button
              variant="outline"
              className="border-white/10 bg-transparent text-white hover:bg-white/5 disabled:opacity-30"
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ExerciseDetailDialog exercise={selected} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
