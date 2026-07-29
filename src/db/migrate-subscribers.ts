/**
 * Migration: Add subscribers table for newsletter signup.
 * Usage: bun run src/db/migrate-subscribers.ts
 */

import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set — cannot run migration.");
    process.exit(1);
  }

  const sql = neon(url);

  console.log("Running migration: add subscribers table...");

  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email           TEXT NOT NULL UNIQUE,
        subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        unsubscribed_at TIMESTAMPTZ,
        ip_address      TEXT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers (email)
    `);

    console.log("✓ Migration complete: subscribers table added.");
  } catch (err) {
    console.error("✗ Migration failed:", err);
    process.exit(1);
  }
}

main();
