import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "./errors.js";
import { assertRateLimit, getClientIp, resetRateLimits } from "./rate-limit.js";

function makeRequest(headers: Record<string, string | undefined>, ip = "127.0.0.1") {
  return { headers, ip } as never;
}

describe("assertRateLimit", () => {
  beforeEach(() => {
    resetRateLimits();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("throws ApiError 429 RATE_LIMITED once the key exceeds its budget", () => {
    assertRateLimit("k", { maxRequests: 1, windowMs: 60_000, message: "slow" });
    expect(() =>
      assertRateLimit("k", { maxRequests: 1, windowMs: 60_000, message: "slow" }),
    ).toThrow(ApiError);
  });

  it("carries the caller's message and 429 status on the thrown ApiError", () => {
    assertRateLimit("k", { maxRequests: 1, windowMs: 60_000, message: "cool it" });
    try {
      assertRateLimit("k", { maxRequests: 1, windowMs: 60_000, message: "cool it" });
      expect.fail("expected throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(429);
      expect((error as ApiError).code).toBe("RATE_LIMITED");
      expect((error as ApiError).message).toBe("cool it");
    }
  });

  it("allows requests up to the max within the window", () => {
    for (let i = 0; i < 3; i++) {
      expect(() =>
        assertRateLimit("allow", { maxRequests: 3, windowMs: 60_000, message: "n" }),
      ).not.toThrow();
    }
    expect(() =>
      assertRateLimit("allow", { maxRequests: 3, windowMs: 60_000, message: "n" }),
    ).toThrow(ApiError);
  });

  it("resets the bucket after the window elapses", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    assertRateLimit("roll", { maxRequests: 1, windowMs: 1_000, message: "x" });
    expect(() =>
      assertRateLimit("roll", { maxRequests: 1, windowMs: 1_000, message: "x" }),
    ).toThrow(ApiError);

    vi.setSystemTime(new Date("2026-01-01T00:00:02Z"));
    expect(() =>
      assertRateLimit("roll", { maxRequests: 1, windowMs: 1_000, message: "x" }),
    ).not.toThrow();
  });

  it("scopes counts per key", () => {
    assertRateLimit("a", { maxRequests: 1, windowMs: 60_000, message: "n" });
    expect(() =>
      assertRateLimit("b", { maxRequests: 1, windowMs: 60_000, message: "n" }),
    ).not.toThrow();
  });
});

describe("getClientIp", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalTrust = process.env.TRUST_CLIENT_IP_HEADERS;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    if (originalTrust === undefined) delete process.env.TRUST_CLIENT_IP_HEADERS;
    else process.env.TRUST_CLIENT_IP_HEADERS = originalTrust;
  });

  it("returns 'unknown' in production when TRUST_CLIENT_IP_HEADERS is not set", () => {
    process.env.NODE_ENV = "production";
    delete process.env.TRUST_CLIENT_IP_HEADERS;
    expect(getClientIp(makeRequest({ "x-forwarded-for": "1.2.3.4" }))).toBe("unknown");
  });

  it("returns the first x-forwarded-for entry when proxy headers are trusted", () => {
    process.env.NODE_ENV = "development";
    expect(
      getClientIp(makeRequest({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" })),
    ).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    process.env.NODE_ENV = "development";
    expect(getClientIp(makeRequest({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
  });

  it("falls back to request.ip when no proxy headers are present", () => {
    process.env.NODE_ENV = "development";
    expect(getClientIp(makeRequest({}, "5.6.7.8"))).toBe("5.6.7.8");
  });
});
