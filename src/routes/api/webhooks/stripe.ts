/**
 * POST /api/webhooks/stripe
 * Receives Stripe webhook events for order fulfillment.
 */

import { createFileRoute } from "@tanstack/react-router";
import { verifyStripeWebhook, getStripe } from "~/lib/stripe";
import { sql } from "~/db";
import { sendEmailQuietly } from "~/lib/email";
import { BUNDLES } from "~/data/products";
import { isBundle, getBundleProductSlugs } from "~/lib/storage";
import {
  purchaseConfirmation,
  downloadAccess,
  getFirstName,
  formatCents,
  formatDate,
  getSiteUrl,
} from "~/lib/email-templates";

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

  // Determine if this is a bundle purchase
  const bundleMode = productSlug ? isBundle(productSlug) : false;

  // Collect the slugs we need to process
  let slugsToProcess: string[];

  if (bundleMode) {
    // Bundle: create order_item for each constituent product
    slugsToProcess = getBundleProductSlugs(productSlug);
    console.log(`  Bundle purchase: ${productSlug} → ${slugsToProcess.length} products`);
  } else {
    slugsToProcess = [productSlug];
  }

  const createdTokens: Array<{ token: string; productTitle: string; productSlug: string }> = [];

  for (const slug of slugsToProcess) {
    // Find the product in DB
    let productId: string | null = null;
    let productTitle = slug;

    const productRows = await sql()`
      SELECT id, title FROM products WHERE slug = ${slug}
    `;
    if (productRows.length > 0) {
      productId = (productRows[0] as any).id;
      productTitle = (productRows[0] as any).title;
    }

    // Create order item with product_slug
    const itemRows = await sql()`
      INSERT INTO order_items (order_id, product_id, product_slug, product_title, price_cents, quantity)
      VALUES (${orderId}, ${productId || null}, ${slug}, ${productTitle}, ${amountTotal}, 1)
      RETURNING id
    `;
    const orderItemId = (itemRows[0] as any).id;

    // Generate download token (24-hour expiry for emailed links)
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await sql()`
      INSERT INTO download_tokens (order_item_id, token, max_downloads, expires_at)
      VALUES (${orderItemId}, ${token}, 10, ${expiresAt.toISOString()})
    `;

    createdTokens.push({ token, productTitle, productSlug: slug });

    console.log(`  ✓ Order item created for "${productTitle}" (${slug}). Download token: ${token}`);
  }

  // If the user is logged in, update their Stripe customer ID
  if (userId && customerId) {
    await sql()`
      UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${userId}
    `;
  }

  // ── Send transactional emails ──────────────────────────────────────

  // Determine customer name from user record or fall back
  let customerName = "";
  if (userId) {
    const userRows = await sql()`SELECT name FROM users WHERE id = ${userId}`;
    if (userRows.length > 0) {
      customerName = (userRows[0] as any).name || "";
    }
  }

  const firstName = getFirstName(customerName);
  const siteUrl = getSiteUrl();
  const accountDownloadsUrl = `${siteUrl}/account`;
  const orderDate = formatDate(new Date().toISOString());

  // Get payment method details from Stripe
  let paymentMethodBrief = "card";
  try {
    if (paymentIntentId) {
      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const paymentMethod = paymentIntent.payment_method;
      if (typeof paymentMethod === "object" && paymentMethod && "card" in paymentMethod) {
        const card = (paymentMethod as any).card;
        if (card) {
          paymentMethodBrief = `${card.brand || "Card"} ending ${card.last4 || "****"}`;
        }
      }
    }
  } catch {
    // Fall back to "card" if Stripe lookup fails
  }

  // Build a display name for the purchase
  const purchaseName = bundleMode
    ? BUNDLES.find((b) => b.slug === productSlug)?.name || productSlug
    : createdTokens[0]?.productTitle || productSlug;

  // Template 1: Purchase confirmation
  const purchaseEmail = purchaseConfirmation({
    customerFirstName: firstName,
    orderId: orderId.slice(0, 8), // Use shortened ID for readability
    orderDate,
    productName: purchaseName,
    pricePaid: formatCents(amountTotal),
    paymentMethodBrief,
    accountDownloadsUrl,
  });

  await sendEmailQuietly({
    to: customerEmail,
    subject: purchaseEmail.subject,
    body: purchaseEmail.body,
  });

  // Template 2: Download access email(s)
  // For bundles, include all download links in one email
  if (createdTokens.length === 1) {
    // Single product — one download link
    const { token, productTitle: pt } = createdTokens[0];
    const downloadUrl = `${siteUrl}/api/downloads/${token}`;
    const downloadEmail = downloadAccess({
      customerFirstName: firstName,
      productName: pt,
      downloadUrl,
      tokenExpiryDuration: "24 hours",
      accountDownloadsUrl,
    });

    await sendEmailQuietly({
      to: customerEmail,
      subject: downloadEmail.subject,
      body: downloadEmail.body,
    });
  } else {
    // Bundle — build multi-product download email
    const downloadLinks = createdTokens
      .map(
        ({ token, productTitle: pt }) =>
          `• ${pt}: ${siteUrl}/api/downloads/${token}`,
      )
      .join("\n");

    const bundleDownloadEmail = downloadAccess({
      customerFirstName: firstName,
      productName: purchaseName,
      downloadUrl: `${siteUrl}/account`,
      tokenExpiryDuration: "24 hours",
      accountDownloadsUrl,
    });

    // Override the body to include all links
    const multiBody = bundleDownloadEmail.body.replace(
      /(download your .+ at:).+(\n)/,
      `$1\n${downloadLinks}$2`,
    );

    await sendEmailQuietly({
      to: customerEmail,
      subject: `Your ${purchaseName} downloads are ready`,
      body: multiBody,
    });
  }

  console.log(`  ✓ Emails sent to ${customerEmail}`);
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
