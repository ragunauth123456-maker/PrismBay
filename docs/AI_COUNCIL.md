# ChatGPT + Claude AI Council

This project supports two second-opinion routes behind one ChatGPT-led workflow.

The **genuine Claude route** uses Anthropic's official `anthropics/claude-code-action` and authenticates with either `CLAUDE_CODE_OAUTH_TOKEN` or `ANTHROPIC_API_KEY`. Outputs from this route may be attributed to Anthropic Claude.

The **free fallback route** uses Claude Code as a client harness through 9Router/OpenCode Free. Its model may not be an Anthropic Claude model, so outputs from that route must be described as a free-model second opinion rather than as Claude.

## Operating model

1. The owner gives ChatGPT a task in the normal ChatGPT conversation.
2. ChatGPT performs its own analysis first.
3. When an independent second opinion would materially improve the result, ChatGPT sends a focused challenge to the genuine Claude control issue.
4. GitHub Actions invokes Anthropic's official Claude Code Action using repository-held authentication. The workflow is read-only for repository contents and restricted to owner-triggered issue comments.
5. ChatGPT reads Claude's response, compares it with its own analysis, and resolves disagreements using evidence.
6. If genuine Claude authentication is unavailable, the existing free-model reviewer can still be used, but it is labeled accurately.
7. For consequential work, ChatGPT may request a second red-team pass before returning the final result.

## Council roles

**ChatGPT** is the coordinator, researcher, synthesizer, and user-facing layer. It decomposes tasks, gathers evidence, compares model outputs, and produces the final response.

**Anthropic Claude** is the independent reviewer when the genuine route is authenticated. It should challenge assumptions, identify missing evidence and risks, and propose alternative reasoning rather than simply agree.

**OpenCode Free via 9Router** is an optional third opinion or fallback. It is not treated as Anthropic Claude unless the advertised model is independently verified as an Anthropic model through an authorized provider route.

**GitHub** is the execution and audit layer. It records trigger comments, workflow runs, model responses, tests, and code changes.

## Recommended council modes

ChatGPT can ask the second model for an independent solution, critique, red-team review, verification pass, implementation review, or publication audit.

For genuine Claude, use the owner-only `[CLAUDE-GENUINE]` issue and include `@claude` in the request. The official Anthropic action handles the Claude response.

For the free fallback reviewer, use the existing `[AI-COUNCIL]` issue. That route remains useful for additional model diversity but must not be represented as genuine Claude.

## Safety and cost boundaries

The council remains cloud-only. It must not connect K1, AGMADMINLPT18, another user computer, self-hosted runners, or remote desktop. It must not expose credentials, customer data, unpublished employer material, or private correspondence to unapproved services.

The genuine Claude workflow grants repository contents read-only access and issue/pull-request comment permissions. It does not authorize deployment, purchases, supplier orders, Stripe actions, external outreach, social posting, or paid API spend beyond credentials the owner has explicitly provisioned.

Credentials must remain in GitHub Actions secrets. The workflow checks only whether an approved secret exists and never prints its value.

Existing `AGENTS.md` and `CLAUDE.md` rules remain authoritative.

## What "combined" means

The models are not merged into one neural network. The combination is an orchestrated council. ChatGPT reasons first, genuine Claude independently challenges or verifies the work, and ChatGPT synthesizes the evidence into one final result. A third free-model review can be added when useful. This keeps disagreement visible and auditable instead of hiding it.
