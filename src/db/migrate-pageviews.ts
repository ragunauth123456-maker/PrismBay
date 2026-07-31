/**
 * Migration: Add page_views table for privacy-friendly analytics.
 * Usage: bun run src/db/migrate-pageviews.ts
 */
import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set — cannot run migration.");
    process.exit(1);
  }
  const db = neon(url);
  console.log("Running migration: add page_views table...");
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS page_views (
        id          BIGSERIAL PRIMARY KEY,
        path        TEXT NOT NULL,
        referrer    TEXT,
        user_agent  TEXT,
        ip_hash     TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (path)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at)`);
    console.log("✓ Migration complete: page_views table created.");
  } catch (err) {
    console.error("✗ Migration failed:", err);
    process.exit(1);
  }
}

main();
