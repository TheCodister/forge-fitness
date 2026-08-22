import { describe, expect, it } from "vitest";

import {
  aiProviderSchema,
  aiProviderValues,
  exerciseCategorySchema,
  exerciseCategoryValues,
  muscleGroupSchema,
  muscleGroupValues,
  workoutStatusSchema,
  workoutStatusValues,
} from "./enums.js";

describe("enum values (kept in sync with prisma/schema.prisma)", () => {
  it("workoutStatusValues covers scheduled → in_progress → completed → cancelled", () => {
    expect(workoutStatusValues).toEqual([
      "scheduled",
      "in_progress",
      "completed",
      "cancelled",
    ]);
  });

  it("exerciseCategoryValues covers the five Prisma categories", () => {
    expect(exerciseCategoryValues).toEqual([
      "cardio",
      "strength",
      "flexibility",
      "mobility",
      "conditioning",
    ]);
  });

  it("muscleGroupValues covers the seven Prisma groups", () => {
    expect(muscleGroupValues).toEqual([
      "chest",
      "back",
      "legs",
      "shoulders",
      "arms",
      "core",
      "full_body",
    ]);
  });

  it("aiProviderValues covers openai, anthropic, google", () => {
    expect(aiProviderValues).toEqual(["openai", "anthropic", "google"]);
  });
});

describe("enum schemas reject values outside the allowed set", () => {
  it("workoutStatusSchema rejects 'meh'", () => {
    expect(workoutStatusSchema.safeParse("meh").success).toBe(false);
  });

  it("exerciseCategorySchema rejects 'yoga'", () => {
    expect(exerciseCategorySchema.safeParse("yoga").success).toBe(false);
  });

  it("muscleGroupSchema rejects 'neck'", () => {
    expect(muscleGroupSchema.safeParse("neck").success).toBe(false);
  });

  it("aiProviderSchema rejects 'cohere'", () => {
    expect(aiProviderSchema.safeParse("cohere").success).toBe(false);
  });
});
