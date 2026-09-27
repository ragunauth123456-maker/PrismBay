# PrismBay Agency Agents integration

This is a lightweight, project-specific adaptation of the MIT-licensed [Agency Agents](https://github.com/msitarzewski/agency-agents) role approach. It does not install upstream executables, duplicate cloud agents, introduce a paid model, reconnect PCs or change existing scheduled workflows.

## Available instructions
- `AGENTS.md`: shared Codex-compatible repository guidance.
- `.github/agents/prismbay-cloud-engineer.agent.md`: selectable GitHub Copilot cloud specialist.
- `.github/agents/prismbay-supplier-auditor.agent.md`: selectable, read-only CJ evidence auditor.
- `.github/agents/prismbay-growth-analyst.agent.md`: selectable, read-only growth analyst.
- `.github/copilot-instructions.md`: existing PrismBay instructions, which remain authoritative.

## Existing execution infrastructure
- `free-cloud-ops.yml`: runs existing public-data growth worker scripts on GitHub-hosted Linux runners every six hours.
- `cloud-agent-migration.yml`: runs candidate discovery and video draft generation on GitHub-hosted Linux runners.
- `cj-supplier-verification.yml`: read-only CJ product matching, stock and freight checks when the configured secret and API are available.

Existing scripted workers are NOT LLM-driven agents. The new profiles become active only when selected through a supported Copilot/Codex session or an expressly authorized model-enabled automation. GitHub Copilot access and limits are account-dependent.

## Acceptance checks after merge
1. Confirm Copilot presents each named agent in a supported interface, or verify Codex reads AGENTS.md.
2. Give the Cloud Engineer a read-only audit of one recent Actions run and compare its observations with real logs.
3. Give the Supplier Auditor one real CJ verification artifact and confirm missing freight, stock or media-rights evidence remains blocked.
4. Give the Growth Analyst one dated report and check its sales claims against payment evidence.
5. For code changes, use a separate PR with the corresponding existing regression checks.

No external email sends, supplier orders, payments, direct posting, production deployments or user PC access are authorized by these instructions. If a model runtime is unavailable, existing deterministic schedules remain useful on their own.
