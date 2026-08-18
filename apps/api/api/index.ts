import type { IncomingMessage, ServerResponse } from "node:http";

// Import from src — @vercel/node bundles the function via ncc and follows
// NodeNext ".js" specifiers back to their .ts sources. Importing from dist
// would require the tsc build to run before the function bundler; simpler to
// let ncc traverse the workspace fresh.
import { buildApp } from "../src/app.js";

// Vercel serverless entry. `apps/api/api/*.ts` is auto-routed to a Node
// Function; we mount the whole Fastify app under it and let Vercel's rewrites
// (see apps/api/vercel.json) forward every path to this handler.
//
// One Fastify instance per warm invocation — cached across requests on the
// same lambda container. Cold start pays for buildApp() once.

let appPromise: ReturnType<typeof buildApp> | undefined;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const app = await buildApp();
      await app.ready();
      return app;
    })();
  }
  return appPromise;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const app = await getApp();
  app.server.emit("request", req, res);
}

export const config = {
  // SSE responses can run long; bump from the 10s hobby default.
  maxDuration: 60,
};
