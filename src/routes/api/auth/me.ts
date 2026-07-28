/**
 * GET /api/auth/me
 * Return the currently authenticated customer, or 401.
 */

import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getSessionCookieName, validateSession } from "~/lib/auth";

export const APIRoute = createAPIFileRoute("/api/auth/me")({
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

    return new Response(
      JSON.stringify({ user: result.user }),
      { status: 200, headers: { "Content-Type": "application/json" } },
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
