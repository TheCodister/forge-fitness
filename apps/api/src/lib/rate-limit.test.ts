import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "./errors.js";
import { assertRateLimit, resetRateLimits } from "./rate-limit.js";

describe("assertRateLimit", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws ApiError with 429 when key exceeds its limit", () => {
    assertRateLimit("test:key", {
      maxRequests: 1,
      windowMs: 60_000,
      message: "Slow down.",
    });

    try {
      assertRateLimit("test:key", {
        maxRequests: 1,
        windowMs: 60_000,
        message: "Slow down.",
      });
      expect.fail("expected throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(429);
      expect((error as ApiError).code).toBe("RATE_LIMITED");
    }
  });

  it("allows requests up to the max within the window", () => {
    for (let i = 0; i < 3; i++) {
      expect(() =>
        assertRateLimit("test:allow", {
          maxRequests: 3,
          windowMs: 60_000,
          message: "Slow down.",
        }),
      ).not.toThrow();
    }
  });
});
