/**
 * Admin authentication — separate session management from customers.
 * Sessions stored in the `admin_sessions` table.
 */

import { bcrypt } from "@node-rs/bcrypt";
import { generateRandomString, type RandomReader } from "@oslojs/crypto/random";
import { sql } from "~/db";
import type { AdminSession, AdminUser, PublicAdmin } from "~/types";

// ── Constants ──────────────────────────────────────────────────────────

const BCRYPT_COST = 12;
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
const ADMIN_SESSION_COOKIE = "prismbay_admin_session";

// ── Crypto helpers ─────────────────────────────────────────────────────

const random: RandomReader = {
  read(bytes: Uint8Array): void {
    crypto.getRandomValues(bytes);
  },
};

const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateId(length: number): string {
  return generateRandomString(random, ALPHABET, length);
}

// ── Password helpers ───────────────────────────────────────────────────

export async function hashAdminPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyAdminPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.verify(password, hash);
}

// ── Session management ─────────────────────────────────────────────────

export async function createAdminSession(adminId: string): Promise<AdminSession> {
  const sessionId = generateId(40);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await sql()`
    INSERT INTO admin_sessions (id, admin_id, expires_at)
    VALUES (${sessionId}, ${adminId}, ${expiresAt.toISOString()})
  `;

  return {
    id: sessionId,
    admin_id: adminId,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  };
}

export async function validateAdminSession(
  sessionId: string,
): Promise<{ session: AdminSession; admin: PublicAdmin } | null> {
  const rows = await sql()`
    SELECT s.id as session_id, s.admin_id, s.expires_at, s.created_at as session_created_at,
           a.id, a.email, a.name, a.role
    FROM admin_sessions s
    JOIN admin_users a ON a.id = s.admin_id
    WHERE s.id = ${sessionId}
  `;

  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;

  // Check expiry
  const expiresAt = new Date(row.expires_at as string);
  if (Date.now() > expiresAt.getTime()) {
    await sql()`DELETE FROM admin_sessions WHERE id = ${sessionId}`;
    return null;
  }

  return {
    session: {
      id: row.session_id as string,
      admin_id: row.admin_id as string,
      expires_at: row.expires_at as string,
      created_at: row.session_created_at as string,
    },
    admin: {
      id: row.id as string,
      email: row.email as string,
      name: row.name as string,
      role: row.role as string,
    },
  };
}

export async function deleteAdminSession(sessionId: string): Promise<void> {
  await sql()`DELETE FROM admin_sessions WHERE id = ${sessionId}`;
}

// ── Cookie helpers ─────────────────────────────────────────────────────

export function getAdminSessionCookieHeader(sessionId: string): string {
  const maxAge = Math.floor(SESSION_DURATION_MS / 1000);
  return `${ADMIN_SESSION_COOKIE}=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function getClearAdminSessionCookieHeader(): string {
  return `${ADMIN_SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function getAdminSessionCookieName(): string {
  return ADMIN_SESSION_COOKIE;
}

// ── Admin user helpers ─────────────────────────────────────────────────

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const rows = await sql()`
    SELECT id, email, password_hash, name, role, created_at, updated_at
    FROM admin_users
    WHERE email = ${email.toLowerCase().trim()}
  `;
  if (rows.length === 0) return null;
  return rows[0] as unknown as AdminUser;
}

export async function createAdminUser(
  email: string,
  password: string,
  name: string,
  role = "admin",
): Promise<AdminUser> {
  const passwordHash = await hashAdminPassword(password);
  const rows = await sql()`
    INSERT INTO admin_users (email, password_hash, name, role)
    VALUES (${email.toLowerCase().trim()}, ${passwordHash}, ${name.trim()}, ${role})
    RETURNING id, email, password_hash, name, role, created_at, updated_at
  `;
  return rows[0] as unknown as AdminUser;
}
