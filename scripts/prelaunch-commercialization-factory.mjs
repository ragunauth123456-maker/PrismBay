import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

function slugWords(value='') {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean);
}

export function buildSeoThemes(candidate={}) {
  const name=String(candidate.name||candidate.slug||'product').trim();
  const category=String(candidate.category||'').trim();
  const words=[...new Set([...slugWords(name),...slugWords(category)])];
  return [
    name,
    category ? `${category} solution` : `${name} solution`,
    category ? `how to choose ${category}` : `how to choose ${name}`,
    words.length ? `${words.slice(0,4).join(' ')} guide` : `${name} guide`,
  ].filter(Boolean);
}

export function buildOfferHypotheses(candidate={}) {
  const name=String(candidate.name||candidate.slug||'product');
  return [
    {id:'single',label:`Single ${name}`,status:'hypothesis_only',requires:['verified_unit_economics','verified_stock','final_destination_freight']},
    {id:'multi-pack',label:`Multi-pack ${name}`,status:'hypothesis_only',requires:['verified_pack_freight','verified_stock','margin_floor']},
    {id:'problem-solution-bundle',label:`Problem-solution bundle around ${name}`,status:'hypothesis_only',requires:['complementary_product_identity','bundle_stock','bundle_margin']},
  ];
}

export function buildLaunchKit(candidate={}, context={}) {
  const evidence=Array.isArray(candidate.evidence)?candidate.evidence:[];
  const next=Array.isArray(context.next)?context.next:[];
  const ready=Boolean(context.promotionReady);
  return {
    slug:candidate.slug,
    name:candidate.name,
    category:candidate.category||null,
    researchScore:Number(candidate.researchScore||0),
    evidenceIds:evidence,
    commercialMode:ready?'activation_ready_pending_channel_authorization':'draft_only_prelaunch',
    claimBoundary:[
      'Do not claim supplier stock, freight, performance, materials, compatibility, safety, delivery time or customer outcomes unless separately verified.',
      'Do not reuse observed marketplace sales counts as claims about this exact PrismBay SKU.',
      'Do not publish fake reviews, fake scarcity, fake discounts or unsupported comparative claims.',
    ],
    productPageRequirements:[
      'exact verified product identity and variant',
      'current verified stock evidence',
      'evidence-backed product specifications',
      'final buyer destination freight or safe shipping rule',
      'returns/refund terms',
      'checkout eligibility',
      'rights-safe original media',
      'privacy-safe conversion instrumentation',
    ],
    seoThemes:buildSeoThemes(candidate),
    faqPrompts:[
      `What exactly is included with ${candidate.name}?`,
      `Who is ${candidate.name} intended for?`,
      `How should ${candidate.name} be used safely?`,
      `What are the verified dimensions, materials and compatibility limits?`,
      `What are the shipping, return and refund terms?`,
    ],
    objectionPrompts:[
      'Why buy this instead of a generic alternative?',
      'What verified evidence supports the product quality?',
      'What happens if the product is not suitable after delivery?',
      'How are shipping cost and delivery expectations communicated?',
    ],
    offerHypotheses:buildOfferHypotheses(candidate),
    creativeBriefs:[
      {id:'problem-solution',format:'short-form',concept:'Show the problem, the product mechanism and the verified result only; no fabricated before/after outcome.'},
      {id:'feature-proof',format:'short-form',concept:'Demonstrate one verified physical feature with original footage or rights-safe original graphics.'},
      {id:'faq-demo',format:'short-form',concept:'Answer one common buyer question using only verified specifications.'},
      {id:'comparison-framework',format:'static-or-page',concept:'Compare objective verified dimensions/features only; avoid unsupported superiority claims.'},
      {id:'use-case',format:'short-form',concept:'Show a realistic use case without implying unverified performance.'},
    ],
    channelPackages:[
      {channel:'owned-search-seo',status:'prepare_now',deliverables:['title/meta draft','FAQ schema inputs','search-intent article outline','internal-link plan']},
      {channel:'google-free-listings',status:ready?'prepare_for_activation':'prepare_only',deliverables:['product title','description','price/availability placeholders','shipping/return evidence checklist']},
      {channel:'pinterest-product-pins',status:ready?'prepare_for_activation':'prepare_only',deliverables:['original pin concepts','landing URL','truthful title/description']},
      {channel:'tiktok-shop-affiliate',status:ready?'eligibility_check':'prepare_only',deliverables:['creator brief','commission placeholder','rights-safe creative kit','eligibility checklist']},
      {channel:'marketplace-listing-packages',status:ready?'eligibility_check':'prepare_only',deliverables:['marketplace title','item specifics checklist','shipping evidence','returns evidence']},
    ],
    measurementPlan:{
      contract:'config/conversion-event-contract.json',
      funnel:['product_view','cta_click','checkout_start','purchase_verified'],
      blockedEvent:'checkout_blocked',
      success:'verified non-test paid order with source attribution and complete cost evidence',
    },
    unresolvedCommercialGates:next,
    definitionOfDone:'Kit may move from draft-only to activation only after exact SKU identity, stock, unit economics, final shipping/checkout and rights/claims gates are satisfied.',
  };
}

