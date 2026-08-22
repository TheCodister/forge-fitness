import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/ai.js", async () => {
  const actual = await vi.importActual<typeof import("../services/ai.js")>(
    "../services/ai.js",
  );
  return {
    ...actual,
    getAiSettings: vi.fn(),
    upsertAiSettings: vi.fn(),
    listConversations: vi.fn(),
    createConversation: vi.fn(),
    getConversation: vi.fn(),
    deleteConversation: vi.fn(),
  };
});

import { buildApp } from "../app.js";
import {
  createConversation,
  deleteConversation,
  getAiSettings,
  getConversation,
  listConversations,
  upsertAiSettings,
} from "../services/ai.js";

describe("ai routes", () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    process.env.JWT_SECRET ??= "test-jwt-secret-please-be-at-least-32-chars-long";
    process.env.DATABASE_URL ??= "postgresql://u:p@127.0.0.1:5432/unused";
    app = await buildApp();
    await app.ready();
    token = app.jwt.sign({ sub: "user_1" });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    for (const m of [
      getAiSettings,
      upsertAiSettings,
      listConversations,
      createConversation,
      getConversation,
      deleteConversation,
    ]) {
      vi.mocked(m).mockReset();
    }
  });

  describe("ai settings", () => {
    it("requires auth", async () => {
      const response = await app.inject({ method: "GET", url: "/ai/settings" });
      expect(response.statusCode).toBe(401);
    });

    it("returns the settings for the authenticated user", async () => {
      vi.mocked(getAiSettings).mockResolvedValueOnce({ provider: "openai" } as never);
      const response = await app.inject({
        method: "GET",
        url: "/ai/settings",
        cookies: { ff_token: token },
      });
      expect(response.statusCode).toBe(200);
      expect(getAiSettings).toHaveBeenCalledWith("user_1");
    });

    it("PUT /ai/settings validates provider + model + apiKey", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/ai/settings",
        cookies: { ff_token: token },
        payload: { provider: "bogus", model: "x", apiKey: "short" },
      });
      expect(response.statusCode).toBe(400);
      expect(upsertAiSettings).not.toHaveBeenCalled();
    });

    it("PUT /ai/settings persists a well-formed payload", async () => {
      vi.mocked(upsertAiSettings).mockResolvedValueOnce({ id: "s_1" } as never);
      const payload = { provider: "openai" as const, model: "gpt-5", apiKey: "sk-abcdefghij" };
      const response = await app.inject({
        method: "PUT",
        url: "/ai/settings",
        cookies: { ff_token: token },
        payload,
      });
      expect(response.statusCode).toBe(200);
      expect(upsertAiSettings).toHaveBeenCalledWith("user_1", payload);
    });
  });

  describe("ai conversations", () => {
    it("lists conversations for the user", async () => {
      vi.mocked(listConversations).mockResolvedValueOnce([] as never);
      const response = await app.inject({
        method: "GET",
        url: "/ai/conversations",
        cookies: { ff_token: token },
      });
      expect(response.statusCode).toBe(200);
      expect(listConversations).toHaveBeenCalledWith("user_1");
    });

    it("creates a conversation with 201", async () => {
      vi.mocked(createConversation).mockResolvedValueOnce({ id: "c_1" } as never);
      const response = await app.inject({
        method: "POST",
        url: "/ai/conversations",
        cookies: { ff_token: token },
      });
      expect(response.statusCode).toBe(201);
      expect(createConversation).toHaveBeenCalledWith("user_1");
    });

    it("fetches a single conversation by id", async () => {
      vi.mocked(getConversation).mockResolvedValueOnce({ id: "c_1" } as never);
      const response = await app.inject({
        method: "GET",
        url: "/ai/conversations/c_1",
        cookies: { ff_token: token },
      });
      expect(response.statusCode).toBe(200);
      expect(getConversation).toHaveBeenCalledWith("user_1", "c_1");
    });

    it("deletes a conversation with 204", async () => {
      vi.mocked(deleteConversation).mockResolvedValueOnce(undefined as never);
      const response = await app.inject({
        method: "DELETE",
        url: "/ai/conversations/c_1",
        cookies: { ff_token: token },
      });
      expect(response.statusCode).toBe(204);
      expect(deleteConversation).toHaveBeenCalledWith("user_1", "c_1");
    });

    it("returns 401 across the family without a cookie", async () => {
      const response = await app.inject({ method: "GET", url: "/ai/conversations/c_1" });
      expect(response.statusCode).toBe(401);
    });
  });
});
