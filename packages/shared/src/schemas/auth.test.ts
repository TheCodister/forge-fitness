import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "./auth.js";

describe("loginSchema", () => {
  it("accepts the credentials used by the e2e suite", () => {
    const parsed = loginSchema.safeParse({
      email: "benqa@gmail.com",
      password: "123456789ben",
    });

    expect(parsed.success).toBe(true);
  });

  it("lowercases the email so lookups are case-insensitive", () => {
    const parsed = loginSchema.parse({
      email: "BenQA@Gmail.com",
      password: "123456789ben",
    });

    expect(parsed.email).toBe("benqa@gmail.com");
  });

  it("rejects a padded email, because .trim() runs after email validation", () => {
    const parsed = loginSchema.safeParse({
      email: "  benqa@gmail.com  ",
      password: "123456789ben",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const parsed = loginSchema.safeParse({ email: "not-an-email", password: "123456789ben" });

    expect(parsed.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const parsed = loginSchema.safeParse({ email: "benqa@gmail.com", password: "" });

    expect(parsed.success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("accepts a well-formed signup payload", () => {
    const parsed = signupSchema.safeParse({
      name: "Ben QA",
      email: "benqa@gmail.com",
      password: "123456789ben",
    });

    expect(parsed.success).toBe(true);
  });

  it.each([
    ["shorter than 8 characters", "abc123"],
    ["missing a letter", "12345678"],
    ["missing a number", "abcdefgh"],
  ])("rejects a password %s", (_label, password) => {
    const parsed = signupSchema.safeParse({
      name: "Ben QA",
      email: "benqa@gmail.com",
      password,
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects a display name shorter than 2 characters", () => {
    const parsed = signupSchema.safeParse({
      name: "B",
      email: "benqa@gmail.com",
      password: "123456789ben",
    });

    expect(parsed.success).toBe(false);
  });
});
