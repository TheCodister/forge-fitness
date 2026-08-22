import { exercisesQuerySchema } from "@forge/shared";

import { ApiError } from "../lib/errors.js";
import { getExerciseImageUrl } from "../lib/exercise-images.js";
import { prisma } from "../lib/prisma.js";
import type { ExerciseCategory, MuscleGroup } from "../generated/prisma/enums.js";

// Legacy DB rows carry gifUrl like "/api/exercise-image/<dbId>". That path
// no longer exists (Next API routes are gone). Rebuild gifUrl from the CDN
// base + exerciseDbId whenever we return an exercise over HTTP.
export function withResolvedImage<T extends { exerciseDbId?: string | null; gifUrl?: string | null }>(
  exercise: T,
): T {
  if (!exercise.exerciseDbId) return exercise;
  return { ...exercise, gifUrl: getExerciseImageUrl(exercise.exerciseDbId) };
}

export async function listExercises(query: unknown) {
  const parsed = exercisesQuerySchema.parse(query);

  const rows = await prisma.exercise.findMany({
    where: {
      isActive: true,
      category: parsed.category as ExerciseCategory | undefined,
      muscleGroup: parsed.muscleGroup as MuscleGroup | undefined,
      OR: parsed.search
        ? [
            { name: { contains: parsed.search, mode: "insensitive" } },
            { description: { contains: parsed.search, mode: "insensitive" } },
            { equipment: { contains: parsed.search, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: { name: "asc" },
    take: parsed.limit,
    skip: parsed.offset,
  });

  return rows.map(withResolvedImage);
}

export async function getExerciseById(id: string) {
  const exercise = await prisma.exercise.findUnique({ where: { id } });

  if (!exercise || !exercise.isActive) {
    throw new ApiError(404, "EXERCISE_NOT_FOUND", "Exercise not found.");
  }

  return withResolvedImage(exercise);
}

export async function assertKnownExerciseDbIds(exerciseIds: string[]) {
  const known = await prisma.exercise.findMany({
    where: {
      isActive: true,
      exerciseDbId: { in: exerciseIds },
    },
    select: { exerciseDbId: true },
  });
  const knownIds = new Set(known.map((exercise) => exercise.exerciseDbId).filter(Boolean));

  if (knownIds.size !== exerciseIds.length) {
    throw new ApiError(404, "EXERCISE_NOT_FOUND", "Exercise not found.");
  }
}
