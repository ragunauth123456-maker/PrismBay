# PackZenoRevenueWarRoom: AGM laptop to GitHub cloud handoff

Status: Cloud candidate implemented; exact migration BLOCKED pending task-definition audit. Do not disable the AGM task based on this candidate.

## Findings

- AGMADMINLPT18 showed Windows task `\PackZenoRevenueWarRoom` as `Ready`. Its action launches a CMD file within the local user's `PackZeno-AgentOS` directory. The screenshot shows a successful Scheduler return code (`0`), with runs at 15:30 and 16:30 on 27 Sep 2026, suggesting hourly repetition. The exact command-file contents, trigger repetition property, dependencies and commercial side effects remain unknown.
- The visible process check found no process matching n8n, Tailscale, Runner.Listener or Runner.Worker. A `Get-Service Tailscale` check returned no result, suggesting there is no local service under that name. Other executables and registrations have not been exhaustively checked.
- Existing PrismBay workflows already handle scheduled cloud growth, supplier research, candidate discovery, and draft media. Do not duplicate their commercial side effects.
- Neither connected GitHub repository contains the exact PackZenoRevenueWarRoom implementation in its default-branch file inventory.
- A read-only public-data candidate cannot replace local AgentOS functionality or private data flows without the original source and approved data handling.

## Candidate implemented in this branch

- `scripts/packzeno-warroom-cloud.mjs` builds an audited public PrismBay catalog, supplier, worker-board and last-recorded storefront-health snapshot. No live revenue is inferred.
- `scripts/packzeno-warroom-cloud.test.mjs` protects against stale/missing data, invented sales, secret leakage and premature task-retirement claims.
- `.github/workflows/packzeno-warroom-cloud.yml` uses GitHub-hosted Ubuntu and read-only GitHub permissions, runs on this migration branch or manual dispatch, and retains a short-lived report artifact.
- A provisional cloud schedule of `30 * * * *` UTC is staged to mirror the apparent hourly `:30` local cadence. GitHub scheduled workflows run only from the default branch: this schedule is **not active** on the migration draft branch. Confirm the task's `Repetition.Interval` before merger. No K1 or AGM PC access, secrets, outbound mail, orders, payment processing or auto-publishing.

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

Next, have an authorized user or IT representative **locally inspect**, without uploading the original file:

```powershell
$t = Get-ScheduledTask -TaskName 'PackZenoRevenueWarRoom'
$t.Triggers | Select-Object -ExpandProperty Repetition | Format-List Interval,Duration,StopAtDurationEnd
$folder = Join-Path $env:USERPROFILE 'PackZeno-AgentOS'
$cmd = Join-Path $folder 'run-war-room.cmd'
if (Test-Path -LiteralPath $cmd) { Get-Content -LiteralPath $cmd }
Get-ChildItem -LiteralPath $folder -File | Select-Object Name,Length
```

Review CMD output on the laptop and redact all secret values, hostnames, paths and employer references **before** sending a small sanitized copy. A local FreeLLMAPI endpoint and six historical local AgentOS agents were described in earlier setup notes. Do not assume that local model/service or its environment key exists in cloud or move a company credential into personal GitHub. Collect an approved personal-source manifest or sanitized source before implementing full parity.

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
