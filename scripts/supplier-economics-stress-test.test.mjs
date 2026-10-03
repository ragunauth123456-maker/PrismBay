import test from 'node:test';
import assert from 'node:assert/strict';
import {requiredRetailFloor,stressProduct,buildStressBoard} from './supplier-economics-stress-test.mjs';

test('required retail floor satisfies contribution and landed-share thresholds',()=>{
 const row=requiredRetailFloor(10,{feeRatePct:8,returnReservePct:5,minContributionPct:25,minContributionUsd:3,maxLandedSharePct:55});
 assert.ok(row.requiredRetailUsd>=18.18);
 assert.ok(row.impliedContributionUsd>=3);
 assert.ok(row.impliedContributionPct>=25);
 assert.ok(row.landedSharePct<=55.1);
 assert.equal(row.provisionalOnly,true);
});

test('rejects invalid landed cost',()=>{
 assert.equal(requiredRetailFloor(0),null);
 assert.equal(requiredRetailFloor('nope'),null);
});

test('stress product never upgrades screening freight into destination verification',()=>{
 const row=stressProduct({slug:'x',supplierVerified:true,variantInventoryVerified:true,freightVerified:true,product:{id:'p'},packFreightScreening:[{quantity:1,priced:true,landedCostUsd:8,landedCostPerUnitUsd:8,finalDestinationVerified:false}]});
 assert.equal(row.exactDestinationFreightVerified,false);
 assert.equal(row.packScenarios[0].finalDestinationVerified,false);
 assert.equal(row.decision,'market_price_validation_required');
});

test('stress board remains non-launch evidence',()=>{
 const board=buildStressBoard({checkedAt:'2026-10-03T00:00:00Z',mode:'read_only',results:[]});
 assert.equal(board.launchApproval,false);
 assert.equal(board.marketRetailValidated,false);
 assert.equal(board.exactDestinationFreightVerified,false);
});
