/**
 * GET /api/admin/auth/me
 * Return the currently authenticated admin, or 401.
 */

import { createFileRoute } from "@tanstack/react-router";
import { getAdminSessionCookieName, validateAdminSession } from "~/lib/admin-auth";

export const Route = createFileRoute("/api/admin/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cookieHeader = request.headers.get("cookie") ?? "";
        const cookies = parseCookies(cookieHeader);
        const sessionId = cookies[getAdminSessionCookieName()];

        if (!sessionId) {
          return new Response(
            JSON.stringify({ error: "Not authenticated" }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }

        const result = await validateAdminSession(sessionId);
        if (!result) {
          return new Response(
            JSON.stringify({ error: "Session expired or invalid" }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }

        return new Response(
          JSON.stringify({ admin: result.admin }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});

function parseCookies(header: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) result[key] = value;
  }
  return result;
}
