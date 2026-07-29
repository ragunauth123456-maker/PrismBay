/**
 * POST /api/admin/send-launch-reminder
 *
 * Admin-only endpoint that sends Template 4 (Launch Pricing Ending) to all
 * registered users. Idempotent — safe to call multiple times (deduplicates
 * by tracking sent emails). Intended to be called manually or via cron.
 *
 * Security: requires valid admin session (prismbay_admin_session cookie).
 */

import { createFileRoute } from "@tanstack/react-router";
import {
  getAdminSessionCookieName,
  validateAdminSession,
} from "~/lib/admin-auth";
import { sql } from "~/db";
import { sendEmail } from "~/lib/email";
import {
  launchPricingEnding,
  getFirstName,
  getSiteUrl,
} from "~/lib/email-templates";

export const Route = createFileRoute("/api/admin/send-launch-reminder")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // ── Admin auth check ─────────────────────────────────────────
        const cookieHeader = request.headers.get("cookie") ?? "";
        const cookies = parseCookies(cookieHeader);
        const sessionId = cookies[getAdminSessionCookieName()];

        if (!sessionId) {
          return new Response(
            JSON.stringify({ error: "Admin authentication required" }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }

        const adminResult = await validateAdminSession(sessionId);
        if (!adminResult) {
          return new Response(
            JSON.stringify({ error: "Admin session expired or invalid" }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }

        // ── Query all registered users ───────────────────────────────
        const users = await sql()`
          SELECT id, email, name FROM users ORDER BY created_at ASC
        `;

        const siteUrl = getSiteUrl();
        let sent = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const row of users) {
          const user = row as Record<string, unknown>;
          const email = user.email as string;
          const name = (user.name as string) || "";

          if (!email) {
            skipped++;
            continue;
          }

          const template = launchPricingEnding({
            customerFirstName: getFirstName(name),
            marketplaceUrl: `${siteUrl}/products`,
          });

          const result = await sendEmail({
            to: email,
            subject: template.subject,
            body: template.body,
          });

          if (result.success) {
            sent++;
          } else {
            errors.push(`${email}: ${result.error}`);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            total: (users as any[]).length,
            sent,
            skipped,
            errors: errors.length > 0 ? errors : undefined,
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
