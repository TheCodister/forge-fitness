"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useExercises, EXERCISES_PAGE_SIZE } from "@/features/exercises/api/use-exercises";
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (exercise: Exercise) => void;
};

export function ExercisePickerDialog({ open, onOpenChange, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [page, setPage] = useState(0);

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

  const { data: exercises, isLoading, isFetching } = useExercises(
    open
      ? { search: debouncedSearch || undefined, muscleGroup: muscleGroup || undefined, page }
      : undefined,
  );

  const hasNext = (exercises?.length ?? 0) === EXERCISES_PAGE_SIZE;
  const hasPrev = page > 0;

  function handleSelect(exercise: Exercise) {
    onSelect(exercise);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-w-2xl flex-col border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Pick an exercise</DialogTitle>
        </DialogHeader>

        <div className="shrink-0 space-y-3">
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
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
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

        <div className={`flex flex-1 flex-col gap-2 overflow-y-auto transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}>
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-2xl bg-white/5" />
              ))}
            </div>
          )}

          {!isLoading && exercises?.length === 0 && (
            <div className="flex h-32 items-center justify-center text-sm text-zinc-500">
              No exercises found.
            </div>
          )}

          {!isLoading && exercises && exercises.length > 0 && (
            <div className="space-y-2 pr-1">
              {exercises.map((exercise) => (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => handleSelect(exercise)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-orange-400/30 hover:bg-orange-500/10"
                >
                  {exercise.gifUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={exercise.gifUrl}
                      alt={exercise.name}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-white/5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{exercise.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
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
          )}
        </div>

        {!isLoading && exercises && exercises.length > 0 && (
          <div className="flex shrink-0 items-center justify-between border-t border-white/10 pt-3">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 bg-transparent text-white hover:bg-white/5 disabled:opacity-30"
              disabled={!hasPrev}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Prev
            </Button>
            <span className="text-xs text-zinc-500">Page {page + 1}</span>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 bg-transparent text-white hover:bg-white/5 disabled:opacity-30"
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
