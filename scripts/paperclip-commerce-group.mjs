import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

async function readJson(file) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return null; }
}

export function validateOrganization(manifest) {
  if (!manifest || !Array.isArray(manifest.companies)) throw new Error('commerce group manifest missing companies');
  const ids = manifest.companies.map(c => c.id);
  if (manifest.companies.length !== 10 || new Set(ids).size !== 10) throw new Error('PrismBay Commerce Group must contain exactly ten unique specialist companies');
  for (const company of manifest.companies) {
    for (const field of ['id','name','funnelStage','mission','primaryKpi']) if (!company[field]) throw new Error(`company ${company.id || 'unknown'} missing ${field}`);
  }
  return true;
}

export function selectBottleneck({firstSale, promotion, supplier, storefront, tiktok, opportunities}) {
  if (storefront?.result?.activeStorefront?.status && storefront.result.activeStorefront.status !== 200) {
    return {stage:'storefront_readiness', owner:'storefront-conversion', reason:'live_storefront_unavailable'};
  }
  if (firstSale?.verifiedFirstSale === true) {
    return {stage:'measurement', owner:'revenue-analytics', reason:'verified_sale_exists_measure_margin_and_repeatability'};
  }
  const approved = Number(promotion?.promotionEligibleCount || supplier?.saleReadyCount || 0);
  if (approved > 0 && tiktok?.readyForPublicRetailPublishing !== true) {
    return {stage:'traffic_generation', owner:'organic-growth', reason:'sale_ready_product_exists_but_public_distribution_not_ready'};
  }
  const candidates = Array.isArray(supplier?.candidates) ? supplier.candidates : [];
  const nearCommercial = candidates.find(c => c.independentIdentityMatch === true && c.variantStockVerified === true && c.freightEstimateVerified === true);
  if (nearCommercial) {
    const missing = [];
    if (!nearCommercial.finalZipFreightVerified) missing.push('final_zip_freight');
    if (!nearCommercial.mediaRightsVerified) missing.push('media_rights');
    if (!nearCommercial.checkoutAllowed) missing.push('checkout');
    if (!nearCommercial.automaticPromotionAllowed) missing.push('promotion_authorization');
    return {stage:'supplier_verification', owner:'supplier-fulfillment', reason:'nearest_product_has_unclosed_commercial_gates', product:nearCommercial.slug, missing};
  }
  if ((opportunities?.sourcingQueue || []).length > 0) {
    return {stage:'supplier_verification', owner:'supplier-fulfillment', reason:'high_scoring_research_candidates_require_supplier_and_economics_validation'};
  }
  return {stage:'product_discovery', owner:'product-intelligence', reason:'no_verified_commercial_candidate_available'};
}

function listSupplierStates(supplier) {
  const candidates = Array.isArray(supplier?.candidates) ? supplier.candidates : [];
  return {
    awaitingSupplierVerification: candidates.filter(c => c.independentIdentityMatch !== true || c.variantStockVerified !== true || c.freightEstimateVerified !== true).map(c => c.slug).filter(Boolean),
    awaitingCommercialGateClosure: candidates.filter(c => c.independentIdentityMatch === true && c.variantStockVerified === true && c.freightEstimateVerified === true && !(c.finalZipFreightVerified && c.mediaRightsVerified && c.checkoutAllowed && c.automaticPromotionAllowed)).map(c => c.slug).filter(Boolean),
    approvedForPromotion: candidates.filter(c => c.independentIdentityMatch === true && c.variantStockVerified === true && c.freightEstimateVerified === true && c.finalZipFreightVerified === true && c.mediaRightsVerified === true && c.checkoutAllowed === true && c.automaticPromotionAllowed === true).map(c => c.slug).filter(Boolean),
    removedFromPromotion: candidates.filter(c => c.status === 'identity_rejected').map(c => c.slug).filter(Boolean),
  };
}

