import test from 'node:test';
import assert from 'node:assert/strict';
import {positiveNumber,chooseProduct,chooseStock,buildPackScreening} from './paperclip-cj-sourcing.mjs';
import {selectRotatingCandidates} from './candidate-rotation.mjs';

test('selects only exact approved on-sale product identity',()=>{
 const c={slug:'car-seat-headrest-hooks'};
 const rows=[{id:'bad',nameEn:'Bathroom Wall Hook Rack',saleStatus:'3',sellPrice:2,totalVerifiedInventory:1000},{id:'good',nameEn:'Car Seat Headrest Bag Hooks',saleStatus:'3',sellPrice:3,totalVerifiedInventory:20}];
 assert.equal(chooseProduct(rows,c)?.id,'good');
});

test('rejects zero prices and prefers usable physical stock',()=>{
 assert.equal(positiveNumber(0),null);
 const stock=chooseStock([{vid:'v',countryCode:'CN',totalInventoryNum:100,cjInventoryNum:20},{vid:'v',countryCode:'US',totalInventoryNum:20,cjInventoryNum:2}], 'v');
 assert.equal(stock.countryCode,'US');
});

test('multi-pack screening amortizes priced freight without claiming destination verification',()=>{
 const pack=buildPackScreening(1.79,5,{offers:[{name:'Carrier',usd:11.5,aging:'3-8'}]});
 assert.equal(pack.priced,true);
 assert.equal(pack.productCostTotalUsd,8.95);
 assert.equal(pack.freightPerUnitUsd,2.3);
 assert.equal(pack.landedCostUsd,20.45);
 assert.equal(pack.landedCostPerUnitUsd,4.09);
 assert.equal(pack.finalDestinationVerified,false);
});

test('pack screening fails closed without positive freight',()=>{
 assert.equal(buildPackScreening(1.79,3,{offers:[]}).priced,false);
 assert.equal(buildPackScreening(1.79,0,{offers:[{usd:4}]}).priced,false);
});

test('keeps top two anchors while rotating remaining supplier slots',()=>{
 const candidates=Array.from({length:8},(_,i)=>({slug:`p${i+1}`}));
 const a=selectRotatingCandidates(candidates,{batchSize:5,anchorCount:2,slot:0});
 const b=selectRotatingCandidates(candidates,{batchSize:5,anchorCount:2,slot:3});
 assert.deepEqual(a.selected.map(x=>x.slug),['p1','p2','p3','p4','p5']);
 assert.deepEqual(b.selected.map(x=>x.slug),['p1','p2','p6','p7','p8']);
 assert.equal(a.selected.length,5);
 assert.equal(b.selected.length,5);
});

test('rotation wraps without duplicates and eventually covers the full queue',()=>{
 const candidates=Array.from({length:9},(_,i)=>({slug:`p${i+1}`}));
 const seen=new Set();
 for(let slot=0;slot<7;slot+=1){
   const batch=selectRotatingCandidates(candidates,{batchSize:5,anchorCount:2,slot});
   assert.equal(new Set(batch.selected.map(x=>x.slug)).size,batch.selected.length);
   for(const row of batch.selected) seen.add(row.slug);
 }
 assert.equal(seen.size,9);
});
