/**
 * Seed script — populates database with products, bundles, and an admin user.
 * Usage: bun run src/db/seed.ts
 */

import { neon } from "@neondatabase/serverless";
import { hash } from "@node-rs/bcrypt";
import { PRODUCTS, BUNDLES, CATEGORY_MAP } from "../data/products";

const ADMIN_EMAIL = "admin@www.prismbayai.com";
const ADMIN_PASSWORD = "admin123"; // TEMPORARY — change immediately

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set — cannot run seed.");
    process.exit(1);
  }

  const sql = neon(url);

  // ── Seed categories ──
  console.log("Seeding categories...");
  for (const cat of Object.values(CATEGORY_MAP)) {
    const existing = await sql`SELECT id FROM categories WHERE slug = ${cat.slug}`;
    if (existing.length > 0) {
      console.log(`  Category "${cat.name}" already exists, skipping.`);
      continue;
    }
    await sql`
      INSERT INTO categories (name, slug, description, sort_order)
      VALUES (${cat.name}, ${cat.slug}, '', ${cat.count})
    `;
    console.log(`  ✓ Category "${cat.name}" created.`);
  }

  // ── Get category IDs for reference ──
  const catRows = await sql`SELECT id, slug FROM categories`;
  const catMap: Record<string, string> = {};
  for (const row of catRows as Array<{ id: string; slug: string }>) {
    catMap[row.slug] = row.id;
  }

  // ── Seed products ──
  console.log("\nSeeding products...");
  for (const product of PRODUCTS) {
    const existing = await sql`SELECT id FROM products WHERE slug = ${product.slug}`;
    if (existing.length > 0) {
      console.log(`  Product "${product.name}" already exists, skipping.`);
      continue;
    }
    await sql`
      INSERT INTO products (
        title, slug, description, long_description,
        price_cents, currency, category_id,
        demo_video_url, is_published, is_featured
      ) VALUES (
        ${product.name}, ${product.slug},
        ${product.tagline}, ${product.longDescription},
        ${product.launchPrice * 100}, 'usd',
        ${catMap[product.categorySlug] || null},
        ${product.demoVideoUrl || null},
        true, false
      )
    `;
    console.log(`  ✓ Product "${product.name}" created.`);
  }

  // ── Seed bundles (as products with special flags) ──
  console.log("\nSeeding bundles...");
  for (const bundle of BUNDLES) {
    const existing = await sql`SELECT id FROM products WHERE slug = ${bundle.slug}`;
    if (existing.length > 0) {
      console.log(`  Bundle "${bundle.name}" already exists, skipping.`);
      continue;
    }
    // Bundles don't map to a real category, use NULL
    await sql`
      INSERT INTO products (
        title, slug, description, long_description,
        price_cents, currency,
        is_published, is_featured
      ) VALUES (
        ${bundle.name}, ${bundle.slug},
        ${bundle.description}, ${bundle.description},
        ${bundle.launchPrice * 100}, 'usd',
        true, true
      )
    `;
    console.log(`  ✓ Bundle "${bundle.name}" created.`);
  }

  // ── Seed admin user ──
  console.log("\nSeeding admin user...");
  const existingAdmin = await sql`
    SELECT id FROM admin_users WHERE email = ${ADMIN_EMAIL}
  `;
  if (existingAdmin.length > 0) {
    console.log(`  Admin "${ADMIN_EMAIL}" already exists, skipping.`);
  } else {
    const passwordHash = await hash(ADMIN_PASSWORD, 12);
    await sql`
      INSERT INTO admin_users (email, password_hash, name, role)
      VALUES (${ADMIN_EMAIL}, ${passwordHash}, 'Admin', 'admin')
    `;
    console.log(`  ✓ Admin user "${ADMIN_EMAIL}" created.`);
    console.log(`  ⚠️  TEMPORARY PASSWORD: ${ADMIN_PASSWORD} — CHANGE IMMEDIATELY.`);
  }

  console.log("\nSeed complete.");
}

main();