export function buildDashboard({manifest, opportunities, supplier, promotion, storefront, tiktok, firstSale, revenueBoard}) {
  validateOrganization(manifest);
  const bottleneck = selectBottleneck({firstSale,promotion,supplier,storefront,tiktok,opportunities});
  const supplierStates = listSupplierStates(supplier);
  const verifiedSales = firstSale?.verifiedFirstSale === true ? 1 : 0;
  const known = value => value === undefined || value === null ? null : value;
  const externalApprovals = [];
  if (tiktok?.siteVerificationReady === false) externalApprovals.push('publish_exact_provider_site_verification_file');
  if ((supplierStates.approvedForPromotion || []).length > 0 && tiktok?.publicPostVerified !== true) externalApprovals.push('external_retail_publication_if_repository_controls_require_owner_approval');
  const companyQueue = manifest.companies.map(company => ({
    companyId: company.id,
    company: company.name,
    funnelStage: company.funnelStage,
    primaryKpi: company.primaryKpi,
    status: company.id === bottleneck.owner ? 'priority' : 'support',
    currentAction: company.id === bottleneck.owner ? bottleneck.reason : null,
  }));

  return {
    schemaVersion:1,
    generatedAt:new Date().toISOString(),
    organization:manifest.parent,
    objective:manifest.objective,
    verifiedSales,
    grossRevenueUsd:known(firstSale?.grossRevenueUsd),
    grossMarginUsd:known(firstSale?.grossMarginUsd),
    contributionMarginUsd:known(firstSale?.netMarginUsd ?? firstSale?.contributionMarginUsd),
    orders:verifiedSales,
    averageOrderValueUsd:known(firstSale?.grossRevenueUsd),
    conversionRate:known(revenueBoard?.conversionRate),
    storeSessions:known(revenueBoard?.storeSessions),
    addToCartRate:known(revenueBoard?.addToCartRate),
    checkoutRate:known(revenueBoard?.checkoutRate),
    refundRate:known(firstSale?.refundRate),
    topProduct:known(revenueBoard?.topProduct),
    topTrafficSource:known(revenueBoard?.topTrafficSource),
    topCreative:known(revenueBoard?.topCreative),
    topExperiment:known(revenueBoard?.topExperiment),
    currentBottleneck:bottleneck,
    researchCandidates:(opportunities?.sourcingQueue || []).map(x => x.slug),
    productsAwaitingSupplierVerification:supplierStates.awaitingSupplierVerification,
    productsAwaitingCommercialGateClosure:supplierStates.awaitingCommercialGateClosure,
    productsApprovedForPromotion:supplierStates.approvedForPromotion,
    productsRemovedFromPromotion:supplierStates.removedFromPromotion,
    externalActionsAwaitingOwnerApproval:externalApprovals,
    promotionEligibleCount:Number(promotion?.promotionEligibleCount || supplier?.saleReadyCount || 0),
    supplierReviewCheckedAt:supplier?.checkedAt || null,
    storefrontHttpStatus:storefront?.result?.activeStorefront?.status ?? null,
    publicRetailPublishingReady:tiktok?.readyForPublicRetailPublishing === true,
    companyQueue,
    evidenceGaps:[
      ...(['grossRevenueUsd','grossMarginUsd','contributionMarginUsd'].filter(k => !(k in (firstSale || {})))),
      ...(['conversionRate','storeSessions','addToCartRate','checkoutRate','topProduct','topTrafficSource','topCreative','topExperiment'].filter(k => !(k in (revenueBoard || {}))))
    ],
    rules:manifest.rules
  };
}

export async function main() {
  const manifest = JSON.parse(await fs.readFile('paperclip/prismbay-commerce-group/companies.json','utf8'));
  const [opportunities,supplier,promotion,storefront,tiktok,firstSale,revenueBoard] = await Promise.all([
    readJson('growth-reports/global-commerce-opportunities.json'),
    readJson('growth-reports/cj-worker-review.json'),
    readJson('growth-reports/retail-promotion-swarm.json'),
    readJson('growth-reports/storefront-cro-auditor.json'),
    readJson('growth-reports/tiktok-retail-readiness.json'),
    readJson('growth-reports/first-sale-verification.json'),
    readJson('growth-reports/paperclip-revenue-board.json')
  ]);
  const dashboard = buildDashboard({manifest,opportunities,supplier,promotion,storefront,tiktok,firstSale,revenueBoard});
  await fs.mkdir('growth-reports',{recursive:true});
  await fs.writeFile('growth-reports/prismbay-commerce-group-dashboard.json',JSON.stringify(dashboard,null,2)+'\n');
  console.log(JSON.stringify({verifiedSales:dashboard.verifiedSales,currentBottleneck:dashboard.currentBottleneck,promotionEligibleCount:dashboard.promotionEligibleCount,researchCandidates:dashboard.researchCandidates,externalApprovals:dashboard.externalActionsAwaitingOwnerApproval},null,2));
  return dashboard;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
