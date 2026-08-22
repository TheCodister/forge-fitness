import { expect, test } from "@playwright/test";

import { testUser } from "./fixtures/credentials";

// These tests must start from a signed-out browser.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("login", () => {
  test("signs in with valid credentials and lands on the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const emailField = page.getByLabel("Email");
    const passwordField = page.getByLabel("Password");
    const submit = page.getByRole("button", { name: "Log in" });

    // Wait for hydration: the form only submits once React has attached handlers.
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(submit).toBeEnabled();

    await emailField.fill(testUser.email);
    await passwordField.fill(testUser.password);

    await expect(emailField).toHaveValue(testUser.email);
    await expect(passwordField).toHaveValue(testUser.password);

    await submit.click();

    // Fastify sets the ff_token cookie, then the client router replaces the URL.
    await page.waitForURL("**/dashboard", { timeout: 30_000 });
    await page.waitForLoadState("networkidle");

    const heading = page.getByRole("heading", { level: 1, name: "Dashboard" });
    await expect(heading).toBeVisible({ timeout: 20_000 });
    await expect(heading).toHaveText("Dashboard");

    // The signed-in shell is server-rendered behind the session check.
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("rejects an invalid password and stays on the login page", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await page.getByLabel("Email").fill(testUser.email);
    await page.getByLabel("Password").fill("wrong-password-123");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText("Invalid email or password.")).toBeVisible({ timeout: 20_000 });
    await expect(page).toHaveURL(/\/login$/);
  });

  test("redirects an anonymous visitor away from the dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login**", { timeout: 30_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
