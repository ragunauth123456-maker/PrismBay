/**
 * POST /api/auth/register
 * Register a new customer account.
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";
import {
  createUser,
  createSession,
  getSessionCookieHeader,
  getUserByEmail,
} from "~/lib/auth";
import { checkRateLimit } from "~/lib/rate-limit";
import { sendEmailQuietly } from "~/lib/email";
import { welcome, getFirstName, getSiteUrl } from "~/lib/email-templates";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
});

export const Route = createFileRoute("/api/auth/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
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

        const existing = await getUserByEmail(email);
        if (existing) {
          return new Response(
            JSON.stringify({ error: "An account with this email already exists" }),
            { status: 409, headers: { "Content-Type": "application/json" } },
          );
        }

        const user = await createUser(email, password, name);
        const session = await createSession(user.id);

        // ── Send welcome email (Template 3) ──────────────────────────

        const siteUrl = getSiteUrl();
        const welcomeEmail = welcome({
          customerFirstName: getFirstName(name),
          marketplaceUrl: `${siteUrl}/products`,
          resourcesUrl: `${siteUrl}/resources`,
          trustUrl: `${siteUrl}/trust`,
        });

        await sendEmailQuietly({
          to: email,
          subject: welcomeEmail.subject,
          body: welcomeEmail.body,
        });

        // ─────────────────────────────────────────────────────────────

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
    },
  },
});
