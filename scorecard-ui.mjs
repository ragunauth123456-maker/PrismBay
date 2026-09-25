import { QUESTIONS, EVIDENCE_LABELS, reviewAnswers, makeReport } from "./scorecard-core.mjs";

const form = document.getElementById("assessment");
const questionRoot = document.getElementById("questions");
const results = document.getElementById("results");
const actions = document.getElementById("actions");
const progressLabel = document.getElementById("progress-label");
const progressTrack = document.getElementById("progress-track");
const progressBar = document.getElementById("progress-bar");
const errorBox = document.getElementById("assessment-error");

const el = (tag, className, value) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
};

QUESTIONS.forEach((q, index) => {
  const fieldset = el("fieldset", "question");
  fieldset.id = "section-" + q.id;
  const legend = el("legend", "", (index + 1) + ". " + q.label);
  if (q.critical) {
    const tag = el("span", "required", "Priority evidence");
    legend.append(tag);
  }
  fieldset.append(legend);
  fieldset.append(el("p", "prompt", q.prompt));
  const choices = el("div", "options");
  choices.setAttribute("role", "group");
  choices.setAttribute("aria-label", q.label + " evidence status");
  EVIDENCE_LABELS.forEach((label, score) => {
    const row = el("label", "option");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "q-" + q.id;
    input.value = String(score);
    input.required = true;
    input.setAttribute("aria-label", label);
    row.append(input, el("span", "", label));
    choices.append(row);
  });
  fieldset.append(choices);
  const noteWrap = el("div", "evidence");
  const noteLabel = el("label", "", "Brief evidence note (optional)");
  const area = document.createElement("textarea");
  area.id = "note-" + q.id;
  area.maxLength = 350;
  area.placeholder = "Document reviewed, dated test, reviewer and/or an evidence gap";
  noteLabel.htmlFor = area.id;
  noteWrap.append(noteLabel, area, el("small", "", "Avoid credentials, personal information and confidential contract details."));
  fieldset.append(noteWrap);
  questionRoot.append(fieldset);
});

function values() {
  return Object.fromEntries(QUESTIONS.map(q => {
    const selected = form.querySelector('input[name="q-' + q.id + '"]:checked');
    const note = document.getElementById("note-" + q.id).value;
    return [q.id, { score: selected ? Number(selected.value) : null, note }];
  }));
}
function updateProgress() {
  const reviewed = reviewAnswers(values());
  progressLabel.textContent = reviewed.answeredCount + " of " + reviewed.totalCount + " questions answered";
  progressTrack.setAttribute("aria-valuenow", String(reviewed.answeredCount));
  progressBar.style.width = (reviewed.answeredCount / reviewed.totalCount * 100) + "%";
}
function markReportStale() {
  results.hidden = true;
  errorBox.hidden = true;
}
form.addEventListener("change", () => { updateProgress(); markReportStale(); });
form.addEventListener("input", markReportStale);
["vendor", "usecase"].forEach(id => document.getElementById(id).addEventListener("input", markReportStale));

let lastReport = "";
form.addEventListener("submit", event => {
  event.preventDefault();
  const answers = values();
  const review = reviewAnswers(answers);
  if (!review.readyToExport) {
    results.hidden = true;
    errorBox.hidden = false;
    const firstMissing = review.lines.find(q => q.score === null);
    if (firstMissing) {
      document.getElementById("section-" + firstMissing.id).scrollIntoView({ behavior: "smooth", block: "center" });
      form.querySelector('input[name="q-' + firstMissing.id + '"]').focus({ preventScroll: true });
    }
    return;
  }
  errorBox.hidden = true;
  lastReport = makeReport(answers, {
    vendor: document.getElementById("vendor").value,
    useCase: document.getElementById("usecase").value,
  });
  document.getElementById("result-count").textContent =
    "Self-reported evidence coverage: " + review.evidencePoints +
    " of 20 possible reviewed-evidence points. Priority follow-ups: " +
    review.unresolvedCritical.length + " of " + QUESTIONS.filter(q => q.critical).length + ".";
  actions.replaceChildren();
  if (!review.nextActions.length) {
    const li = el("li", "", "You marked evidence as reviewed for all ten topics. An independent reviewer still needs to check actual documents and approve any resulting decision.");
    actions.append(li);
  } else {
    for (const action of review.nextActions) {
      const li = el("li");
      const heading = el("strong", "", (action.critical ? "Priority follow-up: " : "") + action.label + ". ");
      li.append(heading, document.createTextNode(action.ask + " Current status: " + action.status + "."));
      actions.append(li);
    }
  }
  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
});
document.getElementById("download").addEventListener("click", () => {
  if (!lastReport || results.hidden) return;
  const blob = new Blob([lastReport], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "prismbay-ai-vendor-evidence-review.md";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
});
document.getElementById("print").addEventListener("click", () => {
  if (!results.hidden) window.print();
});
form.addEventListener("reset", () => {
  lastReport = "";
  results.hidden = true;
  errorBox.hidden = true;
  setTimeout(updateProgress, 0);
});
updateProgress();
