import type { FastifyPluginAsync } from "fastify";

import { requireUser } from "../auth";
import { clientIp } from "../config";
import {
  assertKnownExerciseDbIds,
  fetchExerciseImage,
  isValidExerciseDbId,
  parseExerciseIds,
} from "../services/exercise-images";
import type { IdParams, StringQuery } from "../types";
import { getExerciseById, listExercises } from "../domain/exercises";
import { ApiError } from "../lib/api-error";
import { getExerciseImageUrl } from "../lib/exercise-images";
import { assertRateLimit } from "../security/rate-limit";

type ImageQuery = {
  exerciseId?: string;
  exerciseIds?: string;
};

export const exerciseRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: StringQuery }>("/api/exercises", async (request) => (
    listExercises(request.query)
  ));
  app.get<{ Params: IdParams }>("/api/exercises/:id", async (request) => (
    getExerciseById(request.params.id)
  ));
  app.get<{ Params: IdParams }>("/api/exercise-image/:id", async (request, reply) => (
    reply.redirect(getExerciseImageUrl(request.params.id))
  ));

  app.get<{ Querystring: ImageQuery }>("/api/exercises/image", async (request, reply) => {
    const user = await requireUser(request);
    assertRateLimit(`exercises:image:${user.id}:${clientIp(request)}`, {
      maxRequests: 120,
      windowMs: 10 * 60_000,
      message: "Too many image requests. Please try again shortly.",
    });

    if (request.query.exerciseIds) {
      const ids = parseExerciseIds(request.query.exerciseIds);
      await assertKnownExerciseDbIds(ids);
      return {
        images: ids.map((exerciseId) => ({ exerciseId, imageUrl: getExerciseImageUrl(exerciseId) })),
        total: ids.length,
      };
    }

    const exerciseId = request.query.exerciseId?.trim();
    if (!exerciseId) {
      throw new ApiError(400, "MISSING_EXERCISE_ID", "Missing exerciseId or exerciseIds.");
    }
    if (!isValidExerciseDbId(exerciseId)) {
      throw new ApiError(400, "INVALID_EXERCISE_ID", "Exercise ID is invalid.");
    }

    await assertKnownExerciseDbIds([exerciseId]);
    const image = await fetchExerciseImage(exerciseId);
    return reply
      .type(image.contentType)
      .header("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800")
      .send(image.body);
  });
};
