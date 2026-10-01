import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { ACTIVE_DIGITAL_OFFERS, campaignForSlot, currentSixHourSlot } from './digital-conversion-campaign.mjs';

const forbidden = /guaranteed|best[- ]?seller|limited stock|only\s+\d+\s+left|thousands of customers|verified customer|proven results|instant results|make money fast|risk[- ]free/i;

function cleanString(value, max = 1200) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!text || text.length > max || forbidden.test(text)) return null;
  return text;
}

function cleanStringArray(value, maxItems, maxLen) {
  if (!Array.isArray(value)) return [];
  const out = [];
  for (const item of value) {
    const cleaned = cleanString(item, maxLen);
    if (cleaned && !out.includes(cleaned)) out.push(cleaned);
    if (out.length >= maxItems) break;
  }
  return out;
}

function containsWrongPrice(text, offer) {
  const amounts = [...String(text ?? '').matchAll(/\$(\d+(?:\.\d{1,2})?)/g)].map(m => Number(m[1]));
  return amounts.some(amount => amount !== offer.priceUsd);
}

function cleanOfferString(value, offer, max) {
  const cleaned = cleanString(value, max);
  if (!cleaned || containsWrongPrice(cleaned, offer)) return null;
  return cleaned;
}

function cleanOfferArray(value, offer, maxItems, maxLen) {
  if (!Array.isArray(value)) return [];
  const out = [];
  for (const item of value) {
    const cleaned = cleanOfferString(item, offer, maxLen);
    if (cleaned && !out.includes(cleaned)) out.push(cleaned);
    if (out.length >= maxItems) break;
  }
  return out;
}

export function deterministicSalesPlan(offer, campaign) {
  return {
    workerMode: 'deterministic_fallback',
    seoQueries: [
      offer.name.toLowerCase() + ' template',
      offer.name.toLowerCase() + ' editable workbook',
      offer.slug === 'stakeholder' ? 'stakeholder engagement plan template excel' :
        offer.slug === 'esg' ? 'monthly esg reporting template excel' :
          'board briefing template word',
      offer.slug === 'stakeholder' ? 'stakeholder mapping toolkit' :
        offer.slug === 'esg' ? 'esg social performance reporting pack' :
          'white paper template for executives'
    ],
    landingPageHeadline: offer.name + ' with editable professional files',
    metaDescription: ('Free practical guide plus an optional $' + offer.priceUsd +
      ' one-time PrismBay document package with ' + offer.deliverables.join(', ') + '.').slice(0, 155),
    socialDrafts: [
      offer.problem + ' ' + offer.actionableTip + ' Free guide: ' + campaign.guideUrl,
      offer.educationalHook + ' Optional editable toolkit: $' + offer.priceUsd + ' USD, one time. ' + campaign.checkoutUrl,
      'For ' + offer.audience + ': start with the free guide, then use the editable files if you need a reusable operating system. ' + campaign.guideUrl
    ],
    shortVideoHooks: [
      offer.problem,
      offer.educationalHook,
      'One practical control to add today: ' + offer.actionableTip
    ],
    creatorPitch: 'Educational collaboration idea for professionals working on ' + offer.name + '. The free guide is public, and the optional editable package is $' + offer.priceUsd + ' USD one time. No outcome claims or paid-upfront creator requirement.',
    experiments: [
      'Test a free-guide-first CTA against a direct toolkit CTA.',
      'Test problem-led copy against deliverable-led copy.',
      'Test the individual toolkit CTA against the existing complete-bundle option on the toolkit hub.'
    ]
  };
}

function extractJson(text) {
  const raw = String(text ?? '').trim();
  if (!raw) return null;
  try { return JSON.parse(raw); } catch {}
  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');
  if (first < 0 || last <= first) return null;
  try { return JSON.parse(raw.slice(first, last + 1)); } catch { return null; }
}

export function validateLLMPlan(value, offer) {
  if (!value || typeof value !== 'object') return null;
  const headline = cleanString(value.landingPageHeadline, 120);
  const meta = cleanString(value.metaDescription, 180);
  const creatorPitch = cleanString(value.creatorPitch, 700);
  const seoQueries = cleanStringArray(value.seoQueries, 8, 110);
  const socialDrafts = cleanStringArray(value.socialDrafts, 6, 650);
  const shortVideoHooks = cleanStringArray(value.shortVideoHooks, 5, 180);
  const experiments = cleanStringArray(value.experiments, 6, 240);
  if (!headline || !meta || seoQueries.length < 3 || socialDrafts.length < 2 || shortVideoHooks.length < 2) return null;

  const combined = [headline, meta, creatorPitch, ...seoQueries, ...socialDrafts, ...shortVideoHooks, ...experiments]
    .filter(Boolean).join(' ');
  const dollarAmounts = [...combined.matchAll(/\$(\d+(?:\.\d{1,2})?)/g)].map(m => Number(m[1]));
  if (dollarAmounts.some(n => n !== offer.priceUsd)) return null;

  return {
    workerMode: 'freellmapi',
    seoQueries,
    landingPageHeadline: headline,
    metaDescription: meta,
    socialDrafts,
    shortVideoHooks,
    creatorPitch,
    experiments
  };
}

