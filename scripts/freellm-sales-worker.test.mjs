import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVE_DIGITAL_OFFERS, campaignForSlot } from './digital-conversion-campaign.mjs';
import { deterministicSalesPlan, validateLLMPlan, requestFreeLLM, buildSalesWorkerReport } from './freellm-sales-worker.mjs';

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

test('FreeLLM request is optional and falls back when not configured', async () => {
  const offer = ACTIVE_DIGITAL_OFFERS[0];
  const result = await requestFreeLLM({ offer, campaign: campaignForSlot(0), env: {} });
  assert.equal(result.status, 'not_configured');
  assert.equal(result.plan, null);
});

test('FreeLLM OpenAI-compatible response is accepted when factual', async () => {
  const offer = ACTIVE_DIGITAL_OFFERS[1];
  const body = {
    choices: [{ message: { content: JSON.stringify({
      seoQueries: ['monthly esg reporting template', 'esg kpi workbook', 'social performance reporting pack', 'esg executive brief template'],
      landingPageHeadline: 'ESG reporting files for a repeatable monthly process',
      metaDescription: 'Free ESG reporting guide plus an optional $99 one-time editable document package.',
      socialDrafts: ['Start with a free monthly ESG reporting guide.', 'Optional editable ESG files: $99 one time.', 'Build a clearer evidence trail before reporting.'],
      shortVideoHooks: ['A dashboard does not repair an unverified KPI.', 'Assign an owner to every reported metric.', 'Trace each KPI to supporting evidence.'],
      creatorPitch: 'Educational collaboration for ESG reporting teams.',
      experiments: ['Test evidence-led copy.', 'Test free-guide-first CTA.', 'Test deliverable-led copy.']
    }) } }]
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
  assert.equal(result.plan.workerMode, 'freellmapi');
  assert.equal(result.routedVia, 'kilo/free-model');
});

test('sales worker report never claims a sale', async () => {
  const report = await buildSalesWorkerReport({ nowMs: 0, env: {} });
  assert.equal(report.commercialTruth.salesClaimed, false);
  assert.equal(report.commercialTruth.physicalProductPromotion, false);
  assert.equal(report.distribution.coldEmail, false);
  assert.equal(report.freeLLM.configured, false);
});
