/* ─── Stripe Payment Links (canonical slug → hosted checkout URL) ───
 * Hosted Stripe Payment Links bill directly into the business's connected Stripe
 * account — no STRIPE_SECRET_KEY, DB, or /api/checkout needed, which is why they
 * work while the server-side checkout is degraded (503).
 *
 * Source of truth: /home/team/shared/payments/payment-links.md (created 2026-08-21).
 * One entry per product/bundle slug — every buy button on the site reads its URL
 * from this map, so a product's checkout URL is defined in exactly one place.
 *
 * IMPORTANT: these are hosted one-time payment links that match what PrismBay sells
 * (blueprint/document packages). Do NOT point buy buttons at the pre-existing Stripe
 * catalog items (July-era hosted-SaaS/subscription listings) — those do not match
 * the canonical products and prices in src/data/products.ts.
 */
import { PRODUCTS, BUNDLES } from "./products";

export const PAYMENT_LINKS: Record<string, string> = {
  // ── Individual products ──
  "nexusos": "https://buy.stripe.com/aFaaEW27G30A31L0DT1kA0r", // NexusOS $449
  "nexus-one": "https://buy.stripe.com/fZu5kCbIg9oYcClaet1kA0v", // Nexus One $299
  "empire-ai": "https://buy.stripe.com/fZucN4fYwgRqbyhcmB1kA0s", // Empire AI $399
  "nexus-network": "https://buy.stripe.com/14AdR87s030A1XHdqF1kA0y", // Nexus Network $219
  "digital-humans": "https://buy.stripe.com/bJefZgcMk0Ss45PgCR1kA0t", // Digital Humans $379
  "genesis-platform": "https://buy.stripe.com/eVqbJ0bIg0SseKt1HX1kA0q", // Genesis Platform $499
  "guardianos": "https://buy.stripe.com/bJebJ09A8bx60TD4U91kA0u", // GuardianOS $369
  "spendshield-ai": "https://buy.stripe.com/5kQ28q6nWat2eKtdqF1kA0w", // SpendShield AI $249
  "evidenceflow-ai": "https://buy.stripe.com/3cIdR827G30A31L2M11kA0x", // EvidenceFlow AI $249
  // ── Bundles ──
  "complete-portfolio": "https://buy.stripe.com/eVq28q8w4cBaeKt2M11kA0n", // Complete AI Business Portfolio $2699
  "ai-business-operations": "https://buy.stripe.com/9B66oGeUseJigSB5Yd1kA0o", // AI Business Operations Bundle $999
  "trust-risk-compliance": "https://buy.stripe.com/6oUaEW27Gat259T0DT1kA0p", // Trust, Risk & Compliance Bundle $749
};

/** Return the hosted Stripe checkout URL for a product/bundle slug (if one exists). */
export function getPaymentLink(slug: string): string | undefined {
  return PAYMENT_LINKS[slug];
}

/* Build-time completeness guard: every canonical product/bundle slug must have a
 * payment link, so if a product is ever added to products.ts without a link here,
 * the build fails loudly instead of silently rendering a dead buy button. */
{
  const allSlugs = [
    ...PRODUCTS.map((p) => p.slug),
    ...BUNDLES.map((b) => b.slug),
  ];
  for (const slug of allSlugs) {
    if (!PAYMENT_LINKS[slug]) {
      throw new Error(`Missing Stripe payment link for slug: "${slug}"`);
    }
  }
}
