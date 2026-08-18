import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/auth.js", async () => {
  const actual = await vi.importActual<typeof import("../services/auth.js")>(
    "../services/auth.js",
  );
  return {
    ...actual,
    signupUser: vi.fn(),
    verifyCredentials: vi.fn(),
    getUserById: vi.fn(),
  };
});

vi.mock("../lib/rate-limit.js", async () => {
  const actual = await vi.importActual<typeof import("../lib/rate-limit.js")>(
    "../lib/rate-limit.js",
  );
  return {
    ...actual,
    assertRateLimit: vi.fn(),
  };
});

import { buildApp } from "../app.js";
import { assertRateLimit } from "../lib/rate-limit.js";
import { getUserById, signupUser, verifyCredentials } from "../services/auth.js";

const fixedUser = {
  id: "user_1",
  email: "ben@example.com",
  name: "Ben",
  image: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("auth routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.JWT_SECRET ??= "test-jwt-secret-please-be-at-least-32-chars-long";
    process.env.DATABASE_URL ??= "postgresql://u:p@127.0.0.1:5432/unused";
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.mocked(signupUser).mockReset();
    vi.mocked(verifyCredentials).mockReset();
    vi.mocked(getUserById).mockReset();
    vi.mocked(assertRateLimit).mockReset();
  });

  describe("POST /auth/signup", () => {
    it("creates a user, sets the ff_token cookie, and returns 201", async () => {
      vi.mocked(signupUser).mockResolvedValueOnce(fixedUser);

      const response = await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload: { name: "Ben", email: "ben@example.com", password: "abc12345" },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().email).toBe("ben@example.com");
      const setCookie = response.headers["set-cookie"];
      expect(String(setCookie)).toMatch(/ff_token=/);
      expect(signupUser).toHaveBeenCalledWith({
        name: "Ben",
        email: "ben@example.com",
        password: "abc12345",
      });
    });

    it("returns 400 when the payload fails schema validation", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload: { name: "B", email: "no", password: "short" },
      });
      expect(response.statusCode).toBe(400);
      expect(signupUser).not.toHaveBeenCalled();
    });
  });

  describe("POST /auth/login", () => {
    it("signs the user in, sets the cookie, and returns the public user", async () => {
      vi.mocked(verifyCredentials).mockResolvedValueOnce(fixedUser);

      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "ben@example.com", password: "abc12345" },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().id).toBe("user_1");
      expect(String(response.headers["set-cookie"])).toMatch(/ff_token=/);
    });

    it("returns 401 INVALID_CREDENTIALS on a bad password", async () => {
      vi.mocked(verifyCredentials).mockResolvedValueOnce(null);

      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "ben@example.com", password: "abc12345" },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json().code).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("POST /auth/logout", () => {
    it("clears the auth cookie and returns 204", async () => {
      const response = await app.inject({ method: "POST", url: "/auth/logout" });
      expect(response.statusCode).toBe(204);
      const setCookie = String(response.headers["set-cookie"] ?? "");
      expect(setCookie).toMatch(/ff_token=/);
      // clearCookie sets an empty value with an expired date
      expect(setCookie).toMatch(/Expires=/);
    });
  });

  describe("GET /auth/me", () => {
    it("returns the user for a signed cookie", async () => {
      vi.mocked(getUserById).mockResolvedValueOnce(fixedUser);
      const token = app.jwt.sign({ sub: "user_1" });

      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
        cookies: { ff_token: token },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().user.id).toBe("user_1");
      expect(getUserById).toHaveBeenCalledWith("user_1");
    });

    it("returns 401 without a cookie", async () => {
      const response = await app.inject({ method: "GET", url: "/auth/me" });
      expect(response.statusCode).toBe(401);
    });

    it("returns { user: null } when the user has been deleted since sign-in", async () => {
      vi.mocked(getUserById).mockResolvedValueOnce(null);
      const token = app.jwt.sign({ sub: "user_1" });

      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
        cookies: { ff_token: token },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().user).toBeNull();
    });
  });
});
