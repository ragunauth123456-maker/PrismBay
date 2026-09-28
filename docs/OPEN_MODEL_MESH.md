# Automated Open-Weight Model Mesh

PrismBay now has a zero-secret, cloud-only model mesh for five open-weight model families:

- Qwen: `qwen3:0.6b`
- Llama: `llama3.2:1b`
- Mistral: `ministral-3:3b`
- DeepSeek: `deepseek-r1:1.5b`
- Gemma: `gemma3:1b`

The models run locally inside a standard GitHub-hosted Ubuntu runner through Ollama. No model-provider API key is required and no user PC is involved.

## How the models connect

The models communicate through a shared blackboard rather than direct model-to-model network calls.

**Round 1 — independent answers.** Each family receives the original task without seeing peer answers. This preserves diversity.

**Round 2 — full peer review.** Each available model receives all first-round answers. Every model can challenge the other four, identify agreements, and revise its view.

**Round 3 — open-model chair.** The Mistral-family member receives the original task, the five first answers, and the five peer reviews. It produces a concise council consensus while preserving material disagreement.

The resulting council record is posted back to the owner-only `[OPEN-MESH]` GitHub issue. ChatGPT can read that record through the connected GitHub integration and combine it with ChatGPT's own reasoning and the separate genuine-Claude council when useful.

## Trigger

Only comments created by the repository owner on an issue whose title begins with `[OPEN-MESH]` can start the workflow.

A normal comment runs the full three-round mesh. Include `#smoke` in the comment to run a short connectivity test across all five families without the peer-review and chair rounds.

## Runtime and cost boundary

This repository is public and the workflow uses only a standard `ubuntu-latest` GitHub-hosted runner. GitHub's current billing documentation states that standard GitHub-hosted Actions runners are free for public repositories. The workflow does not provision a larger runner, cloud VM, paid inference API, or model subscription.

Ollama downloads the five model weights into the ephemeral runner for the duration of the job. No model data or prompt is uploaded as a GitHub artifact by this workflow. The issue comment and posted model response remain visible according to the repository's visibility, so do not submit confidential, personal, customer, credential, or unpublished employer information.

## Capability boundary

These are deliberately lightweight CPU-compatible variants selected so all five families can run on a standard GitHub runner. They provide model-family diversity and independent critique, not frontier-scale performance. They must not be represented as equivalent to the largest Qwen, Llama, Mistral, DeepSeek, or Gemma models.

Qwen, Llama, DeepSeek, Gemma, and Mistral have different licenses and are more accurately described collectively as open-weight models rather than assuming every family uses the same open-source license.

## Safety

The mesh is read-only with respect to repository contents. It cannot deploy, purchase, publish, send outreach, place supplier orders, operate Stripe, connect K1, connect AGMADMINLPT18, or access another user device. Existing `AGENTS.md` and `.github/copilot-instructions.md` rules remain authoritative.
