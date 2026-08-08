# Revenue Workflow Guardrail Checker

[Open the free checker](https://ustechautomations.github.io/revenue-workflow-guardrail-checker/)

A browser-only assessment for operations leads and engineering managers putting AI workflows near customer messages, payments, contracts, or authoritative business records.

The checker:

- makes Unknown an explicit result instead of silently passing missing evidence;
- covers authority, idempotency, receipts, attribution, environment separation, recovery, and stop controls;
- creates a portable JSON assessment in the browser; and
- sends no assessment answers to a server.

## Paid review offer

The page also tests demand for a fixed-scope Revenue Workflow Guardrail Review: one workflow, up to five external action types, a written control packet, and a fixed price of $750 once. The page accepts no payment or order. A buyer can [request availability from U.S. Tech Automations](https://ustechautomations.com/partner?interest=revenue-workflow-guardrail-review&utm_source=github&utm_medium=repository&utm_campaign=revenue-workflow-guardrail-checker).

## Local verification

Run:

    node --check app.js
    node scripts/verify.mjs

Then serve the directory with any static file server. No build step or dependency install is required.

## Boundaries

This is a structured screening tool, not a security audit, legal opinion, certification, or production approval. Answers stay in the current browser unless the user downloads or prints them.

MIT licensed.
