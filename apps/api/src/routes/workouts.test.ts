import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/workouts.js", async () => {
  const actual = await vi.importActual<typeof import("../services/workouts.js")>(
    "../services/workouts.js",
  );
  return {
    ...actual,
    listWorkoutTemplates: vi.fn(),
    getWorkoutTemplate: vi.fn(),
    createWorkoutTemplate: vi.fn(),
    updateWorkoutTemplate: vi.fn(),
    deleteWorkoutTemplate: vi.fn(),
    listWorkoutSessions: vi.fn(),
    getWorkoutSession: vi.fn(),
    createWorkoutSession: vi.fn(),
    updateWorkoutSession: vi.fn(),
    deleteWorkoutSession: vi.fn(),
  };
});

import { buildApp } from "../app.js";
import {
  createWorkoutSession,
  createWorkoutTemplate,
  deleteWorkoutSession,
  deleteWorkoutTemplate,
  getWorkoutSession,
  getWorkoutTemplate,
  listWorkoutSessions,
  listWorkoutTemplates,
  updateWorkoutSession,
  updateWorkoutTemplate,
} from "../services/workouts.js";

const validTemplate = {
  name: "Push day",
  description: null,
  exercises: [
    {
      exerciseId: "ex_1",
      sortOrder: 0,
      targetSets: 3,
      targetReps: 10,
      targetWeight: 100,
    },
  ],
};

const validSession = {
  name: "Morning lift",
  scheduledAt: "2026-04-26T08:00:00.000Z",
  exercises: [
    {
      exerciseId: "ex_1",
      sortOrder: 0,
      plannedSets: 3,
      plannedReps: 10,
      plannedWeight: 100,
    },
  ],
};

describe("workout routes", () => {
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
    for (const m of [
      listWorkoutTemplates,
      getWorkoutTemplate,
      createWorkoutTemplate,
      updateWorkoutTemplate,
      deleteWorkoutTemplate,
      listWorkoutSessions,
      getWorkoutSession,
      createWorkoutSession,
      updateWorkoutSession,
      deleteWorkoutSession,
    ]) {
      vi.mocked(m).mockReset();
    }
  });

  describe("workout templates", () => {
    it("requires auth on the list endpoint", async () => {
      const response = await app.inject({ method: "GET", url: "/workout-templates" });
      expect(response.statusCode).toBe(401);
    });

    it("lists templates for the authenticated user", async () => {
      vi.mocked(listWorkoutTemplates).mockResolvedValueOnce([] as never);
      const response = await app.inject({
        method: "GET",
        url: "/workout-templates",
        cookies: { ff_token: token },
      });
      expect(response.statusCode).toBe(200);
      expect(listWorkoutTemplates).toHaveBeenCalledWith("user_1");
    });

    it("creates a template with 201 and forwards the parsed body", async () => {
      vi.mocked(createWorkoutTemplate).mockResolvedValueOnce({ id: "t_1" } as never);
      const response = await app.inject({
        method: "POST",
        url: "/workout-templates",
        cookies: { ff_token: token },
        payload: validTemplate,
      });
      expect(response.statusCode).toBe(201);
      expect(createWorkoutTemplate).toHaveBeenCalledWith("user_1", validTemplate);
    });

    it("rejects a template payload missing exercises with 400", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/workout-templates",
        cookies: { ff_token: token },
        payload: { name: "x", exercises: [] },
      });
      expect(response.statusCode).toBe(400);
      expect(createWorkoutTemplate).not.toHaveBeenCalled();
    });

    it("fetches a single template by id", async () => {
      vi.mocked(getWorkoutTemplate).mockResolvedValueOnce({ id: "t_1" } as never);
      const response = await app.inject({
        method: "GET",
        url: "/workout-templates/t_1",
        cookies: { ff_token: token },
      });
      expect(response.statusCode).toBe(200);
      expect(getWorkoutTemplate).toHaveBeenCalledWith("user_1", "t_1");
    });

    it("updates a template via PATCH", async () => {
      vi.mocked(updateWorkoutTemplate).mockResolvedValueOnce({ id: "t_1" } as never);
      const response = await app.inject({
        method: "PATCH",
        url: "/workout-templates/t_1",
        cookies: { ff_token: token },
        payload: { name: "Renamed" },
      });
      expect(response.statusCode).toBe(200);
      expect(updateWorkoutTemplate).toHaveBeenCalledWith("user_1", "t_1", { name: "Renamed" });
    });

    it("deletes a template with 204", async () => {
      vi.mocked(deleteWorkoutTemplate).mockResolvedValueOnce(undefined as never);
      const response = await app.inject({
        method: "DELETE",
        url: "/workout-templates/t_1",
        cookies: { ff_token: token },
      });
      expect(response.statusCode).toBe(204);
      expect(deleteWorkoutTemplate).toHaveBeenCalledWith("user_1", "t_1");
    });
  });

  describe("workout sessions", () => {
    it("lists sessions with optional status filter", async () => {
      vi.mocked(listWorkoutSessions).mockResolvedValueOnce([] as never);
      const response = await app.inject({
        method: "GET",
        url: "/workout-sessions?status=completed",
        cookies: { ff_token: token },
      });
      expect(response.statusCode).toBe(200);
      expect(listWorkoutSessions).toHaveBeenCalledWith(
        "user_1",
        expect.objectContaining({ status: "completed" }),
      );
    });

    it("rejects an invalid status enum with 400", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/workout-sessions?status=bogus",
        cookies: { ff_token: token },
      });
      expect(response.statusCode).toBe(400);
      expect(listWorkoutSessions).not.toHaveBeenCalled();
    });

    it("creates a session with 201", async () => {
      vi.mocked(createWorkoutSession).mockResolvedValueOnce({ id: "s_1" } as never);
      const response = await app.inject({
        method: "POST",
        url: "/workout-sessions",
        cookies: { ff_token: token },
        payload: validSession,
      });
      expect(response.statusCode).toBe(201);
      expect(createWorkoutSession).toHaveBeenCalledWith("user_1", expect.objectContaining({
        name: "Morning lift",
      }));
    });

    it("returns 401 without a cookie on the create endpoint", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/workout-sessions",
        payload: validSession,
      });
      expect(response.statusCode).toBe(401);
    });

    it("fetches a session by id", async () => {
      vi.mocked(getWorkoutSession).mockResolvedValueOnce({ id: "s_1" } as never);
      const response = await app.inject({
        method: "GET",
        url: "/workout-sessions/s_1",
        cookies: { ff_token: token },
      });
      expect(response.statusCode).toBe(200);
      expect(getWorkoutSession).toHaveBeenCalledWith("user_1", "s_1");
    });

    it("updates a session via PATCH", async () => {
      vi.mocked(updateWorkoutSession).mockResolvedValueOnce({ id: "s_1" } as never);
      const response = await app.inject({
        method: "PATCH",
        url: "/workout-sessions/s_1",
        cookies: { ff_token: token },
        payload: { status: "completed" },
      });
      expect(response.statusCode).toBe(200);
      expect(updateWorkoutSession).toHaveBeenCalledWith(
        "user_1",
        "s_1",
        expect.objectContaining({ status: "completed" }),
      );
    });

    it("deletes a session with 204", async () => {
      vi.mocked(deleteWorkoutSession).mockResolvedValueOnce(undefined as never);
      const response = await app.inject({
        method: "DELETE",
        url: "/workout-sessions/s_1",
        cookies: { ff_token: token },
      });
      expect(response.statusCode).toBe(204);
    });
  });
});
