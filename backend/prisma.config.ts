import { config } from "dotenv";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

config({ path: ["../.env.local", "../.env", ".env.local", ".env"] });

export default defineConfig({
  schema: path.join("..", "prisma", "schema.prisma"),
  migrations: {
    seed: "node ../prisma/seed.mjs",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
