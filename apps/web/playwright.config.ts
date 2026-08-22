import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";
const apiURL = process.env.E2E_API_URL ?? "http://127.0.0.1:4000";

const shouldStartServers = !process.env.E2E_SKIP_WEB_SERVER;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    extraHTTPHeaders: {},
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
    },
  ],
  webServer: shouldStartServers
    ? [
        {
          // Fastify API in dev mode. Cookies land on 127.0.0.1:4000; the web
          // origin at 127.0.0.1:3000 shares the eTLD+1 so SameSite=lax works.
          command: "pnpm --filter @forge/api run dev",
          url: `${apiURL}/health`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          stdout: "pipe",
          stderr: "pipe",
          env: {
            NEXT_PUBLIC_API_URL: apiURL,
            CORS_ORIGINS: baseURL,
            COOKIE_SECURE: "false",
            NODE_ENV: "development",
            // Fastify config.ts requires both; zod rejects boot without them.
            // Inherit if set (CI job env, local .env), else fall back to dev
            // defaults so `pnpm exec playwright test` boots the api cold.
            JWT_SECRET:
              process.env.JWT_SECRET ??
              "dev-jwt-secret-please-be-at-least-32-chars-long",
            DATABASE_URL:
              process.env.DATABASE_URL ??
              "postgresql://postgres:postgres@127.0.0.1:5432/forge_test",
            ENCRYPTION_SECRET:
              process.env.ENCRYPTION_SECRET ??
              "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
          },
        },
        {
          // Static export cannot use `next start`; dev mode covers e2e.
          command: "pnpm --filter @forge/web exec next dev --port 3000",
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          stdout: "pipe",
          stderr: "pipe",
          env: {
            NEXT_PUBLIC_API_URL: apiURL,
          },
        },
      ]
    : undefined,
});
