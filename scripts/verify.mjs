import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
const js = await readFile(new URL("../app.js", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../sitemap.xml", import.meta.url), "utf8");
const offer = await readFile(
  new URL("../offers/revenue-workflow-guardrail-review/index.html", import.meta.url),
  "utf8"
);

const requiredHtml = [
  "Revenue Workflow Guardrail Checker",
  "Your assessment never leaves this browser.",
  "$750",
  "five business days",
  'href="offers/revenue-workflow-guardrail-review/"',
  'meta name="robots" content="index,follow"',
  'link rel="canonical" href="https://ustechautomations.github.io/revenue-workflow-guardrail-checker/"'
];

for (const marker of requiredHtml) {
  if (!html.includes(marker)) {
    throw new Error("missing HTML marker: " + marker);
  }
}

// The priced CTA must reach a destination that knows which product the reader
// came to buy. It previously pointed at the generic marketing contact form,
// which returns byte-identical HTML for every `?interest=` value — so a buyer
// who clicked "$750" arrived stamped as a general enquiry and the demand test
// this page exists to run could not take a reading. Every other check was
// green throughout: the page was 200, carried its markers and sat in the
// sitemap. Reaching a destination is not the same as the destination knowing
// what was requested.
if (html.includes("partner?interest=") || offer.includes("partner?interest=")) {
  throw new Error("priced CTA must not route to the generic contact form");
}

const requiredOffer = [
  "revenue-workflow-guardrail-review",
  "$750",
  "no payment is accepted here",
  "not an order",
  'link rel="canonical" href="https://ustechautomations.github.io/revenue-workflow-guardrail-checker/offers/revenue-workflow-guardrail-review/"'
];

for (const marker of requiredOffer) {
  if (!offer.includes(marker)) {
    throw new Error("missing offer-page marker: " + marker);
  }
}

if (!sitemap.includes("/offers/revenue-workflow-guardrail-review/")) {
  throw new Error("the request page must be in the sitemap");
}

const questionCount = (js.match(/id: "[a-z_]+"/g) || []).length;
if (questionCount !== 12) {
  throw new Error("expected 12 controls, found " + questionCount);
}

if (!js.includes('answerFor(question)') || !js.includes('return selected ? selected.value : "unknown"')) {
  throw new Error("unanswered controls must resolve to Unknown");
}

if (
  html.includes('href="http://') ||
  html.includes('"url": "http://') ||
  /<loc>http:\/\//.test(sitemap)
) {
  throw new Error("public URLs must use HTTPS");
}

if (!css.includes("@media (max-width: 680px)") || !css.includes("@media print")) {
  throw new Error("responsive and printable views are required");
}

console.log(JSON.stringify({
  ok: true,
  controls: questionCount,
  uploads: 0,
  price_usd: 750,
  delivery_business_days: 5
}));
