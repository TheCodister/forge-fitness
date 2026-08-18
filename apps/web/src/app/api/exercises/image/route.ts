import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getExerciseImageUrl } from "@/lib/exercise-images";
import { ApiError, handleRouteError, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/server/auth";
import { assertRateLimit, getClientIp } from "@/lib/server/rate-limit";

const MAX_BATCH_SIZE = 100;
const EXERCISE_DB_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const UPSTREAM_TIMEOUT_MS = 5_000;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/gif", "image/jpeg", "image/png", "image/webp"]);

function parseExerciseIds(value: string) {
  const exerciseIds = Array.from(
    new Set(
      value
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ).slice(0, MAX_BATCH_SIZE);

  if (exerciseIds.length === 0) {
    throw new ApiError(400, "MISSING_EXERCISE_IDS", "Missing exerciseIds.");
  }

  if (!exerciseIds.every((id) => EXERCISE_DB_ID_PATTERN.test(id))) {
    throw new ApiError(400, "INVALID_EXERCISE_ID", "Exercise IDs are invalid.");
  }

  return exerciseIds;
}

async function assertKnownExerciseDbIds(exerciseIds: string[]) {
  const known = await prisma.exercise.findMany({
    where: {
      isActive: true,
      exerciseDbId: { in: exerciseIds },
    },
    select: { exerciseDbId: true },
  });
  const knownIds = new Set(known.map((exercise) => exercise.exerciseDbId).filter(Boolean));

  if (knownIds.size !== exerciseIds.length) {
    throw new ApiError(404, "EXERCISE_NOT_FOUND", "Exercise not found.");
  }
}

async function readBoundedBody(response: Response) {
  const contentLength = response.headers.get("content-length");
  if (contentLength) {
    const length = Number(contentLength);
    if (Number.isFinite(length) && length > MAX_IMAGE_BYTES) {
      throw new ApiError(502, "UPSTREAM_IMAGE_TOO_LARGE", "Upstream image response is too large.");
    }
  }

  if (!response.body) {
    const body = await response.arrayBuffer();
    if (body.byteLength > MAX_IMAGE_BYTES) {
      throw new ApiError(502, "UPSTREAM_IMAGE_TOO_LARGE", "Upstream image response is too large.");
    }
    return body;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_IMAGE_BYTES) {
      throw new ApiError(502, "UPSTREAM_IMAGE_TOO_LARGE", "Upstream image response is too large.");
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const clientIp = getClientIp(request);
    assertRateLimit(`exercises:image:${user.id}:${clientIp}`, {
      maxRequests: 120,
      windowMs: 10 * 60 * 1000,
      message: "Too many image requests. Please try again shortly.",
    });

    const exerciseIdsParam = request.nextUrl.searchParams.get("exerciseIds");
    const exerciseId = request.nextUrl.searchParams.get("exerciseId")?.trim();

    if (exerciseIdsParam) {
      const exerciseIds = parseExerciseIds(exerciseIdsParam);
      await assertKnownExerciseDbIds(exerciseIds);

      return jsonOk({
        images: exerciseIds.map((id) => ({
          exerciseId: id,
          imageUrl: getExerciseImageUrl(id),
        })),
        total: exerciseIds.length,
      });
    }

    if (!exerciseId) {
      throw new ApiError(
        400,
        "MISSING_EXERCISE_ID",
        "Missing exerciseId or exerciseIds.",
      );
    }

    if (!EXERCISE_DB_ID_PATTERN.test(exerciseId)) {
      throw new ApiError(400, "INVALID_EXERCISE_ID", "Exercise ID is invalid.");
    }

    await assertKnownExerciseDbIds([exerciseId]);

    const apiKey = process.env.EXERCISEDB_API_KEY;
    if (!apiKey) {
      throw new ApiError(500, "IMAGE_API_NOT_CONFIGURED", "Image API is not configured.");
    }

    const upstream = new URL("https://exercisedb.p.rapidapi.com/image");
    upstream.searchParams.set("exerciseId", exerciseId);
    upstream.searchParams.set("resolution", "180");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(upstream, {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      throw new ApiError(
        res.status === 404 ? 404 : 502,
        "UPSTREAM_IMAGE_FAILED",
        res.status === 404 ? "Image not found." : "Failed to fetch image.",
      );
    }

    const contentType = res.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
    if (!contentType || !ALLOWED_IMAGE_TYPES.has(contentType)) {
      throw new ApiError(
        502,
        "UPSTREAM_IMAGE_TYPE_UNSUPPORTED",
        "Upstream image response is not supported.",
      );
    }

    const body = await readBoundedBody(res);

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return handleRouteError(
        new ApiError(504, "UPSTREAM_IMAGE_TIMEOUT", "Timed out fetching image."),
      );
    }

    return handleRouteError(error);
  }
}
