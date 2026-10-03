import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrganization, selectBottleneck, buildFirstSaleWarRoom, buildDashboard } from './paperclip-commerce-group.mjs';

const rules={
  verifiedPurchasesOnlyCountAsRevenue:true,
  dashboardOnlyFromVerifiedEvidence:true,
  blockerCreatesAlternativeTask:true,
  parallelExecutionRequired:true,
  neverIdleWholeSystemForOneDependency:true,
  firstSaleWarRoomUntilVerifiedSale:true,
  zeroCostFirst:true,
};
const manifest={
  parent:'PrismBay Commerce Group',
  objective:'Generate verified, profitable dropshipping sales for PrismBay Clean.',
  masterExecutionPrompt:'paperclip/prismbay-commerce-group/MASTER_EXECUTION_PROMPT.md',
  rules,
  commercialEscalation:Array.from({length:8},(_,i)=>({level:i+1,action:'level_'+(i+1)})),
  companies:Array.from({length:10},(_,i)=>({id:'c'+i,name:'Company '+i,funnelStage:'stage'+i,mission:'mission',primaryKpi:'kpi'}))
};

test('requires exactly ten unique specialist companies and persistence rules',()=>{
 assert.equal(validateOrganization(manifest),true);
 assert.throws(()=>validateOrganization({...manifest,companies:manifest.companies.slice(0,9)}),/exactly ten/);
 assert.throws(()=>validateOrganization({...manifest,masterExecutionPrompt:null}),/master execution prompt/);
 assert.throws(()=>validateOrganization({...manifest,rules:{...rules,parallelExecutionRequired:false}}),/parallelExecutionRequired/);
});

test('nearest commercially verified product routes bottleneck to supplier fulfillment',()=>{
 const supplier={candidates:[{slug:'crevice',independentIdentityMatch:true,variantStockVerified:true,freightEstimateVerified:true,finalZipFreightVerified:false,mediaRightsVerified:true,checkoutInfrastructureVerified:true,checkoutAllowed:false,automaticPromotionAllowed:true}]};
 const b=selectBottleneck({firstSale:{verifiedFirstSale:false},supplier,promotion:{promotionEligibleCount:0},opportunities:null});
 assert.equal(b.owner,'supplier-fulfillment');
 assert.equal(b.product,'crevice');
 assert.ok(b.missing.includes('final_zip_freight'));
 assert.ok(b.missing.includes('checkout'));
});

test('First Sale War Room preserves primary blocker and runs backup work in parallel',()=>{
 const supplier={candidates:[{slug:'crevice',independentIdentityMatch:true,variantStockVerified:true,freightEstimateVerified:true,finalZipFreightVerified:false,mediaRightsVerified:true,checkoutInfrastructureVerified:true,checkoutAllowed:false,automaticPromotionAllowed:true}]};
 const opportunities={sourcingQueue:[{slug:'toilet-scrubber-kit'},{slug:'microfiber-car-detailing-cloths'}]};
 const bottleneck=selectBottleneck({firstSale:{verifiedFirstSale:false},supplier,promotion:{promotionEligibleCount:0},opportunities});
 const war=buildFirstSaleWarRoom({bottleneck,supplier,promotion:{promotionEligibleCount:0},storefront:{result:{activeStorefront:{status:200}}},tiktok:{readyForPublicRetailPublishing:false},opportunities,firstSale:{verifiedFirstSale:false}});
 assert.equal(war.closestProduct,'crevice');
 assert.equal(war.nextBestProduct,'toilet-scrubber-kit');
 assert.ok(war.gateOwners.some(g=>g.gate==='final_zip_freight'&&g.owner==='supplier-fulfillment'));
 assert.ok(war.gateOwners.some(g=>g.gate==='checkout'&&g.owner==='storefront-conversion'));
 assert.ok(war.parallelWorkRequired.includes('supplier_verification:toilet-scrubber-kit'));
 assert.ok(war.alternativePathsInProgress.some(x=>x.includes('toilet-scrubber-kit')));
 assert.equal(war.checkoutReadiness,'infrastructure_verified_waiting_remaining_commercial_gates');
});

test('dashboard never invents revenue or funnel metrics and exposes alternatives',()=>{
 const dashboard=buildDashboard({
  manifest,
  firstSale:{verifiedFirstSale:false},
  supplier:{candidates:[{slug:'crevice',independentIdentityMatch:true,variantStockVerified:true,freightEstimateVerified:true,finalZipFreightVerified:false,mediaRightsVerified:true,checkoutInfrastructureVerified:true,checkoutAllowed:false,automaticPromotionAllowed:true}]},
  promotion:{promotionEligibleCount:0},
  opportunities:{sourcingQueue:[{slug:'toilet-scrubber-kit'}]},
  storefront:{result:{activeStorefront:{status:200}}},
  tiktok:{siteVerificationReady:false,readyForPublicRetailPublishing:false},
  revenueBoard:null
 });
 assert.equal(dashboard.verifiedSales,0);
 assert.equal(dashboard.grossRevenueUsd,0);
 assert.equal(dashboard.conversionRate,null);
 assert.equal(dashboard.scoreboard.qualifiedExternalVisitors,null);
 assert.deepEqual(dashboard.scoreboard.productsActivelyPromoted,[]);
 assert.equal(dashboard.companyQueue.length,10);
 assert.ok(dashboard.evidenceGaps.includes('grossMarginUsd'));
 assert.ok(dashboard.scoreboard.alternativePathsInProgress.length>=1);
 assert.equal(dashboard.firstSaleWarRoom.nextBestProduct,'toilet-scrubber-kit');
 assert.ok(dashboard.priorityTasks.every(t=>t.objective&&t.owner&&t.commercialReason&&Array.isArray(t.requiredEvidence)&&t.fallbackRoute&&t.successMetric&&t.stopCondition&&t.nextAction));
 assert.equal(dashboard.externalActionsAwaitingOwnerApproval.length,0);
});

test('a verified sale closes First Sale War Room and shifts control to measurement',()=>{
 const b=selectBottleneck({firstSale:{verifiedFirstSale:true},supplier:null,promotion:null,storefront:null,tiktok:null,opportunities:null});
 assert.equal(b.owner,'revenue-analytics');
 assert.equal(b.reason,'verified_sale_exists_measure_margin_and_repeatability');
 const war=buildFirstSaleWarRoom({bottleneck:b,supplier:null,promotion:null,storefront:null,tiktok:null,opportunities:null,firstSale:{verifiedFirstSale:true}});
 assert.equal(war,null);
});
