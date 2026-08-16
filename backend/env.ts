import { config } from "dotenv";

// Match Next.js local development behavior while keeping deployment-provided
// environment variables authoritative. dotenv does not overwrite existing keys.
config({
  path: [".env.local", ".env", "../.env.local", "../.env"],
  quiet: process.env.NODE_ENV === "production",
});
