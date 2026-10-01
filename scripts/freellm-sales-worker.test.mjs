import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVE_DIGITAL_OFFERS, campaignForSlot } from './digital-conversion-campaign.mjs';
import { deterministicSalesPlan, validateLLMPlan, buildAssistedLLMPlan, parseSalesStrategy, guidedSalesPlan, requestFreeLLM, buildSalesWorkerReport } from './freellm-sales-worker.mjs';

test('deterministic sales plan stays inside verified offer facts', () => {
  for (const [i, offer] of ACTIVE_DIGITAL_OFFERS.entries()) {
    const plan = deterministicSalesPlan(offer, campaignForSlot(i));
    assert.equal(plan.workerMode, 'deterministic_fallback');
    assert.ok(plan.seoQueries.length >= 4);
    assert.ok(plan.socialDrafts.length >= 3);
    assert.match(plan.metaDescription, new RegExp('\\$' + offer.priceUsd));
    assert.doesNotMatch(JSON.stringify(plan), /guaranteed|best[- ]?seller|only \\d+ left|verified customer/i);
  }
});

test('LLM validation rejects invented pricing and unsafe outcome claims', () => {
  const offer = ACTIVE_DIGITAL_OFFERS[0];
  const safe = validateLLMPlan({
    seoQueries: ['stakeholder engagement plan template', 'stakeholder mapping workbook', 'stakeholder toolkit'],
    landingPageHeadline: 'A practical stakeholder mapping toolkit',
    metaDescription: 'Free guide plus an optional $49 one-time editable stakeholder document package.',
    socialDrafts: ['Start with the free guide.', 'Optional editable toolkit: $49 one time.'],
    shortVideoHooks: ['Turn contact lists into action plans.', 'Track commitments with accountable owners.'],
    creatorPitch: 'Educational collaboration around stakeholder planning.',
    experiments: ['Test free-guide-first CTA.', 'Test deliverable-led copy.', 'Test individual toolkit against bundle.']
  }, offer);
  assert.ok(safe);

  assert.equal(validateLLMPlan({
    seoQueries: ['a','b','c'],
    landingPageHeadline: 'Guaranteed results',
    metaDescription: 'Free guide',
    socialDrafts: ['one','two'],
    shortVideoHooks: ['one','two']
  }, offer), null);

  assert.equal(validateLLMPlan({
    seoQueries: ['stakeholder engagement plan template', 'stakeholder mapping workbook', 'stakeholder toolkit'],
    landingPageHeadline: 'A practical toolkit',
    metaDescription: 'Optional $99 package',
    socialDrafts: ['one', 'two'],
    shortVideoHooks: ['one', 'two']
  }, offer), null);
});

test('assisted FreeLLM plan keeps safe model fields and replaces unsafe ones', () => {
  const offer = ACTIVE_DIGITAL_OFFERS[0];
  const campaign = campaignForSlot(0);
  const plan = buildAssistedLLMPlan({
    seoQueries: ['stakeholder engagement plan excel', 'stakeholder mapping workbook', 'Guaranteed stakeholder wins'],
    landingPageHeadline: 'A practical stakeholder evidence system',
    metaDescription: 'Get the $99 stakeholder package today',
    socialDrafts: ['Start with a free stakeholder planning example.'],
    shortVideoHooks: ['Assign an owner to each stakeholder commitment.'],
    creatorPitch: 'Educational collaboration for stakeholder teams.',
    experiments: ['Test evidence-led copy against workflow-led copy.']
  }, offer, campaign);
  assert.ok(plan);
  assert.equal(plan.workerMode, 'freellmapi_assisted');
  assert.equal(plan.landingPageHeadline, 'A practical stakeholder evidence system');
  assert.match(plan.metaDescription, /\$49/);
  assert.doesNotMatch(JSON.stringify(plan), /Guaranteed stakeholder wins|\$99/);
  assert.ok(plan.llmFieldsAccepted >= 2);
});

test('FreeLLM request is optional and falls back when not configured', async () => {
  const offer = ACTIVE_DIGITAL_OFFERS[0];
  const result = await requestFreeLLM({ offer, campaign: campaignForSlot(0), env: {} });
  assert.equal(result.status, 'not_configured');
  assert.equal(result.plan, null);
});

test('FreeLLM OpenAI-compatible response selects a bounded sales strategy', async () => {
  const offer = ACTIVE_DIGITAL_OFFERS[1];
  const body = {
    choices: [{ message: { content: 'evidence-led' } }]
  };
  const fakeFetch = async () => ({
    ok: true,
    status: 200,
    json: async () => body,
    headers: { get: name => name === 'x-routed-via' ? 'kilo/free-model' : null }
  });
  const result = await requestFreeLLM({
    offer,
    campaign: campaignForSlot(1),
    fetchImpl: fakeFetch,
    env: { FREELLMAPI_BASE_URL:'http://localhost:3001', FREELLMAPI_API_KEY:'freellmapi-test', FREELLMAPI_MODEL:'auto:smart' }
  });
  assert.equal(result.status, 'ok');
  assert.equal(result.plan.workerMode, 'freellmapi_guided');
  assert.equal(result.plan.llmStrategy, 'evidence-led');
  assert.equal(result.validationMode, 'guided_strategy');
  assert.equal(result.strategy, 'evidence-led');
  assert.equal(result.routedVia, 'kilo/free-model');
});

test('sales worker report never claims a sale', async () => {
  const report = await buildSalesWorkerReport({ nowMs: 0, env: {} });
  assert.equal(report.commercialTruth.salesClaimed, false);
  assert.equal(report.commercialTruth.physicalProductPromotion, false);
  assert.equal(report.distribution.coldEmail, false);
  assert.equal(report.freeLLM.configured, false);
});

test('FreeLLM sales request allows free-tier latency while keeping output tiny', async () => {
  const source = await import('node:fs').then(fs => fs.readFileSync('scripts/freellm-sales-worker.mjs','utf8'));
  assert.match(source, /max_tokens:\s*24/);
  assert.match(source, /AbortSignal\.timeout\(110000\)/);
});

test('FreeLLM strategy router accepts only the four allowed positioning labels', () => {
  assert.equal(parseSalesStrategy('evidence-led'), 'evidence-led');
  assert.equal(parseSalesStrategy('I choose workflow led.'), 'workflow-led');
  assert.equal(parseSalesStrategy('FREE GUIDE FIRST'), 'free-guide-first');
  assert.equal(parseSalesStrategy('deliverables-led'), 'deliverables-led');
  assert.equal(parseSalesStrategy('guaranteed-sales-first'), null);
});

test('guided sales plan uses the model choice without inventing commercial facts', () => {
  const offer = ACTIVE_DIGITAL_OFFERS[0];
  const plan = guidedSalesPlan(offer, campaignForSlot(0), 'free-guide-first');
  assert.equal(plan.workerMode, 'freellmapi_guided');
  assert.equal(plan.llmStrategy, 'free-guide-first');
  assert.match(plan.landingPageHeadline, /Start with the free/);
  assert.match(plan.metaDescription, /\$49/);
  assert.doesNotMatch(JSON.stringify(plan), /guaranteed|best[- ]?seller|only \d+ left/i);
});

test('FreeLLM strategy request stays tiny for free-tier reliability', async () => {
  const source = await import('node:fs').then(fs => fs.readFileSync('scripts/freellm-sales-worker.mjs','utf8'));
  assert.match(source, /max_tokens:\s*24/);
  assert.match(source, /Reply with exactly one label and nothing else/);
  assert.match(source, /evidence-led/);
  assert.match(source, /deliverables-led/);
});
