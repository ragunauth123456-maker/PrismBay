import test from 'node:test';
import assert from 'node:assert/strict';
import { compareMappedToChallengers } from './supplier-challenger-worker.mjs';

test('recommends a materially better challenger without authorizing remap',()=>{
 const result=compareMappedToChallengers({
  candidate:{slug:'crevice'}, retailPriceUsd:12.95,
  mapped:{productCostUsd:1.89,screeningFreightUsd:6.31,screenedLandedUsd:8.2,stockVerified:true,freightVerified:true},
  challengers:[{productId:'alt',productCostUsd:1.7,screeningFreightUsd:3.1,screenedLandedUsd:4.8,stockVerified:true,freightVerified:true,inventory:50}]
 });
 assert.equal(result.mapped.screeningEconomicsPass,false);
 assert.equal(result.recommendedRemapCandidate.productId,'alt');
 assert.equal(result.automaticRemapAllowed,false);
 assert.equal(result.exactBuyerZipStillRequired,true);
 assert.ok(result.screenedLandedImprovementUsd>=3);
});

test('does not recommend a challenger that still fails the freight ceiling',()=>{
 const result=compareMappedToChallengers({candidate:{slug:'x'},retailPriceUsd:10,mapped:{productCostUsd:2,screeningFreightUsd:7,screenedLandedUsd:9},challengers:[{productId:'alt',productCostUsd:2,screeningFreightUsd:6.5,screenedLandedUsd:8.5,stockVerified:true,freightVerified:true}]});
 assert.equal(result.recommendedRemapCandidate,null);
});

test('requires at least fifty cents screened landed improvement before remap proposal',()=>{
 const result=compareMappedToChallengers({candidate:{slug:'x'},retailPriceUsd:20,mapped:{productCostUsd:2,screeningFreightUsd:3,screenedLandedUsd:5},challengers:[{productId:'alt',productCostUsd:2,screeningFreightUsd:2.7,screenedLandedUsd:4.7,stockVerified:true,freightVerified:true}]});
 assert.equal(result.recommendedRemapCandidate,null);
});
