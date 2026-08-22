import { randomBytes } from "node:crypto";

process.env.NODE_ENV ??= "test";
process.env.JWT_SECRET ??= "test-jwt-secret-please-be-at-least-32-chars-long";
process.env.DATABASE_URL ??= "postgresql://u:p@127.0.0.1:5432/unused";
process.env.ENCRYPTION_SECRET ??= randomBytes(32).toString("hex");
process.env.EXERCISE_IMAGE_BASE_URL ??= "https://cdn.example.com/exercises";
process.env.CORS_ORIGINS ??= "http://localhost:3000";
process.env.LOG_LEVEL ??= "warn";
