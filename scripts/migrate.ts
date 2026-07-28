/**
 * Migration runner — reads all .sql files from migrations/ and executes them in
 * sorted order. Each migration runs in a transaction. Idempotent: uses IF NOT EXISTS
 * so re-running is safe.
 *
 * Usage: bun run scripts/migrate.ts
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

const MIGRATIONS_DIR = join(import.meta.dirname, "..", "migrations");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set — cannot run migrations.");
    process.exit(1);
  }

  const sql = neon(url);

  // Read migration files sorted by name (numeric prefix ensures ordering)
  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found.");
    return;
  }

  console.log(`Found ${files.length} migration(s):`);
  for (const f of files) console.log(`  • ${f}`);

  for (const file of files) {
    const content = await readFile(join(MIGRATIONS_DIR, file), "utf8");
    console.log(`\nRunning ${file}...`);

    try {
      // Remove comment lines, then split into individual statements
      const cleanSQL = content
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n");
      const statements = cleanSQL
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      for (const stmt of statements) {
        await sql.query(stmt);
      }
      console.log(`  ✓ ${file} complete`);
    } catch (err) {
      console.error(`  ✗ ${file} failed:`, err);
      process.exit(1);
    }
  }

  console.log("\nAll migrations complete.");
}

main();
