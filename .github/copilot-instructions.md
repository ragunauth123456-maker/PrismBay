# PrismBay GitHub Agent Instructions

PrismBay Clean / TikTok commerce is the first growth priority until native TikTok Shop is active and verified external revenue exists.

## Operating rules
- Coordinate with the existing Portfolio Sales & Fulfillment controller; do not duplicate fulfillment or customer-order actions.
- Use zero-cost methods by default. Do not provision paid services or incur spend without explicit approval.
- Never fabricate views, sales, testimonials, scarcity, rankings, creator endorsements, product specifications, or supplier facts.
- Internal/test traffic is not demand and must never be reported as revenue.
- Use supplier-authorized media or original non-deceptive generated assets only.
- No fake IDs, nominee identities, account rentals, region spoofing, deceptive engagement, or spam.
- Do not expose tokens, credentials, environment values, customer data, or private correspondence.

## Worker roles
Every growth run should produce a concrete result from one or more of:
Trend Scout, Hook/Creative Writer, Storefront CRO Auditor, Creator/Partner Scout, Publisher, Analytics Reviewer, Offer Optimizer, GitHub Support Scout.

## Current commerce scope
Current Top 10:
1. Cordless Pressure Washer
2. Cordless Handheld Vacuum
3. 5-in-1 Electric Spin Scrubber
4. Mattress Vacuum
5. Portable Garment Steamer
6. Portable Home Caddy
7. Reusable Pet Hair Remover
8. Self-Squeeze Mini Mop
9. 3-in-1 Crevice Cleaning Brush
10. Sink Drain Catcher 2-Pack

Active storefront: https://prismbay-clean-49izhg.v2.appdeploy.ai/tiktok/
Desired custom storefront route: https://shop.prismbayai.com/tiktok
Main site: https://www.prismbayai.com

Run a role with:
`node scripts/organic-growth-agent.mjs "Storefront CRO Auditor"`

Run the full local/K1 swarm with:
`powershell -ExecutionPolicy Bypass -File scripts/run-growth-swarm.ps1`

Treat live publication, creator replies, checkout activity, verified Stripe sales, and native TikTok Shop progress as measurable outcomes. Do not infer outcomes from generated artifacts alone.

## Viral candidate pipeline
- Run `node scripts/viral-product-engine.mjs` to re-rank live approved products.
- Run `node scripts/viral-candidate-engine.mjs` to refresh new product candidates.
- `public/viral-candidates.json` is the auditable discovery feed. `growth-reports/viral-promotion-queue.json` is the commercial staging queue.
- Prefer practical home, cleaning and organization products with clear short-video demonstrations.
- A candidate must not become a live offer from attention data alone.
- Supplier promotion requires an authenticated CJ route, on-sale status, verified US inventory, and product checks.
- Freight validation must occur before a new checkout price is treated as ready.
- Use the official CJMCP integration when available for supplier search, SKU details, freight, logistics timing and order creation.
- Never publish supplier media unless its usage is authorized for the selling account.
- Keep weak or unverified candidates in research status and never present them as products already sold by PrismBay.
