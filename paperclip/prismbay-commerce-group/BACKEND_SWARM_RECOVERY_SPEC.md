# PrismBay Clean Backend Swarm Recovery Upgrade

This is the required next runtime revision for the live PrismBay Clean AppDeploy backend swarm. The existing runtime already persists per-worker KPI score, KPI band, consecutive misses, intervention status and role-rewrite status.

## Required controller behavior

On every Commerce Controller cycle:

1. Rank the six backend workers by KPI band, score and consecutive misses.
2. Identify the weakest non-cooldown worker.
3. If any worker is Critical or Red, make recovery of that worker one of the controller's highest-priority internal actions while preserving the primary sales blocker and parallel product work.
4. Require at least one cross-support action that another worker can execute to create missing evidence or remove the weakness.
5. If `interventionRequired=true`, the next controller focus must name the worker and its evidence/output deficit.
6. If `roleRewriteRequired=true`, rewrite that worker's next assignment around the missing evidence rather than repeating the same failed task.
7. Cooldown caused by model/provider rate limiting must not be treated as a commercial KPI failure.

## Worker context expansion

Each worker must receive, for all six workers:

- `kpiScore`
- `kpiBand`
- `consecutiveMisses`
- `interventionRequired`
- `roleRewriteRequired`
- latest action titles
- latest evidence inspection count

Workers should use that context to avoid duplicate work and to support the weakest part of the commerce system where their own role can legitimately help.

## Safety boundaries

This recovery logic does not authorize fake traffic, paid spend, supplier ordering, bulk unsolicited outreach, automatic external publishing, live price changes, fake reviews, fake scarcity, fabricated sales or bypassing platform/payment/identity/security controls.

## Deployment state

The source-level design is staged in GitHub because the AppDeploy provider reported its daily deployment-credit ceiling on 2026-10-03. The currently deployed backend remains operational; this file must not be interpreted as evidence that the cross-support revision itself has already been deployed.
