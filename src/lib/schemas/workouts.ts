import { z } from "zod";

import { WorkoutStatus } from "@/generated/prisma/client";

export const templateExerciseInputSchema = z.object({
  exerciseId: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
  targetSets: z.number().int().positive(),
  targetReps: z.number().int().positive(),
  targetWeight: z.number().nonnegative(),
  restSeconds: z.number().int().nonnegative().nullable().optional(),
  notes: z.string().trim().max(300).nullable().optional(),
});

export const workoutTemplateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(400).nullable().optional(),
  isArchived: z.boolean().optional(),
  exercises: z.array(templateExerciseInputSchema).min(1),
});

export const workoutTemplateUpdateSchema = workoutTemplateSchema.partial().extend({
  exercises: z.array(templateExerciseInputSchema).min(1).optional(),
});

export const sessionExerciseInputSchema = z.object({
  exerciseId: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
  plannedSets: z.number().int().positive(),
  plannedReps: z.number().int().positive(),
  plannedWeight: z.number().nonnegative(),
  actualSets: z.number().int().positive().nullable().optional(),
  actualReps: z.number().int().positive().nullable().optional(),
  actualWeight: z.number().nonnegative().nullable().optional(),
  notes: z.string().trim().max(300).nullable().optional(),
});

export const workoutSessionCreateSchema = z
  .object({
    templateId: z.string().min(1).nullable().optional(),
    name: z.string().trim().min(2).max(80),
    scheduledAt: z.iso.datetime(),
    comments: z.string().trim().max(400).nullable().optional(),
    exercises: z.array(sessionExerciseInputSchema).min(1).optional(),
  })
  .refine((value) => value.templateId || value.exercises?.length, {
    message: "Custom workout sessions require exercises.",
    path: ["exercises"],
  });

export const workoutSessionUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  scheduledAt: z.iso.datetime().optional(),
  status: z.nativeEnum(WorkoutStatus).optional(),
  comments: z.string().trim().max(400).nullable().optional(),
  exercises: z.array(sessionExerciseInputSchema).min(1).optional(),
});

export const workoutSessionsQuerySchema = z.object({
  status: z.nativeEnum(WorkoutStatus).optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
});

export const progressQuerySchema = z.object({
  exerciseId: z.string().optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
});
