import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEvidencePriority } from './decision-evidence-priority.mjs';

test('ranks commercial gate evidence above low-leverage evidence',()=>{
  const board=buildEvidencePriority({
    growthBoard:{productRace:[{slug:'crevice',lane:'primary',missing:['final_zip_freight','checkout','creative']}]},
    evidenceLedger:{items:[{companyId:'creative-studio',evidenceGap:'creative_hypothesis_mapping'}]},
    tournament:{hypothesisLedger:[{id:'seo-crevice',owner:'organic-growth',evidenceGate:'search asset published only when product facts are verified'}]}
  });
  assert.equal(board.immediateTopFive[0].evidence,'final_zip_freight');
  assert.ok(board.immediateTopFive.some(x=>x.evidence==='checkout'));
});

test('never fabricates closure and keeps explicit evidence rows',()=>{
  const board=buildEvidencePriority({growthBoard:{productRace:[{slug:'x',lane:'primary',missing:['supplier_identity']}]},evidenceLedger:{items:[]},tournament:{hypothesisLedger:[]}});
  assert.equal(board.topDecisionEvidence[0].subject,'x');
  assert.match(board.rule,/No missing fact may be invented/i);
});
