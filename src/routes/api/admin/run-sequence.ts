/**
 * POST /api/admin/run-sequence
 *
 * Automated email nurture sequence runner. Processes post-purchase onboarding
 * and pre-purchase nurture sequences on a schedule. Fully idempotent — safe to
 * call multiple times per day (deduplicates via email_campaign_log).
 *
 * Intended to be called by a daily cron job or manually from the admin dashboard.
 *
 * Security: requires valid admin session (prismbay_admin_session cookie).
 *
 * Post-purchase sequence (campaign: "post-purchase-onboarding"):
 *   Day  1 — "Here's where to start"        (0.5–1.5 days after purchase)
 *   Day  3 — "Two things most people miss"   (2.5–3.5 days after purchase)
 *   Day  7 — "One-week check-in"             (6.5–7.5 days after purchase)
 *   Day 12 — "Before your refund window closes" (11.5–12.5 days after purchase)
 *   Day 21 — "Building on X — what next?"    (20.5–21.5 days after purchase)
 *
 * Pre-purchase sequence (campaign: "pre-purchase-nurture"):
 *   Day  1 — "Still exploring AI business systems?" (0.5–1.5 days after subscribe)
 *   Day  4 — "How businesses are using AI systems"  (3.5–4.5 days after subscribe)
 *   Day 10 — "The 14-day refund policy"             (9.5–10.5 days after subscribe)
 */

import { createFileRoute } from "@tanstack/react-router";
import {
  getAdminSessionCookieName,
  validateAdminSession,
} from "~/lib/admin-auth";
import { sql } from "~/db";
import { sendEmail, hasReceived, logSent } from "~/lib/email";
import {
  postPurchaseStartHere,
  postPurchaseTwoThings,
  postPurchaseWeekCheckIn,
  postPurchaseRefundReminder,
  postPurchaseWhatNext,
  prePurchaseStillExploring,
  prePurchaseHowBusinessesUseAI,
  prePurchaseRefundPolicy,
  getFirstName,
  getSiteUrl,
} from "~/lib/email-templates";

// ─── Upsell mapping for Day-21 "what next" email ──────────────────────────
// Maps each product slug to its recommended next-step product
const UPSELL_MAP: Record<string, {
  name: string;
  slug: string;
  bundleName: string;
  bundleSlug: string;
  bundleSavingsPercent: number;
}> = {
  "nexus-network": {
    name: "NexusOS",
    slug: "nexusos",
    bundleName: "AI Business Operations",
    bundleSlug: "ai-business-operations",
    bundleSavingsPercent: 35,
  },
  "nexus-one": {
    name: "NexusOS",
    slug: "nexusos",
    bundleName: "AI Business Operations",
    bundleSlug: "ai-business-operations",
    bundleSavingsPercent: 35,
  },
  "nexusos": {
    name: "Empire AI",
    slug: "empire-ai",
    bundleName: "Complete AI Business Portfolio",
    bundleSlug: "complete-portfolio",
    bundleSavingsPercent: 36,
  },
  "empire-ai": {
    name: "NexusOS",
    slug: "nexusos",
    bundleName: "Complete AI Business Portfolio",
    bundleSlug: "complete-portfolio",
    bundleSavingsPercent: 36,
  },
  "genesis-platform": {
    name: "Digital Humans",
    slug: "digital-humans",
    bundleName: "Complete AI Business Portfolio",
    bundleSlug: "complete-portfolio",
    bundleSavingsPercent: 36,
  },
  "digital-humans": {
    name: "Genesis Platform",
    slug: "genesis-platform",
    bundleName: "Complete AI Business Portfolio",
    bundleSlug: "complete-portfolio",
    bundleSavingsPercent: 36,
  },
  "spendshield-ai": {
    name: "GuardianOS",
    slug: "guardianos",
    bundleName: "Trust, Risk & Compliance",
    bundleSlug: "trust-risk-compliance",
    bundleSavingsPercent: 37,
  },
  "guardianos": {
    name: "EvidenceFlow AI",
    slug: "evidenceflow-ai",
    bundleName: "Trust, Risk & Compliance",
    bundleSlug: "trust-risk-compliance",
    bundleSavingsPercent: 37,
  },
  "evidenceflow-ai": {
    name: "GuardianOS",
    slug: "guardianos",
    bundleName: "Trust, Risk & Compliance",
    bundleSlug: "trust-risk-compliance",
    bundleSavingsPercent: 37,
  },
};

// ─── Campaign constants ────────────────────────────────────────────────────

const POST_PURCHASE_CAMPAIGN = "post-purchase-onboarding";
const PRE_PURCHASE_CAMPAIGN = "pre-purchase-nurture";

interface SequenceStep {
  templateName: string;
  label: string;
  dayMin: number; // minimum days since event (inclusive)
  dayMax: number; // maximum days since event (inclusive)
}

