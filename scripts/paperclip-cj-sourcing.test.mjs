import test from 'node:test';
import assert from 'node:assert/strict';
import {positiveNumber,chooseProduct,chooseStock} from './paperclip-cj-sourcing.mjs';

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
