/**
 * POST /api/admin/send-follow-ups
 *
 * Admin-only endpoint that sends Template 5 (Post-Purchase Follow-Up) to
 * customers who completed a purchase exactly 7 days ago (±12h window).
 * Intended to be called manually or via a daily cron job.
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
  postPurchaseFollowUp,
  getFirstName,
  getSiteUrl,
} from "~/lib/email-templates";

export const Route = createFileRoute("/api/admin/send-follow-ups")({
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

        // ── Find orders from 7 days ago (±12 hours) ─────────────────
        // Use a window: 6.5 to 7.5 days ago
        const now = new Date();
        const windowStart = new Date(now.getTime() - 7.5 * 24 * 60 * 60 * 1000);
        const windowEnd = new Date(now.getTime() - 6.5 * 24 * 60 * 60 * 1000);

        const orders = await sql()`
          SELECT o.id, o.user_id, o.customer_email, o.created_at,
                 u.name, u.email as user_email,
                 oi.product_title
          FROM orders o
          JOIN users u ON u.id = o.user_id
          JOIN order_items oi ON oi.order_id = o.id
          WHERE o.status = 'paid'
            AND o.created_at >= ${windowStart.toISOString()}
            AND o.created_at <= ${windowEnd.toISOString()}
          ORDER BY o.created_at ASC
        `;

        const siteUrl = getSiteUrl();
        let sent = 0;
        let skipped = 0;
        const errors: string[] = [];
        const sentTo = new Set<string>(); // Deduplicate by customer email

        for (const row of orders) {
          const order = row as Record<string, unknown>;
          const email =
            (order.customer_email as string) ||
            (order.user_email as string) ||
            "";
          const name = (order.name as string) || "";
          const productTitle = (order.product_title as string) || "your product";
          const orderDate = new Date(order.created_at as string);

          if (!email || sentTo.has(email)) {
            skipped++;
            continue;
          }

          sentTo.add(email);

          // Calculate refund deadline (14 days from order)
          const refundDeadline = new Date(orderDate);
          refundDeadline.setDate(refundDeadline.getDate() + 14);

          const template = postPurchaseFollowUp({
            customerFirstName: getFirstName(name),
            productName: productTitle,
            resourcesUrl: `${siteUrl}/resources`,
            accountDownloadsUrl: `${siteUrl}/account`,
            refundDeadlineDate: refundDeadline.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
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
            ordersFound: (orders as any[]).length,
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
