/**
 * GET /api/auth/me/downloads
 * Returns the current user's download tokens.
 */

import { createFileRoute } from "@tanstack/react-router";
import { getSessionCookieName, validateSession } from "~/lib/auth";
import { sql } from "~/db";

export const Route = createFileRoute("/api/auth/me/downloads")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cookieHeader = request.headers.get("cookie") ?? "";
        const cookies = parseCookies(cookieHeader);
        const sessionId = cookies[getSessionCookieName()];

        if (!sessionId) {
          return new Response(
            JSON.stringify({ error: "Not authenticated" }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }

        const result = await validateSession(sessionId);
        if (!result) {
          return new Response(
            JSON.stringify({ error: "Session expired or invalid" }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }

        const userId = result.user.id;

        // Fetch download tokens for this user's paid orders
        const rows = await sql()`
          SELECT dt.token, dt.downloads_used, dt.max_downloads, dt.expires_at,
                 oi.product_title, o.status as order_status
          FROM download_tokens dt
          JOIN order_items oi ON oi.id = dt.order_item_id
          JOIN orders o ON o.id = oi.order_id
          WHERE o.user_id = ${userId}
            AND o.status = 'paid'
          ORDER BY dt.created_at DESC
        `;

        const downloads = (rows as any[]).map((r) => ({
          token: r.token,
          downloads_used: r.downloads_used,
          max_downloads: r.max_downloads,
          expires_at: r.expires_at ? String(r.expires_at) : null,
          product_title: r.product_title,
          order_status: r.order_status,
        }));

        return new Response(
          JSON.stringify({ downloads }),
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
