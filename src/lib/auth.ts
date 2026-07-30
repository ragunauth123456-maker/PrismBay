/**
 * Customer authentication — session management, password hashing, token generation.
 * Sessions stored in the `sessions` table, separate from admin sessions.
 */

import { hash as bcryptHash, verify as bcryptVerify } from "@node-rs/bcrypt";
import { generateRandomString, type RandomReader } from "@oslojs/crypto/random";
import { sql } from "~/db";
import type { PublicUser, Session, User } from "~/types";

// ── Constants ──────────────────────────────────────────────────────────

const BCRYPT_COST = 12;
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SESSION_COOKIE = "prismbay_session";

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

function generateToken(length: number): string {
  return generateRandomString(random, ALPHABET, length);
}

// ── Password helpers ───────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcryptHash(password, BCRYPT_COST);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcryptVerify(password, hash);
}

// ── Session management ─────────────────────────────────────────────────

export async function createSession(userId: string): Promise<Session> {
  const sessionId = generateId(40);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await sql()`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${sessionId}, ${userId}, ${expiresAt.toISOString()})
  `;

  return {
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  };
}

export async function validateSession(
  sessionId: string,
): Promise<{ session: Session; user: PublicUser } | null> {
  const rows = await sql()`
    SELECT s.id as session_id, s.user_id, s.expires_at, s.created_at as session_created_at,
           u.id, u.email, u.name, u.email_verified_at, u.created_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ${sessionId}
  `;

  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;

  // Check expiry
  const expiresAt = new Date(row.expires_at as string);
  if (Date.now() > expiresAt.getTime()) {
    // Delete expired session
    await sql()`DELETE FROM sessions WHERE id = ${sessionId}`;
    return null;
  }

  return {
    session: {
      id: row.session_id as string,
      user_id: row.user_id as string,
      expires_at: row.expires_at as string,
      created_at: row.session_created_at as string,
    },
    user: {
      id: row.id as string,
      email: row.email as string,
      name: row.name as string,
      email_verified_at: row.email_verified_at as string | null,
      created_at: row.created_at as string,
    },
  };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await sql()`DELETE FROM sessions WHERE id = ${sessionId}`;
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  await sql()`DELETE FROM sessions WHERE user_id = ${userId}`;
}

// ── Cookie helpers ─────────────────────────────────────────────────────

export function getSessionCookieHeader(sessionId: string): string {
  const maxAge = Math.floor(SESSION_DURATION_MS / 1000);
  return `${SESSION_COOKIE}=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function getClearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

// ── Token generation (for password resets, email verification) ─────────

export function generateSecureToken(length = 48): string {
  return generateToken(length);
}

// ── User creation helper ───────────────────────────────────────────────

export async function createUser(
  email: string,
  password: string,
  name: string,
): Promise<User> {
  const passwordHash = await hashPassword(password);
  const rows = await sql()`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email.toLowerCase().trim()}, ${passwordHash}, ${name.trim()})
    RETURNING id, email, password_hash, name, email_verified_at, stripe_customer_id, created_at, updated_at
  `;
  return rows[0] as unknown as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const rows = await sql()`
    SELECT id, email, password_hash, name, email_verified_at, stripe_customer_id, created_at, updated_at
    FROM users
    WHERE email = ${email.toLowerCase().trim()}
  `;
  if (rows.length === 0) return null;
  return rows[0] as unknown as User;
}
