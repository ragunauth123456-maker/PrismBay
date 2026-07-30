/**
 * Database setup — reads schema.sql and executes it against the database.
 * Usage: bun run src/db/setup.ts
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

const SCHEMA_PATH = join(import.meta.dirname, "..", "schema.sql");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set — cannot run setup.");
    process.exit(1);
  }

  const sql = neon(url);
  const schema = await readFile(SCHEMA_PATH, "utf8");

  console.log("Running schema setup...");
  try {
    // Use sql.query() for raw multi-statement SQL
    await sql.query(schema);
    console.log("✓ Schema setup complete.");
  } catch (err) {
    console.error("✗ Schema setup failed:", err);
    process.exit(1);
  }
}

main();
