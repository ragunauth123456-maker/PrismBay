/**
 * GET /api/admin/customers
 * Returns all registered customers for admin management.
 */

import { createFileRoute } from "@tanstack/react-router";
import { getAdminSessionCookieName, validateAdminSession } from "~/lib/admin-auth";
import { sql } from "~/db";

export const Route = createFileRoute("/api/admin/customers")({
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

        const rows = await sql()`
          SELECT u.id, u.email, u.name, u.created_at,
                 COUNT(o.id)::int as order_count
          FROM users u
          LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'paid'
          GROUP BY u.id, u.email, u.name, u.created_at
          ORDER BY u.created_at DESC
          LIMIT 100
        `;

        return new Response(
          JSON.stringify({
            customers: (rows as any[]).map((r) => ({
              id: r.id,
              email: r.email,
              name: r.name,
              created_at: String(r.created_at),
              order_count: r.order_count,
            })),
          }),
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
