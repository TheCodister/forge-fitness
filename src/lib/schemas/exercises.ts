import { z } from "zod";

import { ExerciseCategory, MuscleGroup } from "@/generated/prisma/client";

export const exercisesQuerySchema = z.object({
  category: z.nativeEnum(ExerciseCategory).optional(),
  muscleGroup: z.nativeEnum(MuscleGroup).optional(),
  search: z.string().trim().optional(),
});
