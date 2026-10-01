import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const script=fs.readFileSync('scripts/ci-freellmapi-bootstrap.sh','utf8');

test('CI bootstrap stays on a loopback-only public port',()=>{
  assert.match(script,/-p 127\.0\.0\.1:3001:3001/);
  assert.doesNotMatch(script,/-p 0\.0\.0\.0:3001:3001/);
});

test('CI bootstrap uses only documented keyless free providers',()=>{
  for(const platform of ['kilo','ovh','aihorde']){
    assert.match(script,new RegExp('"platform":"'+platform+'"'));
  }
  assert.doesNotMatch(script,/groq|openrouter|gemini|anthropic|openai/);
});

test('CI bootstrap uses a run-scoped unified key and never prints it',()=>{
  assert.match(script,/UNIFIED_KEY="freellmapi-\$\(openssl rand -hex 24\)"/);
  assert.match(script,/docker exec -e UNIFIED_KEY="\$UNIFIED_KEY"/);
  assert.match(script,/\/app\/server\/data\/freeapi\.db/);
  assert.match(script,/UPDATE settings SET value=\? WHERE key=\?/);
  assert.doesNotMatch(script,/-v "\$DATA_DIR:\/app\/server\/data"/);
  assert.doesNotMatch(script,/echo "\$UNIFIED_KEY"/);
  assert.doesNotMatch(script,/set -x/);
});

test('CI bootstrap verifies a live chat before exporting the route',()=>{
  assert.match(script,/\/v1\/chat\/completions/);
  assert.match(script,/FREELLMAPI_MODEL=auto:smart/);
  assert.match(script,/FREELLMAPI_CI_MODE=ephemeral-keyless/);
});

test('CI bootstrap never provisions or calls a paid infrastructure API',()=>{
  assert.doesNotMatch(script,/railway|stripe|checkout|supplier|order/i);
});
