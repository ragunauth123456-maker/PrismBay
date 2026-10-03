import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const REQUIRED_PROMOTION_GATES = [
  ['independentIdentityMatch', 'independent product identity'],
  ['variantStockVerified', 'exact variant stock'],
  ['freightEstimateVerified', 'supplier freight estimate'],
  ['finalZipFreightVerified', 'final destination ZIP freight'],
  ['mediaRightsVerified', 'product media rights'],
  ['checkoutAllowed', 'live checkout approval'],
  ['automaticPromotionAllowed', 'promotion approval'],
];

export function candidateReadiness(candidate = {}) {
  const missing = REQUIRED_PROMOTION_GATES
    .filter(([field]) => candidate[field] !== true)
    .map(([field, label]) => ({ field, label }));
  const passed = REQUIRED_PROMOTION_GATES.length - missing.length;
  return {
    slug: candidate.slug || null,
    candidate: candidate.candidate || null,
    sku: candidate.observedVariantSku || candidate.observedSupplierSku || null,
    liveStoreProduct: candidate.liveStoreProduct === true,
    status: candidate.status || 'unknown',
    passedGates: passed,
    totalGates: REQUIRED_PROMOTION_GATES.length,
    readinessPct: Math.round((passed / REQUIRED_PROMOTION_GATES.length) * 100),
    missing,
    promotionEligible: missing.length === 0,
  };
}

export function buildRetailPromotionSwarm({ review, workerBoard = null, reports = {}, now = Date.now() }) {
  const checkedAt = review?.checkedAt || null;
  const reviewAgeHours = checkedAt ? (now - Date.parse(checkedAt)) / 36e5 : null;
  const reviewFresh = Number.isFinite(reviewAgeHours) && reviewAgeHours >= 0 && reviewAgeHours < 30;
  const rawCandidates = reviewFresh && Array.isArray(review?.candidates) ? review.candidates : [];
  const readiness = rawCandidates.map(candidateReadiness).sort((a, b) => {
    if (b.passedGates !== a.passedGates) return b.passedGates - a.passedGates;
    if (a.liveStoreProduct !== b.liveStoreProduct) return a.liveStoreProduct ? -1 : 1;
    return String(a.slug).localeCompare(String(b.slug));
  });
  const eligible = readiness.filter(item => item.promotionEligible);
  const nearReady = readiness.filter(item => !item.promotionEligible).slice(0, 3);
  const activeStorefront = reports['storefront-cro-auditor']?.result?.activeStorefront || null;
  const publisher = reports.publisher?.result || null;
  const analytics = reports['analytics-reviewer']?.result || null;

  const execution = {
    supplierVerification: {
      state: reviewFresh ? (eligible.length ? 'eligible_products_available' : 'blockers_active') : 'stale_or_missing',
      checkedAt,
      next: reviewFresh
        ? nearReady.map(item => ({ slug: item.slug, sku: item.sku, missing: item.missing.map(x => x.field) }))
        : [{ action: 'Run PrismBay CJ Supplier Verification before any product promotion.' }],
    },
    creative: {
      state: eligible.length ? 'promotion_packages_allowed_for_eligible_only' : 'informational_drafts_only',
      products: eligible.map(item => item.slug),
      rule: 'Use original or supplier-authorized media and evidence-backed product claims only.',
    },
    creatorPartners: {
      state: eligible.length ? 'qualified_shortlist_ready_for_owner_approved_contact' : 'research_only',
      products: eligible.map(item => item.slug),
      rule: 'No bulk messages, fake engagement, paid-upfront promises, or implied relationships.',
    },
    ownedSearch: {
      state: eligible.length ? 'retail_offer_pages_allowed_for_eligible_only' : 'informational_only',
      products: eligible.map(item => item.slug),
      rule: 'No Product offer markup, price, inventory, or purchase CTA for blocked products.',
    },
    storefront: {
      state: activeStorefront?.status === 200 ? 'reachable' : 'needs_review',
      url: activeStorefront?.finalUrl || activeStorefront?.target || null,
      ctaCount: activeStorefront?.ctaCount ?? null,
      hasProductSchema: activeStorefront?.hasProductSchema ?? null,
    },
    tiktok: {
      state: eligible.length && publisher?.tiktokVerificationReady ? 'approval_gated_publication_path_ready' : 'blocked_or_readiness_only',
      siteVerificationReady: publisher?.tiktokVerificationReady === true,
      products: eligible.map(item => item.slug),
      rule: 'Keep the existing consent, media-digest, rights, OWNER_AUTHORIZED and video.publish gates. Do not use the educational YouTube channel for retail.',
    },
    analytics: {
      state: analytics?.live ? 'control_plane_reachable' : 'needs_review',
      rule: 'Treat only verified non-test paid orders as sales. Availability, views, health checks and generated assets are not revenue.',
    },
  };

  const trackedOffers = eligible.map(item => ({
    slug: item.slug,
    sku: item.sku,
    storefrontUrl: `https://prismbay-clean-49izhg.v2.appdeploy.ai/tiktok/?utm_source=retail_swarm&utm_medium=organic&utm_campaign=verified_${encodeURIComponent(item.slug)}`,
    allowedChannels: ['owned-search', 'owner-approved-creator', 'approval-gated-short-form'],
  }));

  return {
    schemaVersion: 1,
    generatedAt: new Date(now).toISOString(),
    objective: 'First verified non-test paid PrismBay Clean order with valid supplier evidence and measurable source attribution.',
    reviewFresh,
    saleReadyCount: Number(review?.saleReadyCount || 0),
    promotionEligibleCount: eligible.length,
    promotionEligible: eligible,
    nearReady,
    trackedOffers,
    execution,
    existingWorkerCount: Array.isArray(workerBoard?.tasks) ? workerBoard.tasks.length : 0,
    safeguards: {
      unverifiedProductPromotion: false,
      automaticSocialPosting: false,
      bulkCreatorOutreach: false,
      paidSpend: false,
      fakeEngagement: false,
      educationalYouTubeRetailUse: false,
    },
  };
}

