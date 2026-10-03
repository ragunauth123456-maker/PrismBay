# PrismBay Clean Backend Swarm — 24x7 Operating Architecture

## Purpose

The PrismBay Clean storefront backend now operates a persistent scheduled AI swarm through the live AppDeploy backend. GitHub/Paperclip remains the external code-control, watchdog and recovery plane.

This is not fake traffic automation. The swarm works on the commercial system itself: storefront health, product merchandising, SEO/CRO opportunities, truthful offer and creative preparation, analytics/experiment design, and commerce control.

## Live backend

App: `prismbay-clean-49izhg`

Public storefront: `https://prismbay-clean-49izhg.v2.appdeploy.ai/`

Sanitized backend swarm status: `https://prismbay-clean-49izhg.v2.appdeploy.ai/api/swarm-status`

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

## GitHub/Paperclip watchdog

GitHub Actions polls the sanitized status endpoint every ten minutes. The watchdog validates:

- the backend is reachable;
- exactly six workers remain configured;
- safety boundaries remain closed;
- persisted swarm state is not stale after execution has begun;
- the backend continues exposing a controller focus and worker run state.

This allows Paperclip to distinguish a healthy backend swarm from a silent failure.

## Commercial principle

The swarm is a continuous operating layer, not a sales claim. A backend cycle is not traffic, a customer, a purchase, revenue or profit. Verified sales remain governed by the existing first-sale evidence standard.
