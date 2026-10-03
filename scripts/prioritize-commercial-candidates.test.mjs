import test from 'node:test';
import assert from 'node:assert/strict';
import {commercialReadinessScore,prioritizeCandidates} from './prioritize-commercial-candidates.mjs';

test('checkout-ready infrastructure breaks otherwise similar supplier-readiness ties',()=>{
 const steamer={slug:'garment-steamer',independentIdentityMatch:true,variantStockVerified:true,freightEstimateVerified:true,finalZipFreightVerified:false,mediaRightsVerified:true,checkoutInfrastructureVerified:false,checkoutAllowed:false,automaticPromotionAllowed:true,liveStoreProduct:true};
 const crevice={...steamer,slug:'crevice',checkoutInfrastructureVerified:true};
 const out=prioritizeCandidates({candidates:[steamer,crevice]});
 assert.equal(out.candidates[0].slug,'crevice');
 assert.ok(commercialReadinessScore(crevice)>commercialReadinessScore(steamer));
});

test('a fully sale-ready candidate outranks a merely prepared candidate',()=>{
 const prepared={slug:'prepared',independentIdentityMatch:true,variantStockVerified:true,freightEstimateVerified:true,finalZipFreightVerified:false,mediaRightsVerified:true,checkoutInfrastructureVerified:true,checkoutAllowed:false,automaticPromotionAllowed:true,liveStoreProduct:true};
 const ready={...prepared,slug:'ready',finalZipFreightVerified:true,checkoutAllowed:true};
 assert.equal(prioritizeCandidates({candidates:[prepared,ready]}).candidates[0].slug,'ready');
});
