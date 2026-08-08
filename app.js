"use strict";

const QUESTIONS = [
  {
    id: "external_actions",
    title: "External actions are enumerated",
    help: "Every message, payment, contract, record mutation, and third-party call is named.",
    critical: true,
    remedy: "Inventory each external action and bind it to an explicit authority class."
  },
  {
    id: "named_owner",
    title: "A human owner is named",
    help: "One person owns pause, escalation, and final authority decisions.",
    critical: true,
    remedy: "Assign a named owner and document how the workflow reaches them."
  },
  {
    id: "message_boundary",
    title: "Customer messages default to draft-only",
    help: "Generated customer content cannot leave without the intended approval boundary.",
    critical: true,
    remedy: "Separate content generation from transport and keep transport disabled by default."
  },
  {
    id: "money_boundary",
    title: "Money movement has a hard ceiling",
    help: "Spend, charges, refunds, and paid APIs have explicit limits and refusal behavior.",
    critical: true,
    remedy: "Set transaction and period caps that refuse before credentials or provider calls."
  },
  {
    id: "contract_boundary",
    title: "Contract acceptance remains explicit",
    help: "The workflow cannot accept terms, sign agreements, or widen scope by inference.",
    critical: true,
    remedy: "Route every contract or terms-acceptance step to a named human decision."
  },
  {
    id: "unknown_state",
    title: "Unknowable states report Unknown",
    help: "A failed probe or unreadable source never becomes a pass, zero, or down status.",
    critical: true,
    remedy: "Add an explicit Unknown state and block consequential actions when evidence is unreadable."
  },
  {
    id: "idempotency",
    title: "Retries cannot duplicate effects",
    help: "Stable keys and retrieve-before-retry behavior cover every external mutation.",
    critical: true,
    remedy: "Bind mutations to stable idempotency keys and inspect provider state before retry."
  },
  {
    id: "receipts",
    title: "Actions produce durable receipts",
    help: "Receipts record what was attempted, what happened, and the external identifier.",
    critical: false,
    remedy: "Persist a receipt for each attempt, including uncertainty and provider identifiers."
  },
  {
    id: "attribution",
    title: "Outcomes trace to their trigger",
    help: "Source, workflow, decision, action, and commercial outcome share a stable path identity.",
    critical: false,
    remedy: "Carry one path identity from trigger through action and business outcome."
  },
  {
    id: "environment_separation",
    title: "Test and production are separated",
    help: "Credentials, data, webhooks, and payment environments cannot silently cross.",
    critical: false,
    remedy: "Separate credentials and assert environment identity at every ingress and egress."
  },
  {
    id: "recovery_drill",
    title: "Recovery has been exercised",
    help: "A recent drill proves pause, replay, and resume without lost or duplicate effects.",
    critical: false,
    remedy: "Run a bounded recovery drill and retain its measured replay and duplication evidence."
  },
  {
    id: "kill_switch",
    title: "A tested stop path exists",
    help: "A human can halt new work and contain in-flight actions without relying on the model.",
    critical: true,
    remedy: "Implement a non-model stop control and test it against an in-flight workflow."
  }
];

const ANSWERS = [
  { value: "supported", label: "Supported" },
  { value: "gap", label: "Gap" },
  { value: "unknown", label: "Unknown" }
];

const form = document.querySelector("#assessment-form");
const questionList = document.querySelector("#question-list");
const results = document.querySelector("#results");
const notes = document.querySelector("#assessment-notes");
let currentReport = null;

function buildQuestions() {
  QUESTIONS.forEach(function (question, index) {
    const row = document.createElement("fieldset");
    row.className = "question";
    row.dataset.questionId = question.id;

    const legend = document.createElement("legend");
    legend.className = "sr-only";
    legend.textContent = question.title;
    row.appendChild(legend);

    const number = document.createElement("span");
    number.className = "question-number";
    number.textContent = String(index + 1).padStart(2, "0");
    row.appendChild(number);

    const copy = document.createElement("div");
    copy.className = "question-copy";
    const title = document.createElement("strong");
    title.textContent = question.title;
    const help = document.createElement("small");
    help.textContent = question.help;
    copy.append(title, help);
    row.appendChild(copy);

    const group = document.createElement("div");
    group.className = "answer-group";
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", question.title);

    ANSWERS.forEach(function (answer) {
      const input = document.createElement("input");
      input.type = "radio";
      input.name = question.id;
      input.id = question.id + "-" + answer.value;
      input.value = answer.value;

      const label = document.createElement("label");
      label.htmlFor = input.id;
      label.textContent = answer.label;
      group.append(input, label);
    });

    row.appendChild(group);
    questionList.appendChild(row);
  });
}

