import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('scheduled creative worker produces useful drafts without unverified sales claims', () => {
  const folder = mkdtempSync(path.join(tmpdir(), 'prismbay-creative-'));
  try {
    const script = fileURLToPath(new URL('./organic-growth-agent.mjs', import.meta.url));
    const run = spawnSync(process.execPath, [script, 'Hook/Creative Writer'],
      { cwd:folder, encoding:'utf8', timeout:12000 });
    assert.equal(run.status, 0, run.stderr);
    const report = JSON.parse(readFileSync(path.join(folder,'growth-reports','hook-creative-writer.json'),'utf8'));
    assert.equal(report.result.draftOnly,true);
    assert.equal(report.result.publicationAuthorized,false);
    assert.equal(report.result.cta,null);
    assert.equal(report.result.physicalProductAvailabilityClaim,false);
    assert.equal(report.result.hooks.length,3);
  } finally { rmSync(folder,{recursive:true,force:true}); }
});
