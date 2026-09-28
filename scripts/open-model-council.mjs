#!/usr/bin/env node
import fs from "node:fs";
import fsp from "node:fs/promises";
import { spawnSync } from "node:child_process";

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const DEFAULT_MODELS = [
  { family: "Qwen", model: "qwen3:0.6b" },
  { family: "Llama", model: "llama3.2:1b" },
  { family: "Mistral", model: "ministral-3:3b" },
  { family: "DeepSeek", model: "deepseek-r1:1.5b" },
  { family: "Gemma", model: "gemma3:1b" },
];

function argValue(name) {
  const prefix = `${name}=`;
  const found = process.argv.slice(2).find((item) => item.startsWith(prefix));
  return found ? found.slice(prefix.length) : "";
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: options.capture ? "utf8" : undefined,
    env: options.env || process.env,
    cwd: options.cwd || process.cwd(),
    maxBuffer: 8 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const stderr = options.capture ? String(result.stderr || "").trim() : "";
    throw new Error(`${command} exited with ${result.status}${stderr ? `: ${stderr}` : ""}`);
  }
  return options.capture ? String(result.stdout || "") : "";
}

function stripHiddenReasoning(text) {
  return String(text || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<analysis>[\s\S]*?<\/analysis>/gi, "")
    .trim();
}

function compact(text, limit = 2800) {
  const clean = stripHiddenReasoning(text).replace(/\0/g, "");
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit)}\n[truncated]`;
}

async function ollamaReady() {
  try {
    const response = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: AbortSignal.timeout(2500),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForOllama() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await ollamaReady()) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("Ollama did not become reachable on localhost.");
}

function loadModelPlan() {
  const raw = process.env.OPEN_COUNCIL_MODELS_JSON;
  if (!raw) return DEFAULT_MODELS;
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length !== 5) {
    throw new Error("OPEN_COUNCIL_MODELS_JSON must define exactly five family/model entries.");
  }
  const required = new Set(["Qwen", "Llama", "Mistral", "DeepSeek", "Gemma"]);
  for (const item of parsed) {
    if (!required.has(item?.family) || typeof item?.model !== "string" || !item.model) {
      throw new Error("Invalid OPEN_COUNCIL_MODELS_JSON entry.");
    }
    required.delete(item.family);
  }
  if (required.size) throw new Error("OPEN_COUNCIL_MODELS_JSON is missing a required family.");
  return parsed;
}

async function pullModel(model) {
  console.log(`Pulling ${model} ...`);
  run("ollama", ["pull", model]);
}

async function chat(model, system, user, numPredict) {
  const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      think: false,
      keep_alive: "0",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      options: {
        temperature: 0.2,
        num_predict: numPredict,
        num_ctx: 8192,
      },
    }),
    signal: AbortSignal.timeout(8 * 60 * 1000),
  });
  if (!response.ok) {
    const detail = compact(await response.text(), 800);
    throw new Error(`${model} returned HTTP ${response.status}: ${detail}`);
  }
  const payload = await response.json();
  const content = stripHiddenReasoning(payload?.message?.content || "");
  if (!content) throw new Error(`${model} returned an empty response.`);
  return content;
}

function roundOneSystem(family) {
  return [
    `You are the ${family} member of a five-model independent AI council.`,
    "Solve the task independently before seeing any peer answer.",
    "Do not reveal hidden chain-of-thought. Give conclusions, evidence, assumptions, and risks only.",
    "Be concise. Do not claim to have verified facts or files you did not actually inspect.",
    "You have no authority to spend money, send messages, deploy, publish, or access private user devices.",
  ].join(" ");
}

function roundTwoSystem(family) {
  return [
    `You are the ${family} peer-reviewer in a five-model AI council.`,
    "You are now seeing all first-round answers.",
    "Compare them, challenge errors, identify useful agreements, and state what you would change in your own answer.",
    "Do not reveal hidden chain-of-thought. Return only concise findings and evidence.",
  ].join(" ");
}

function chairSystem() {
  return [
    "You are the Mistral-family chair of a five-model open-weight AI council.",
    "Synthesize the original task, all first-round answers, and all peer reviews.",
    "Preserve meaningful disagreement instead of forcing consensus.",
    "Do not reveal hidden chain-of-thought.",
    "Return four sections: Consensus, Important disagreements, Evidence or facts to verify, Recommended next action.",
  ].join(" ");
}

function makePeerPacket(roundOne) {
  return Object.entries(roundOne)
    .map(([family, value]) => `### ${family}\n${compact(value, 2200)}`)
    .join("\n\n");
}

function makeFullPacket(task, roundOne, roundTwo) {
  const first = Object.entries(roundOne)
    .map(([family, value]) => `### ${family} first answer\n${compact(value, 1800)}`)
    .join("\n\n");
  const reviews = Object.entries(roundTwo)
    .map(([family, value]) => `### ${family} peer review\n${compact(value, 1400)}`)
    .join("\n\n");
  return `ORIGINAL TASK:\n${compact(task, 5000)}\n\nFIRST ROUND:\n${first}\n\nPEER REVIEWS:\n${reviews}`;
}

