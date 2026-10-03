import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { commercialFreightCeiling } from './freight-ceiling-engine.mjs';

function finiteOrNull(value){
  if(value === null || value === undefined || value === '') return null;
  const n=Number(value);
  return Number.isFinite(n)?n:null;
}

function usableRoutes(result={}){
  return (Array.isArray(result.supplierRoutePortfolio)?result.supplierRoutePortfolio:[])
    .filter(route=>route?.variantInventoryVerified===true && route?.screeningFreightVerified===true && finiteOrNull(route?.productCostUsd)!==null && finiteOrNull(route?.screeningFreightUsd)!==null);
}

export function resilienceEvidence(result={}, retailPriceUsd=null){
  const routes=usableRoutes(result);
  const selectedCost=finiteOrNull(result.product?.productCostUsd);
  const selectedFreight=finiteOrNull(result.lowestFreightUsd);
  const retail=finiteOrNull(retailPriceUsd);
  let ceiling=null;
  let headroomUsd=null;
  let freightUtilizationPct=null;
  let selectedRouteWithinCeiling=null;
  if(retail!==null && selectedCost!==null){
    ceiling=commercialFreightCeiling({retailUsd:retail,supplierCostUsd:selectedCost,quantity:1});
    if(ceiling.viable && selectedFreight!==null){
      headroomUsd=+(ceiling.maxFreightUsd-selectedFreight).toFixed(2);
      freightUtilizationPct=+((selectedFreight/ceiling.maxFreightUsd)*100).toFixed(2);
      selectedRouteWithinCeiling=headroomUsd>=0;
    }
  }
  const redundantRouteCount=routes.length;
  const resilientRouteCount=retail===null?0:routes.filter(route=>{
    const routeCost=finiteOrNull(route.productCostUsd);
    const routeFreight=finiteOrNull(route.screeningFreightUsd);
    if(routeCost===null||routeFreight===null) return false;
    const c=commercialFreightCeiling({retailUsd:retail,supplierCostUsd:routeCost,quantity:1});
    return c.viable && routeFreight<=c.maxFreightUsd;
  }).length;
  const redundancyPoints=redundantRouteCount>=3?10:redundantRouteCount===2?7:redundantRouteCount===1?3:0;
  const headroomPoints=headroomUsd===null?0:headroomUsd>=5?10:headroomUsd>=2.5?7:headroomUsd>=1?4:headroomUsd>=0?1:-10;
  const resiliencePoints=Math.max(-10,Math.min(20,redundancyPoints+headroomPoints));
  return {
    routeCount:routes.length,
    resilientRouteCount,
    redundancyPoints,
    headroomPoints,
    resiliencePoints,
    retailPriceUsd:retail,
    maxFreightUsd:ceiling?.viable?ceiling.maxFreightUsd:null,
    headroomUsd,
    freightUtilizationPct,
    selectedRouteWithinCeiling,
    governingConstraint:ceiling?.viable?ceiling.governingConstraint:null,
  };
}

export function commercialEvidenceScore(result={},retailPriceUsd=null) {
  const research=Math.max(0,Math.min(100,Number(result.researchScore||0)));
  const inventory=Number(result.product?.inventory||0);
  const origin=String(result.product?.originCountryCode||'').toUpperCase();
  const inventoryPoints=inventory>=100?10:inventory>=25?7:inventory>=10?5:0;
  const resilience=resilienceEvidence(result,retailPriceUsd);
  const components={
    research:Math.round(research*0.25),
    supplier:result.supplierVerified===true?18:0,
    variantStock:result.variantInventoryVerified===true?18:0,
    freightScreening:result.freightVerified===true?12:0,
    targetMarketOrigin:origin==='US'?4:0,
    inventory:inventoryPoints,
    resilience:resilience.resiliencePoints,
  };
  return {score:Object.values(components).reduce((a,b)=>a+b,0),components,resilience};
}

