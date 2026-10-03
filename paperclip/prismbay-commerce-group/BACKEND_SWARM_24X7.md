# PrismBay Clean Backend Swarm — 24x7 Operating Architecture

## Purpose

The PrismBay Clean storefront backend now operates a persistent scheduled AI swarm through the live AppDeploy backend. GitHub/Paperclip remains the external code-control, configuration-watchdog and recovery plane.

This is not fake traffic automation. The swarm works on the commercial system itself: storefront health, product merchandising, SEO/CRO opportunities, truthful offer and creative preparation, analytics/experiment design, and commerce control.

## Live backend

App: `prismbay-clean-49izhg`

Public storefront: `https://prismbay-clean-49izhg.v2.appdeploy.ai/`

The backend also exposes an internal swarm-status route for the storefront runtime. Because the static Next.js export serves public unknown paths through the frontend fallback, GitHub does not treat the public `/api/*` URL as authoritative runtime evidence.

## Six resident scheduled workers

Each worker runs once per hour, staggered so the backend receives a worker cycle every ten minutes around the clock:

- `:00` Commerce Controller
- `:10` Product and Merchandising Scout
- `:20` Storefront Reliability Auditor
- `:30` SEO and Conversion Worker
- `:40` Offer and Creative Worker
- `:50` Analytics and Experiment Worker

The workers use bounded backend LLM tool loops and persist shared state in the application database. One worker failure does not stop the others. AI quota/rate-limit responses produce a persisted cooldown instead of a retry storm.

## Permitted work

Workers may inspect only whitelisted PrismBay Clean storefront paths and produce bounded internal action queues. They may identify broken pages, catalog/feed inconsistencies, SEO gaps, CRO friction, truthful offer/bundle ideas, original creative tasks, instrumentation gaps, experiments and the next commercial focus.

## Hard boundaries

The backend swarm must never:

- create fake traffic, clicks, reviews, scarcity, orders, stock or performance metrics;
- automatically purchase from suppliers;
- spend on ads or paid media;
- send bulk unsolicited outreach;
- publish externally without the existing authorization gates;
- change retail prices autonomously;
- weaken product identity, freight, fulfillment, checkout or evidence requirements.

## Runtime authority and GitHub/Paperclip watchdog

AppDeploy is the authoritative source for private cron execution status, next-run scheduling and failure counts for the six backend workers.

GitHub Actions runs a separate watchdog every ten minutes. It validates what GitHub can independently verify without inventing cross-platform visibility:

- the committed six-worker swarm contract;
- ten-minute staggered coverage across the hour;
- closed safety boundaries;
- public PrismBay Clean storefront health;
- product feed, merchant feed, sitemap and robots availability.

The watchdog explicitly does not claim that a public frontend request proves private AppDeploy cron execution. This keeps the monitoring evidence honest while still giving Paperclip an independent failure signal for configuration or storefront breakage.

## Commercial principle

The swarm is a continuous operating layer, not a sales claim. A backend cycle is not traffic, a customer, a purchase, revenue or profit. Verified sales remain governed by the existing first-sale evidence standard.
