import test from 'node:test';
import assert from 'node:assert/strict';
import {makeDispatch} from './dropshipping-dispatch.mjs';
const now=Date.parse('2026-09-26T22:00:00Z');
test('dispatches the six existing workstreams with fresh CJ evidence but no commercial permission',()=>{
 const b=makeDispatch({now,catalog:{candidates:[{slug:'cordless-handheld-vacuum'}]},queue:{items:[{}]},review:{
 checkedAt:'2026-09-26T20:00:00Z',independentProductMatches:1,verifiedVariantCount:0,countryFreightEstimateCount:0,rejectedFalseMatches:1,
 candidates:[{slug:'cordless-handheld-vacuum',status:'variant_stock_required'}]},
 growthReports:{'storefront-cro-auditor':{}}});
 assert.equal(b.verifiedCJStatus.validSupplierMatches,1);
 assert.equal(b.constraints.customerOrdersEnabled,false);
 assert.equal(b.constraints.autoPublishingEnabled,false);
 assert.ok(b.tasks.some(t=>t.worker==='Supplier Auditor'));
 assert.ok(b.tasks.some(t=>t.worker==='Quality Reviewer'));
 assert.equal(b.tasks.find(t=>t.worker==='Hook/Creative Writer').state,'drafts_only');
});
test('actual freight blockers become SKU-specific worker assignments',()=>{
 const b=makeDispatch({now,catalog:{candidates:[{slug:'hanging-closet-organizer'}]},queue:{items:[]},review:{
  checkedAt:'2026-09-26T20:00:00Z',independentProductMatches:1,verifiedVariantCount:1,
  countryFreightEstimateCount:0,rejectedFalseMatches:0,
  candidates:[{slug:'hanging-closet-organizer',status:'destination_freight_required',
   variantStockVerified:true,countryFreightEstimated:false,observedVariantSku:'CJ-V1',
   freightDiagnostic:'zero_priced_methods_require_supplier_confirmation',zeroPricedMethodCount:11}]}});
 const worker=b.tasks.find(x=>x.worker==='Freight Analyst');
 assert.equal(worker.state,'supplier_quote_needed');
 assert.equal(worker.products[0].variantSku,'CJ-V1');
 assert.equal(worker.products[0].zeroPricedMethods,11);
 assert.equal(b.constraints.customerOrdersEnabled,false);
});
test('expired or missing CJ evidence never becomes a sales authorization',()=>{
 for (const review of [null,{checkedAt:'2026-09-20T20:00:00Z',independentProductMatches:10,candidates:[]}]) {
  const b=makeDispatch({now,catalog:{candidates:[]},queue:{items:[]},review});
  assert.equal(b.verifiedCJStatus,null);
  assert.equal(b.tasks[0].state,'awaiting_new_evidence');
  assert.equal(b.constraints.livePaymentsAuthorized,false);
 }
});
