import "./env";

import { buildApp } from "./app";

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";
const shutdownTimeoutMs = Number(process.env.SHUTDOWN_TIMEOUT_MS ?? 25_000);

async function main() {
  const app = await buildApp();

  let shuttingDown = false;
  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    app.log.info({ signal }, "Shutdown signal received; draining connections");

    const forcedExit = setTimeout(() => {
      app.log.error("Graceful shutdown timed out");
      process.exit(1);
    }, shutdownTimeoutMs);
    forcedExit.unref();

    try {
      await app.close();
      clearTimeout(forcedExit);
      app.log.info("Graceful shutdown complete");
      process.exitCode = 0;
    } catch (error) {
      app.log.error(error, "Graceful shutdown failed");
      process.exitCode = 1;
    }
  };

  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  process.once("SIGINT", () => void shutdown("SIGINT"));

  try {
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    process.exitCode = 1;
  }
}

void main();