export function buildAssistedLLMPlan(value, offer, campaign) {
  if (!value || typeof value !== 'object') return null;
  const fallback = deterministicSalesPlan(offer, campaign);
  let accepted = 0;

  const headline = cleanOfferString(value.landingPageHeadline, offer, 120);
  if (headline) accepted++;

  const meta = cleanOfferString(value.metaDescription, offer, 180);
  if (meta) accepted++;

  const creatorPitch = cleanOfferString(value.creatorPitch, offer, 700);
  if (creatorPitch) accepted++;

  const seoQueries = cleanOfferArray(value.seoQueries, offer, 8, 110);
  if (seoQueries.length >= 2) accepted++;

  const socialDrafts = cleanOfferArray(value.socialDrafts, offer, 6, 650);
  if (socialDrafts.length >= 1) accepted++;

  const shortVideoHooks = cleanOfferArray(value.shortVideoHooks, offer, 5, 180);
  if (shortVideoHooks.length >= 1) accepted++;

  const experiments = cleanOfferArray(value.experiments, offer, 6, 240);
  if (experiments.length >= 1) accepted++;

  if (accepted < 2) return null;

  return {
    workerMode: 'freellmapi_assisted',
    seoQueries: seoQueries.length >= 2 ? seoQueries : fallback.seoQueries,
    landingPageHeadline: headline || fallback.landingPageHeadline,
    metaDescription: meta || fallback.metaDescription,
    socialDrafts: socialDrafts.length ? socialDrafts : fallback.socialDrafts,
    shortVideoHooks: shortVideoHooks.length ? shortVideoHooks : fallback.shortVideoHooks,
    creatorPitch: creatorPitch || fallback.creatorPitch,
    experiments: experiments.length ? experiments : fallback.experiments,
    llmFieldsAccepted: accepted
  };
}


export function parseSalesStrategy(value) {
  const text = String(value ?? '').toLowerCase();
  const strategies = [
    ['evidence-led', /\bevidence[\s_-]*led\b/],
    ['workflow-led', /\b(?:workflow|process)[\s_-]*led\b/],
    ['free-guide-first', /\bfree[\s_-]*guide[\s_-]*first\b/],
    ['deliverables-led', /\b(?:deliverables?|files?)[\s_-]*led\b/]
  ];
  for (const [label, pattern] of strategies) {
    if (pattern.test(text)) return label;
  }
  return null;
}

export function guidedSalesPlan(offer, campaign, strategy) {
  const fallback = deterministicSalesPlan(offer, campaign);
  const choices = {
    'evidence-led': {
      query: offer.name.toLowerCase() + ' evidence template',
      headline: 'Build ' + offer.name + ' around traceable evidence',
      hook: 'Start with evidence you can trace before the next review.',
      experiment: 'Test an evidence-led headline against the standard toolkit headline.'
    },
    'workflow-led': {
      query: offer.name.toLowerCase() + ' workflow template',
      headline: offer.name + ' for a repeatable working process',
      hook: 'Turn a one-off task into a repeatable documented process.',
      experiment: 'Test workflow-led copy against deliverable-led copy.'
    },
    'free-guide-first': {
      query: 'free ' + offer.name.toLowerCase() + ' guide',
      headline: 'Start with the free ' + offer.name + ' guide',
      hook: 'Start with the free guide, test the workflow, then decide whether editable files fit the work.',
      experiment: 'Test a free-guide-first CTA against a direct toolkit CTA.'
    },
    'deliverables-led': {
      query: offer.name.toLowerCase() + ' editable files',
      headline: offer.name + ': editable files for practical implementation',
      hook: 'Use the free guide first, then review the editable files listed in the toolkit.',
      experiment: 'Test deliverable-led copy against problem-led copy.'
    }
  };
  const selected = choices[strategy];
  if (!selected) return null;
  return {
    ...fallback,
    workerMode: 'freellmapi_guided',
    llmStrategy: strategy,
    seoQueries: [selected.query, ...fallback.seoQueries.filter(q => q !== selected.query)].slice(0, 4),
    landingPageHeadline: selected.headline,
    shortVideoHooks: [selected.hook, ...fallback.shortVideoHooks.filter(h => h !== selected.hook)].slice(0, 3),
    experiments: [selected.experiment, ...fallback.experiments.filter(e => e !== selected.experiment)].slice(0, 3)
  };
}

function normalizeBaseUrl(base) {
  const clean = String(base || '').trim().replace(/\/+$/, '');
  if (!clean) return null;
  return clean.endsWith('/v1') ? clean : clean + '/v1';
}

