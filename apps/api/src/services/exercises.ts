import { exercisesQuerySchema } from "@forge/shared";

import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import type { ExerciseCategory, MuscleGroup } from "../generated/prisma/enums.js";

export async function listExercises(query: unknown) {
  const parsed = exercisesQuerySchema.parse(query);

  return prisma.exercise.findMany({
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
}

export async function getExerciseById(id: string) {
  const exercise = await prisma.exercise.findUnique({ where: { id } });

  if (!exercise || !exercise.isActive) {
    throw new ApiError(404, "EXERCISE_NOT_FOUND", "Exercise not found.");
  }

  return exercise;
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
