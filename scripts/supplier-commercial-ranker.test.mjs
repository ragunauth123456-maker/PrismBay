import test from 'node:test';
import assert from 'node:assert/strict';
import {commercialEvidenceScore,buildCommercialRank} from './supplier-commercial-ranker.mjs';

test('verified supplier evidence can outweigh higher research score',()=>{
 const strong=commercialEvidenceScore({researchScore:85,supplierVerified:true,variantInventoryVerified:true,freightVerified:true,product:{originCountryCode:'US',inventory:120}});
 const trendOnly=commercialEvidenceScore({researchScore:100,supplierVerified:false,variantInventoryVerified:false,freightVerified:false,product:{inventory:0}});
 assert.ok(strong.score>trendOnly.score);
});

test('commercial ranker prefers stronger operating evidence',()=>{
 const board=buildCommercialRank({
   sourcing:{results:[
     {slug:'trendier',candidate:'Trendier',researchScore:99,supplierVerified:false,variantInventoryVerified:false,freightVerified:false,product:{}},
     {slug:'operational',candidate:'Operational',researchScore:88,supplierVerified:true,variantInventoryVerified:true,freightVerified:true,product:{originCountryCode:'US',inventory:50}},
   ]},
   stress:{products:[{slug:'operational',bestProvisionalUnitFloorUsd:12.5}]},
 });
 assert.equal(board.ranked[0].slug,'operational');
 assert.equal(board.recommendedBackup,'operational');
 assert.equal(board.safeguards.launchApproval,false);
});

test('ranker never upgrades screening freight into final freight',()=>{
 const board=buildCommercialRank({sourcing:{results:[{slug:'x',researchScore:90,supplierVerified:true,variantInventoryVerified:true,freightVerified:true,product:{originCountryCode:'US',inventory:10}}]}});
 assert.equal(board.ranked[0].exactDestinationFreightVerified,false);
 assert.equal(board.ranked[0].marketRetailValidated,false);
});

test('missing provisional floor remains null instead of synthetic zero',()=>{
 const board=buildCommercialRank({sourcing:{results:[{slug:'x',researchScore:90,supplierVerified:false,variantInventoryVerified:false,freightVerified:false,product:{}}]},stress:{products:[{slug:'x',bestProvisionalUnitFloorUsd:null}]}});
 assert.equal(board.ranked[0].bestProvisionalUnitFloorUsd,null);
 assert.equal(board.ranked[0].inventory,null);
});
