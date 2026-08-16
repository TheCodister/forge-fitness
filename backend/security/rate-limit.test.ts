import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../lib/api-error";
import {
  assertRateLimit,
  getClientIp,
  getClientIpFromHeaders,
  resetRateLimits,
} from "./rate-limit";

describe("rate limiting", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns Retry-After when a key exceeds its limit", () => {
    assertRateLimit("test:key", {
      maxRequests: 1,
      windowMs: 60_000,
      message: "Slow down.",
    });

    expect(() =>
      assertRateLimit("test:key", {
        maxRequests: 1,
        windowMs: 60_000,
        message: "Slow down.",
      }),
    ).toThrowError(ApiError);

    try {
      assertRateLimit("test:key", {
        maxRequests: 1,
        windowMs: 60_000,
        message: "Slow down.",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(429);
      expect((error as ApiError).headers).toEqual({ "Retry-After": "60" });
    }
  });

  it("does not trust forwarded IP headers in production by default", () => {
    vi.stubEnv("NODE_ENV", "production");

    const request = new Request("https://example.test", {
      headers: {
        "x-forwarded-for": "203.0.113.10",
        "x-real-ip": "203.0.113.11",
      },
    });

    expect(getClientIp(request)).toBe("unknown");
  });

  it("uses forwarded IP headers only when explicitly trusted", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TRUST_CLIENT_IP_HEADERS", "true");

    expect(
      getClientIpFromHeaders({
        "x-forwarded-for": "203.0.113.10, 198.51.100.4",
      }),
    ).toBe("203.0.113.10");
  });
});