export function buildCommercialRank({sourcing={},stress={},retailCatalog={}}={}) {
  const stressMap=new Map((stress.products||[]).map(x=>[x.slug,x]));
  const retailMap=new Map((retailCatalog.candidates||[]).map(x=>[x.slug,finiteOrNull(x.retailPriceUsd)]));
  const ranked=(sourcing.results||[]).map(result=>{
    const s=stressMap.get(result.slug);
    const retail=retailMap.get(result.slug)??finiteOrNull(result.retailPriceUsd);
    const scoring=commercialEvidenceScore(result,retail);
    const resilience=scoring.resilience;
    const fragile=resilience.selectedRouteWithinCeiling===false;
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
      inventory:finiteOrNull(result.product?.inventory),
      bestProvisionalUnitFloorUsd:finiteOrNull(s?.bestProvisionalUnitFloorUsd),
      retailPriceUsd:resilience.retailPriceUsd,
      supplierRouteCount:resilience.routeCount,
      resilientSupplierRouteCount:resilience.resilientRouteCount,
      maxAffordableFreightUsd:resilience.maxFreightUsd,
      screeningFreightHeadroomUsd:resilience.headroomUsd,
      screeningFreightUtilizationPct:resilience.freightUtilizationPct,
      selectedRouteWithinFreightCeiling:resilience.selectedRouteWithinCeiling,
      freightGoverningConstraint:resilience.governingConstraint,
      exactDestinationFreightVerified:false,
      marketRetailValidated:resilience.retailPriceUsd!==null,
      operationalStage:fragile?'screening_economics_rejected':scoring.score>=80?'commercial_evidence_leader':scoring.score>=60?'promising_supplier_route':'weak_or_incomplete_supplier_route',
      next:fragile
        ? ['find lower-cost supplier route or better warehouse','test bundle economics','do not advance checkout']
        : result.freightVerified===true
          ? ['obtain exact destination freight before checkout','recheck stock at quote time','complete final contribution economics']
          : result.variantInventoryVerified===true
            ? ['obtain freight screening','test pack economics']
            : result.supplierVerified===true
              ? ['verify exact variant stock']
              : ['find alternate exact-match supplier'],
    };
  }).sort((a,b)=>{
    if(a.selectedRouteWithinFreightCeiling===false && b.selectedRouteWithinFreightCeiling!==false) return 1;
    if(b.selectedRouteWithinFreightCeiling===false && a.selectedRouteWithinFreightCeiling!==false) return -1;
    return b.commercialEvidenceScore-a.commercialEvidenceScore || (b.screeningFreightHeadroomUsd??-Infinity)-(a.screeningFreightHeadroomUsd??-Infinity) || (a.bestProvisionalUnitFloorUsd??Infinity)-(b.bestProvisionalUnitFloorUsd??Infinity) || b.researchScore-a.researchScore;
  });
  return {
    schemaVersion:2,
    generatedAt:new Date().toISOString(),
    objective:'Rank candidates by verified supplier evidence, route redundancy and freight headroom so trend score and fragile economics cannot dominate commercialization decisions.',
    candidateCount:ranked.length,
    resilientCandidateCount:ranked.filter(x=>x.selectedRouteWithinFreightCeiling===true).length,
    multiRouteCandidateCount:ranked.filter(x=>x.supplierRouteCount>=2).length,
    recommendedBackup:ranked.find(x=>x.supplierVerified&&x.variantInventoryVerified&&x.selectedRouteWithinFreightCeiling!==false)?.slug||ranked.find(x=>x.supplierVerified&&x.variantInventoryVerified)?.slug||ranked[0]?.slug||null,
    ranked,
    safeguards:{researchScoreAloneCannotWin:true,screeningFreightIsNotFinalFreight:true,exactZipStillRequired:true,marketRetailFromLiveCatalogOnlyWhenAvailable:true,launchApproval:false},
  };
}

export async function main(){
  const sourcing=JSON.parse(await fs.readFile('growth-reports/paperclip-cj-sourcing.json','utf8'));
  let stress={}; try{stress=JSON.parse(await fs.readFile('growth-reports/supplier-economics-stress-test.json','utf8'));}catch{}
  let retailCatalog={}; try{retailCatalog=JSON.parse(await fs.readFile('services/physical-orders/live-catalog-candidates.json','utf8'));}catch{}
  const board=buildCommercialRank({sourcing,stress,retailCatalog});
  await fs.mkdir('growth-reports',{recursive:true});
  await fs.writeFile('growth-reports/supplier-commercial-rank.json',JSON.stringify(board,null,2)+'\n');
  console.log(JSON.stringify({recommendedBackup:board.recommendedBackup,resilientCandidateCount:board.resilientCandidateCount,multiRouteCandidateCount:board.multiRouteCandidateCount,ranked:board.ranked.map(x=>({slug:x.slug,score:x.commercialEvidenceScore,stage:x.operationalStage,routes:x.supplierRouteCount,resilientRoutes:x.resilientSupplierRouteCount,headroom:x.screeningFreightHeadroomUsd,floor:x.bestProvisionalUnitFloorUsd}))},null,2));
  return board;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) await main();
