# ChatGPT + Claude AI Council

This project supports a two-model workflow in which ChatGPT coordinates the work and Claude Code acts as an independent reviewer through the GitHub-hosted 9Router/OpenCode Free route.

## Operating model

1. The owner gives ChatGPT a task in the normal ChatGPT conversation.
2. ChatGPT performs its own analysis first.
3. For work that benefits from an independent second model, ChatGPT posts a focused task to the dedicated `[AI-COUNCIL]` GitHub issue.
4. GitHub Actions starts a fresh cloud runner, launches 9Router privately, selects an approved OpenCode free model, runs Claude Code headlessly, and posts Claude's answer back to the issue.
5. ChatGPT reads Claude's response, compares it with its own analysis, resolves disagreements using evidence, and returns the combined result to the owner.
6. For complex or consequential repository changes, ChatGPT may send the combined draft back to Claude for a final red-team or verification pass before implementation.

## Council roles

ChatGPT is the coordinator, synthesizer, and user-facing decision support layer. It owns task decomposition, evidence gathering, comparison of model outputs, and the final response.

Claude is the independent second opinion. It should inspect evidence, challenge weak assumptions, identify missed risks, and propose a concrete next action. It should not simply agree with ChatGPT.

GitHub is the shared execution and audit layer. It records the task, the Claude response, workflow runs, code changes, tests, and pull requests.

## Recommended council modes

Use an ordinary natural-language comment in the council issue. ChatGPT should state the desired role explicitly when useful, such as:

- Independent solution: solve the task without relying on ChatGPT's answer.
- Critique: attack weaknesses in a proposed plan or draft.
- Red team: search for failure modes, security risks, unsupported assumptions, or missing evidence.
- Verification: test factual or technical claims against repository evidence.
- Implementation review: inspect a proposed patch, tests, and rollback plan.
- Publication audit: check a document for gaps, unsupported claims, consistency, and scrutiny resistance.

The workflow adds a council instruction automatically so Claude returns: Independent answer, Evidence, Risks or disagreements, and Recommended next action.

## Safety and cost boundaries

The council remains cloud-only. It must not connect K1, AGMADMINLPT18, another user computer, self-hosted runners, or remote desktop. It must not expose credentials or private data. Paid models, purchases, supplier orders, Stripe actions, external outreach, public deployment, and automatic publishing still require separate owner authorization. Existing `AGENTS.md` and `CLAUDE.md` rules remain authoritative.

9Router and OpenCode Free are third-party components. Free-provider availability and quotas may change. The deterministic PrismBay workflows must continue to work without the council.

## What "combined" means

The models are not merged into one neural network. The practical combination is an orchestrated model council: one model reasons, the other independently challenges or verifies it, and ChatGPT synthesizes the evidence into one result for the owner. This preserves disagreement instead of hiding it and creates an auditable record in GitHub.
