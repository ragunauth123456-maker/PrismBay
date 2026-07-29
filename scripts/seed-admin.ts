/**
 * Admin seed script — creates the first admin user.
 *
 * Usage:
 *   bun run seed-admin
 *   ADMIN_EMAIL=admin@www.prismbayai.com ADMIN_PASSWORD=changeme bun run seed-admin
 */

import { neon } from "@neondatabase/serverless";
import { hash as bcryptHash } from "@node-rs/bcrypt";

const DEFAULT_EMAIL = "admin@www.prismbayai.com";
const DEFAULT_PASSWORD = "PrismBay2026!"; // Change in production!

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const sql = neon(url);
  const email = process.env.ADMIN_EMAIL || DEFAULT_EMAIL;
  const password = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
  const name = "Admin";

  // Check if admin already exists
  const existing = await sql`
    SELECT id FROM admin_users WHERE email = ${email.toLowerCase().trim()}
  `;

  if (existing.length > 0) {
    console.log(`Admin user "${email}" already exists. Skipping seed.`);
    return;
  }

  const passwordHash = await bcryptHash(password, 12);

  const result = await sql`
    INSERT INTO admin_users (email, password_hash, name, role)
    VALUES (${email.toLowerCase().trim()}, ${passwordHash}, ${name}, 'admin')
    RETURNING id, email, name, role
  `;

  const admin = result[0] as Record<string, unknown>;
  console.log("Admin user created:");
  console.log(`  ID:    ${admin.id}`);
  console.log(`  Email: ${admin.email}`);
  console.log(`  Name:  ${admin.name}`);
  console.log(`  Role:  ${admin.role}`);
  console.log("\n⚠️  Change the default password immediately in production.");
}

main();
