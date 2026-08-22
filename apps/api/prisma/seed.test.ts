import { describe, expect, it } from "vitest";

import { exercises } from "./exercise-catalog.mjs";

describe("exercise seed catalog", () => {
  it("contains at least 20 seeded exercises", () => {
    expect(exercises.length).toBeGreaterThanOrEqual(20);
  });

  it("uses unique slugs", () => {
    const slugs = exercises.map(([slug]) => slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
