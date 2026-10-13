# SentinelOS

**SentinelOS is a continuous PCI/PII compliance control tower.** It turns regulatory language into executable obligations, maps obligations to reusable Control DNA, monitors sensitive-data exposure inside a privacy boundary, challenges its own conclusions, and produces audit-ready evidence.

This repository is a self-contained, dependency-free demo that runs locally in a browser. It is designed to make the agentic workflow visible during a pitch without requiring cloud credentials or a live customer data connection.

## Product walkthrough

1. Open **Overview** to see the live compliance twin, posture trend, priority queue and agent event stream.
2. Click **Simulate violation** to inject a safe synthetic card-like value into the observability stream. The UI shows local detection, masking and a new critical finding.
3. Open **Findings** to inspect the evidence chain, confidence score and agent-generated remediation plan.
4. Open **Regulatory intelligence** to see the Regulation Compiler turn PCI DSS 6.4.3 into an obligation and impact map.
5. Open **Evidence center** and generate an audit package with source-linked evidence and provenance.
6. Open **Remediation** to show the prioritized plan and the human approval boundary.

## Product ideas represented in the demo

- **Regulatory Change Compiler:** human-readable regulatory text becomes structured obligations, controls and evidence requirements.
- **Compliance Digital Twin:** regulations, controls, assets, vendors, evidence and findings are linked through the interface.
- **Privacy boundary:** raw PCI/PII values are detected locally and only masked metadata is available to the reasoning layer.
- **Compliance chaos engineering:** a synthetic violation proves that a control actually fires.
- **Adversarial review:** findings carry a review trail rather than an unexplained model answer.
- **Evidence freshness:** artifacts have a current/stale lifecycle instead of being treated as permanently valid.
- **Agent-based remediation:** the queue is sequenced by blast radius, owner, evidence and dependencies.

## Run locally

Requires Node.js 18+.

```bash
npm run dev
```

Then open <http://localhost:4173>.

## Checks

```bash
npm run check
```

The check validates the JavaScript syntax for the browser app and local server. The demo intentionally uses no npm runtime dependencies, so it can be cloned and presented quickly.

## Production extension path

The UI is intentionally decoupled from the future service layer. The next production increment would replace the in-memory demo state with:

- FastAPI or Node API for findings, controls, evidence and agent runs
- PostgreSQL plus pgvector for control/evidence state and retrieval
- Presidio or a local DLP scanner before any LLM call
- An event bus for logs, transactions and configuration changes
- Connectors for cloud inventory, Jira/ServiceNow, GitHub and vendor systems
- A policy-as-code executor with read-only, approval-required and blocked tool permissions

The app should not be connected to real cardholder data without implementing that privacy boundary and the approval model first.