async function readOptional(path) {
  try {
    return JSON.parse(await fs.readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

export async function main() {
  const review = await readOptional('growth-reports/cj-worker-review.json');
  const workerBoard = await readOptional('growth-reports/dropshipping-worker-board.json');
  const reports = {};
  for (const name of ['storefront-cro-auditor', 'publisher', 'analytics-reviewer']) {
    reports[name] = await readOptional(`growth-reports/${name}.json`);
  }
  const swarm = buildRetailPromotionSwarm({ review, workerBoard, reports });
  await fs.mkdir('growth-reports', { recursive: true });
  await fs.writeFile('growth-reports/retail-promotion-swarm.json', JSON.stringify(swarm, null, 2) + '\n');
  console.log(JSON.stringify({
    objective: swarm.objective,
    promotionEligibleCount: swarm.promotionEligibleCount,
    nearReady: swarm.nearReady.map(item => ({ slug: item.slug, readinessPct: item.readinessPct, missing: item.missing.map(x => x.field) })),
    tiktok: swarm.execution.tiktok.state,
  }, null, 2));
  if (process.env.GITHUB_STEP_SUMMARY) {
    const lines = [
      '',
      '## PrismBay Clean retail promotion swarm',
      '',
      `Promotion-eligible products: ${swarm.promotionEligibleCount}`,
      `Supplier review fresh: ${swarm.reviewFresh}`,
      '',
      ...swarm.nearReady.map(item => `- ${item.candidate || item.slug}: ${item.readinessPct}% gates passed. Missing: ${item.missing.map(x => x.label).join(', ')}`),
      '',
      'Promotion stays blocked for any product that has not passed every supplier, freight, rights, checkout and promotion gate.',
      '',
    ];
    await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, lines.join('\n'));
  }
  return swarm;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
