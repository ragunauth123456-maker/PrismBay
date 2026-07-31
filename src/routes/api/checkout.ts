/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session for a product or bundle.
 * Body: { productSlug: string }
 * Creates a pending order record in the database.
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";
import { createProductCheckoutSession } from "~/lib/stripe";
import { getSessionCookieName, validateSession } from "~/lib/auth";
import { sql } from "~/db";
import { getProductBySlug } from "~/data/products";
import { BUNDLES } from "~/data/products";

const checkoutSchema = z.object({
  productSlug: z.string().min(1),
});

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Get origin for success/cancel URLs
        const origin = request.headers.get("origin") || "https://www.prismbayai.com";

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(
            JSON.stringify({ error: "Invalid JSON body" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const parsed = checkoutSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({ error: "Validation failed", details: parsed.error.issues }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const { productSlug } = parsed.data;

        // Validate product exists
        const product = getProductBySlug(productSlug);
        const bundle = BUNDLES.find((b) => b.slug === productSlug);
        if (!product && !bundle) {
          return new Response(
            JSON.stringify({ error: "Product not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } },
          );
        }

        // Get customer email from session if logged in
        let customerEmail: string | undefined;
        let userId: string | null = null;

        const cookieHeader = request.headers.get("cookie") ?? "";
        const cookies = parseCookies(cookieHeader);
        const sessionId = cookies[getSessionCookieName()];
        if (sessionId) {
          const sessionResult = await validateSession(sessionId);
          if (sessionResult) {
            customerEmail = sessionResult.user.email;
            userId = sessionResult.user.id;
          }
        }

        // Track checkout initiation (abandoned cart tracking)
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          null;
        const checkoutEmail = customerEmail || "";
        const sessionToken = sessionId || null;

        try {
          await sql()`
            INSERT INTO checkout_events (email, product_slug, session_id, ip_address)
            VALUES (${checkoutEmail}, ${productSlug}, ${sessionToken}, ${ip})
          `;
        } catch (err) {
          console.error("Checkout event tracking error:", (err as Error).message);
          // Non-blocking — don't fail checkout if tracking fails
        }

        try {
          const session = await createProductCheckoutSession({
            productSlug,
            customerEmail,
            origin,
          });

          // Create pending order in database
          const item = product || bundle!;
          const amount = product ? product.launchPrice * 100 : bundle!.launchPrice * 100;
          const name = product ? product.name : bundle!.name;

          await sql()`
            INSERT INTO orders (
              user_id, stripe_session_id, status, total_cents, currency, customer_email
            ) VALUES (
              ${userId || null}, ${session.sessionId}, 'pending', ${amount}, 'usd',
              ${customerEmail || ''}
            )
          `;

          return new Response(
            JSON.stringify({
              url: session.url,
              sessionId: session.sessionId,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (err) {
          const message = (err as Error).message;
          console.error("Stripe checkout error:", message);

          // If Stripe isn't configured, give a clear message
          if (message.includes("STRIPE_SECRET_KEY")) {
            return new Response(
              JSON.stringify({
                error: "Payment system is not yet configured. Please try again shortly.",
              }),
              { status: 503, headers: { "Content-Type": "application/json" } },
            );
          }

          return new Response(
            JSON.stringify({ error: "Failed to create checkout session" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
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
