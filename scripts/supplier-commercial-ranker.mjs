import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function commercialEvidenceScore(result={}) {
  const research=Math.max(0,Math.min(100,Number(result.researchScore||0)));
  const inventory=Number(result.product?.inventory||0);
  const origin=String(result.product?.originCountryCode||'').toUpperCase();
  const inventoryPoints=inventory>=100?10:inventory>=25?7:inventory>=10?5:0;
  const components={
    research:Math.round(research*0.30),
    supplier:result.supplierVerified===true?20:0,
    variantStock:result.variantInventoryVerified===true?20:0,
    freightScreening:result.freightVerified===true?15:0,
    targetMarketOrigin:origin==='US'?5:0,
    inventory:inventoryPoints,
  };
  return {score:Object.values(components).reduce((a,b)=>a+b,0),components};
}

export function buildCommercialRank({sourcing={},stress={}}={}) {
  const stressMap=new Map((stress.products||[]).map(x=>[x.slug,x]));
  const ranked=(sourcing.results||[]).map(result=>{
    const s=stressMap.get(result.slug);
    const scoring=commercialEvidenceScore(result);
    return {
      slug:result.slug,
      candidate:result.candidate,
      researchScore:Number(result.researchScore||0),
      commercialEvidenceScore:scoring.score,
      scoreComponents:scoring.components,
      supplierVerified:result.supplierVerified===true,
      variantInventoryVerified:result.variantInventoryVerified===true,
      freightScreeningVerified:result.freightVerified===true,
      originCountryCode:result.product?.originCountryCode||null,
      inventory:Number.isFinite(Number(result.product?.inventory))?Number(result.product.inventory):null,
      bestProvisionalUnitFloorUsd:Number.isFinite(Number(s?.bestProvisionalUnitFloorUsd))?Number(s.bestProvisionalUnitFloorUsd):null,
      exactDestinationFreightVerified:false,
      marketRetailValidated:false,
      operationalStage:scoring.score>=80?'commercial_evidence_leader':scoring.score>=60?'promising_supplier_route':'weak_or_incomplete_supplier_route',
      next:result.freightVerified===true
        ? ['validate comparable market retail price','obtain exact destination freight before checkout','complete contribution economics']
        : result.variantInventoryVerified===true
          ? ['obtain freight screening','test pack economics']
          : result.supplierVerified===true
            ? ['verify exact variant stock']
            : ['find alternate exact-match supplier'],
    };
  }).sort((a,b)=>b.commercialEvidenceScore-a.commercialEvidenceScore || (a.bestProvisionalUnitFloorUsd??Infinity)-(b.bestProvisionalUnitFloorUsd??Infinity) || b.researchScore-a.researchScore);
  return {
    schemaVersion:1,
    generatedAt:new Date().toISOString(),
    objective:'Re-rank research candidates using verified supplier operating evidence so trend score cannot dominate commercialization decisions.',
    candidateCount:ranked.length,
    recommendedBackup:ranked.find(x=>x.supplierVerified&&x.variantInventoryVerified)?.slug||ranked[0]?.slug||null,
    ranked,
    safeguards:{researchScoreAloneCannotWin:true,screeningFreightIsNotFinalFreight:true,marketRetailStillRequired:true,launchApproval:false},
  };
}

export async function main(){
  const sourcing=JSON.parse(await fs.readFile('growth-reports/paperclip-cj-sourcing.json','utf8'));
  let stress={}; try{stress=JSON.parse(await fs.readFile('growth-reports/supplier-economics-stress-test.json','utf8'));}catch{}
  const board=buildCommercialRank({sourcing,stress});
  await fs.mkdir('growth-reports',{recursive:true});
  await fs.writeFile('growth-reports/supplier-commercial-rank.json',JSON.stringify(board,null,2)+'\n');
  console.log(JSON.stringify({recommendedBackup:board.recommendedBackup,ranked:board.ranked.map(x=>({slug:x.slug,score:x.commercialEvidenceScore,stage:x.operationalStage,floor:x.bestProvisionalUnitFloorUsd}))},null,2));
  return board;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) await main();
