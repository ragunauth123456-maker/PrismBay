import test from 'node:test';
import assert from 'node:assert/strict';
import {boardPublicationDecision} from './board-freshness.mjs';
const snapshot = (generatedAt,checkedAt) => ({generatedAt,tasks:[{worker:'Trend Scout'}],verifiedCJStatus:checkedAt?{checkedAt}:null});
const old='2026-09-27T01:00:00Z', newDate='2026-09-27T02:00:00Z';
test('stale growth report never overwrites newer supplier evidence',()=>{
  assert.deepEqual(boardPublicationDecision(snapshot(newDate,old),{checkedAt:newDate},null),{publish:false,reason:'newer_supplier_review_on_main'});
  assert.equal(boardPublicationDecision(snapshot(newDate,null),{checkedAt:old},null).publish,false);
});
test('older growth report never replaces a newer owner board',()=>{
  assert.equal(boardPublicationDecision(snapshot(old,old),{checkedAt:old},snapshot(newDate,old)).reason,'newer_worker_board_on_main');
});
test('fresh snapshot with same independently checked supplier report is accepted',()=>{
  assert.deepEqual(boardPublicationDecision(snapshot(newDate,newDate),{checkedAt:newDate},snapshot(old,old)),{publish:true,reason:'snapshot_current'});
});
test('malformed timestamps and absent worker tasks fail closed',()=>{
  assert.equal(boardPublicationDecision({generatedAt:'invalid',tasks:[]},null,null).publish,false);
  assert.equal(boardPublicationDecision({generatedAt:newDate},null,null).publish,false);
});
