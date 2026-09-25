import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { QUESTIONS, EVIDENCE_LABELS, reviewAnswers, makeReport } from "./scorecard-core.mjs";
const populated = score => Object.fromEntries(QUESTIONS.map(q => [q.id,{score, note:"Dated supporting evidence reviewed"}]));
test("the public checklist contains ten unique, substantive topics", () => {
  assert.equal(QUESTIONS.length,10);
  assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,10);
  assert.equal(EVIDENCE_LABELS.length,3);
  assert.ok(QUESTIONS.filter(q=>q.critical).length >= 3);
  for(const q of QUESTIONS){ assert.ok(q.prompt.length > 50); assert.ok(q.evidence.length > 35); }
});
test("unanswered items are not silently treated as zero", () => {
  const r=reviewAnswers({});
  assert.equal(r.answeredCount,0);
  assert.equal(r.evidencePoints,0);
  assert.equal(r.evidenceMax,0);
  assert.equal(r.readyToExport,false);
  assert.equal(r.unresolvedCritical.length,QUESTIONS.filter(q=>q.critical).length);
  assert.throws(()=>makeReport({}),/Complete all 10/);
});
test("zero is an explicit answer, not a missing one", () => {
  const r=reviewAnswers(populated(0));
  assert.equal(r.answeredCount,10);
  assert.equal(r.evidencePoints,0);
  assert.equal(r.evidenceMax,20);
  assert.equal(r.readyToExport,true);
  assert.equal(r.nextActions.length,10);
});
test("critical evidence remains a follow-up even with a high total", () => {
  const a=populated(2);
  a.retention.score=0;
  const r=reviewAnswers(a);
  assert.equal(r.evidencePoints,18);
  assert.equal(r.unresolvedCritical.length,1);
  assert.equal(r.unresolvedCritical[0].id,"retention");
  assert.ok(r.nextActions.find(x=>x.label==="Data retention and deletion")?.critical);
});
test("the report never interprets self-reported evidence as procurement approval", () => {
  const r=reviewAnswers(populated(2));
  assert.equal(r.evidencePoints,20);
  assert.equal(r.nextActions.length,0);
  assert.equal(r.unresolvedCritical.length,0);
  const text=makeReport(populated(2),{vendor:"Fictional Vendor",useCase:"Drafting internal checklists"},"2026-09-24T12:00:00Z");
  assert.match(text,/neither.*nor approval/i);
  assert.match(text,/independent.*review/i);
  assert.match(text,/human decision record/i);
  assert.match(text,/Fictional Vendor/);
  assert.ok(text.includes("2026-09-24"));
});
test("adversarial notes are escaped and cannot create markdown table rows", () => {
  const answers=populated(1);
  answers.export.note="Test | ###\n<script>alert(1)</script>\n";
  const report=makeReport(answers,{vendor:"A|B\n<script>alert(2)</script>",useCase:"Test"}, "2026-09-24");
  assert.ok(!report.includes("<script>"));
  assert.ok(!report.includes("\n<script>"));
  assert.ok(report.includes("\\|"));
  assert.equal(report.match(/^\| Data export and deletion test \|/gm)?.length,1);
});
test("static site is private-by-design and links to the same free resource and optional support", () => {
  const html=fs.readFileSync(new URL("./scorecard.html",import.meta.url),"utf8");
  const ui=fs.readFileSync(new URL("./scorecard-ui.mjs",import.meta.url),"utf8");
  assert.ok(html.includes("scorecard-ui.mjs"));
  assert.ok(html.includes('id="results"'));
  assert.ok(html.includes('id="assessment"'));
  assert.ok(html.includes("aFa3cw0jweEMfCn2xs2400H"));
  assert.ok(html.includes("remains completely free"));
  assert.ok(!/google-analytics|gtag\(|localStorage|sessionStorage|fetch\(/.test(html+ui));
  assert.ok(!ui.includes("innerHTML"));
  assert.ok(ui.includes("URL.createObjectURL"));
});
