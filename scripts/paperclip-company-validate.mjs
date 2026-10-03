import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = 'paperclip/prismbay-revenue-company';
const required = [
  'COMPANY.md', '.paperclip.yaml',
  'agents/revenue-ceo/AGENTS.md', 'agents/supplier-readiness/AGENTS.md',
  'agents/growth-lead/AGENTS.md', 'agents/storefront-cro/AGENTS.md',
  'agents/creator-partnerships/AGENTS.md', 'agents/analytics/AGENTS.md',
  'agents/cloud-ops/AGENTS.md', 'projects/first-verified-sale/PROJECT.md',
];

for (const file of required) {
  const text = await fs.readFile(path.join(ROOT, file), 'utf8');
  if (!text.trim()) throw new Error(`Empty Paperclip file: ${file}`);
  if (file.endsWith('.md') && !text.startsWith('---\n')) throw new Error(`Missing frontmatter: ${file}`);
}
const company = await fs.readFile(path.join(ROOT, 'COMPANY.md'), 'utf8');
if (!/schema:\s*agentcompanies\/v1/.test(company)) throw new Error('COMPANY.md schema mismatch');
const sidecar = await fs.readFile(path.join(ROOT, '.paperclip.yaml'), 'utf8');
if (!/schema:\s*["']paperclip\/v1["']/.test(sidecar)) throw new Error('.paperclip.yaml schema mismatch');
if (!/America\/Guyana/.test(sidecar)) throw new Error('Expected Guyana timezone');

const tasksRoot = path.join(ROOT, 'projects/first-verified-sale/tasks');
const taskDirs = (await fs.readdir(tasksRoot, { withFileTypes: true })).filter(entry => entry.isDirectory());
let starterTasks = 0;
for (const entry of taskDirs) {
  const taskFile = path.join(tasksRoot, entry.name, 'TASK.md');
  const text = await fs.readFile(taskFile, 'utf8');
  if (!text.startsWith('---\n')) throw new Error(`Missing frontmatter: ${path.relative(ROOT, taskFile)}`);
  starterTasks += 1;
}
if (starterTasks < 6) throw new Error('Revenue project needs at least six starter tasks');
console.log(JSON.stringify({valid:true, root:ROOT, requiredFiles:required.length, starterTasks}));