const POST_PURCHASE_STEPS: SequenceStep[] = [
  { templateName: "post-purchase-day-1",  label: "Day 1 — Start Here",            dayMin: 0.5, dayMax: 1.5 },
  { templateName: "post-purchase-day-3",  label: "Day 3 — Two Things",            dayMin: 2.5, dayMax: 3.5 },
  { templateName: "post-purchase-day-7",  label: "Day 7 — Week Check-In",         dayMin: 6.5, dayMax: 7.5 },
  { templateName: "post-purchase-day-12", label: "Day 12 — Refund Reminder",      dayMin: 11.5, dayMax: 12.5 },
  { templateName: "post-purchase-day-21", label: "Day 21 — What Next",            dayMin: 20.5, dayMax: 21.5 },
];

const PRE_PURCHASE_STEPS: SequenceStep[] = [
  { templateName: "pre-purchase-day-1",  label: "Day 1 — Still Exploring",      dayMin: 0.5, dayMax: 1.5 },
  { templateName: "pre-purchase-day-4",  label: "Day 4 — How Businesses Use AI", dayMin: 3.5, dayMax: 4.5 },
  { templateName: "pre-purchase-day-10", label: "Day 10 — Refund Policy",        dayMin: 9.5, dayMax: 10.5 },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

interface StatsAccumulator {
  candidate: number;
  sent: number;
  skipped: number;
  errors: string[];
}

function initStats(): StatsAccumulator {
  return { candidate: 0, sent: 0, skipped: 0, errors: [] };
}

/**
 * Send a single campaign email, checking dedup first.
 */
async function sendIfNotReceived(
  email: string,
  campaignName: string,
  templateName: string,
  subject: string,
  body: string,
  stats: StatsAccumulator,
): Promise<void> {
  const alreadyReceived = await hasReceived(email, campaignName, templateName);
  if (alreadyReceived) {
    stats.skipped++;
    return;
  }

  const result = await sendEmail({ to: email, subject, body });
  if (result.success) {
    await logSent(email, campaignName, templateName);
    stats.sent++;
  } else {
    stats.errors.push(`${email}: ${result.error ?? "unknown error"}`);
  }
}

// ─── Route handler ──────────────────────────────────────────────────────────

export const Route = createFileRoute("/api/admin/run-sequence")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // ── Admin auth check ─────────────────────────────────────────────
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

        const siteUrl = getSiteUrl();
        const now = new Date();
        const results: Record<string, unknown> = {};

        // ── Post-Purchase Sequence ───────────────────────────────────────
        const ppTotal = initStats();

        for (const step of POST_PURCHASE_STEPS) {
          const windowStart = new Date(
            now.getTime() - step.dayMax * 24 * 60 * 60 * 1000,
          );
          const windowEnd = new Date(
            now.getTime() - step.dayMin * 24 * 60 * 60 * 1000,
          );

          // Fetch all paid orders in this time window with their items
          const orders = await sql()`
            SELECT DISTINCT ON (o.customer_email)
              o.id, o.customer_email, o.created_at, o.user_id,
              u.name,
              oi.product_title, oi.product_slug
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            JOIN order_items oi ON oi.order_id = o.id
            WHERE o.status = 'paid'
              AND o.created_at >= ${windowStart.toISOString()}
              AND o.created_at <= ${windowEnd.toISOString()}
            ORDER BY o.customer_email, o.created_at ASC
          `;

          for (const row of orders as Record<string, unknown>[]) {
            const email = (row.customer_email as string) || "";
            if (!email) continue;

            ppTotal.candidate++;

            const name = (row.name as string) || "";
            const firstName = getFirstName(name);
            const productTitle = (row.product_title as string) || "your product";
            const productSlug = (row.product_slug as string) || "";
            const orderDate = new Date(row.created_at as string);

            // Build refund deadline (14 days from order)
            const refundDeadline = new Date(orderDate);
            refundDeadline.setDate(refundDeadline.getDate() + 14);
            const refundDeadlineStr = refundDeadline.toLocaleDateString(
              "en-US",
              { year: "numeric", month: "long", day: "numeric" },
            );

            const supportDaysRemaining = Math.max(
              0,
              30 - Math.floor((now.getTime() - orderDate.getTime()) / 86400000),
            );

            let subject = "";
            let body = "";

            switch (step.templateName) {
              case "post-purchase-day-1": {
                const t = postPurchaseStartHere({
                  customerFirstName: firstName,
                  productName: productTitle,
                  productDemoUrl: `${siteUrl}/demo/${productSlug}`,
                  accountDownloadsUrl: `${siteUrl}/account`,
                });
                subject = t.subject;
                body = t.body;
                break;
              }
              case "post-purchase-day-3": {
                const t = postPurchaseTwoThings({
                  customerFirstName: firstName,
                  productName: productTitle,
                  productSlug,
                  resourcesUrl: `${siteUrl}/resources`,
                });
                subject = t.subject;
                body = t.body;
                break;
              }
              case "post-purchase-day-7": {
                const t = postPurchaseWeekCheckIn({
                  customerFirstName: firstName,
                  productName: productTitle,
                  accountDownloadsUrl: `${siteUrl}/account`,
                  refundDeadlineDate: refundDeadlineStr,
                  supportDaysRemaining,
                });
                subject = t.subject;
                body = t.body;
                break;
              }
              case "post-purchase-day-12": {
                const t = postPurchaseRefundReminder({
                  customerFirstName: firstName,
                  productName: productTitle,
                  refundDeadlineDate: refundDeadlineStr,
                  productDemoUrl: `${siteUrl}/demo/${productSlug}`,
                });
                subject = t.subject;
                body = t.body;
                break;
              }
              case "post-purchase-day-21": {
                const upsell = UPSELL_MAP[productSlug] ?? UPSELL_MAP["nexus-one"];
                const t = postPurchaseWhatNext({
                  customerFirstName: firstName,
                  productName: productTitle,
                  upsellProductName: upsell.name,
                  upsellProductUrl: `${siteUrl}/products/${upsell.slug}`,
                  bundleSavingsPercent: upsell.bundleSavingsPercent,
                  bundleName: upsell.bundleName,
                  bundleUrl: `${siteUrl}/bundles/${upsell.bundleSlug}`,
                  marketplaceUrl: `${siteUrl}/products`,
                });
                subject = t.subject;
                body = t.body;
                break;
              }
              default:
                continue;
            }

            await sendIfNotReceived(
              email,
              POST_PURCHASE_CAMPAIGN,
              step.templateName,
              subject,
              body,
              ppTotal,
            );
          }
        }

        results.postPurchase = {
          label: "Post-Purchase Onboarding",
          steps: POST_PURCHASE_STEPS.map((s) => s.label),
          candidate: ppTotal.candidate,
          sent: ppTotal.sent,
          skipped: ppTotal.skipped,
          errors: ppTotal.errors.length > 0 ? ppTotal.errors : undefined,
        };

        // ── Pre-Purchase Sequence ────────────────────────────────────────
        const preTotal = initStats();

        for (const step of PRE_PURCHASE_STEPS) {
          const windowStart = new Date(
            now.getTime() - step.dayMax * 24 * 60 * 60 * 1000,
          );
          const windowEnd = new Date(
            now.getTime() - step.dayMin * 24 * 60 * 60 * 1000,
          );

          // Fetch subscribers who signed up in this window and haven't unsubscribed
          const subscribers = await sql()`
            SELECT email, subscribed_at
            FROM subscribers
            WHERE unsubscribed_at IS NULL
              AND subscribed_at >= ${windowStart.toISOString()}
              AND subscribed_at <= ${windowEnd.toISOString()}
            ORDER BY subscribed_at ASC
          `;

          for (const row of subscribers as Record<string, unknown>[]) {
            const email = (row.email as string) || "";
            if (!email) continue;

            preTotal.candidate++;

            const firstName = "there"; // subscribers table has no name field

            let subject = "";
            let body = "";

            switch (step.templateName) {
              case "pre-purchase-day-1": {
                const t = prePurchaseStillExploring({
                  customerFirstName: firstName,
                  marketplaceUrl: `${siteUrl}/products`,
                  resourcesUrl: `${siteUrl}/resources`,
                });
                subject = t.subject;
                body = t.body;
                break;
              }
              case "pre-purchase-day-4": {
                const t = prePurchaseHowBusinessesUseAI({
                  customerFirstName: firstName,
                  resourcesUrl: `${siteUrl}/resources`,
                  marketplaceUrl: `${siteUrl}/products`,
                });
                subject = t.subject;
                body = t.body;
                break;
              }
              case "pre-purchase-day-10": {
                const t = prePurchaseRefundPolicy({
                  customerFirstName: firstName,
                  refundPolicyUrl: `${siteUrl}/refunds`,
                  marketplaceUrl: `${siteUrl}/products`,
                });
                subject = t.subject;
                body = t.body;
                break;
              }
              default:
                continue;
            }

            await sendIfNotReceived(
              email,
              PRE_PURCHASE_CAMPAIGN,
              step.templateName,
              subject,
              body,
              preTotal,
            );
          }
        }

        results.prePurchase = {
          label: "Pre-Purchase Nurture",
          steps: PRE_PURCHASE_STEPS.map((s) => s.label),
          candidate: preTotal.candidate,
          sent: preTotal.sent,
          skipped: preTotal.skipped,
          errors: preTotal.errors.length > 0 ? preTotal.errors : undefined,
        };

        return new Response(
          JSON.stringify({ success: true, results }),
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
