import test from 'node:test';
import assert from 'node:assert/strict';
import {sanitizeVariant,matchSelectedVariant} from './cj-variant-detail-enricher.mjs';

test('matches only exact selected variant id',()=>{
 const rows=[{vid:'a',variantSku:'A'},{vid:'b',variantSku:'B'}];
 assert.equal(matchSelectedVariant(rows,'b')?.variantSku,'B');
 assert.equal(matchSelectedVariant(rows,'c'),null);
});

test('sanitizes to bounded non-secret variant evidence fields',()=>{
 const out=sanitizeVariant({vid:'v1',variantSku:'SKU1',variantNameEn:'Gray 600g 30X40CM',variantWeight:120,variantSellPrice:1.79,secret:'do-not-copy'});
 assert.equal(out.vid,'v1');
 assert.equal(out.variantNameEn,'Gray 600g 30X40CM');
 assert.equal(out.variantWeight,120);
 assert.equal('secret' in out,false);
});
