# PackZenoRevenueWarRoom: AGM laptop to GitHub cloud handoff

Status: Cloud candidate implemented; exact migration BLOCKED pending task-definition audit. Do not disable the AGM task based on this candidate.

## Findings

- AGMADMINLPT18 showed Windows task `\PackZenoRevenueWarRoom` as `Ready`. Its exact action and cadence are still unknown.
- The visible process check found no process matching n8n, Tailscale, Runner.Listener or Runner.Worker. Other executables and registrations have not been exhaustively checked.
- Existing PrismBay workflows already handle scheduled cloud growth, supplier research, candidate discovery, and draft media. Do not duplicate their commercial side effects.
- Neither connected GitHub repository contains the exact PackZenoRevenueWarRoom implementation in its default-branch file inventory.
- A read-only public-data candidate cannot replace local AgentOS functionality or private data flows without the original source and approved data handling.

## Candidate implemented in this branch

- `scripts/packzeno-warroom-cloud.mjs` builds an audited public PrismBay catalog, supplier, worker-board and last-recorded storefront-health snapshot. No live revenue is inferred.
- `scripts/packzeno-warroom-cloud.test.mjs` protects against stale/missing data, invented sales, secret leakage and premature task-retirement claims.
- `.github/workflows/packzeno-warroom-cloud.yml` uses GitHub-hosted Ubuntu and read-only GitHub permissions, runs on this migration branch or manual dispatch, and retains a short-lived report artifact.
- No schedule is enabled because the exact Windows task trigger is not yet known. No K1 or AGM PC access, secrets, outbound mail, orders, payment processing or auto-publishing.

## Read-only task inventory for authorized AGM laptop user or IT

Run the following locally in PowerShell. Redact sensitive values before sharing anything. Do not upload full task XML, passwords, customer data, employer documents or private source to personal GitHub.

```powershell
$t = Get-ScheduledTask -TaskName 'PackZenoRevenueWarRoom'
$t | Select-Object TaskName,TaskPath,State
$t.Actions | Select-Object Execute,Arguments,WorkingDirectory | Format-List
$t.Triggers | Select-Object Enabled,StartBoundary,EndBoundary,DaysInterval,WeeksInterval,DaysOfWeek,Repetition | Format-List
Get-ScheduledTaskInfo -TaskName 'PackZenoRevenueWarRoom' | Select-Object LastRunTime,LastTaskResult,NextRunTime
```

Redact tokens, internal URLs, company paths, customer records and usernames. Share only the personal automation script name, sanitized action details and cadence. Employer IT should check the task's ownership and data-transfer policy.

## Acceptance gates before local disablement

1. Inspect sanitized executable/script, arguments, working directory, trigger, source and dependencies. Verify whether this is an employer-owned task or personal automation.
2. Compare exact behavior against the existing GitHub cloud jobs. Reuse workers instead of duplicating supplier, checkout, fulfillment, or publication actions.
3. Migrate only approved personal logic to GitHub cloud with least-privilege secrets if needed. No employer-controlled data or credentials in personal GitHub.
4. Run offline tests and actual cloud executions, inspect artifacts and compare expected sanitized outputs, error handling and scheduling.
5. Only after completed parity and any required employer-IT approval, disable the AGM task locally and verify:

```powershell
Disable-ScheduledTask -TaskName 'PackZenoRevenueWarRoom'
Get-ScheduledTask -TaskName 'PackZenoRevenueWarRoom' | Select-Object TaskName,State
```

6. Recheck after reboot. Cloud candidate success alone is NOT proof the AGM local workflow is redundant.
