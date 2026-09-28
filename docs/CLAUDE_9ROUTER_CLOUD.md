# Claude Code + 9Router: free-provider, cloud-only setup

Status: repository integration prepared. No cloud VM, gateway account, provider login, secret or live LLM request has been provisioned or verified by this change. The existing GitHub Actions workers continue unchanged.

## Architecture and cost boundary

9Router is an independently maintained third-party proxy. Its software is free. Upstream providers set their own quotas and prices; there is no guarantee of unlimited free Claude-model access. Anthropic does not endorse or audit third-party gateways and does not support non-Claude routing through gateways. Review the provider's current terms before authorizing access.

An approved persistent cloud VM is suitable for 9Router + Claude Code. GitHub-hosted Actions runners are temporary; running 9Router inside a job does not provide a persistent agent. This change deliberately avoids K1, AGM devices, self-hosted runners, public endpoints, unattended LLM requests, cloud provisioning and paid APIs.

## One-time setup on your approved cloud Linux VM

1. Install Node.js 22 or newer and npm. Verify `node --version` and `npm --version`.
2. Install 9Router from the independently maintained project: `npm install -g 9router`. Review `https://github.com/decolua/9router` before running third-party code.
3. Start it privately: `9router --no-browser`. Keep port 20128 on the local host only. If using a cloud dashboard, access it through an authenticated private tunnel, not a publicly exposed dashboard.
4. Open `http://127.0.0.1:20128/dashboard` through your private tunnel. Create the owner account if prompted. Under Providers, connect OpenCode Free, or another free provider whose usage terms you have reviewed. In model routing, restrict the endpoint and fallback to authorized free models only; do not connect paid subscriptions or provider keys without approval. Enable RTK Token Saver only after comparing a few outputs for correctness.
5. Create/copy the 9Router endpoint API key from the private dashboard. Never paste it into an issue, PR, repository file, shell history, chat message, or workflow logs.
6. Install official Claude Code on the same cloud host: `curl -fsSL https://claude.ai/install.sh | bash`. Check `claude --version` and `claude doctor`. Use the official installation guide at `https://code.claude.com/docs/en/setup`.
7. In the VM session, supply the endpoint key through your approved secrets manager or an interactive hidden prompt: `read -rs NINE_ROUTER_API_KEY; export NINE_ROUTER_API_KEY; echo`. Paste the key only into the hidden terminal prompt. Alternatively use an existing private cloud secrets manager. Set `NINE_ROUTER_BASE_URL=https://YOUR-PRIVATE-HTTPS-GATEWAY/v1` only if 9Router runs on a different trusted host. For the same host, omit the variable.
8. In the checked-out PrismBay repository, run `bash scripts/claude-9router.sh --models`. Select a listed free-provider model after verifying the dashboard configuration, then `export NINE_ROUTER_MODEL='MODEL_ID_FROM_THE_LIST'`.
9. Run `bash scripts/claude-9router.sh --check` for health, authentication and model listing. To explicitly start Claude Code through your selected free model, run `bash scripts/claude-9router.sh --run` or `bash scripts/claude-9router.sh --run --print 'Reply OK'`. The latter sends a live request to the configured provider.
10. If Claude Code requests login despite the gateway token, inspect the official gateway setup and provider compatibility. Avoid writing tokens to shared project settings.

## GitHub Actions and optional validation

The repository contains `scripts/claude-9router.test.sh`, an offline test using mocked router and Claude executables. Run `bash scripts/claude-9router.test.sh` before changes to the wrapper. The test does not install or contact a provider and does not incur model charges.

For a future one-off hosted Action, store the gateway address as an Actions variable and its credential as an Actions secret, then review the exact workflow before enabling a live model request. Do not use a local-only VM URL from the hosted runner, and do not deploy an unauthenticated public proxy. Leave the scheduled deterministic PrismBay workflows as-is.

## Privacy and failure handling

Treat all prompts submitted through 9Router as disclosed to the configured external model provider. Never submit unpublished AGM material, confidential customer data or private tokens. The wrapper accepts localhost HTTP or remote HTTPS endpoints, clears an unrelated Anthropic API key for the subprocess, verifies the advertised model ID and prints no credential. A green offline test is not proof of a working provider login or a free-tier entitlement.

Sources: `https://github.com/decolua/9router`, `https://github.com/decolua/9router/blob/master/gitbook/content/en/integration/claude-code.md`, `https://code.claude.com/docs/en/llm-gateway`, `https://code.claude.com/docs/en/setup`.
