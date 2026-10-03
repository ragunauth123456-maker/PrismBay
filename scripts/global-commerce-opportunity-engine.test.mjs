import test from 'node:test';
import assert from 'node:assert/strict';
import { researchScore, economicsGate, buildOpportunityBoard } from './global-commerce-opportunity-engine.mjs';

test('scores only declared research dimensions',()=>{
  assert.equal(researchScore({scores:{demand:25,shipping:15,demo:15,safety:15,returnRisk:10,competitionOpportunity:10,supplierDiscoverability:10,magic:999}}),100);
});

test('incomplete economics never becomes profit ready',()=>{
  assert.deepEqual(economicsGate({supplierCostUsd:3}),{verified:false,profitReady:false,reason:'complete_verified_unit_economics_required'});
});

test('strong verified economics passes and thin economics fails',()=>{
  assert.equal(economicsGate({supplierCostUsd:4,freightUsd:2,retailUsd:19.95,feeRatePct:4}).profitReady,true);
  assert.equal(economicsGate({supplierCostUsd:10,freightUsd:5,retailUsd:19.95,feeRatePct:4}).profitReady,false);
});

test('trend score creates sourcing work but never invents profit',()=>{
  const seed={sources:[{id:'s'}],candidates:[{slug:'car-hook',name:'Car hook',category:'automotive',evidence:['s'],scores:{demand:25,shipping:15,demo:15,safety:15,returnRisk:10,competitionOpportunity:10,supplierDiscoverability:10}}]};
  const board=buildOpportunityBoard(seed,{});
  assert.equal(board.sourcingQueue.length,1);
  assert.equal(board.profitReadyCount,0);
  assert.equal(board.candidates[0].commercialState,'research_only');
});

test('restricted categories fail closed regardless of demand score',()=>{
  const seed={sources:[{id:'s'}],candidates:[{slug:'x',name:'Vitamin supplement',category:'supplement',evidence:['s'],scores:{demand:25,shipping:15,demo:15,safety:15,returnRisk:10,competitionOpportunity:10,supplierDiscoverability:10}}]};
  assert.equal(buildOpportunityBoard(seed,{}).candidates[0].researchStage,'blocked_category');
});
