/**
 * POST /api/admin/auth/logout
 * Clear the admin session.
 */

import { createAPIFileRoute } from "@tanstack/react-start/api";
import {
  deleteAdminSession,
  getAdminSessionCookieName,
  getClearAdminSessionCookieHeader,
} from "~/lib/admin-auth";

export const APIRoute = createAPIFileRoute("/api/admin/auth/logout")({
  POST: async ({ request }) => {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const cookies = parseCookies(cookieHeader);
    const sessionId = cookies[getAdminSessionCookieName()];

    if (sessionId) {
      await deleteAdminSession(sessionId);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": getClearAdminSessionCookieHeader(),
        },
      },
    );
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
