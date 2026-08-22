import { expect, test } from "@playwright/test";

const apiURL = process.env.E2E_API_URL ?? "http://127.0.0.1:4000";

const PUBLIC_ROUTES = ["/health"];

const AUTHENTICATED_ROUTES = [
  "/auth/me",
  "/exercises",
  "/workout-templates",
  "/workout-sessions",
  "/reports/summary",
  "/reports/progress",
  "/ai/settings",
  "/ai/conversations",
];

test.describe("api health", () => {
  test("health endpoint reports uptime", async ({ request }) => {
    const response = await request.get(`${apiURL}/health`, { timeout: 30_000 });
    expect(response.status(), `GET ${apiURL}/health`).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(typeof body.uptime).toBe("number");
  });

  for (const route of PUBLIC_ROUTES) {
    test(`public route ${route} responds 200`, async ({ request }) => {
      const response = await request.get(`${apiURL}${route}`, { timeout: 30_000 });
      expect(response.status(), `GET ${route}`).toBe(200);
    });
  }

  for (const route of AUTHENTICATED_ROUTES) {
    test(`authenticated route ${route} responds 200 with a session`, async ({ request }) => {
      const response = await request.get(`${apiURL}${route}`, { timeout: 30_000 });
      expect(response.status(), `GET ${route} (signed in)`).toBe(200);
    });
  }
});

test.describe("api health (signed out)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("authenticated routes reject anonymous callers", async ({ request }) => {
    for (const route of AUTHENTICATED_ROUTES) {
      const response = await request.get(`${apiURL}${route}`, { timeout: 30_000 });
      expect(response.status(), `GET ${route} (anonymous)`).toBe(401);
    }
  });
});
