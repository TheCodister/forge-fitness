import { expect, test } from "@playwright/test";

// Routes readable without a session.
const PUBLIC_ROUTES = ["/api/health", "/api/auth/me", "/api/exercises"];

// Routes that require a signed-in user; 401 when anonymous, 200 with a session.
const AUTHENTICATED_ROUTES = [
  "/api/workout-templates",
  "/api/workout-sessions",
  "/api/reports/summary",
  "/api/reports/progress",
  "/api/ai/settings",
  "/api/ai/conversations",
];

test.describe("api health", () => {
  test("health endpoint reports every dependency as up", async ({ request, baseURL }) => {
    const response = await request.get("/api/health", { timeout: 30_000 });

    expect(response.status(), `GET ${baseURL}/api/health`).toBe(200);

    const body = await response.json();

    expect(body.status).toBe("ok");
    expect(body.checks.database.status).toBe("up");
    expect(body.checks.env.status).toBe("up");
    expect(body.checks.env.missing).toEqual([]);
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  for (const route of PUBLIC_ROUTES) {
    test(`public route ${route} responds 200`, async ({ request }) => {
      const response = await request.get(route, { timeout: 30_000 });
      expect(response.status(), `GET ${route}`).toBe(200);
    });
  }

  for (const route of AUTHENTICATED_ROUTES) {
    test(`authenticated route ${route} responds 200 with a session`, async ({ request }) => {
      const response = await request.get(route, { timeout: 30_000 });
      expect(response.status(), `GET ${route} (signed in)`).toBe(200);
    });
  }

});

test.describe("api health (signed out)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("authenticated routes reject anonymous callers", async ({ request }) => {
    for (const route of AUTHENTICATED_ROUTES) {
      const response = await request.get(route, { timeout: 30_000 });
      expect(response.status(), `GET ${route} (anonymous)`).toBe(401);
    }
  });
});
