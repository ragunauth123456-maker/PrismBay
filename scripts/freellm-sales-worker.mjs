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
    'You are a conversion copy analyst for PrismBay professional document toolkits.',
    'Return one JSON object only. Do not use markdown.',
    'Use only the supplied facts. Do not invent customers, results, scarcity, rankings, testimonials, revenue, delivery timing, product features, discounts or claims.',
    'Never promise outcomes. Keep the free guide separate from the optional paid package.',
    'Fields: seoQueries (array 4-8), landingPageHeadline, metaDescription, socialDrafts (array 3-6), shortVideoHooks (array 3-5), creatorPitch, experiments (array 3-6).',
    '',
    'FACTS:',
    JSON.stringify({
      title: offer.name,
      priceUsd: offer.priceUsd,
      audience: offer.audience,
      problem: offer.problem,
      educationalHook: offer.educationalHook,
      actionableTip: offer.actionableTip,
      deliverables: offer.deliverables,
      freeGuide: campaign.guideUrl,
      checkout: campaign.checkoutUrl,
      commercialDisclosure: 'One-time professional document package. Not hosted AI software, bespoke consulting, or a guarantee of results.'
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
        temperature: 0.35,
        messages: [
          { role: 'system', content: 'Return accurate, concise JSON grounded only in the supplied commercial facts.' },
          { role: 'user', content: prompt }
        ]
      }),
      signal: AbortSignal.timeout(45000)
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) return { plan: null, status: 'http_' + response.status };
    const content = payload?.choices?.[0]?.message?.content;
    const parsed = extractJson(content);
    const strictPlan = validateLLMPlan(parsed, offer);
    const plan = strictPlan || buildAssistedLLMPlan(parsed, offer, campaign);
    return {
      plan,
      status: plan ? 'ok' : 'invalid_output',
      validationMode: strictPlan ? 'strict' : plan ? 'assisted' : 'rejected',
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
