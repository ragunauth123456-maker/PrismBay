/**
 * Migration: Add product_slug column to order_items.
 * Usage: bun run src/db/migrate.ts
 */

import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set — cannot run migration.");
    process.exit(1);
  }

  const sql = neon(url);

  console.log("Running migration: add product_slug to order_items...");

  try {
    // Add column if it doesn't exist (safe to re-run)
    await sql.query(`
      ALTER TABLE order_items
      ADD COLUMN IF NOT EXISTS product_slug TEXT
    `);

    // Add index if it doesn't exist
    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_product_slug
      ON order_items (product_slug)
    `);

    console.log("✓ Migration complete: product_slug column added to order_items.");
  } catch (err) {
    console.error("✗ Migration failed:", err);
    process.exit(1);
  }
}

main();
