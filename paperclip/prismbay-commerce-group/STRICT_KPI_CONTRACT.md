# PrismBay Commerce Group — Strict KPI Contract

## Non-negotiable rule

Every Paperclip company, backend swarm worker and parent controller is measured against explicit KPIs tied to commercial progress, evidence quality, reliability or verified revenue. Activity, token usage, generated documents, GitHub commits, page views from workers, test orders and internal task volume are not success by themselves.

The machine-readable source of truth is `config/strict-kpis.json`.

## Score bands

- Green: 90–100
- Yellow: 75–89
- Red: 50–74
- Critical: 0–49

Missing evidence receives zero credit. Unknown is not a pass. An integrity breach forces Critical regardless of other activity.

## Consequences

- Two consecutive Yellow cycles: tighten scope and raise priority.
- Two consecutive Red cycles: launch an independent recovery route and rewrite the assignment.
- One Critical cycle: stop the weak route, preserve evidence and replace the strategy.
- Three consecutive Red cycles: restructure the worker/company mandate.
- Owner escalation is reserved for genuine owner-only or platform-only actions; independent work must continue in parallel.

## Commercial integrity hard fails

The following cannot be compensated for by a high activity score:

- fabricated sales, traffic, reviews, scarcity, stock, freight, rankings or conversion data;
- counting test orders as sales;
- releasing an unverified product through checkout or promotion;
- unauthorized paid spend, supplier ordering, bulk outreach or external publishing;
- unsupported product claims or rights-unsafe creative;
- bypassing account, KYC, payment, security or marketplace controls.

## Paperclip company accountability

The ten companies are scored every parent-control cycle from available evidence. The scorecard is retained as `growth-reports/strict-kpi-scorecard.json` and included in the Commerce Group artifact.

Each company has four weighted role KPIs totaling 100 points. A company cannot earn Green solely by remaining active. Where a metric is not yet instrumented, that missing evidence earns zero until the company or Revenue Analytics closes the instrumentation gap.

## Backend swarm accountability

The six live PrismBay Clean backend workers persist their own per-run KPI state inside AppDeploy. Each run records:

- distinct evidence inspections;
- actionable output count;
- KPI score and band;
- consecutive misses;
- intervention requirement;
- role-rewrite requirement.

Minimum evidence/action floors are role-specific. The backend worker prompt is given its KPI floor every cycle.

Two consecutive runs below 75 trigger intervention. Three consecutive runs below 75 require a role/assignment rewrite. AI-provider rate-limit cooldowns do not count as worker-performance misses; ordinary worker failures do.

## Parent controller accountability

The parent controller is explicitly measured on verified sales, active-company coverage, strategy diversification, blocker ownership, fallback coverage and integrity. Until a verified sale exists, a high activity level cannot produce a Green parent score by itself.

## CEO principle

The purpose of the KPI system is not to maximize activity. It is to expose weak execution quickly, force evidence, redirect underperforming routes and keep the organization focused on the shortest legitimate path to verified profitable sales.
