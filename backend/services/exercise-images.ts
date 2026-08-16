import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/http";

const MAX_BATCH_SIZE = 100;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const EXERCISE_DB_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const ALLOWED_IMAGE_TYPES = new Set(["image/gif", "image/jpeg", "image/png", "image/webp"]);

export function parseExerciseIds(value: string) {
  const ids = [...new Set(value.split(",").map((id) => id.trim()).filter(Boolean))]
    .slice(0, MAX_BATCH_SIZE);
  if (!ids.length) throw new ApiError(400, "MISSING_EXERCISE_IDS", "Missing exerciseIds.");
  if (!ids.every(isValidExerciseDbId)) {
    throw new ApiError(400, "INVALID_EXERCISE_ID", "Exercise IDs are invalid.");
  }
  return ids;
}

export function isValidExerciseDbId(id: string) {
  return EXERCISE_DB_ID_PATTERN.test(id);
}

export async function assertKnownExerciseDbIds(ids: string[]) {
  const known = await prisma.exercise.findMany({
    where: { isActive: true, exerciseDbId: { in: ids } },
    select: { exerciseDbId: true },
  });
  const knownIds = new Set(known.map((item) => item.exerciseDbId).filter(Boolean));
  if (knownIds.size !== ids.length) {
    throw new ApiError(404, "EXERCISE_NOT_FOUND", "Exercise not found.");
  }
}

export async function fetchExerciseImage(exerciseId: string) {
  const apiKey = process.env.EXERCISEDB_API_KEY;
  if (!apiKey) {
    throw new ApiError(500, "IMAGE_API_NOT_CONFIGURED", "Image API is not configured.");
  }

  const upstream = new URL("https://exercisedb.p.rapidapi.com/image");
  upstream.searchParams.set("exerciseId", exerciseId);
  upstream.searchParams.set("resolution", "180");
  const response = await fetch(upstream, {
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
    },
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) {
    throw new ApiError(
      response.status === 404 ? 404 : 502,
      "UPSTREAM_IMAGE_FAILED",
      response.status === 404 ? "Image not found." : "Failed to fetch image.",
    );
  }

  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  if (!contentType || !ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new ApiError(502, "UPSTREAM_IMAGE_TYPE_UNSUPPORTED", "Upstream image response is not supported.");
  }

  const body = Buffer.from(await response.arrayBuffer());
  if (body.byteLength > MAX_IMAGE_BYTES) {
    throw new ApiError(502, "UPSTREAM_IMAGE_TOO_LARGE", "Upstream image response is too large.");
  }
  return { body, contentType };
}
