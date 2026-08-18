import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { ApiError } from "../lib/errors.js";
import { getExerciseImageUrl } from "../lib/exercise-images.js";
import { assertRateLimit, getClientIp } from "../lib/rate-limit.js";
import {
  assertKnownExerciseDbIds,
  getExerciseById,
  listExercises,
} from "../services/exercises.js";

const MAX_BATCH_SIZE = 100;
const EXERCISE_DB_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const UPSTREAM_TIMEOUT_MS = 5_000;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const querySchema = z.object({
  category: z.string().optional(),
  muscleGroup: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

const idParamsSchema = z.object({ id: z.string().min(1) });

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

  for (;;) {
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

export async function exerciseRoutes(app: FastifyInstance) {
  app.get(
    "/",
    { schema: { querystring: querySchema } },
    async (request) => listExercises(request.query),
  );

  app.get(
    "/:id",
    { schema: { params: idParamsSchema } },
    async (request) => getExerciseById(request.params.id),
  );
}

export async function exerciseImageRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  const querySchema = z.object({
    exerciseIds: z.string().optional(),
    exerciseId: z.string().optional(),
  });

  app.get(
    "/",
    { schema: { querystring: querySchema } },
    async (request, reply) => {
      const ip = getClientIp(request);
      assertRateLimit(`exercises:image:${request.userId}:${ip}`, {
        maxRequests: 120,
        windowMs: 10 * 60 * 1000,
        message: "Too many image requests. Please try again shortly.",
      });

      const { exerciseIds: exerciseIdsParam, exerciseId } = request.query;

      if (exerciseIdsParam) {
        const exerciseIds = parseExerciseIds(exerciseIdsParam);
        await assertKnownExerciseDbIds(exerciseIds);
        return {
          images: exerciseIds.map((id) => ({
            exerciseId: id,
            imageUrl: getExerciseImageUrl(id),
          })),
          total: exerciseIds.length,
        };
      }

      const trimmed = exerciseId?.trim();
      if (!trimmed) {
        throw new ApiError(400, "MISSING_EXERCISE_ID", "Missing exerciseId or exerciseIds.");
      }

      if (!EXERCISE_DB_ID_PATTERN.test(trimmed)) {
        throw new ApiError(400, "INVALID_EXERCISE_ID", "Exercise ID is invalid.");
      }

      await assertKnownExerciseDbIds([trimmed]);

      const apiKey = process.env.EXERCISEDB_API_KEY;
      if (!apiKey) {
        throw new ApiError(500, "IMAGE_API_NOT_CONFIGURED", "Image API is not configured.");
      }

      const upstream = new URL("https://exercisedb.p.rapidapi.com/image");
      upstream.searchParams.set("exerciseId", trimmed);
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
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new ApiError(504, "UPSTREAM_IMAGE_TIMEOUT", "Timed out fetching image.");
        }
        throw error;
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

      const contentType = res.headers
        .get("content-type")
        ?.split(";")[0]
        ?.trim()
        .toLowerCase();
      if (!contentType || !ALLOWED_IMAGE_TYPES.has(contentType)) {
        throw new ApiError(
          502,
          "UPSTREAM_IMAGE_TYPE_UNSUPPORTED",
          "Upstream image response is not supported.",
        );
      }

      const body = await readBoundedBody(res);
      reply
        .header("Content-Type", contentType)
        .header("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
      return reply.send(Buffer.from(body));
    },
  );
}

export async function exerciseRedirectRoutes(app: FastifyInstance) {
  app.get(
    "/:id",
    { schema: { params: idParamsSchema } },
    async (request, reply) => reply.redirect(getExerciseImageUrl(request.params.id), 302),
  );
}
