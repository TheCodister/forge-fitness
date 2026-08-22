import { describe, expect, it } from "vitest";

import { calculateStreak, calculateVolume } from "./workouts.js";

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

  it("returns 0 when no dates", () => {
    expect(calculateStreak([])).toBe(0);
  });

  it("returns 1 when only a single date is provided", () => {
    expect(calculateStreak([new Date("2026-04-26T08:00:00.000Z")])).toBe(1);
  });

  it("collapses multiple sessions on the same UTC day into one streak entry", () => {
    expect(
      calculateStreak([
        new Date("2026-04-26T02:00:00.000Z"),
        new Date("2026-04-26T20:00:00.000Z"),
        new Date("2026-04-25T04:00:00.000Z"),
      ]),
    ).toBe(2);
  });

  it("breaks the streak on the first gap even if there are later consecutive runs", () => {
    expect(
      calculateStreak([
        new Date("2026-04-26T00:00:00.000Z"),
        new Date("2026-04-25T00:00:00.000Z"),
        new Date("2026-04-20T00:00:00.000Z"),
        new Date("2026-04-19T00:00:00.000Z"),
      ]),
    ).toBe(2);
  });

  it("does not care about input order", () => {
    expect(
      calculateStreak([
        new Date("2026-04-24T00:00:00.000Z"),
        new Date("2026-04-26T00:00:00.000Z"),
        new Date("2026-04-25T00:00:00.000Z"),
      ]),
    ).toBe(3);
  });
});

const exercise = (over: Partial<Record<string, number | null>> = {}) => ({
  plannedSets: 3,
  plannedReps: 10,
  plannedWeight: 100,
  actualSets: null,
  actualReps: null,
  actualWeight: null,
  ...over,
}) as never;

describe("calculateVolume", () => {
  it("multiplies sets × reps × weight for each exercise and sums them", () => {
    expect(calculateVolume([exercise(), exercise()])).toBe(3 * 10 * 100 + 3 * 10 * 100);
  });

  it("prefers actualSets/Reps/Weight over their planned counterparts when set", () => {
    expect(
      calculateVolume([
        exercise({ actualSets: 4, actualReps: 8, actualWeight: 120 }),
      ]),
    ).toBe(4 * 8 * 120);
  });

  it("falls back per-field: null actualSets uses planned, but the other actuals still count", () => {
    expect(
      calculateVolume([
        exercise({ actualSets: null, actualReps: 12, actualWeight: 50 }),
      ]),
    ).toBe(3 * 12 * 50);
  });

  it("returns 0 for an empty exercise list", () => {
    expect(calculateVolume([])).toBe(0);
  });
});
