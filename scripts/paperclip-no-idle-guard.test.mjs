import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNoIdleState, enforceNoIdleState } from './paperclip-no-idle-guard.mjs';

const companies = [
  'product-intelligence','supplier-fulfillment','offer-engineering','storefront-conversion','creative-studio','organic-growth','creator-affiliate-growth','revenue-analytics','experiment-lab','commerce-control'
].map(id => ({ id, name:id, funnelStage:id }));

const manifest = {
  companies,
  noIdleContract:'paperclip/prismbay-commerce-group/NO_IDLE_UNTIL_FIRST_SALE.md',
  rules:{
    noIdleUntilFirstVerifiedSale:true,
    allCompaniesActiveBeforeFirstSale:true,
    anotherCycleRequiredBeforeFirstSale:true
  }
};

const preSaleDashboard = {
  verifiedSales:0,
  currentBottleneck:{owner:'supplier-fulfillment',stage:'supplier_verification',product:'crevice'},
  firstSaleWarRoom:{closestProduct:'crevice',nextBestProduct:'toilet-scrubber-kit',alternativePathsInProgress:['verify_backup_candidate:toilet-scrubber-kit']},
  priorityTasks:[{owner:'supplier-fulfillment',objective:'close gates'}],
  companyQueue:companies.map(c=>({companyId:c.id,status:'support',currentAction:null}))
};

test('before first sale all ten companies receive active work and another cycle is required',()=>{
  const state=buildNoIdleState({manifest,dashboard:preSaleDashboard});
  assert.equal(state.mode,'no_idle_until_first_verified_sale');
  assert.equal(state.idleAllowed,false);
  assert.equal(state.nextCycleRequired,true);
  assert.equal(state.assignments.length,10);
  assert.ok(state.assignments.every(a=>a.state==='active_until_first_verified_sale'&&a.action));
  assert.equal(state.primaryProduct,'crevice');
  assert.equal(state.nextBestProduct,'toilet-scrubber-kit');
});

test('guard rewrites company queue so no company is idle before first verified sale',()=>{
  const guarded=enforceNoIdleState({manifest,dashboard:preSaleDashboard});
  assert.equal(guarded.companyQueue.length,10);
  assert.ok(guarded.companyQueue.every(c=>c.currentAction));
  assert.ok(guarded.companyQueue.every(c=>['priority_active','active_parallel'].includes(c.status)));
  assert.equal(guarded.noIdleUntilFirstSale.nextCycleRequired,true);
});

test('guard fails closed if fallback work disappears before first sale',()=>{
  const dashboard={...preSaleDashboard,firstSaleWarRoom:{closestProduct:'crevice',nextBestProduct:null,alternativePathsInProgress:[]},researchCandidates:[]};
  const guarded=enforceNoIdleState({manifest,dashboard});
  assert.ok(guarded.noIdleUntilFirstSale.alternativePaths.length>=1);
});

test('first verified sale ends the pre-sale no-idle contract and hands control to post-sale work',()=>{
  const state=buildNoIdleState({manifest,dashboard:{...preSaleDashboard,verifiedSales:1}});
  assert.equal(state.mode,'first_verified_sale_achieved');
  assert.equal(state.nextCycleRequired,false);
  assert.equal(state.stopConditionMet,true);
  assert.deepEqual(state.assignments,[]);
});
