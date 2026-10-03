import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrganization, selectBottleneck, buildDashboard } from './paperclip-commerce-group.mjs';

const manifest={parent:'PrismBay Commerce Group',objective:'Generate verified, profitable dropshipping sales for PrismBay Clean.',rules:{zeroCostFirst:true},companies:Array.from({length:10},(_,i)=>({id:'c'+i,name:'Company '+i,funnelStage:'stage'+i,mission:'mission',primaryKpi:'kpi'}))};

test('requires exactly ten unique specialist companies',()=>{
 assert.equal(validateOrganization(manifest),true);
 assert.throws(()=>validateOrganization({...manifest,companies:manifest.companies.slice(0,9)}),/exactly ten/);
});

test('nearest commercially verified product routes bottleneck to supplier fulfillment',()=>{
 const supplier={candidates:[{slug:'crevice',independentIdentityMatch:true,variantStockVerified:true,freightEstimateVerified:true,finalZipFreightVerified:false,mediaRightsVerified:true,checkoutAllowed:false,automaticPromotionAllowed:true}]};
 const b=selectBottleneck({firstSale:{verifiedFirstSale:false},supplier,promotion:{promotionEligibleCount:0},opportunities:null});
 assert.equal(b.owner,'supplier-fulfillment');
 assert.equal(b.product,'crevice');
 assert.ok(b.missing.includes('final_zip_freight'));
});

test('dashboard never invents revenue or funnel metrics',()=>{
 const dashboard=buildDashboard({manifest,firstSale:{verifiedFirstSale:false},supplier:{candidates:[]},promotion:{promotionEligibleCount:0},opportunities:{sourcingQueue:[]},storefront:null,tiktok:null,revenueBoard:null});
 assert.equal(dashboard.verifiedSales,0);
 assert.equal(dashboard.grossRevenueUsd,null);
 assert.equal(dashboard.conversionRate,null);
 assert.equal(dashboard.companyQueue.length,10);
 assert.ok(dashboard.evidenceGaps.includes('grossRevenueUsd'));
});

test('a verified sale shifts control to measurement rather than claiming scale',()=>{
 const b=selectBottleneck({firstSale:{verifiedFirstSale:true},supplier:null,promotion:null,storefront:null,tiktok:null,opportunities:null});
 assert.equal(b.owner,'revenue-analytics');
 assert.equal(b.reason,'verified_sale_exists_measure_margin_and_repeatability');
});
