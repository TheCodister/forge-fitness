import bcrypt from "bcryptjs";
import { config } from "dotenv";
import pg from "pg";

// Local runs read .env.local; CI supplies DATABASE_URL through the job env.
config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for seeding the e2e test user.");
}

const email = (process.env.E2E_USER_EMAIL ?? "benqa@gmail.com").trim().toLowerCase();
const password = process.env.E2E_USER_PASSWORD ?? "123456789ben";
const name = process.env.E2E_USER_NAME ?? "Ben QA";

async function main() {
  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await client.query(
      `
        INSERT INTO "User" ("id", "email", "name", "passwordHash", "createdAt", "updatedAt")
        VALUES (concat('e2e_', md5($1)), $1, $2, $3, now(), now())
        ON CONFLICT ("email")
        DO UPDATE SET "name" = EXCLUDED."name",
                      "passwordHash" = EXCLUDED."passwordHash",
                      "updatedAt" = now()
      `,
      [email, name, passwordHash],
    );

    console.log(`Seeded e2e test user: ${email}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
