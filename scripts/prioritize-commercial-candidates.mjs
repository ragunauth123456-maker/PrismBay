import fs from 'node:fs/promises';

export function commercialReadinessScore(c={}){
  return Number(c.independentIdentityMatch===true)*64 +
    Number(c.variantStockVerified===true)*16 +
    Number(c.freightEstimateVerified===true)*16 +
    Number(c.finalZipFreightVerified===true)*32 +
    Number(c.mediaRightsVerified===true)*4 +
    Number(c.checkoutInfrastructureVerified===true)*24 +
    Number(c.checkoutAllowed===true)*32 +
    Number(c.automaticPromotionAllowed===true)*4 +
    Number(c.liveStoreProduct===true)*8;
}

export function prioritizeCandidates(report){
  if(!report||!Array.isArray(report.candidates)) throw new Error('candidate_report_missing');
  return {...report,candidates:[...report.candidates].sort((a,b)=>commercialReadinessScore(b)-commercialReadinessScore(a) || String(a.slug||'').localeCompare(String(b.slug||'')))};
}

export async function main(path='growth-reports/cj-worker-review.json'){
  const report=JSON.parse(await fs.readFile(path,'utf8'));
  const prioritized=prioritizeCandidates(report);
  await fs.writeFile(path,JSON.stringify(prioritized,null,2)+'\n');
  console.log(JSON.stringify({primary:prioritized.candidates[0]?.slug||null,score:commercialReadinessScore(prioritized.candidates[0]||{}),top:prioritized.candidates.slice(0,3).map(c=>({slug:c.slug,score:commercialReadinessScore(c),checkoutInfrastructureVerified:c.checkoutInfrastructureVerified===true}))},null,2));
  return prioritized;
}

if(import.meta.url===`file://${process.argv[1]}`) await main();
