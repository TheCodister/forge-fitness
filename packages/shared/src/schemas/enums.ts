import { z } from "zod";

// Mirror of Prisma enums used at the HTTP boundary. Kept in sync with
// apps/api/prisma/schema.prisma. The backend maps to/from Prisma's real
// enum types; the frontend and wire format use these string literals.

export const workoutStatusValues = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export const workoutStatusSchema = z.enum(workoutStatusValues);
export type WorkoutStatus = z.infer<typeof workoutStatusSchema>;

export const exerciseCategoryValues = [
  "cardio",
  "strength",
  "flexibility",
  "mobility",
  "conditioning",
] as const;
export const exerciseCategorySchema = z.enum(exerciseCategoryValues);
export type ExerciseCategory = z.infer<typeof exerciseCategorySchema>;

export const muscleGroupValues = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "full_body",
] as const;
export const muscleGroupSchema = z.enum(muscleGroupValues);
export type MuscleGroup = z.infer<typeof muscleGroupSchema>;

export const aiProviderValues = ["openai", "anthropic", "google"] as const;
export const aiProviderSchema = z.enum(aiProviderValues);
export type AiProvider = z.infer<typeof aiProviderSchema>;
