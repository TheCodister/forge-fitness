import { prisma } from "../database/prisma";
import { ApiError } from "../lib/api-error";
import { exercisesQuerySchema } from "../schemas/exercises";

export async function listExercises(query: unknown) {
  const parsed = exercisesQuerySchema.parse(query);

  return prisma.exercise.findMany({
    where: {
      isActive: true,
      category: parsed.category,
      muscleGroup: parsed.muscleGroup,
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
  const exercise = await prisma.exercise.findUnique({
    where: { id },
  });

  if (!exercise || !exercise.isActive) {
    throw new ApiError(404, "EXERCISE_NOT_FOUND", "Exercise not found.");
  }

  return exercise;
}
