import { describe, expect, it } from "vitest";

import { aiProviderSchema, aiSettingsUpsertSchema, chatMessageCreateSchema } from "./ai.js";

describe("aiProviderSchema", () => {
  it.each(["openai", "anthropic", "google"] as const)("accepts %s", (provider) => {
    expect(aiProviderSchema.safeParse(provider).success).toBe(true);
  });

  it("rejects an unknown provider", () => {
    expect(aiProviderSchema.safeParse("cohere").success).toBe(false);
  });
});

describe("aiSettingsUpsertSchema", () => {
  const base = {
    provider: "openai" as const,
    model: "gpt-5",
    apiKey: "sk-abcdefghij",
  };

  it("accepts a well-formed payload", () => {
    expect(aiSettingsUpsertSchema.safeParse(base).success).toBe(true);
  });

  it.each([
    ["provider outside enum", { provider: "bogus" }],
    ["empty model", { model: "" }],
    ["model over 80 chars", { model: "x".repeat(81) }],
    ["apiKey shorter than 10", { apiKey: "short" }],
    ["apiKey over 300 chars", { apiKey: "x".repeat(301) }],
  ])("rejects %s", (_label, patch) => {
    expect(aiSettingsUpsertSchema.safeParse({ ...base, ...patch }).success).toBe(false);
  });
});

describe("chatMessageCreateSchema", () => {
  it("accepts a normal chat message", () => {
    expect(chatMessageCreateSchema.safeParse({ content: "hello" }).success).toBe(true);
  });

  it("rejects an empty message", () => {
    expect(chatMessageCreateSchema.safeParse({ content: "   " }).success).toBe(false);
  });

  it("rejects a message longer than 4000 chars", () => {
    expect(
      chatMessageCreateSchema.safeParse({ content: "x".repeat(4001) }).success,
    ).toBe(false);
  });

  it("trims whitespace off the message", () => {
    expect(chatMessageCreateSchema.parse({ content: "  hi  " }).content).toBe("hi");
  });
});
