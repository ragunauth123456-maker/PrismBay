/**
 * Public educational scoring, not procurement approval or a real-vendor rating.
 * This module runs entirely client-side and has no network, analytics or storage calls.
 */
export const QUESTIONS = Object.freeze([
  { id: "retention", label: "Data retention and deletion", prompt: "Does the supplier document which data it retains, for how long, and how deletion is verified?", evidence: "A dated retention schedule, deletion procedure and applicable contract clauses.", critical: true },
  { id: "training", label: "Model training and data use", prompt: "Are prompts, uploaded files and outputs protected by clear contractual training and secondary-use terms?", evidence: "Signed data-use terms, subprocessor list and relevant configuration evidence.", critical: true },
  { id: "location", label: "Data processing and transfers", prompt: "Do you have evidence of the countries, hosting providers and subprocessors that handle your data?", evidence: "Locations, transfer safeguards and the current subprocessor register.", critical: false },
  { id: "access", label: "Access controls and audit logs", prompt: "Can the supplier demonstrate least-privilege access, appropriate authentication and useful audit logs?", evidence: "Access-control documentation, relevant test evidence and sample audit records.", critical: false },
  { id: "incident", label: "Incident accountability", prompt: "Is there a named incident contact and a written notification, escalation and response process?", evidence: "Incident clauses, contact details, response plan and exercise results.", critical: false },
  { id: "export", label: "Data export and deletion test", prompt: "Have you tested how to export your data and confirm its deletion at contract termination?", evidence: "A reproducible export and deletion test using non-sensitive sample data.", critical: true },
  { id: "limits", label: "Model limitations", prompt: "Does the supplier document important failure cases, performance boundaries and evaluation methods?", evidence: "Relevant evaluations, release notes and known-limitations documentation.", critical: false },
  { id: "human", label: "Human approval and escalation", prompt: "Are irreversible or sensitive decisions subject to an accountable human approval process?", evidence: "A written approval matrix, escalation path and workflow test.", critical: true },
  { id: "cost", label: "Costs and exit rights", prompt: "Have you confirmed total operating costs, renewal terms, lock-in and the practical exit process?", evidence: "Priced proposal, signed contract, termination terms and exit plan.", critical: false },
  { id: "review", label: "Ongoing monitoring", prompt: "Is there an owner and schedule for testing performance, reviewing exceptions and updating controls?", evidence: "Baseline, acceptance criteria, monitoring plan and review calendar.", critical: false },
]);
export const EVIDENCE_LABELS = ["No evidence or unanswered", "Supplier claim or unreviewed documents", "Supporting evidence reviewed by a named owner"];
export function reviewAnswers(answers = {}) {
  const lines = QUESTIONS.map(q => {
    const value = answers[q.id];
    const score = value && Number.isInteger(value.score) && value.score >= 0 && value.score <= 2 ? value.score : null;
    return { ...q, score, note: typeof value?.note === "string" ? value.note.slice(0, 350).trim() : "" };
  });
  const answered = lines.filter(q => q.score !== null);
  const unresolvedCritical = lines.filter(q => q.critical && q.score !== 2);
  const nextActions = lines.filter(q => q.score !== 2).map(q => ({
    label: q.label,
    ask: q.evidence,
    critical: q.critical,
    status: q.score === null ? "Not assessed" : EVIDENCE_LABELS[q.score],
  }));
  return {
    lines, answeredCount: answered.length, totalCount: QUESTIONS.length,
    evidencePoints: answered.reduce((n,q) => n + q.score, 0),
    evidenceMax: answered.length * 2, unresolvedCritical, nextActions,
    readyToExport: answered.length === QUESTIONS.length,
  };
}
const safe = (value, max=180) => String(value ?? "").slice(0,max).replace(/[\r\n\t]+/g," ").replace(/[<>]/g,"").trim();
const safeMd = (value,max=180) => safe(value,max).replace(/[\\|*_\[\]#`]/g, "\\$&");
export function makeReport(answers = {}, info = {}, createdAt = new Date().toISOString()) {
  const review = reviewAnswers(answers);
  if(!review.readyToExport) throw new Error("Complete all 10 questions before exporting.");
  const vendor = safeMd(info.vendor || "Not supplied",120);
  const useCase = safeMd(info.useCase || "Not supplied",180);
  const date = /^\d{4}-\d{2}-\d{2}/.exec(String(createdAt))?.[0] || "Undated";
  const rows = [
    "# AI Vendor Evidence Review — Working Draft",
    "", "Generated from the free PrismBay AI educational worksheet. All answers are self-reported. This is neither a vendor rating nor approval for procurement or deployment.",
    "", "**Supplier:** "+vendor, "**Proposed use:** "+useCase, "**Review date:** "+date,
    "", "## Evidence coverage", "",
    "Reviewed-evidence points: "+review.evidencePoints+" of 20 across the ten selected responses. This measures only the evidence status indicated by the person completing this form. It does not measure real-world safety, compliance, supplier quality or expected returns.",
    "", "Items marked for critical follow-up: "+review.unresolvedCritical.length+". Even when all are marked reviewed, independent human assessment and all required organizational approvals remain necessary.",
    "", "## Evidence checklist", "",
    "| Topic | Self-reported status | Evidence / notes | Requested supporting material |",
    "|---|---|---|---|"
  ];
  for (const item of review.lines)
    rows.push("| "+safeMd(item.label,80)+" | "+safeMd(EVIDENCE_LABELS[item.score],80)+" | "+safeMd(item.note || "Not recorded",350)+" | "+safeMd(item.evidence,250)+" |");
  rows.push("", "## Follow-up items", "");
  if (!review.nextActions.length) rows.push("All ten items are marked evidence-reviewed by the author. Obtain independent specialist review; this checklist never approves a supplier.");
  else for(const item of review.nextActions)
    rows.push("- "+(item.critical ? "**Critical evidence follow-up:** " : "")+safeMd(item.label)+": "+safeMd(item.ask,260)+" ("+item.status+").");
  rows.push("", "## Human decision record", "", "**Decision owner:**", "", "**Independent security/privacy review:**", "", "**Outstanding contract or regulatory questions:**", "", "**Decision and rationale:**", "", "**Next scheduled reassessment:**", "", "This file remains on your device when downloaded. The browser worksheet sends no answer data to PrismBay AI.", "", "Free original educational worksheet: https://ragunauth123456-maker.github.io/PrismBay/", "");
  return rows.join("\n");
}
