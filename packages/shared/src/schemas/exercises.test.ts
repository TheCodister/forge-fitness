import { describe, expect, it } from "vitest";

import { exercisesQuerySchema } from "./exercises.js";

describe("exercisesQuerySchema", () => {
  it("applies default limit and offset", () => {
    const parsed = exercisesQuerySchema.parse({});
    expect(parsed.limit).toBe(24);
    expect(parsed.offset).toBe(0);
  });

  it("coerces limit and offset from strings (querystring-style)", () => {
    const parsed = exercisesQuerySchema.parse({ limit: "50", offset: "10" });
    expect(parsed.limit).toBe(50);
    expect(parsed.offset).toBe(10);
  });

  it.each([
    ["limit below 1", { limit: 0 }],
    ["limit above 100", { limit: 101 }],
    ["negative offset", { offset: -1 }],
  ])("rejects %s", (_label, patch) => {
    expect(exercisesQuerySchema.safeParse(patch).success).toBe(false);
  });

  it("accepts a known category and muscle group", () => {
    expect(
      exercisesQuerySchema.safeParse({ category: "strength", muscleGroup: "chest" }).success,
    ).toBe(true);
  });

  it("rejects an unknown category", () => {
    expect(exercisesQuerySchema.safeParse({ category: "yoga" }).success).toBe(false);
  });

  it("trims whitespace off the search filter", () => {
    expect(exercisesQuerySchema.parse({ search: "  bench  " }).search).toBe("bench");
  });
});
