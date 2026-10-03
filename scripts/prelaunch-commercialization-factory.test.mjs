import test from 'node:test';
import assert from 'node:assert/strict';
import {buildFactory,buildLaunchKit,buildSeoThemes} from './prelaunch-commercialization-factory.mjs';

test('builds evidence-bounded draft kit without activating publishing',()=>{
 const kit=buildLaunchKit({slug:'cloth',name:'Microfiber cloth kit',category:'automotive cleaning',evidence:['s1'],researchScore:92},{next:['verify stock'],promotionReady:false});
 assert.equal(kit.commercialMode,'draft_only_prelaunch');
 assert.equal(kit.channelPackages.every(x=>x.status!=='active'),true);
 assert.equal(kit.unresolvedCommercialGates.includes('verify stock'),true);
 assert.equal(kit.measurementPlan.success.includes('verified non-test paid order'),true);
});

test('seo themes stay generic and derived from product/category terms',()=>{
 const themes=buildSeoThemes({name:'Car seat headrest hooks',category:'automotive organization'});
 assert.ok(themes.some(x=>x.includes('Car seat headrest hooks')));
 assert.ok(themes.some(x=>x.includes('automotive organization')));
 assert.equal(themes.some(x=>/best|guaranteed|#1/i.test(x)),false);
});

test('factory merges sourcing queue and near-ready products without duplicates',()=>{
 const report=buildFactory({
   signals:{candidates:[{slug:'a',name:'A',category:'home',evidence:[]},{slug:'b',name:'B',category:'home',evidence:[]}]},
   opportunities:{sourcingQueue:[{slug:'a',name:'A',researchScore:90,next:['verify']}]},
   promotion:{nearReady:[{slug:'a',missing:['checkout']},{slug:'b',missing:['freight']}]},
 });
 assert.equal(report.kitCount,2);
 assert.deepEqual(report.kits.map(x=>x.slug),['a','b']);
 assert.equal(report.publicationEnabled,false);
 assert.equal(report.automaticListingEnabled,false);
});
