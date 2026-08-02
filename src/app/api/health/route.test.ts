import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { GET } from "@/app/api/health/route";
import { prisma } from "@/lib/db/prisma";

const queryRaw = vi.mocked(prisma.$queryRaw);

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/forge");
    vi.stubEnv("NEXTAUTH_SECRET", "test-secret");
    queryRaw.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 200 when the database and env are healthy", async () => {
    queryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.checks.database.status).toBe("up");
    expect(body.checks.env.status).toBe("up");
    expect(body.checks.env.missing).toEqual([]);
    expect(typeof body.checks.database.latencyMs).toBe("number");
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  it("returns 503 and surfaces the error when the database is unreachable", async () => {
    queryRaw.mockRejectedValueOnce(new Error("connection refused"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe("degraded");
    expect(body.checks.database.status).toBe("down");
    expect(body.checks.database.error).toBe("connection refused");
  });

  it("returns 503 and lists the missing required env vars", async () => {
    queryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);
    vi.stubEnv("NEXTAUTH_SECRET", "");

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe("degraded");
    expect(body.checks.env.status).toBe("down");
    expect(body.checks.env.missing).toContain("NEXTAUTH_SECRET");
  });

  it("does not run more than one database probe per request", async () => {
    queryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);

    await GET();

    expect(queryRaw).toHaveBeenCalledTimes(1);
  });
});
