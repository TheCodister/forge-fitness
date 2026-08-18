import { exercises } from "./exercise-catalog.mjs";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for seeding.");
}

async function main() {
  const client = new pg.Client({
    connectionString,
  });

  await client.connect();

  try {
    for (const [slug, name, description, category, muscleGroup, equipment] of exercises) {
      await client.query(
        `
          INSERT INTO "Exercise" (
            "id",
            "slug",
            "name",
            "description",
            "category",
            "muscleGroup",
            "equipment",
            "isActive",
            "createdAt",
            "updatedAt"
          )
          VALUES (
            concat('seed_', md5($1)),
            $1,
            $2,
            $3,
            CAST($4 AS "ExerciseCategory"),
            CAST($5 AS "MuscleGroup"),
            $6,
            true,
            NOW(),
            NOW()
          )
          ON CONFLICT ("slug")
          DO UPDATE SET
            "name" = EXCLUDED."name",
            "description" = EXCLUDED."description",
            "category" = EXCLUDED."category",
            "muscleGroup" = EXCLUDED."muscleGroup",
            "equipment" = EXCLUDED."equipment",
            "isActive" = true,
            "updatedAt" = NOW()
        `,
        [slug, name, description, category, muscleGroup, equipment],
      );
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
