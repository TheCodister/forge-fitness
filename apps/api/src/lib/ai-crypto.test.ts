import { randomBytes } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { decryptApiKey, encryptApiKey, maskApiKey } from "./ai-crypto.js";

const original = process.env.ENCRYPTION_SECRET;

beforeAll(() => {
  process.env.ENCRYPTION_SECRET = randomBytes(32).toString("hex");
});

afterAll(() => {
  if (original === undefined) delete process.env.ENCRYPTION_SECRET;
  else process.env.ENCRYPTION_SECRET = original;
});

describe("encryptApiKey / decryptApiKey", () => {
  it("round-trips the plaintext", () => {
    const plaintext = "sk-test-abc123-xyz";
    expect(decryptApiKey(encryptApiKey(plaintext))).toBe(plaintext);
  });

  it("emits a fresh IV each call, so the same plaintext yields different ciphertexts", () => {
    const plaintext = "same-key";
    expect(encryptApiKey(plaintext)).not.toBe(encryptApiKey(plaintext));
  });

  it("fails to decrypt when the ciphertext has been tampered with", () => {
    const stored = encryptApiKey("secret");
    const [iv, tag, ct] = stored.split(":");
    const flipped = ct.slice(0, -2) + (ct.endsWith("00") ? "11" : "00");
    expect(() => decryptApiKey(`${iv}:${tag}:${flipped}`)).toThrow();
  });

  it("fails to decrypt when the auth tag has been tampered with", () => {
    const stored = encryptApiKey("secret");
    const [iv, tag, ct] = stored.split(":");
    const flipped = tag.slice(0, -2) + (tag.endsWith("00") ? "11" : "00");
    expect(() => decryptApiKey(`${iv}:${flipped}:${ct}`)).toThrow();
  });

  it("rejects a malformed stored payload that is missing sections", () => {
    expect(() => decryptApiKey("only:two")).toThrow(/Invalid encrypted key format/);
  });
});

describe("getKey guard", () => {
  it("throws when ENCRYPTION_SECRET is not set", () => {
    const prev = process.env.ENCRYPTION_SECRET;
    delete process.env.ENCRYPTION_SECRET;
    try {
      expect(() => encryptApiKey("x")).toThrow(/ENCRYPTION_SECRET/);
    } finally {
      process.env.ENCRYPTION_SECRET = prev;
    }
  });

  it("throws when ENCRYPTION_SECRET is not 32 bytes", () => {
    const prev = process.env.ENCRYPTION_SECRET;
    process.env.ENCRYPTION_SECRET = "aa";
    try {
      expect(() => encryptApiKey("x")).toThrow(/32-byte/);
    } finally {
      process.env.ENCRYPTION_SECRET = prev;
    }
  });
});

describe("maskApiKey", () => {
  it("keeps the last 4 characters and masks the rest", () => {
    expect(maskApiKey("sk-live-1234567890abcd")).toBe("••••••••abcd");
  });

  it("still returns a masked prefix for short inputs", () => {
    expect(maskApiKey("abc")).toBe("••••••••abc");
  });
});
