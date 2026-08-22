import path from "node:path";

import { expect, test as setup } from "@playwright/test";

import { testUser } from "./fixtures/credentials";

export const storageStatePath = path.join(__dirname, ".auth", "user.json");

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");

  await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();

  await page.getByLabel("Email").fill(testUser.email);
  await page.getByLabel("Password").fill(testUser.password);
  await page.getByRole("button", { name: "Log in" }).click();

  await page.waitForURL("**/dashboard", { timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();

  await page.context().storageState({ path: storageStatePath });
});
