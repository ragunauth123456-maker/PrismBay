/**
 * Stripe integration — checkout sessions and webhook verification.
 * Uses STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET from environment.
 */

import Stripe from "stripe";
import { PRODUCTS, BUNDLES, getProductBySlug } from "~/data/products";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Connect Stripe in the dashboard to enable payments.",
    );
  }
  return new Stripe(key, { apiVersion: "2024-11-20.acacia" });
}

/**
 * Create a Stripe Checkout Session for a single product or bundle.
 */
export async function createProductCheckoutSession(params: {
  productSlug: string;
  customerEmail?: string;
  origin: string;
  couponCode?: string;
  extraMetadata?: Record<string, string>;
}): Promise<{ url: string | null; sessionId: string }> {
  const stripe = getStripe();

  // Look up in products data
  const product = getProductBySlug(params.productSlug);

  // Also check bundles
  let bundle = BUNDLES.find((b) => b.slug === params.productSlug);

  let name: string;
  let description: string;
  let unitAmount: number;

  if (product) {
    name = product.name;
    description = product.tagline;
    unitAmount = product.launchPrice * 100; // Stripe uses cents
  } else if (bundle) {
    name = bundle.name;
    description = bundle.description;
    unitAmount = bundle.launchPrice * 100;
  } else {
    throw new Error(`Product or bundle not found: ${params.productSlug}`);
  }

  // Validate coupon if provided
  if (params.couponCode) {
    try {
      await stripe.coupons.retrieve(params.couponCode);
    } catch {
      console.warn(`Stripe coupon not found: ${params.couponCode} — proceeding without discount`);
      params.couponCode = undefined;
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: params.customerEmail || undefined,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name,
            description,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    discounts: params.couponCode ? [{ coupon: params.couponCode }] : undefined,
    metadata: {
      product_slug: params.productSlug,
      ...(params.extraMetadata || {}),
    },
    success_url: `${params.origin}/account?checkout=success`,
    cancel_url: `${params.origin}/products/${params.productSlug}`,
  });

  return {
    url: session.url,
    sessionId: session.id,
  };
}

/**
 * Verify a Stripe webhook signature.
 * Returns the parsed event, or null if verification fails.
 */
export async function verifyStripeWebhook(
  body: string,
  signature: string,
): Promise<Stripe.Event | null> {
  try {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set — cannot verify webhook.");
      return null;
    }
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("Webhook signature verification failed:", (err as Error).message);
    return null;
  }
}

export { getStripe };
