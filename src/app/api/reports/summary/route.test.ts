import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/auth", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/lib/server/workouts", () => ({
  getSummaryReport: vi.fn(),
}));

import { GET } from "@/app/api/reports/summary/route";
import { requireUser } from "@/lib/server/auth";
import { getSummaryReport } from "@/lib/server/workouts";

describe("GET /api/reports/summary", () => {
  it("returns the report payload for the authenticated user", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce({
      id: "user_1",
      email: "athlete@example.com",
      displayName: "Athlete",
      createdAt: new Date("2026-04-26T00:00:00.000Z"),
    });
    vi.mocked(getSummaryReport).mockResolvedValueOnce({
      completedSessions: 4,
      upcomingSessions: 2,
      totalVolume: 12345,
      currentStreak: 3,
      recentSessions: [],
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.totalVolume).toBe(12345);
  });
});
