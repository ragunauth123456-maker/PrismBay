import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function requiredRetailFloor(landedCostUsd, options={}) {
  const landed=Number(landedCostUsd);
  const feeRate=Number(options.feeRatePct ?? 8)/100;
  const returnReserveRate=Number(options.returnReservePct ?? 5)/100;
  const minContributionPct=Number(options.minContributionPct ?? 25)/100;
  const minContributionUsd=Number(options.minContributionUsd ?? 3);
  const maxLandedShare=Number(options.maxLandedSharePct ?? 55)/100;
  if(!Number.isFinite(landed)||landed<=0) return null;
  if(feeRate<0||returnReserveRate<0||minContributionPct<0||minContributionPct>=1||maxLandedShare<=0||maxLandedShare>=1) return null;
  const afterVariable=1-feeRate-returnReserveRate;
  const marginDenominator=afterVariable-minContributionPct;
  if(afterVariable<=0||marginDenominator<=0) return null;
  const byDollar=(landed+minContributionUsd)/afterVariable;
  const byPct=landed/marginDenominator;
  const byLandedShare=landed/maxLandedShare;
  const retail=Math.max(byDollar,byPct,byLandedShare);
  const contribution=retail*afterVariable-landed;
  return {
    landedCostUsd:+landed.toFixed(2),
    feeRatePct:+(feeRate*100).toFixed(2),
    returnReservePct:+(returnReserveRate*100).toFixed(2),
    requiredRetailUsd:+retail.toFixed(2),
    impliedContributionUsd:+contribution.toFixed(2),
    impliedContributionPct:+(contribution/retail*100).toFixed(1),
    landedSharePct:+(landed/retail*100).toFixed(1),
    provisionalOnly:true,
  };
}

export function stressProduct(result={}) {
  const packs=Array.isArray(result.packFreightScreening)?result.packFreightScreening.filter(x=>x?.priced):[];
  const scenarios=[3,8,15];
  const packScenarios=packs.map(pack=>({
    quantity:Number(pack.quantity),
    landedCostUsd:Number(pack.landedCostUsd),
    landedCostPerUnitUsd:Number(pack.landedCostPerUnitUsd),
    finalDestinationVerified:pack.finalDestinationVerified===true,
    feeScenarios:scenarios.map(feeRatePct=>({feeRatePct,...requiredRetailFloor(pack.landedCostUsd,{feeRatePct})})),
  }));
  return {
    slug:result.slug,
    supplierVerified:result.supplierVerified===true,
    variantInventoryVerified:result.variantInventoryVerified===true,
    screeningFreightVerified:result.freightVerified===true,
    exactDestinationFreightVerified:false,
    product:result.product||null,
    packScenarios,
    bestProvisionalUnitFloorUsd:packScenarios.length?Math.min(...packScenarios.flatMap(p=>p.feeScenarios.map(s=>s.requiredRetailUsd/p.quantity))):null,
    decision:'market_price_validation_required',
    note:'These are minimum retail floors derived from screening landed cost and margin rules. They are not market prices, exact destination quotes, or launch approval.',
  };
}

export function buildStressBoard(report={}) {
  const products=(Array.isArray(report.results)?report.results:[]).map(stressProduct);
  return {
    schemaVersion:1,
    generatedAt:new Date().toISOString(),
    objective:'Reject weak supplier routes earlier by calculating provisional retail floors required to satisfy PrismBay contribution rules.',
    sourceCheckedAt:report.checkedAt||null,
    sourceMode:report.mode||null,
    exactDestinationFreightVerified:false,
    marketRetailValidated:false,
    launchApproval:false,
    productCount:products.length,
    products,
  };
}

export async function main(){
  const report=JSON.parse(await fs.readFile('growth-reports/paperclip-cj-sourcing.json','utf8'));
  const board=buildStressBoard(report);
  await fs.mkdir('growth-reports',{recursive:true});
  await fs.writeFile('growth-reports/supplier-economics-stress-test.json',JSON.stringify(board,null,2)+'\n');
  console.log(JSON.stringify({productCount:board.productCount,products:board.products.map(x=>({slug:x.slug,bestProvisionalUnitFloorUsd:x.bestProvisionalUnitFloorUsd,packCount:x.packScenarios.length}))},null,2));
  return board;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) await main();
