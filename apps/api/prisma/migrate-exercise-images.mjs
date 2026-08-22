import { config } from "dotenv";
config({ path: ".env.local" });
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const imageBaseUrl = process.env.EXERCISE_IMAGE_BASE_URL;

if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to run image migration with NODE_ENV=production.");
}

if (!connectionString) {
  throw new Error("DATABASE_URL is required for the exercise image migration.");
}

if (!imageBaseUrl) {
  throw new Error("EXERCISE_IMAGE_BASE_URL is required for the exercise image migration.");
}

function getExerciseImageUrl(exerciseId) {
  return `${imageBaseUrl}/${exerciseId}.jpg`;
}

async function main() {
  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    const { rows } = await client.query(`
      SELECT "id", "exerciseDbId"
      FROM "Exercise"
      WHERE "exerciseDbId" IS NOT NULL
    `);

    let updated = 0;
    for (const row of rows) {
      await client.query(
        `
          UPDATE "Exercise"
          SET "gifUrl" = $2, "updatedAt" = NOW()
          WHERE "id" = $1
        `,
        [row.id, getExerciseImageUrl(row.exerciseDbId)],
      );
      updated += 1;
    }

    console.log(`Updated ${updated} exercise image URLs.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
