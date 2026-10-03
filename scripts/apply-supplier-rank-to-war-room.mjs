import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

function finiteOrNull(value){
  if(value === null || value === undefined || value === '') return null;
  const n=Number(value);
  return Number.isFinite(n)?n:null;
}

export function applySupplierRank(dashboard={}, rank={}) {
  const verifiedSales=Number(dashboard.verifiedSales ?? dashboard.scoreboard?.verifiedSales ?? 0);
  if(verifiedSales >= 1) return dashboard;
  const war=dashboard.firstSaleWarRoom;
  if(!war || !rank || !Array.isArray(rank.ranked)) return dashboard;
  const primary=war.closestProduct || dashboard.currentBottleneck?.product || null;
  const preferred=rank.ranked.find(row => row?.slug && row.slug !== primary && row.supplierVerified === true && row.variantInventoryVerified === true)
    || rank.ranked.find(row => row?.slug && row.slug !== primary)
    || null;
  if(!preferred?.slug) return dashboard;

  const supplierPath=`verify_commercial_evidence_backup:${preferred.slug}`;
  const existingPaths=Array.isArray(war.alternativePathsInProgress)?war.alternativePathsInProgress:[];
  const filteredPaths=existingPaths.filter(path => !String(path).startsWith('verify_backup_candidate:') && !String(path).startsWith('verify_commercial_evidence_backup:'));
  const alternativePathsInProgress=[supplierPath,...filteredPaths];

  const priorityTasks=Array.isArray(dashboard.priorityTasks)?dashboard.priorityTasks.map(task => {
    if(task?.owner !== 'supplier-fulfillment') return task;
    const text=`${task.objective||''} ${task.nextAction||''}`.toLowerCase();
    if(!text.includes('backup')) return task;
    return {
      ...task,
      objective:`Advance evidence-backed backup product ${preferred.slug}`,
      commercialReason:'Latest authenticated supplier evidence outranks research popularity for backup prioritization.',
      requiredEvidence:['exact supplier identity','exact variant','verified stock','screening freight','exact destination freight before checkout','comparable market retail evidence','full contribution economics'],
      dependency:'latest successful Paperclip CJ sourcing evidence',
      fallbackRoute:'If this route fails exact freight, market-price or contribution tests, advance the next supplier-evidence-ranked candidate without weakening gates.',
      successMetric:'backup candidate reaches a documented commercial pass/reject decision using current supplier and economics evidence',
      stopCondition:'candidate is rejected with evidence or passes all remaining commercialization gates',
      nextAction:`validate market retail, exact destination freight and contribution economics for ${preferred.slug}`,
    };
  }):dashboard.priorityTasks;

  return {
    ...dashboard,
    generatedAt:new Date().toISOString(),
    firstSaleWarRoom:{
      ...war,
      nextBestProduct:preferred.slug,
      alternativePathsInProgress,
      supplierEvidenceBackup:{
        slug:preferred.slug,
        commercialEvidenceScore:finiteOrNull(preferred.commercialEvidenceScore),
        researchScore:finiteOrNull(preferred.researchScore),
        supplierVerified:preferred.supplierVerified===true,
        variantInventoryVerified:preferred.variantInventoryVerified===true,
        freightScreeningVerified:preferred.freightScreeningVerified===true,
        originCountryCode:preferred.originCountryCode||null,
        inventory:finiteOrNull(preferred.inventory),
        bestProvisionalUnitFloorUsd:finiteOrNull(preferred.bestProvisionalUnitFloorUsd),
        exactDestinationFreightVerified:preferred.exactDestinationFreightVerified===true,
        marketRetailValidated:preferred.marketRetailValidated===true,
        operationalStage:preferred.operationalStage||null,
        source:'latest_successful_paperclip_cj_sourcing_artifact',
      },
    },
    priorityTasks,
    supplierCommercialEvidence:{
      generatedAt:rank.generatedAt||null,
      recommendedBackup:preferred.slug,
      candidateCount:Number(rank.candidateCount||rank.ranked.length||0),
      safeguards:rank.safeguards||null,
    },
  };
}

export async function main(){
  const dashboard=JSON.parse(await fs.readFile('growth-reports/prismbay-commerce-group-dashboard.json','utf8'));
  let rank=null;
  try{rank=JSON.parse(await fs.readFile('growth-reports/supplier-commercial-rank.json','utf8'));}catch{
    console.log(JSON.stringify({applied:false,reason:'supplier_commercial_rank_not_available'},null,2));
    return dashboard;
  }
  const next=applySupplierRank(dashboard,rank);
  await fs.writeFile('growth-reports/prismbay-commerce-group-dashboard.json',JSON.stringify(next,null,2)+'\n');
  console.log(JSON.stringify({applied:Boolean(next.supplierCommercialEvidence),primary:next.firstSaleWarRoom?.closestProduct||null,nextBest:next.firstSaleWarRoom?.nextBestProduct||null,supplierEvidenceBackup:next.firstSaleWarRoom?.supplierEvidenceBackup||null},null,2));
  return next;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) await main();
