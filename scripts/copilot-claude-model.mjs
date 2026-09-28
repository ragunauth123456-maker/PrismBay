#!/usr/bin/env node
import fs from "node:fs";
import { CopilotClient } from "@github/copilot-sdk";

const preferred = [
  "claude-sonnet-5",
  "claude-opus-5",
  "claude-haiku-4.5",
  "claude-sonnet-4.6",
];

const client = new CopilotClient({ useLoggedInUser: false });

try {
  await client.start();
  const result = await client.rpc.models.list({});
  const models = Array.isArray(result?.models) ? result.models : [];
  const ids = models.map((m) => m?.id).filter((id) => typeof id === "string");
  const claude = ids.filter((id) => id.toLowerCase().includes("claude"));
  const selected = preferred.find((id) => ids.includes(id)) || claude[0] || "";

  if (!selected) {
    console.error("No Anthropic Claude model is available through this Copilot entitlement.");
    process.exitCode = 2;
  } else {
    console.log(`Selected Anthropic Claude model: ${selected}`);
    console.log(`Available Claude models: ${claude.join(", ") || selected}`);
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `model=${selected}\n`);
    }
  }
} finally {
  await client.stop().catch(() => {});
}
