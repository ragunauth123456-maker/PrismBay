/**
 * Migration: Add contact_messages table for contact form submissions.
 * Usage: bun run src/db/migrate-contact.ts
 */
import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set — cannot run migration.");
    process.exit(1);
  }
  const db = neon(url);
  console.log("Running migration: add contact_messages table...");
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name       TEXT NOT NULL,
        email      TEXT NOT NULL,
        subject    TEXT NOT NULL DEFAULT '',
        message    TEXT NOT NULL,
        ip_address TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages (created_at)`);
    console.log("✓ Migration complete: contact_messages table created.");
  } catch (err) {
    console.error("✗ Migration failed:", err);
    process.exit(1);
  }
}

main();
