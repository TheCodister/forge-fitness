import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "./app";

describe("Fastify API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.JWT_SECRET = "unit-test-jwt-secret-at-least-32-characters";
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("reports an anonymous session without failing", async () => {
    const response = await app.inject({ method: "GET", url: "/api/auth/me" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ user: null });
  });

  it("exposes an ECS liveness endpoint without checking dependencies", async () => {
    const response = await app.inject({ method: "GET", url: "/api/health/live" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: "ok" });
  });

  it("rejects protected resources without a session", async () => {
    const response = await app.inject({ method: "GET", url: "/api/workout-templates" });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns structured validation errors", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "not-an-email", password: "short" },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
