/**
 * POST /api/subscribe
 * Subscribes an email address to the newsletter.
 * Body: { email: string }
 * Stores in the subscribers table. Rate-limited (3 per hour per IP).
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";
import { checkRateLimit } from "~/lib/rate-limit";
import { sql } from "~/db";
import { sendEmail } from "~/lib/email";
import { newsletterWelcome, getSiteUrl } from "~/lib/email-templates";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address.").min(1),
});

/**
 * Send the welcome-to-newsletter email to a new subscriber.
 * Non-blocking — failures are logged but don't affect the subscription.
 */
async function sendWelcomeNewsletter(email: string): Promise<void> {
  const siteUrl = getSiteUrl();
  const template = newsletterWelcome({
    customerFirstName: "there",
    resourcesUrl: `${siteUrl}/resources`,
    marketplaceUrl: `${siteUrl}/products`,
    unsubscribeUrl: `${siteUrl}/cookies`, // placeholder — real unsubscribe tokens TBD
  });

  await sendEmail({
    to: email,
    subject: template.subject,
    body: template.body,
  });
}

export const Route = createFileRoute("/api/subscribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Rate limit by IP
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "unknown";

        if (!checkRateLimit("subscribe", ip)) {
          return new Response(
            JSON.stringify({ error: "Too many requests. Please try again later." }),
            { status: 429, headers: { "Content-Type": "application/json" } },
          );
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(
            JSON.stringify({ error: "Invalid JSON body." }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const parsed = subscribeSchema.safeParse(body);
        if (!parsed.success) {
          const firstIssue = parsed.error.issues[0];
          const message =
            firstIssue?.message === "Invalid input: expected string, received undefined"
              ? "Please enter a valid email address."
              : firstIssue?.message ?? "Invalid email address.";
          return new Response(
            JSON.stringify({ error: message }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const { email } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();

        try {
          // Upsert: if already subscribed, update subscribed_at; if unsubscribed, re-subscribe
          await sql()`
            INSERT INTO subscribers (email, subscribed_at, unsubscribed_at, ip_address)
            VALUES (${normalizedEmail}, now(), NULL, ${ip})
            ON CONFLICT (email)
            DO UPDATE SET
              subscribed_at = now(),
              unsubscribed_at = NULL,
              ip_address = ${ip}
          `;

          // Send welcome-to-newsletter email (non-blocking)
          sendWelcomeNewsletter(normalizedEmail).catch((err) => {
            console.error("Failed to send newsletter welcome:", (err as Error).message);
          });

          return new Response(
            JSON.stringify({ success: true, message: "You're subscribed! Check your inbox." }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        } catch (err) {
          console.error("Subscribe error:", err);
          return new Response(
            JSON.stringify({ error: "Something went wrong. Please try again." }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
