import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";

import { ApiError } from "../lib/errors.js";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        fieldErrors: error.flatten().fieldErrors,
      });
    }

    if (error instanceof ApiError) {
      return reply.status(error.status).send({
        message: error.message,
        code: error.code,
        fieldErrors: error.fieldErrors,
      });
    }

    // fastify-zod validation errors surface as validation
    if (error.validation) {
      return reply.status(400).send({
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        fieldErrors: error.validation.reduce<Record<string, string[]>>((acc, issue) => {
          const key = issue.instancePath.replace(/^\//, "") || "_";
          (acc[key] ??= []).push(issue.message ?? "invalid");
          return acc;
        }, {}),
      });
    }

    request.log.error({ err: error }, "unhandled route error");
    return reply.status(500).send({
      message: "Unexpected server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({ message: "Not found.", code: "NOT_FOUND" });
  });
}
