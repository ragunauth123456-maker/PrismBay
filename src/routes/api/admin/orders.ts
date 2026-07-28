/**
 * GET /api/admin/orders
 * Returns all orders for admin management.
 */

import { createFileRoute } from "@tanstack/react-router";
import { getAdminSessionCookieName, validateAdminSession } from "~/lib/admin-auth";
import { sql } from "~/db";

export const Route = createFileRoute("/api/admin/orders")({
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
          SELECT o.id, o.created_at as date, o.customer_email as email,
                 o.status, o.total_cents as amount,
                 COALESCE(oi.product_title, 'Unknown') as product
          FROM orders o
          LEFT JOIN order_items oi ON oi.order_id = o.id
          ORDER BY o.created_at DESC
          LIMIT 100
        `;

        return new Response(
          JSON.stringify({
            orders: (rows as any[]).map((r) => ({
              id: r.id,
              date: String(r.date),
              email: r.email,
              product: r.product,
              amount: r.amount,
              status: r.status,
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
