import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

// Reuses eight existing scripted growth workers and the separate CJ verification.
// Coordinates work without activating checkout, automatic publication or paid AI.
export function makeDispatch({catalog, queue, review, growthReports = {}, now = Date.now()}) {
  const items = Array.isArray(queue?.items) ? queue.items : [];
  const candidateCount = Array.isArray(catalog?.candidates) ? catalog.candidates.length : 0;
  const ageHours = review?.checkedAt ? (now - Date.parse(review.checkedAt)) / 36e5 : null;
  const reviewFresh = Number.isFinite(ageHours) && ageHours >= 0 && ageHours < 30;
  const tasks = [];
  const candidates = reviewFresh && Array.isArray(review.candidates) ? review.candidates : [];
  const blocked = candidates.filter(c => c.status !== 'commercial_review_required');
  const freightBlocked = blocked.filter(c => c.variantStockVerified && !c.countryFreightEstimated);
  const reviewTasks = blocked.map(c => ({
    slug: c.slug, status: c.status,
    sku: c.observedVariantSku || c.observedSupplierSku || null,
    shippingDiagnostic: c.freightDiagnostic || null,
    zeroPricedMethods: c.zeroPricedMethodCount || 0,
  }));
  if (!reviewFresh) {
    tasks.push({worker:'Supplier Auditor',priority:'high',action:'Obtain a fresh CJ read-only verification run. Do not infer readiness from stale supplier data.',state:'awaiting_new_evidence',executionMode:'scheduled_cj_and_manual_review'});
  } else {
    tasks.push({worker:'Supplier Auditor',priority:'high',action:'Investigate specific catalog SKUs, incorrect product matches and incomplete stock evidence.',state:'review_required',executionMode:'scheduled_cj_and_manual_review',candidateCount:blocked.length,blockers:reviewTasks});
    if (review.rejectedFalseMatches) tasks.push({worker:'Quality Reviewer',priority:'high',action:'Reject CJ keyword false matches and update the explicit product-class regression tests.',state:'review_required',executionMode:'manual_copilot_review',rejectedFalseMatches:review.rejectedFalseMatches});
    if (freightBlocked.length) tasks.push({
      worker:'Freight Analyst',priority:'high',executionMode:'scheduled_cj_and_manual_review',
      action:'Check SKU-specific origin and destination ZIP quotes. Zero-dollar CJ methods require written supplier confirmation before treating shipping as free.',
      state:'supplier_quote_needed',
      products:freightBlocked.map(c=>({slug:c.slug,variantSku:c.observedVariantSku || null,
        zeroPricedMethods:c.zeroPricedMethodCount || 0,
        diagnostic:c.freightDiagnostic || null})),
    });
  }
  tasks.push({worker:'Trend Scout',priority:'normal',action:'Refresh current public-news research; do not represent attention scores as verified orders.',state:'scheduled',executionMode:'existing_cloud_script',candidateCount});
  const cro = growthReports['storefront-cro-auditor']?.result?.activeStorefront;
  tasks.push({worker:'Storefront CRO Auditor',priority:'normal',
    action:'Inspect existing storefront, shipping disclosures, policies, live offer identity and mobile experience. Propose a Product schema only for independently verified live listings.',
    state:'scheduled',executionMode:'existing_cloud_script',
    reportAvailable:Boolean(cro),storefrontStatus:cro?.status ?? null,
    missingProductSchema:cro?.hasProductSchema === false});
  tasks.push({worker:'Hook/Creative Writer',priority:'normal',
    action:'Prepare original informational product-comparison drafts. Do not add a purchase CTA until SKU, inventory, freight, creative rights and approval are independently verified.',
    state:'drafts_only',executionMode:'existing_cloud_script'});
  tasks.push({worker:'Creator/Partner Scout',priority:'normal',
    action:'Research relevant cleaning creators and prepare a qualified shortlist; do not send unsolicited messages or imply an active creator relationship.',
    state:'research_only',executionMode:'existing_cloud_script'});
  tasks.push({worker:'Publisher Readiness',priority:'normal',
    action:'Check channel verification and policy pages; all new product posts remain draft-only pending merchant and media-rights authorization.',
    state:'readiness_check_only',executionMode:'existing_cloud_script'});
  tasks.push({worker:'Analytics Reviewer',priority:'normal',
    action:'Compare live storefront health with verified, non-test payment evidence. No inferred revenue.',
    state:'scheduled',executionMode:'existing_cloud_script',
    reportAvailable:Boolean(growthReports['analytics-reviewer'])});
  tasks.push({worker:'Offer Optimizer',priority:'normal',
    action:'Inspect existing product-page prices and outdated urgency. Do not modify live prices without verified supplier landed cost and owner approval.',
    state:'scheduled',executionMode:'existing_cloud_script'});
  return {
    schemaVersion: 2, generatedAt:new Date(now).toISOString(),
    researchCandidates:candidateCount, publishedResearchSignals:Array.isArray(catalog?.candidates) ? catalog.candidates.length : 0,
    verifiedCJStatus:reviewFresh ? {checkedAt:review.checkedAt,validSupplierMatches:review.independentProductMatches,variantStock:review.verifiedVariantCount,countryFreightEstimates:review.countryFreightEstimateCount,falseMatches:review.rejectedFalseMatches} : null,
    constraints:{supplierApprovalsRequired:true,customerOrdersEnabled:false,autoPublishingEnabled:false,livePaymentsAuthorized:false},
    tasks,
    note:'Existing scheduled scripts execute Trend, Creative, CRO, Creator, Readiness, Analytics and Offer checks. Supplier CJ checks execute on their separate schedule. Any manual Copilot or supplier follow-up remains pending until invoked or confirmed.',
  };
}

async function readOptional(file) {try{return JSON.parse(await fs.readFile(file,'utf8'));}catch{return null;}}
export async function main() {
  const catalog=await readOptional('public/viral-candidates.json');
  const queue=await readOptional('growth-reports/viral-promotion-queue.json');
  const review=await readOptional('growth-reports/cj-worker-review.json');
  const reports={};
  for(const name of ['storefront-cro-auditor','analytics-reviewer']) reports[name]=await readOptional('growth-reports/'+name+'.json');
  const board=makeDispatch({catalog,queue,review,growthReports:reports});
  await fs.mkdir('growth-reports',{recursive:true});
  await fs.writeFile('growth-reports/dropshipping-worker-board.json',JSON.stringify(board,null,2)+'\n');
  console.log(JSON.stringify({workers:board.tasks.map(t=>t.worker),cj:board.verifiedCJStatus,ordersEnabled:false,publishingEnabled:false}));
  if(process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,'\n## Dropshipping worker assignments\n\n'+board.tasks.map(t=>'- '+t.worker+': '+t.action).join('\n')+'\n');
  return board;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) await main();
