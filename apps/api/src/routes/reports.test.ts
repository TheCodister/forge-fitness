import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { FastifyInstance } from "fastify";

vi.mock("../services/workouts.js", async () => {
  const actual =
    await vi.importActual<typeof import("../services/workouts.js")>(
      "../services/workouts.js",
    );
  return {
    ...actual,
    getSummaryReport: vi.fn(),
  };
});

import { buildApp } from "../app.js";
import { getSummaryReport } from "../services/workouts.js";

describe("GET /reports/summary", () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    process.env.JWT_SECRET ??=
      "test-jwt-secret-please-be-at-least-32-chars-long";
    process.env.DATABASE_URL ??= "postgresql://u:p@127.0.0.1:5432/unused";
    app = await buildApp();
    await app.ready();
    token = app.jwt.sign({ sub: "user_1" });
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns the summary for the authenticated user", async () => {
    vi.mocked(getSummaryReport).mockResolvedValueOnce({
      completedSessions: 4,
      upcomingSessions: 2,
      totalVolume: 12345,
      currentStreak: 3,
      recentSessions: [],
    } as never);

    const response = await app.inject({
      method: "GET",
      url: "/reports/summary",
      cookies: { ff_token: token },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().totalVolume).toBe(12345);
    expect(getSummaryReport).toHaveBeenCalledWith("user_1");
  });

  it("returns 401 without an auth cookie", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/reports/summary",
    });
    expect(response.statusCode).toBe(401);
  });
});
