import test from 'node:test';
import assert from 'node:assert/strict';
import {applySupplierRank} from './apply-supplier-rank-to-war-room.mjs';

test('promotes strongest supplier-verified backup over research-only backup',()=>{
 const dashboard={verifiedSales:0,currentBottleneck:{product:'crevice'},firstSaleWarRoom:{closestProduct:'crevice',nextBestProduct:'toilet-scrubber-kit',alternativePathsInProgress:['verify_backup_candidate:toilet-scrubber-kit','prepare_storefront']},priorityTasks:[{owner:'supplier-fulfillment',objective:'Verify backup product toilet-scrubber-kit in parallel',nextAction:'source backup'}]};
 const rank={candidateCount:2,ranked:[{slug:'microfiber-car-detailing-cloths',commercialEvidenceScore:95,researchScore:92,supplierVerified:true,variantInventoryVerified:true,freightScreeningVerified:true,originCountryCode:'US',inventory:29,bestProvisionalUnitFloorUsd:10.196,exactDestinationFreightVerified:false,marketRetailValidated:false,operationalStage:'commercial_evidence_leader'},{slug:'toilet-scrubber-kit',commercialEvidenceScore:29,supplierVerified:false,variantInventoryVerified:false}]};
 const out=applySupplierRank(dashboard,rank);
 assert.equal(out.firstSaleWarRoom.nextBestProduct,'microfiber-car-detailing-cloths');
 assert.equal(out.firstSaleWarRoom.supplierEvidenceBackup.commercialEvidenceScore,95);
 assert.equal(out.firstSaleWarRoom.supplierEvidenceBackup.exactDestinationFreightVerified,false);
 assert.equal(out.firstSaleWarRoom.alternativePathsInProgress[0],'verify_commercial_evidence_backup:microfiber-car-detailing-cloths');
 assert.ok(out.priorityTasks[0].nextAction.includes('microfiber-car-detailing-cloths'));
});

test('does not change operating state after a verified sale',()=>{
 const dashboard={verifiedSales:1,firstSaleWarRoom:{closestProduct:'crevice',nextBestProduct:'old'}};
 const out=applySupplierRank(dashboard,{ranked:[{slug:'new',supplierVerified:true,variantInventoryVerified:true}]});
 assert.equal(out.firstSaleWarRoom.nextBestProduct,'old');
});

test('null provisional floor remains null instead of becoming zero',()=>{
 const dashboard={verifiedSales:0,currentBottleneck:{product:'crevice'},firstSaleWarRoom:{closestProduct:'crevice',alternativePathsInProgress:[]},priorityTasks:[]};
 const out=applySupplierRank(dashboard,{ranked:[{slug:'x',supplierVerified:false,variantInventoryVerified:false,bestProvisionalUnitFloorUsd:null}]});
 assert.equal(out.firstSaleWarRoom.supplierEvidenceBackup.bestProvisionalUnitFloorUsd,null);
});
