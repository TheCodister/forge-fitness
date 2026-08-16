import type { FastifyInstance, FastifyReply } from "fastify";
import { ZodError } from "zod";

import { ApiError } from "@/lib/http";

function copyErrorHeaders(error: ApiError, reply: FastifyReply) {
  if (!error.headers) return;
  new Headers(error.headers).forEach((value, key) => reply.header(key, value));
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        fieldErrors: error.flatten().fieldErrors,
      });
    }

    if (error instanceof ApiError) {
      copyErrorHeaders(error, reply);
      return reply.status(error.status).send({
        message: error.message,
        code: error.code,
        fieldErrors: error.fieldErrors,
      });
    }

    app.log.error(error);
    return reply.status(500).send({
      message: "Unexpected server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  });
}
