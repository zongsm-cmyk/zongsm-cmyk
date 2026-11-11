# Mhamed Askoure

**Python, FastAPI, Webhook & n8n Reliability Engineer | Scoped 24–48h Fixes & Verifiable Proofs**

I help engineering and operations teams isolate and fix failing backend endpoints, webhook pipelines, PostgreSQL bottlenecks, and broken n8n workflows—shipping a clean code patch, reproducible verification tests (`pytest` / `curl` / synthetic webhook payloads), and a clear runbook.

## Direct Scoped Engineering Fix ($100–$150 USD · 24–48h Milestone)

- **Scope:** One failing FastAPI/Python endpoint, webhook handler (HMAC verification, idempotency, retries), slow PostgreSQL query, Pydantic schema/LLM JSON validation error, or broken n8n workflow.
- **Verification:** Reproducible test harness + staging/local pass proof delivered before milestone handoff.
- **How to start:** Email [`zongsm@gmail.com`](mailto:zongsm@gmail.com?subject=Scoped%20Backend%2FWebhook%20Fix) or book via [Contra Fixed-Scope Service ($150)](https://contra.com/s/YeUP6oqq-fast-api-webhook-and-n8n-reliability-fix-48h). No upfront fee to review your brief; acceptance criteria, timeline, and PayPal Invoice / Contra milestone are agreed before work begins.
- **Profiles:** [LinkedIn](https://www.linkedin.com/in/mhamed-askoure-1b02b7438/) · [Contra](https://contra.com/mhamed_askoure_rdcfquvb/work) · [Upwork](https://www.upwork.com/freelancers/~01f95546c501a4254e)

## Verifiable Live & Open-Source Proofs

- **Live AWS Lambda FastAPI Swagger UI:** https://7hjfrxuwyxgke2h7fqhaubykda0benzq.lambda-url.us-east-1.on.aws/docs
- **[LLM Reliability Rescue Demo](https://github.com/zongsm-cmyk/llm-reliability-rescue-demo)** (`CI` passing · FastAPI + strict Pydantic v2 + explicit error states + 11/11 regression tests)
- **[Agent Runaway Guard Demo](https://github.com/zongsm-cmyk/agent-runaway-guard-demo)** (pre-dispatch tool-loop detection, retry/spend ceilings, deterministic stop conditions)
- **[CRM Webhook Reliability Proof](https://github.com/zongsm-cmyk/zongsm-cmyk/blob/main/resources/fde/crm-webhook-proof/README.md)** (idempotent batch ingestion, CSV formula sanitization, 18/18 Python regression tests)
- **[Go-Hybrid Compiler CI Proof](https://github.com/zongsm-cmyk/Go-Hybrid/actions/runs/40126865308)**

---

## What I work on

- AI workflow automation and integration
- Python + FastAPI
- REST APIs, webhooks and system handoffs
- LLM API integrations and structured output reliability
- Agent guardrails, bounded retries and stop conditions
- Pydantic v2 and JSON Schema validation
- Regression testing with pytest
- Docker / AWS Lambda / cloud deployment
- Workflow reliability, observability and failure recovery

## Featured public engineering proof

### [LLM Reliability Rescue](https://github.com/zongsm-cmyk/llm-reliability-rescue-demo)

[![CI](https://github.com/zongsm-cmyk/llm-reliability-rescue-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/zongsm-cmyk/llm-reliability-rescue-demo/actions/workflows/ci.yml)

A self-built public engineering proof for unreliable structured LLM output.

It demonstrates:

- safe JSON extraction without `eval` or fabricated repair
- strict Pydantic v2 validation
- explicit structured error states
- FastAPI endpoints
- Docker support
- AWS Lambda deployment
- **11/11 public regression tests passing**

**Live API docs:**  
https://7hjfrxuwyxgke2h7fqhaubykda0benzq.lambda-url.us-east-1.on.aws/docs

### [Agent Runaway Guard](https://github.com/zongsm-cmyk/agent-runaway-guard-demo)

A runnable public proof for containing common agent failure modes before dispatch.

It focuses on:

- repeated identical tool-call detection
- bounded execution
- projected LLM-spend controls
- explicit stop conditions
- testable guard behavior

### [CRM webhook reliability — offline proof](https://github.com/zongsm-cmyk/zongsm-cmyk/blob/main/resources/fde/crm-webhook-proof/README.md)

A self-contained example of idempotent **single-batch** contact imports, data validation, CSV formula defenses and audit-safe error reporting. **18/18 local Python regression tests passed (25 Oct 2026)**; not a live CRM integration or paid-client reference. [Review the tested source and limitations](https://github.com/zongsm-cmyk/zongsm-cmyk/blob/main/resources/fde/crm-webhook-proof/README.md).

### [Askoure Systems — Commercial Proof Portfolio](https://askoure-systems.floot.app)

A public portfolio of sanitized, real engineering and operations proofs.

Current case studies:

- **[Automation Reliability Proof](https://askoure-systems.floot.app/proof/reliability)** — verified cloud-to-browser acceptance facts, serialization, persistent session continuity, fail-closed binding checks and regression gating.
- **[Connector-First Outreach Operations](https://askoure-systems.floot.app/proof/outreach-ops)** — research → enrichment → one-to-one outreach → booking CTA → reply/bounce monitoring, with clear boundaries between sent state and actual conversion.
- **[Recovery Engineering](https://github.com/zongsm-cmyk/zongsm-cmyk/blob/main/proofs/recovery-engineering.md)** — evidence-led incident isolation that preserves known-good controls instead of rebuilding a healthy core.
- **[Deployment Runtime Verification](https://github.com/zongsm-cmyk/zongsm-cmyk/blob/main/proofs/deployment-runtime-verification.md)** — a real cloud deployment case showing why saved configuration, deployment status and actual serving runtime must be verified separately.
- **[LLM Structured Output Reliability](https://github.com/zongsm-cmyk/zongsm-cmyk/blob/main/proofs/llm-structured-output-reliability.md)** — a focused case study on safe extraction, strict Pydantic contracts, explicit failure states and regression testing for model outputs.

Private implementation details, secrets, session identifiers and proprietary control-stack internals are intentionally not published.

## Free practical resources

- **[Free n8n workflow export preflight checklist](resources/gumroad/n8n-workflow-export-preflight-checklist.md)** — a practical ten-step manual review of JSON exports, credential rebinding, dependencies and safe client handoff. No signup; optional independent local auditor is clearly disclosed.
- **[Free overdue-invoice follow-up plan + email sample](resources/gumroad/invoice-followup-5-minute-plan.md)** — a five-minute manual workflow: verify invoice facts, ask for a confirmed payment date, track next action and handle disputes without aggressive templates. No signup; optional clearly disclosed paid kit.
- **[Open-source Landing Page Release Checker (Python)](https://github.com/zongsm-cmyk/zongsm-cmyk/blob/main/resources/LANDING_PAGE_QA_README.md)** — a bounded, read-only 13-check command-line tool for page metadata, server rendering, sitemap discovery, affiliate disclosure, and external-link hygiene; includes executable offline fixtures.
- **[Landing Page Self-Audit — free interactive tool](https://askoure-systems.floot.app/tools/landing-page-audit)** — a ten-point self-check of message clarity, mobile readiness, working forms, privacy and conversion measurement, with a personalized fix list. No login required.
- **[How to Create a Free Lead-Capture Page in systeme.io](https://askoure-systems.floot.app/guides/systeme-io-free-landing-page)** — independent step-by-step setup guide with a free downloadable copy-and-QA kit. The guide discloses its affiliate relationship.
- **[Créer une page de capture gratuite avec systeme.io (français)](https://askoure-systems.floot.app/fr/guide-page-capture-gratuite-systeme-io)** — guide pratique en français, exemples pour indépendants et entreprises de services, modèle et checklist gratuits. L'article précise les liens d'affiliation.
- **[2026 Moroccan blue zellige & small-space decor guide](resources/etsy/2026-moroccan-blue-zellige-small-space-decor-guide.md)** — five renter-friendly wall-art ideas inspired by clearly dated Pinterest trend data, with accurate digital-only disclosures and the [existing Etsy shop](https://www.etsy.com/shop/ALFAROUQWorks).
- **[Free 4×6 / 5×7 printable art printing guide](resources/etsy/small-printable-art-printing-guide.md)** — avoid accidental cropping, choose the matching JPG, understand DPI-versus-image-detail, and see the current [ALFAROUQWorks Etsy shop](https://www.etsy.com/shop/ALFAROUQWorks). Digital downloads only; current shop availability should be checked on Etsy.

## Developer kits

The public proofs above have packaged commercial versions for teams that want the runnable implementation, tests, documentation, and handoff material rather than rebuilding the reliability layer from scratch.

- **[LLM Reliability Rescue Kit — $19](https://mhamedasskoure.gumroad.com/l/llm-reliability-rescue-kit)** — Python/FastAPI structured-output validation, strict Pydantic contracts, CLI tooling, regression corpus, tests, CI, and production guidance.
- **[Agent Runaway Guard Kit — $24](https://mhamedasskoure.gumroad.com/l/agent-runaway-guard-kit)** — local Python guardrails for repeated tool calls, cyclic loops, retry storms, token/API-cost boundaries, replay testing, and CI regression gates.
- **[n8n Workflow Preflight Auditor — $9](https://mhamedasskoure.gumroad.com/l/n8n-workflow-preflight-auditor?utm_source=github&utm_medium=organic&utm_campaign=profile_developer_kits)** — an offline structural review for exported workflow JSON plus setup and handoff checks; it does not execute workflows or certify runtime security.
- **[Automation ROI Scenario Planner — $9](https://mhamedasskoure.gumroad.com/l/automation-roi-scenario-planner-offline?utm_source=github&utm_medium=organic&utm_campaign=profile_developer_kits)** — standalone offline HTML kit for a three-scenario workflow business case, operating/setup costs, CSV export, printable report and pilot brief. The [free online estimator](https://automation-roi-calculator.floot.app/) remains available without signing up.

## How I approach automation and rescue work

1. Reproduce or measure one concrete problem.
2. Define the expected contract or outcome.
3. Isolate the smallest failing component.
4. Add the smallest reliable fix.
5. Make failures explicit instead of silently inventing data.
6. Lock behavior with focused regression tests.
7. Document the handoff and keep known-good controls intact.

## Work with me

- **Direct Scoped Engineering Inquiries:** [`zongsm@gmail.com`](mailto:zongsm@gmail.com?subject=Scoped%20Backend%2FWebhook%20Fix)
- **Fixed-Scope 48h Service (Contra):** https://contra.com/s/YeUP6oqq-fast-api-webhook-and-n8n-reliability-fix-48h
- **Askoure Systems:** https://askoure-systems.floot.app
- **Upwork:** https://www.upwork.com/freelancers/~01f95546c501a4254e
- **Fiverr:** https://www.fiverr.com/mhamedaskoure
- **LinkedIn:** https://www.linkedin.com/in/mhamed-askoure-1b02b7438/

---

**Current focus:** AI Automation · Python · FastAPI · APIs/Webhooks · LLM Reliability · Agent Guardrails · pytest · Docker · AWS
