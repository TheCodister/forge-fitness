import { describe, expect, it } from "vitest";

import { calculateStreak } from "./workouts.js";

describe("calculateStreak", () => {
  it("counts consecutive-day streaks", () => {
    const streak = calculateStreak([
      new Date("2026-04-26T08:00:00.000Z"),
      new Date("2026-04-25T08:00:00.000Z"),
      new Date("2026-04-24T08:00:00.000Z"),
      new Date("2026-04-22T08:00:00.000Z"),
    ]);
    expect(streak).toBe(3);
  });

  it("returns zero when no dates", () => {
    expect(calculateStreak([])).toBe(0);
  });
});
