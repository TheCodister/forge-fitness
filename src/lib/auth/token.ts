import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const secret = process.env.JWT_SECRET ?? (process.env.NODE_ENV === "test" ? "test-secret" : undefined);

if (!secret) {
  throw new Error("JWT_SECRET is not configured.");
}

const secretKey = new TextEncoder().encode(secret);
const sessionDurationInSeconds = 60 * 60 * 24 * 7;

export type SessionPayload = JWTPayload & {
  userId: string;
  email: string;
  displayName: string;
};

export async function signSessionToken(payload: Omit<SessionPayload, "exp" | "iat">) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${sessionDurationInSeconds}s`)
    .sign(secretKey);
}

export async function verifySessionToken(token?: string) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.displayName !== "string"
    ) {
      return null;
    }

    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export { sessionDurationInSeconds };