export function buildFactory({signals={},opportunities={},promotion={}}={}) {
  const candidateMap=new Map((signals.candidates||[]).map(c=>[c.slug,c]));
  const queue=Array.isArray(opportunities.sourcingQueue)?opportunities.sourcingQueue:[];
  const nearReady=Array.isArray(promotion.nearReady)?promotion.nearReady:[];
  const readySlugs=new Set((promotion.promotionEligible||promotion.eligible||[]).map(x=>typeof x==='string'?x:x?.slug).filter(Boolean));
  const selected=[];
  for(const row of queue){ if(row?.slug && !selected.includes(row.slug)) selected.push(row.slug); }
  for(const row of nearReady){ if(row?.slug && !selected.includes(row.slug)) selected.push(row.slug); }
  const kits=selected.slice(0,8).map(slug=>{
    const base=candidateMap.get(slug)||{slug,name:nearReady.find(x=>x.slug===slug)?.name||slug,category:null,evidence:[]};
    const q=queue.find(x=>x.slug===slug);
    const nr=nearReady.find(x=>x.slug===slug);
    const candidate={...base,researchScore:q?.researchScore??base.researchScore??0};
    return buildLaunchKit(candidate,{next:q?.next||nr?.missing||[],promotionReady:readySlugs.has(slug)});
  });
  return {
    schemaVersion:1,
    generatedAt:new Date().toISOString(),
    objective:'Prepare truthful, measurable commercialization assets before product gates clear so launch latency approaches zero without premature publishing.',
    publicationEnabled:false,
    paidSpendEnabled:false,
    automaticListingEnabled:false,
    kitCount:kits.length,
    kits,
  };
}

export async function main(){
  const signals=JSON.parse(await fs.readFile('paperclip/prismbay-global-commerce/research/current-market-signals.json','utf8'));
  let opportunities={}; let promotion={};
  try{opportunities=JSON.parse(await fs.readFile('growth-reports/global-commerce-opportunities.json','utf8'));}catch{}
  try{promotion=JSON.parse(await fs.readFile('growth-reports/retail-promotion-swarm.json','utf8'));}catch{}
  const report=buildFactory({signals,opportunities,promotion});
  await fs.mkdir('growth-reports/prelaunch-kits',{recursive:true});
  await fs.writeFile('growth-reports/prelaunch-commercialization.json',JSON.stringify(report,null,2)+'\n');
  for(const kit of report.kits) await fs.writeFile(`growth-reports/prelaunch-kits/${kit.slug}.json`,JSON.stringify(kit,null,2)+'\n');
  console.log(JSON.stringify({kitCount:report.kitCount,slugs:report.kits.map(x=>x.slug),publicationEnabled:report.publicationEnabled},null,2));
  return report;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) await main();