async function main() {
  const promptFile = argValue("--prompt-file");
  const outputFile = argValue("--output-file");
  const smoke = process.argv.includes("--smoke");
  if (!promptFile) throw new Error("Pass --prompt-file=/path/to/task.txt");
  const task = (await fsp.readFile(promptFile, "utf8")).trim();
  if (!task) throw new Error("The council task is empty.");

  if (!run("which", ["ollama"], { capture: true }).trim()) {
    throw new Error("Ollama is not installed.");
  }
  await waitForOllama();

  const plan = loadModelPlan();
  const activePlan = smoke ? plan.slice(0, 2) : plan;
  const failures = {};
  const roundOne = {};
  const roundTwo = {};

  for (const item of activePlan) {
    try {
      await pullModel(item.model);
      roundOne[item.family] = await chat(
        item.model,
        roundOneSystem(item.family),
        task,
        smoke ? 120 : 320,
      );
      console.log(`Round 1 complete: ${item.family} (${item.model})`);
    } catch (error) {
      failures[item.family] = `Round 1 failed: ${error?.message || String(error)}`;
      console.error(`${item.family}: ${failures[item.family]}`);
    }
  }

  if (!smoke) {
    const peerPacket = makePeerPacket(roundOne);
    for (const item of plan) {
      if (!roundOne[item.family]) continue;
      try {
        roundTwo[item.family] = await chat(
          item.model,
          roundTwoSystem(item.family),
          `ORIGINAL TASK:\n${compact(task, 4000)}\n\nPEER FIRST-ROUND ANSWERS:\n${peerPacket}`,
          240,
        );
        console.log(`Peer review complete: ${item.family} (${item.model})`);
      } catch (error) {
        failures[item.family] = `${failures[item.family] ? `${failures[item.family]} | ` : ""}Peer review failed: ${error?.message || String(error)}`;
        console.error(`${item.family}: ${failures[item.family]}`);
      }
    }
  }

  let consensus = "";
  if (!smoke && roundOne.Mistral) {
    try {
      consensus = await chat(
        plan.find((item) => item.family === "Mistral").model,
        chairSystem(),
        makeFullPacket(task, roundOne, roundTwo),
        520,
      );
    } catch (error) {
      failures.Mistral = `${failures.Mistral ? `${failures.Mistral} | ` : ""}Chair synthesis failed: ${error?.message || String(error)}`;
    }
  }

  const completed = Object.keys(roundOne);
  const required = activePlan.map((item) => item.family);
  const allConnected = required.every((family) => roundOne[family]);
  const modelTable = activePlan
    .map((item) => `| ${item.family} | \`${item.model}\` | ${roundOne[item.family] ? "connected" : "failed"} |`)
    .join("\n");

  const sections = [
    "# Open-Weight Model Mesh",
    "",
    "This council uses a shared blackboard. Round 1 is independent. Round 2 lets every available member read all first-round responses and critique them. Mistral then chairs the open-model synthesis.",
    "",
    "| Family | Ollama model | Status |",
    "| --- | --- | --- |",
    modelTable,
    "",
  ];

  for (const item of activePlan) {
    if (roundOne[item.family]) {
      sections.push(`## ${item.family} first answer`, "", compact(roundOne[item.family], 5000), "");
    }
  }

  if (!smoke) {
    for (const item of activePlan) {
      if (roundTwo[item.family]) {
        sections.push(`## ${item.family} peer review`, "", compact(roundTwo[item.family], 4000), "");
      }
    }
    if (consensus) sections.push("## Open-model consensus", "", compact(consensus, 7000), "");
  }

  if (Object.keys(failures).length) {
    sections.push("## Connection notes", "");
    for (const [family, message] of Object.entries(failures)) {
      sections.push(`- ${family}: ${compact(message, 900)}`);
    }
    sections.push("");
  }

  sections.push(
    "## Runtime status",
    "",
    allConnected
      ? `All requested families completed the ${smoke ? "connectivity smoke test" : "first council round"}.`
      : `Completed: ${completed.join(", ") || "none"}. One or more requested families did not complete.`,
    "",
    "The local runner models are lightweight open-weight variants chosen for CPU-only GitHub-hosted execution. They are not equivalent in capability to the largest hosted variants from the same model families.",
    "",
  );

  const output = sections.join("\n");
  if (outputFile) {
    await fsp.writeFile(outputFile, output, { mode: 0o600 });
    console.log(`Council output written to ${outputFile}`);
  } else {
    process.stdout.write(output);
  }

  if (!allConnected) process.exitCode = 2;
}

main().catch((error) => {
  console.error(`ERROR: ${error?.message || String(error)}`);
  process.exit(1);
});
