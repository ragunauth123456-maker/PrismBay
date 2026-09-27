import test from 'node:test';
import assert from 'node:assert/strict';
import {candidateSearches,uniqueEligibleProducts,selectBestInspection} from './cj-search-strategy.mjs';

test('only approved categories receive one alternate search',()=>{
 const c=candidateSearches({slug:'cordless-handheld-vacuum',query:'cordless handheld vacuum'});
 assert.equal(c.length,2);
 assert.match(c[1],/portable/);
 assert.equal(candidateSearches({slug:'unapproved',query:'unknown'}).length,1);
 assert.deepEqual(candidateSearches({slug:'unapproved'},),[]);
});

test('one duplicate CJ PID is inspected once and at most two alternatives are probed',()=>{
 const first=[{id:'p1',nameEn:'Cordless Handheld Vacuum'}];
 const second=[{id:'p1'},{id:'p2'},{id:'p3'}];
 assert.deepEqual(uniqueEligibleProducts([first,second]).map(x=>x.id),['p1','p2']);
 assert.throws(()=>uniqueEligibleProducts([first,second],99),/limit/);
});

test('choose positive freight after inspecting a second matched candidate',()=>{
 const zero={supplierVerified:true,variantInventoryVerified:true,freightVerified:false,status:'supplier_matched_freight_pending'};
 const quoted={supplierVerified:true,variantInventoryVerified:true,freightVerified:true,status:'supplier_matched_us_freight_estimate'};
 assert.equal(selectBestInspection([zero,quoted]),quoted);
});
test('keep verified variant if second alternate lacks physical stock',()=>{
 const stock={supplierVerified:true,variantInventoryVerified:true,freightVerified:false};
 const noStock={supplierVerified:true,variantInventoryVerified:false,freightVerified:false};
 assert.equal(selectBestInspection([stock,noStock]),stock);
 assert.equal(selectBestInspection([]),null);
});
