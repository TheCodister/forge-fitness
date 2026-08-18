import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/server/auth", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    exercise: {
      findMany: vi.fn(),
    },
  },
}));

import { GET } from "@/app/api/exercises/image/route";
import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/http";
import { requireUser } from "@/lib/server/auth";
import { resetRateLimits } from "@/lib/server/rate-limit";

const findMany = vi.mocked(prisma.exercise.findMany);
const requireUserMock = vi.mocked(requireUser);
const fetchMock = vi.fn<typeof fetch>();

function makeRequest(path: string) {
  const url = new URL(path, "https://forge.test");
  const request = new Request(url) as NextRequest;
  Object.defineProperty(request, "nextUrl", { value: url });
  return request;
}

describe("GET /api/exercises/image", () => {
  beforeEach(() => {
    resetRateLimits();
    vi.stubEnv("EXERCISEDB_API_KEY", "rapid-key");
    vi.stubEnv("EXERCISE_IMAGE_BASE_URL", "https://images.example.test");
    requireUserMock.mockResolvedValue({
      id: "user_1",
      email: "athlete@example.com",
      name: "Athlete",
      image: null,
      createdAt: new Date("2026-04-26T00:00:00.000Z"),
    });
    findMany.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("requires authentication before returning generated image URLs", async () => {
    requireUserMock.mockRejectedValueOnce(
      new ApiError(401, "UNAUTHORIZED", "You must be logged in to access this resource."),
    );

    const response = await GET(makeRequest("/api/exercises/image?exerciseIds=0001"));

    expect(response.status).toBe(401);
    expect(findMany).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects malformed exercise IDs without touching the upstream API", async () => {
    const response = await GET(makeRequest("/api/exercises/image?exerciseId=https://bad.test"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.code).toBe("INVALID_EXERCISE_ID");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects unknown exercise IDs before touching the upstream API", async () => {
    findMany.mockResolvedValueOnce([]);

    const response = await GET(makeRequest("/api/exercises/image?exerciseId=0001"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.code).toBe("EXERCISE_NOT_FOUND");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns generated URLs only for catalog-backed batch IDs", async () => {
    findMany.mockResolvedValueOnce([
      { exerciseDbId: "0001" },
      { exerciseDbId: "0002" },
    ] as Awaited<ReturnType<typeof findMany>>);

    const response = await GET(makeRequest("/api/exercises/image?exerciseIds=0001,0002"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.images).toEqual([
      { exerciseId: "0001", imageUrl: "https://images.example.test/0001.jpg" },
      { exerciseId: "0002", imageUrl: "https://images.example.test/0002.jpg" },
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("proxies a bounded image response for a known single exercise ID", async () => {
    findMany.mockResolvedValueOnce([
      { exerciseDbId: "0001" },
    ] as Awaited<ReturnType<typeof findMany>>);
    fetchMock.mockResolvedValueOnce(
      new Response(new Uint8Array([1, 2, 3]), {
        headers: { "content-type": "image/gif", "content-length": "3" },
      }),
    );

    const response = await GET(makeRequest("/api/exercises/image?exerciseId=0001"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/gif");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects non-image upstream responses", async () => {
    findMany.mockResolvedValueOnce([
      { exerciseDbId: "0001" },
    ] as Awaited<ReturnType<typeof findMany>>);
    fetchMock.mockResolvedValueOnce(
      new Response("<html></html>", {
        headers: { "content-type": "text/html" },
      }),
    );

    const response = await GET(makeRequest("/api/exercises/image?exerciseId=0001"));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.code).toBe("UPSTREAM_IMAGE_TYPE_UNSUPPORTED");
  });
});
