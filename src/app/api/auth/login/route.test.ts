import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/auth", () => ({
  loginUser: vi.fn(),
}));

import { loginUser } from "@/lib/server/auth";
import { POST } from "@/app/api/auth/login/route";

describe("POST /api/auth/login", () => {
  it("returns the logged-in user payload", async () => {
    vi.mocked(loginUser).mockResolvedValueOnce({
      id: "user_1",
      email: "athlete@example.com",
      displayName: "Athlete",
      createdAt: new Date("2026-04-26T00:00:00.000Z"),
    });

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "athlete@example.com", password: "Training123" }),
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.email).toBe("athlete@example.com");
  });
});
