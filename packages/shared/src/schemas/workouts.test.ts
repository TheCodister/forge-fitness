import { describe, expect, it } from "vitest";

import {
  progressQuerySchema,
  sessionExerciseInputSchema,
  templateExerciseInputSchema,
  workoutSessionCreateSchema,
  workoutSessionUpdateSchema,
  workoutSessionsQuerySchema,
  workoutTemplateSchema,
  workoutTemplateUpdateSchema,
} from "./workouts.js";

describe("templateExerciseInputSchema", () => {
  const base = {
    exerciseId: "ex_1",
    sortOrder: 0,
    targetSets: 3,
    targetReps: 10,
    targetWeight: 100,
  };

  it("accepts a minimal valid input", () => {
    expect(templateExerciseInputSchema.safeParse(base).success).toBe(true);
  });

  it.each([
    ["negative sortOrder", { sortOrder: -1 }],
    ["non-positive targetSets", { targetSets: 0 }],
    ["non-positive targetReps", { targetReps: 0 }],
    ["negative targetWeight", { targetWeight: -1 }],
    ["notes exceeding 300 chars", { notes: "a".repeat(301) }],
  ])("rejects %s", (_label, patch) => {
    expect(templateExerciseInputSchema.safeParse({ ...base, ...patch }).success).toBe(false);
  });

  it("allows null restSeconds and null notes", () => {
    expect(
      templateExerciseInputSchema.safeParse({ ...base, restSeconds: null, notes: null }).success,
    ).toBe(true);
  });
});

describe("workoutTemplateSchema", () => {
  const validExercise = {
    exerciseId: "ex_1",
    sortOrder: 0,
    targetSets: 3,
    targetReps: 10,
    targetWeight: 100,
  };

  it("requires at least one exercise", () => {
    expect(
      workoutTemplateSchema.safeParse({ name: "Push", exercises: [] }).success,
    ).toBe(false);
  });

  it("trims and enforces the 2-80 char name bounds", () => {
    expect(
      workoutTemplateSchema.safeParse({ name: " X ", exercises: [validExercise] }).success,
    ).toBe(false);
    const parsed = workoutTemplateSchema.parse({
      name: "  Push day  ",
      exercises: [validExercise],
    });
    expect(parsed.name).toBe("Push day");
  });
});

describe("workoutTemplateUpdateSchema", () => {
  it("makes every field optional but still validates exercise shape when present", () => {
    expect(workoutTemplateUpdateSchema.safeParse({}).success).toBe(true);
    expect(
      workoutTemplateUpdateSchema.safeParse({ exercises: [{ nope: true }] }).success,
    ).toBe(false);
  });
});

describe("sessionExerciseInputSchema", () => {
  it("accepts a planned-only exercise", () => {
    expect(
      sessionExerciseInputSchema.safeParse({
        exerciseId: "ex_1",
        sortOrder: 0,
        plannedSets: 3,
        plannedReps: 10,
        plannedWeight: 100,
      }).success,
    ).toBe(true);
  });

  it("accepts null actuals", () => {
    expect(
      sessionExerciseInputSchema.safeParse({
        exerciseId: "ex_1",
        sortOrder: 0,
        plannedSets: 3,
        plannedReps: 10,
        plannedWeight: 100,
        actualSets: null,
        actualReps: null,
        actualWeight: null,
      }).success,
    ).toBe(true);
  });
});

describe("workoutSessionCreateSchema", () => {
  const validExercise = {
    exerciseId: "ex_1",
    sortOrder: 0,
    plannedSets: 3,
    plannedReps: 10,
    plannedWeight: 100,
  };

  it("accepts a template-backed session", () => {
    expect(
      workoutSessionCreateSchema.safeParse({
        templateId: "t_1",
        name: "AM lift",
        scheduledAt: "2026-04-26T08:00:00.000Z",
      }).success,
    ).toBe(true);
  });

  it("accepts a custom session with exercises", () => {
    expect(
      workoutSessionCreateSchema.safeParse({
        name: "Custom",
        scheduledAt: "2026-04-26T08:00:00.000Z",
        exercises: [validExercise],
      }).success,
    ).toBe(true);
  });

  it("rejects a custom session with no template and no exercises", () => {
    const result = workoutSessionCreateSchema.safeParse({
      name: "Custom",
      scheduledAt: "2026-04-26T08:00:00.000Z",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.at(0)?.path).toEqual(["exercises"]);
    }
  });

  it("rejects a non-ISO scheduledAt", () => {
    expect(
      workoutSessionCreateSchema.safeParse({
        name: "x",
        scheduledAt: "yesterday",
        templateId: "t_1",
      }).success,
    ).toBe(false);
  });
});

describe("workoutSessionUpdateSchema", () => {
  it("accepts a valid WorkoutStatus string", () => {
    expect(workoutSessionUpdateSchema.safeParse({ status: "completed" }).success).toBe(true);
  });

  it("rejects a status outside the enum", () => {
    expect(workoutSessionUpdateSchema.safeParse({ status: "meh" }).success).toBe(false);
  });
});

describe("workoutSessionsQuerySchema", () => {
  it("accepts empty filters", () => {
    expect(workoutSessionsQuerySchema.safeParse({}).success).toBe(true);
  });

  it("requires ISO datetime for from/to", () => {
    expect(workoutSessionsQuerySchema.safeParse({ from: "nope" }).success).toBe(false);
  });
});

describe("progressQuerySchema", () => {
  it("accepts any of exerciseId, from, to", () => {
    expect(
      progressQuerySchema.safeParse({
        exerciseId: "ex_1",
        from: "2026-01-01T00:00:00.000Z",
      }).success,
    ).toBe(true);
  });
});
