import test from 'node:test';
import assert from 'node:assert/strict';
import { researchScore, evidenceQuality, economicsGate, buildOpportunityBoard } from './global-commerce-opportunity-engine.mjs';

test('scores only declared research dimensions',()=>{
  assert.equal(researchScore({scores:{demand:25,shipping:15,demo:15,safety:15,returnRisk:10,competitionOpportunity:10,supplierDiscoverability:10,magic:999}}),100);
});

test('evidence quality rewards freshness and independent publishers',()=>{
  const sources=[
    {id:'a',publisher:'TikTok Shop',retrieved:'2026-10-03',market:'US'},
    {id:'b',publisher:'Shopify',published:'2026-09-30',market:'global'},
    {id:'c',publisher:'TikTok Shop',retrieved:'2026-10-02',market:'US'},
  ];
  const quality=evidenceQuality({evidence:['a','b','c']},sources,'2026-10-03');
  assert.equal(quality.independentlyCorroborated,true);
  assert.equal(quality.publisherCount,2);
  assert.equal(quality.freshEvidenceCount,3);
  assert.ok(quality.confidence>=80);
});

test('many pages from one publisher do not count as independent corroboration',()=>{
  const sources=[
    {id:'a',publisher:'TikTok Shop',retrieved:'2026-10-03',market:'US'},
    {id:'b',publisher:'TikTok Shop',retrieved:'2026-10-03',market:'US'},
    {id:'c',publisher:'TikTok Shop',retrieved:'2026-10-03',market:'US'},
  ];
  const quality=evidenceQuality({evidence:['a','b','c']},sources,'2026-10-03');
  assert.equal(quality.publisherCount,1);
  assert.equal(quality.independentlyCorroborated,false);
});

test('incomplete economics never becomes profit ready',()=>{
  assert.deepEqual(economicsGate({supplierCostUsd:3}),{verified:false,profitReady:false,reason:'complete_verified_unit_economics_required'});
});

test('strong verified economics passes and thin economics fails',()=>{
  assert.equal(economicsGate({supplierCostUsd:4,freightUsd:2,retailUsd:19.95,feeRatePct:4}).profitReady,true);
  assert.equal(economicsGate({supplierCostUsd:10,freightUsd:5,retailUsd:19.95,feeRatePct:4}).profitReady,false);
});

test('fresh corroborated trend evidence creates sourcing work but never invents profit',()=>{
  const seed={asOf:'2026-10-03',sources:[
    {id:'s1',publisher:'Marketplace A',retrieved:'2026-10-03',market:'US'},
    {id:'s2',publisher:'Platform B',published:'2026-09-28',market:'global'},
  ],candidates:[{slug:'car-hook',name:'Car hook',category:'automotive',evidence:['s1','s2'],scores:{demand:25,shipping:15,demo:15,safety:15,returnRisk:10,competitionOpportunity:10,supplierDiscoverability:10}}]};
  const board=buildOpportunityBoard(seed,{});
  assert.equal(board.sourcingQueue.length,1);
  assert.equal(board.profitReadyCount,0);
  assert.equal(board.candidates[0].commercialState,'research_only');
  assert.equal(board.candidates[0].researchStage,'source_now');
});

test('stale single-source hype is demoted from source_now even with a high raw score',()=>{
  const seed={asOf:'2026-10-03',sources:[{id:'s',publisher:'One Publisher',published:'2025-01-01',market:'US'}],candidates:[{slug:'x',name:'Old trend',category:'home',evidence:['s'],scores:{demand:25,shipping:15,demo:15,safety:15,returnRisk:10,competitionOpportunity:10,supplierDiscoverability:10}}]};
  const candidate=buildOpportunityBoard(seed,{}).candidates[0];
  assert.equal(candidate.researchStage,'watch_or_source');
  assert.ok(candidate.adjustedResearchScore<candidate.researchScore);
});

test('existing store SKU gets commercialization proximity bonus without inventing demand',()=>{
  const seed={asOf:'2026-10-03',sources:[{id:'s',publisher:'Marketplace',retrieved:'2026-10-03',market:'US'}],candidates:[{slug:'crevice',storeSku:'crevice',name:'Crevice brush',category:'cleaning',evidence:['s'],scores:{demand:20,shipping:15,demo:15,safety:15,returnRisk:10,competitionOpportunity:8,supplierDiscoverability:10}}]};
  const candidate=buildOpportunityBoard(seed,{}).candidates[0];
  assert.equal(candidate.commercialProximityBonus,6);
  assert.equal(candidate.researchScore,93);
  assert.ok(candidate.priorityScore>candidate.adjustedResearchScore);
});

test('restricted categories fail closed regardless of demand score',()=>{
  const seed={asOf:'2026-10-03',sources:[{id:'s',publisher:'A',retrieved:'2026-10-03',market:'US'},{id:'s2',publisher:'B',retrieved:'2026-10-03',market:'US'}],candidates:[{slug:'x',name:'Vitamin supplement',category:'supplement',evidence:['s','s2'],scores:{demand:25,shipping:15,demo:15,safety:15,returnRisk:10,competitionOpportunity:10,supplierDiscoverability:10}}]};
  assert.equal(buildOpportunityBoard(seed,{}).candidates[0].researchStage,'blocked_category');
});
