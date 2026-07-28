/**
 * POST /api/auth/register
 * Register a new customer account.
 */

import { createAPIFileRoute } from "@tanstack/react-start/api";
import { z } from "zod/v4";
import {
  createUser,
  createSession,
  getSessionCookieHeader,
  getUserByEmail,
} from "~/lib/auth";
import { checkRateLimit } from "~/lib/rate-limit";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
});

export const APIRoute = createAPIFileRoute("/api/auth/register")({
  POST: async ({ request }) => {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1";

    if (!checkRateLimit("register", ip)) {
      return new Response(
        JSON.stringify({ error: "Too many registration attempts. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: parsed.error.issues }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const { email, password, name } = parsed.data;

    // Check existing user
    const existing = await getUserByEmail(email);
    if (existing) {
      return new Response(
        JSON.stringify({ error: "An account with this email already exists" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }

    // Create user
    const user = await createUser(email, password, name);

    // Create session
    const session = await createSession(user.id);

    const { password_hash: _, ...publicUser } = user;

    return new Response(
      JSON.stringify({ user: publicUser }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": getSessionCookieHeader(session.id),
        },
      },
    );
  },
});
