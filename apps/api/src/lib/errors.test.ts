import { describe, expect, it } from "vitest";

import { ApiError } from "./errors.js";

describe("ApiError", () => {
  it("is an Error subclass", () => {
    const error = new ApiError(400, "BAD_REQUEST", "nope");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });

  it("exposes status, code, and message", () => {
    const error = new ApiError(404, "NOT_FOUND", "gone");
    expect(error.status).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("gone");
  });

  it("carries optional field errors verbatim", () => {
    const fieldErrors = { email: ["required"], password: ["too short"] };
    const error = new ApiError(400, "VALIDATION", "bad", fieldErrors);
    expect(error.fieldErrors).toEqual(fieldErrors);
  });

  it("leaves fieldErrors undefined when not provided", () => {
    expect(new ApiError(500, "OOPS", "boom").fieldErrors).toBeUndefined();
  });
});
