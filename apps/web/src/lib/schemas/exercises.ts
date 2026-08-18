import { z } from "zod";

import { ExerciseCategory, MuscleGroup } from "@/generated/prisma/client";

export const exercisesQuerySchema = z.object({
  category: z.nativeEnum(ExerciseCategory).optional(),
  muscleGroup: z.nativeEnum(MuscleGroup).optional(),
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(24),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
