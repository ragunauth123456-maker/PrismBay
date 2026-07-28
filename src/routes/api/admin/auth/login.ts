/**
 * POST /api/admin/auth/login
 * Authenticate an admin user.
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";
import {
  createAdminSession,
  getAdminByEmail,
  getAdminSessionCookieHeader,
  verifyAdminPassword,
} from "~/lib/admin-auth";
import { checkRateLimit } from "~/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const Route = createFileRoute("/api/admin/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("x-real-ip") ??
          "127.0.0.1";

        if (!checkRateLimit("login", ip)) {
          return new Response(
            JSON.stringify({ error: "Too many login attempts." }),
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

        const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({ error: "Validation failed", details: parsed.error.issues }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const { email, password } = parsed.data;

        const admin = await getAdminByEmail(email);
        if (!admin) {
          return new Response(
            JSON.stringify({ error: "Invalid email or password" }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }

        const valid = await verifyAdminPassword(password, admin.password_hash);
        if (!valid) {
          return new Response(
            JSON.stringify({ error: "Invalid email or password" }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }

        const session = await createAdminSession(admin.id);

        const { password_hash: _, ...publicAdmin } = admin;

        return new Response(
          JSON.stringify({ admin: publicAdmin }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": getAdminSessionCookieHeader(session.id),
            },
          },
        );
      },
    },
  },
});
