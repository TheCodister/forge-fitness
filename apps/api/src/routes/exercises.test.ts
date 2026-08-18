import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/exercises.js", async () => {
  const actual = await vi.importActual<typeof import("../services/exercises.js")>(
    "../services/exercises.js",
  );
  return {
    ...actual,
    listExercises: vi.fn(),
    getExerciseById: vi.fn(),
    assertKnownExerciseDbIds: vi.fn(),
  };
});

import { buildApp } from "../app.js";
import {
  assertKnownExerciseDbIds,
  getExerciseById,
  listExercises,
} from "../services/exercises.js";

describe("exercise routes", () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    process.env.JWT_SECRET ??= "test-jwt-secret-please-be-at-least-32-chars-long";
    process.env.DATABASE_URL ??= "postgresql://u:p@127.0.0.1:5432/unused";
    process.env.EXERCISE_IMAGE_BASE_URL ??= "https://cdn.example.com/exercises";
    app = await buildApp();
    await app.ready();
    token = app.jwt.sign({ sub: "user_1" });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.mocked(listExercises).mockReset();
    vi.mocked(getExerciseById).mockReset();
    vi.mocked(assertKnownExerciseDbIds).mockReset();
  });

  describe("GET /exercises", () => {
    it("is public and forwards query filters to the service", async () => {
      vi.mocked(listExercises).mockResolvedValueOnce([] as never);

      const response = await app.inject({
        method: "GET",
        url: "/exercises?category=strength&muscleGroup=chest&limit=5",
      });

      expect(response.statusCode).toBe(200);
      expect(listExercises).toHaveBeenCalledWith(
        expect.objectContaining({ category: "strength", muscleGroup: "chest", limit: 5 }),
      );
    });

    // Category enum validation lives on the service side (exercisesQuerySchema).
    // With listExercises mocked here, the shared schema tests cover the reject path.
  });

  describe("GET /exercises/:id", () => {
    it("returns a single exercise", async () => {
      vi.mocked(getExerciseById).mockResolvedValueOnce({ id: "e1" } as never);

      const response = await app.inject({ method: "GET", url: "/exercises/e1" });

      expect(response.statusCode).toBe(200);
      expect(getExerciseById).toHaveBeenCalledWith("e1");
    });
  });

  describe("GET /exercises/image", () => {
    it("returns 401 without a cookie", async () => {
      const response = await app.inject({ method: "GET", url: "/exercises/image?exerciseIds=abc" });
      expect(response.statusCode).toBe(401);
    });

    it("returns a batch of image URLs for known exerciseDbIds", async () => {
      vi.mocked(assertKnownExerciseDbIds).mockResolvedValueOnce(undefined as never);

      const response = await app.inject({
        method: "GET",
        url: "/exercises/image?exerciseIds=alpha,beta",
        cookies: { ff_token: token },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.total).toBe(2);
      expect(body.images).toEqual([
        { exerciseId: "alpha", imageUrl: "https://cdn.example.com/exercises/alpha.jpg" },
        { exerciseId: "beta", imageUrl: "https://cdn.example.com/exercises/beta.jpg" },
      ]);
      expect(assertKnownExerciseDbIds).toHaveBeenCalledWith(["alpha", "beta"]);
    });

    it("rejects exercise ids that do not match the allowed pattern", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/exercises/image?exerciseIds=has%20space",
        cookies: { ff_token: token },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().code).toBe("INVALID_EXERCISE_ID");
    });

    it("returns 400 MISSING_EXERCISE_ID when neither param is supplied", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/exercises/image",
        cookies: { ff_token: token },
      });
      expect(response.statusCode).toBe(400);
      expect(response.json().code).toBe("MISSING_EXERCISE_ID");
    });
  });

  describe("GET /exercise-image/:id", () => {
    it("302-redirects to the CDN URL", async () => {
      const response = await app.inject({ method: "GET", url: "/exercise-image/abc" });
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe("https://cdn.example.com/exercises/abc.jpg");
    });
  });
});
