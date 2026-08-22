import { z } from "zod";

import { exerciseCategorySchema, muscleGroupSchema } from "./enums.js";

export const exercisesQuerySchema = z.object({
  category: exerciseCategorySchema.optional(),
  muscleGroup: muscleGroupSchema.optional(),
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(24),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type ExercisesQuery = z.infer<typeof exercisesQuerySchema>;
