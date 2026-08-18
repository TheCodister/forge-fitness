import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/workouts.js", async () => {
  const actual = await vi.importActual<typeof import("../services/workouts.js")>(
    "../services/workouts.js",
  );
  return {
    ...actual,
    getSummaryReport: vi.fn(),
    getProgressReport: vi.fn(),
  };
});

import { buildApp } from "../app.js";
import { getProgressReport, getSummaryReport } from "../services/workouts.js";

describe("reports routes", () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    process.env.JWT_SECRET ??= "test-jwt-secret-please-be-at-least-32-chars-long";
    process.env.DATABASE_URL ??= "postgresql://u:p@127.0.0.1:5432/unused";
    app = await buildApp();
    await app.ready();
    token = app.jwt.sign({ sub: "user_1" });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.mocked(getSummaryReport).mockReset();
    vi.mocked(getProgressReport).mockReset();
  });

  describe("GET /reports/summary", () => {
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
      const response = await app.inject({ method: "GET", url: "/reports/summary" });
      expect(response.statusCode).toBe(401);
    });

    it("returns 401 when the cookie carries a bad JWT", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/reports/summary",
        cookies: { ff_token: "not-a-jwt" },
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /reports/progress", () => {
    it("forwards querystring filters to getProgressReport", async () => {
      vi.mocked(getProgressReport).mockResolvedValueOnce([] as never);

      const response = await app.inject({
        method: "GET",
        url: "/reports/progress?exerciseId=e1&from=2026-01-01T00:00:00Z",
        cookies: { ff_token: token },
      });

      expect(response.statusCode).toBe(200);
      expect(getProgressReport).toHaveBeenCalledWith("user_1", expect.objectContaining({
        exerciseId: "e1",
        from: "2026-01-01T00:00:00Z",
      }));
    });

    it("returns 400 when the datetime filter is malformed", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/reports/progress?from=not-a-date",
        cookies: { ff_token: token },
      });
      expect(response.statusCode).toBe(400);
    });

    it("returns 401 without an auth cookie", async () => {
      const response = await app.inject({ method: "GET", url: "/reports/progress" });
      expect(response.statusCode).toBe(401);
    });
  });
});
