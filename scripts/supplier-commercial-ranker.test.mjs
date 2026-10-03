import test from 'node:test';
import assert from 'node:assert/strict';
import {commercialEvidenceScore,buildCommercialRank,resilienceEvidence} from './supplier-commercial-ranker.mjs';

test('verified supplier evidence can outweigh higher research score',()=>{
 const strong=commercialEvidenceScore({researchScore:85,supplierVerified:true,variantInventoryVerified:true,freightVerified:true,product:{originCountryCode:'US',inventory:120}},20);
 const trendOnly=commercialEvidenceScore({researchScore:100,supplierVerified:false,variantInventoryVerified:false,freightVerified:false,product:{inventory:0}},null);
 assert.ok(strong.score>trendOnly.score);
});

test('resilience rewards independently stocked and freight-screened routes',()=>{
 const evidence=resilienceEvidence({
   product:{productCostUsd:2},lowestFreightUsd:3,
   supplierRoutePortfolio:[
     {variantInventoryVerified:true,screeningFreightVerified:true,productCostUsd:2,screeningFreightUsd:3},
     {variantInventoryVerified:true,screeningFreightVerified:true,productCostUsd:2.5,screeningFreightUsd:3.5},
   ],
 },15);
 assert.equal(evidence.routeCount,2);
 assert.equal(evidence.resilientRouteCount,2);
 assert.equal(evidence.selectedRouteWithinCeiling,true);
 assert.ok(evidence.headroomUsd>=0);
 assert.ok(evidence.resiliencePoints>0);
});

test('commercial ranker prefers resilient operating evidence',()=>{
 const board=buildCommercialRank({
   sourcing:{results:[
     {slug:'fragile',candidate:'Fragile',researchScore:99,supplierVerified:true,variantInventoryVerified:true,freightVerified:true,lowestFreightUsd:8,product:{originCountryCode:'US',inventory:50,productCostUsd:7},supplierRoutePortfolio:[{variantInventoryVerified:true,screeningFreightVerified:true,productCostUsd:7,screeningFreightUsd:8}]},
     {slug:'operational',candidate:'Operational',researchScore:88,supplierVerified:true,variantInventoryVerified:true,freightVerified:true,lowestFreightUsd:3,product:{originCountryCode:'US',inventory:50,productCostUsd:2},supplierRoutePortfolio:[{variantInventoryVerified:true,screeningFreightVerified:true,productCostUsd:2,screeningFreightUsd:3},{variantInventoryVerified:true,screeningFreightVerified:true,productCostUsd:2.5,screeningFreightUsd:3.5}]},
   ]},
   stress:{products:[{slug:'operational',bestProvisionalUnitFloorUsd:5}]},
   retailCatalog:{candidates:[{slug:'fragile',retailPriceUsd:12.95},{slug:'operational',retailPriceUsd:12.95}]},
 });
 assert.equal(board.ranked[0].slug,'operational');
 assert.equal(board.ranked[1].operationalStage,'screening_economics_rejected');
 assert.equal(board.recommendedBackup,'operational');
 assert.equal(board.multiRouteCandidateCount,1);
 assert.equal(board.safeguards.launchApproval,false);
});

test('ranker never upgrades screening freight into final freight',()=>{
 const board=buildCommercialRank({sourcing:{results:[{slug:'x',researchScore:90,supplierVerified:true,variantInventoryVerified:true,freightVerified:true,lowestFreightUsd:2,product:{originCountryCode:'US',inventory:10,productCostUsd:1},supplierRoutePortfolio:[]}]},retailCatalog:{candidates:[{slug:'x',retailPriceUsd:12.95}]}});
 assert.equal(board.ranked[0].exactDestinationFreightVerified,false);
 assert.equal(board.ranked[0].marketRetailValidated,true);
 assert.equal(board.safeguards.exactZipStillRequired,true);
});

test('missing provisional floor and retail remain null instead of synthetic zero',()=>{
 const board=buildCommercialRank({sourcing:{results:[{slug:'x',researchScore:90,supplierVerified:false,variantInventoryVerified:false,freightVerified:false,product:{}}]},stress:{products:[{slug:'x',bestProvisionalUnitFloorUsd:null}]}});
 assert.equal(board.ranked[0].bestProvisionalUnitFloorUsd,null);
 assert.equal(board.ranked[0].inventory,null);
 assert.equal(board.ranked[0].retailPriceUsd,null);
 assert.equal(board.ranked[0].selectedRouteWithinFreightCeiling,null);
});
