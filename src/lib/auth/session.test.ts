import { describe, expect, it } from "vitest";

import { signSessionToken, verifySessionToken } from "@/lib/auth/token";

describe("session helpers", () => {
  it("signs and verifies a session payload", async () => {
    const token = await signSessionToken({
      userId: "user_123",
      email: "athlete@example.com",
      displayName: "Athlete",
    });

    const payload = await verifySessionToken(token);

    expect(payload?.userId).toBe("user_123");
    expect(payload?.email).toBe("athlete@example.com");
    expect(payload?.displayName).toBe("Athlete");
  });

  it("returns null for an invalid token", async () => {
    const payload = await verifySessionToken("invalid-token");
    expect(payload).toBeNull();
  });
});
