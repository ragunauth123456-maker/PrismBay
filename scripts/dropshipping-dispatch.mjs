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
  if (!reviewFresh) {
    tasks.push({worker:'Supplier Auditor',priority:'high',action:'Read latest CJ verification artifact; refresh strict identity, variant inventory and US freight evidence.',state:'awaiting_new_evidence'});
  } else {
    const blockers = (review.candidates || []).filter(c => c.status !== 'commercial_review_required');
    tasks.push({worker:'Supplier Auditor',priority:'high',action:'Review CJ candidate blockers and investigate precise SKUs. Do not create a listing or order.',state:'active_read_only',candidateCount:blockers.length,blockers:blockers.map(c=>({slug:c.slug,status:c.status}))});
    if (review.rejectedFalseMatches) tasks.push({worker:'Quality Reviewer',priority:'high',action:'Inspect and reject unrelated CJ keyword matches before any offer work.',state:'active_read_only',rejectedFalseMatches:review.rejectedFalseMatches});
  }
  tasks.push({worker:'Trend Scout',priority:'normal',action:'Refresh the existing public-news attention catalog; treat news mentions as research signals only.',state:'scheduled',candidateCount});
  tasks.push({worker:'Storefront CRO Auditor',priority:'normal',action:'Check existing store route, price and shipping disclosures, links, policy pages and checkout visibility. Log findings.',state:'scheduled',reportAvailable:Boolean(growthReports['storefront-cro-auditor'])});
  tasks.push({worker:'Hook/Creative Writer',priority:'normal',action:'Prepare original product demonstration scripts for approved inventory only. Hold all posts for rights and merchant review.',state:'drafts_only'});
  tasks.push({worker:'Analytics Reviewer',priority:'normal',action:'Compare storefront availability and verified sales evidence. Never count test payments or impressions as sales.',state:'scheduled',reportAvailable:Boolean(growthReports['analytics-reviewer'])});
  return {
    schemaVersion: 1, generatedAt:new Date(now).toISOString(),
    researchCandidates:candidateCount, publishedResearchSignals:Array.isArray(catalog?.candidates) ? catalog.candidates.length : 0,
    verifiedCJStatus:reviewFresh ? {checkedAt:review.checkedAt,validSupplierMatches:review.independentProductMatches,variantStock:review.verifiedVariantCount,countryFreightEstimates:review.countryFreightEstimateCount,falseMatches:review.rejectedFalseMatches} : null,
    constraints:{supplierApprovalsRequired:true,customerOrdersEnabled:false,autoPublishingEnabled:false,livePaymentsAuthorized:false},
    tasks,
    note:'These are existing deterministic scheduled workers and next-task instructions. A model-enabled Copilot agent runs only when explicitly invoked through an available runtime.',
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
