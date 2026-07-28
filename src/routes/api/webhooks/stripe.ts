/**
 * POST /api/webhooks/stripe
 * Receives Stripe webhook events for order fulfillment.
 */

import { createFileRoute } from "@tanstack/react-router";
import { verifyStripeWebhook } from "~/lib/stripe";
import { sql } from "~/db";

export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          return new Response(
            JSON.stringify({ error: "Missing stripe-signature header" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const body = await request.text();

        const event = await verifyStripeWebhook(body, signature);
        if (!event) {
          return new Response(
            JSON.stringify({ error: "Webhook signature verification failed" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        try {
          switch (event.type) {
            case "checkout.session.completed": {
              await handleCheckoutCompleted(event);
              break;
            }
            case "checkout.session.expired": {
              await handleCheckoutExpired(event);
              break;
            }
            default:
              // Ignore other event types
              break;
          }

          return new Response(
            JSON.stringify({ received: true }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        } catch (err) {
          console.error("Webhook handler error:", (err as Error).message);
          return new Response(
            JSON.stringify({ error: "Webhook processing failed" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});

async function handleCheckoutCompleted(event: any) {
  const session = event.data.object;
  const sessionId = session.id;
  const customerEmail = session.customer_details?.email || session.customer_email || "";
  const customerId = session.customer; // Stripe customer ID
  const metadata = session.metadata || {};
  const productSlug = metadata.product_slug || "";
  const amountTotal = session.amount_total || 0;
  const paymentIntentId = session.payment_intent || null;

  console.log(`Checkout completed: ${sessionId} — ${customerEmail} — ${productSlug}`);

  // Find the order by stripe_session_id
  const orderRows = await sql()`
    SELECT id, user_id FROM orders WHERE stripe_session_id = ${sessionId}
  `;

  if (orderRows.length === 0) {
    console.error(`Order not found for session: ${sessionId}`);
    return;
  }

  const orderId = (orderRows[0] as any).id;
  const userId = (orderRows[0] as any).user_id;

  // Mark order as paid
  await sql()`
    UPDATE orders
    SET status = 'paid',
        stripe_payment_intent_id = ${paymentIntentId},
        customer_email = ${customerEmail},
        updated_at = now()
    WHERE id = ${orderId}
  `;

  // Find the product in DB (or use the slug)
  let productId: string | null = null;
  let productTitle = productSlug;

  if (productSlug) {
    const productRows = await sql()`
      SELECT id, title FROM products WHERE slug = ${productSlug}
    `;
    if (productRows.length > 0) {
      productId = (productRows[0] as any).id;
      productTitle = (productRows[0] as any).title;
    }
  }

  // Create order item
  const itemRows = await sql()`
    INSERT INTO order_items (order_id, product_id, product_title, price_cents, quantity)
    VALUES (${orderId}, ${productId || null}, ${productTitle}, ${amountTotal}, 1)
    RETURNING id
  `;
  const orderItemId = (itemRows[0] as any).id;

  // Generate download token
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

  await sql()`
    INSERT INTO download_tokens (order_item_id, token, max_downloads, expires_at)
    VALUES (${orderItemId}, ${token}, 10, ${expiresAt.toISOString()})
  `;

  console.log(`  ✓ Order ${orderId} fulfilled. Download token: ${token}`);

  // If the user is logged in, update their Stripe customer ID
  if (userId && customerId) {
    await sql()`
      UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${userId}
    `;
  }

  // TODO: Send fulfillment email (Phase 10 — email service)
  console.log(`  ℹ Fulfillment email for ${customerEmail} — not yet implemented`);
}

async function handleCheckoutExpired(event: any) {
  const session = event.data.object;
  const sessionId = session.id;

  console.log(`Checkout expired: ${sessionId}`);

  // Mark order as expired
  await sql()`
    UPDATE orders
    SET status = 'expired', updated_at = now()
    WHERE stripe_session_id = ${sessionId} AND status = 'pending'
  `;
}
