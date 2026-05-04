import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) throw new Error("ENCRYPTION_SECRET env var is not set.");
  const buf = Buffer.from(secret, "hex");
  if (buf.length !== 32) throw new Error("ENCRYPTION_SECRET must be a 32-byte hex string.");
  return buf;
}

export function encryptApiKey(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptApiKey(stored: string): string {
  const key = getKey();
  const parts = stored.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted key format.");
  const [ivHex, authTagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(ciphertext) + decipher.final("utf8");
}

export function maskApiKey(plaintext: string): string {
  return "••••••••" + plaintext.slice(-4);
}