export async function requestFreeLLM({ offer, campaign, fetchImpl = fetch, env = process.env } = {}) {
  const base = normalizeBaseUrl(env.FREELLMAPI_BASE_URL);
  const key = String(env.FREELLMAPI_API_KEY || '').trim();
  if (!base || !key) return { plan: null, status: 'not_configured' };

  const prompt = [
    'Choose the strongest positioning angle for this PrismBay professional document toolkit.',
    'Reply with exactly one label and nothing else:',
    'evidence-led',
    'workflow-led',
    'free-guide-first',
    'deliverables-led',
    '',
    'Choose from the verified facts below. Do not infer sales, customers, outcomes, scarcity, rankings or testimonials.',
    'FACTS:',
    JSON.stringify({
      title: offer.name,
      audience: offer.audience,
      problem: offer.problem,
      educationalHook: offer.educationalHook,
      actionableTip: offer.actionableTip,
      deliverables: offer.deliverables,
      commercialDisclosure: 'One-time professional document package. The free guide remains available without purchase.'
    })
  ].join('\n');

  try {
    const response = await fetchImpl(base + '/chat/completions', {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + key,
        'content-type': 'application/json',
        'x-freellm-task-type': 'chat'
      },
      body: JSON.stringify({
        model: String(env.FREELLMAPI_MODEL || 'auto:smart'),
        temperature: 0,
        max_tokens: 24,
        messages: [
          { role: 'system', content: 'Return exactly one allowed positioning label. No explanation.' },
          { role: 'user', content: prompt }
        ]
      }),
      signal: AbortSignal.timeout(110000)
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) return { plan: null, status: 'http_' + response.status };
    const content = payload?.choices?.[0]?.message?.content;
    const strategy = parseSalesStrategy(content);
    const plan = strategy ? guidedSalesPlan(offer, campaign, strategy) : null;
    return {
      plan,
      status: plan ? 'ok' : 'invalid_output',
      validationMode: plan ? 'guided_strategy' : 'rejected',
      strategy,
      routedVia: response.headers?.get?.('x-routed-via') || null,
      fallbackAttempts: response.headers?.get?.('x-fallback-attempts') || null
    };
  } catch (error) {
    return { plan: null, status: 'request_failed', errorClass: error?.name || 'Error' };
  }
}

export async function buildSalesWorkerReport({ nowMs = Date.now(), fetchImpl = fetch, env = process.env } = {}) {
  const campaign = campaignForSlot(currentSixHourSlot(nowMs));
  const offer = ACTIVE_DIGITAL_OFFERS.find(item => item.slug === campaign.offer.slug);
  if (!offer) throw new Error('active_offer_not_found');

  const llm = await requestFreeLLM({ offer, campaign, fetchImpl, env });
  const plan = llm.plan || deterministicSalesPlan(offer, campaign);
  return {
    schemaVersion: 1,
    generatedAt: new Date(nowMs).toISOString(),
    priority: 'sales_acquisition_for_verified_digital_products',
    offer: {
      slug: offer.slug,
      title: offer.name,
      priceUsd: offer.priceUsd,
      audience: offer.audience,
      guideUrl: campaign.guideUrl,
      checkoutUrl: campaign.checkoutUrl,
      deliverables: offer.deliverables
    },
    freeLLM: {
      configured: Boolean(normalizeBaseUrl(env.FREELLMAPI_BASE_URL) && String(env.FREELLMAPI_API_KEY || '').trim()),
      status: llm.status,
      routedVia: llm.routedVia || null,
      fallbackAttempts: llm.fallbackAttempts || null,
      validationMode: llm.validationMode || null,
      strategy: llm.strategy || plan.llmStrategy || null,
      workerMode: plan.workerMode,
      sourceProject: 'https://github.com/tashfeenahmed/freellmapi'
    },
    workers: {
      demandMiner: { state: 'ready', seoQueries: plan.seoQueries },
      conversionWriter: { state: 'ready', headline: plan.landingPageHeadline, metaDescription: plan.metaDescription, socialDrafts: plan.socialDrafts },
      shortVideoWriter: { state: 'ready', hooks: plan.shortVideoHooks },
      creatorPartnerWriter: { state: 'draft_only', pitch: plan.creatorPitch },
      experimentPlanner: { state: 'ready', experiments: plan.experiments }
    },
    distribution: {
      ownedSearchPages: 'published_by_existing_free_cloud_workflow_after_verified-page generation',
      indexNow: 'existing buyer acquisition workflow submits live owned URLs',
      social: 'draft_only_until_an_authorized_channel_adapter_is_connected',
      coldEmail: false
    },
    commercialTruth: {
      salesClaimed: false,
      physicalProductPromotion: false,
      note: 'Worker output improves acquisition assets for existing digital products. A paid Stripe event is required before reporting a sale.'
    }
  };
}

export async function main() {
  const report = await buildSalesWorkerReport();
  await fs.mkdir('growth-reports', { recursive: true });
  await fs.writeFile('growth-reports/freellm-sales-worker-latest.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({
    status: 'PASS',
    offer: report.offer.slug,
    freeLLM: report.freeLLM.status,
    mode: report.workers.conversionWriter.state,
    socialPublishing: false
  }));
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
