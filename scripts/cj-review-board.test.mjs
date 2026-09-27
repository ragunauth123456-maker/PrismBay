import test from 'node:test';
import assert from 'node:assert/strict';
import {buildCJReview} from './cj-review-board.mjs';
const base={checkedAt:'2026-09-26T16:52:56.364Z',market:'US',authentication:'verified'};
test('rejects the two unrelated products claimed as CJ supplier matches',()=>{
 const b=buildCJReview({...base,results:[
   {slug:'cordless-handheld-vacuum',candidate:'Cordless Handheld Vacuum',supplierVerified:true,variantInventoryVerified:false,freightVerified:false,product:{name:'VEVOR Wet Dry Vac, 2.6 Gallon, Portable Shop Vacuum'}},
   {slug:'hanging-closet-organizer',candidate:'Hanging Closet Organizer',supplierVerified:true,variantInventoryVerified:false,freightVerified:false,product:{name:'Wall-door Mounted Jewelry Wardrobe Large Capacity Mirror And LED Light Lockable Organizer'}}
 ]});
 assert.equal(b.independentProductMatches,0);
 assert.equal(b.rejectedFalseMatches,2);
 assert.equal(b.saleReadyCount,0);
 assert.ok(b.candidates.every(c=>c.status==='identity_rejected'&&!c.checkoutAllowed&&!c.automaticPromotionAllowed));
});
test('correctly matched and fully quoted product still requires manual commercial approval',()=>{
 const b=buildCJReview({...base,results:[{slug:'cordless-handheld-vacuum',candidate:'Cordless Handheld Vacuum',supplierVerified:true,variantInventoryVerified:true,freightVerified:true,product:{name:'Cordless Portable Handheld Vacuum Cleaner'}}]});
 assert.equal(b.independentProductMatches,1);
 assert.equal(b.verifiedVariantCount,1);
 assert.equal(b.countryFreightEstimateCount,1);
 assert.equal(b.saleReadyCount,0);
 assert.equal(b.candidates[0].status,'commercial_review_required');
 assert.equal(b.candidates[0].checkoutAllowed,false);
 assert.equal(b.candidates[0].mediaRightsVerified,false);
});
test('unknown identity and missing reports fail closed',()=>{
 const b=buildCJReview({...base,results:[{candidate:'new item',supplierVerified:true,product:{name:'Mystery item'}}]});
 assert.equal(b.candidates[0].status,'manual_identity_check_required');
 assert.throws(()=>buildCJReview({results:[]}),/invalid/);
});