function answerFor(question) {
  const selected = form.querySelector('input[name="' + question.id + '"]:checked');
  return selected ? selected.value : "unknown";
}

function makeReport() {
  const controls = QUESTIONS.map(function (question) {
    return {
      id: question.id,
      control: question.title,
      result: answerFor(question),
      critical: question.critical,
      next_step: question.remedy
    };
  });

  const counts = controls.reduce(function (total, control) {
    total[control.result] += 1;
    return total;
  }, { supported: 0, gap: 0, unknown: 0 });

  const criticalFailures = controls.filter(function (control) {
    return control.critical && control.result !== "supported";
  });
  const allFindings = controls.filter(function (control) {
    return control.result !== "supported";
  });

  let posture = "review";
  let title = "Evidence-supported review";
  let summary = "All listed controls are supported by your answers. Independently validate the evidence before granting or widening production authority.";

  if (criticalFailures.length > 0 || counts.gap > 0) {
    posture = "hold";
    title = "Hold consequential authority";
    summary = "One or more authority, failure, or recovery controls need work before this workflow should gain consequential production access.";
  } else if (counts.unknown > 0) {
    posture = "unknown";
    title = "Evidence needed";
    summary = "No explicit gap was selected, but missing evidence prevents a supported result. Keep consequential authority closed until the unknowns are resolved.";
  }

  return {
    schema: "usta.revenue-workflow-guardrail-assessment.v1",
    generated_at: new Date().toISOString(),
    tool_url: "https://ustechautomations.github.io/revenue-workflow-guardrail-checker/",
    posture: posture,
    title: title,
    summary: summary,
    counts: counts,
    controls: controls,
    findings: allFindings,
    note: notes.value.trim(),
    disclaimer: "Structured screening only; not a security audit, legal opinion, certification, or production approval."
  };
}

function renderReport(report) {
  document.querySelector("#result-title").textContent = report.title;
  document.querySelector("#result-summary").textContent = report.summary;
  document.querySelector("#count-supported").textContent = String(report.counts.supported);
  document.querySelector("#count-gaps").textContent = String(report.counts.gap);
  document.querySelector("#count-unknown").textContent = String(report.counts.unknown);

  const badge = document.querySelector("#result-badge");
  badge.className = "result-badge " + report.posture;
  badge.textContent = report.posture === "review" ? "Review evidence" : report.posture;

  const list = document.querySelector("#finding-list");
  list.replaceChildren();
  if (report.findings.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No listed gap. Verify the supporting artifacts and exercise recovery before launch.";
    list.appendChild(item);
  } else {
    report.findings.slice(0, 6).forEach(function (finding) {
      const item = document.createElement("li");
      const label = document.createElement("strong");
      label.textContent = finding.control + ": ";
      item.append(label, finding.next_step);
      list.appendChild(item);
    });
  }

  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

function refreshReportNote() {
  if (!currentReport) return;
  currentReport.note = notes.value.trim();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  currentReport = makeReport();
  renderReport(currentReport);
});

form.addEventListener("reset", function () {
  window.setTimeout(function () {
    currentReport = null;
    notes.value = "";
    results.hidden = true;
  }, 0);
});

notes.addEventListener("input", refreshReportNote);

document.querySelector("#download-report").addEventListener("click", function () {
  if (!currentReport) return;
  refreshReportNote();
  const body = JSON.stringify(currentReport, null, 2) + "\n";
  const blob = new Blob([body], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "revenue-workflow-guardrail-assessment.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
});

document.querySelector("#print-report").addEventListener("click", function () {
  window.print();
});

buildQuestions();
