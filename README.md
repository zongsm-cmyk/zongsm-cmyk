# Mhamed Askoure

**AI Automation & Python Developer focused on reliable LLM, agent and workflow systems.**

I build practical automation around Python/FastAPI, REST APIs and webhooks, structured LLM outputs, workflow orchestration, browser/document automation, cloud deployment, validation, retries, idempotency and regression testing.

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

- **[شرح عربي: إنشاء صفحة مجانية لجذب العملاء باستخدام systeme.io](https://github.com/zongsm-cmyk/zongsm-cmyk/blob/main/resources/systeme-free-funnel-ar.md)** — خطوات عملية بالعربية وقائمة تحقق مجانية لأصحاب المشاريع الصغيرة. يتضمن رابط إحالة مع إفصاح واضح.

- **[Open-source Landing Page Release Checker (Python)](https://github.com/zongsm-cmyk/zongsm-cmyk/blob/main/resources/LANDING_PAGE_QA_README.md)** — a bounded, read-only 13-check command-line tool for page metadata, server rendering, sitemap discovery, affiliate disclosure, and external-link hygiene; includes executable offline fixtures.

- **[Landing Page Self-Audit — free interactive tool](https://askoure-systems.floot.app/tools/landing-page-audit)** — a ten-point self-check of message clarity, mobile readiness, working forms, privacy and conversion measurement, with a personalized fix list. No login required.
- **[How to Create a Free Lead-Capture Page in systeme.io](https://askoure-systems.floot.app/guides/systeme-io-free-landing-page)** — independent step-by-step setup guide with a free downloadable copy-and-QA kit. The guide discloses its affiliate relationship.
- **[Créer une page de capture gratuite avec systeme.io (français)](https://askoure-systems.floot.app/fr/guide-page-capture-gratuite-systeme-io)** — guide pratique en français, exemples pour indépendants et entreprises de services, modèle et checklist gratuits. L'article précise les liens d'affiliation.

These are practical educational resources, not claims of measured conversion gains.

## Developer kits

The public proofs above have packaged commercial versions for teams that want the runnable implementation, tests, documentation, and handoff material rather than rebuilding the reliability layer from scratch.

- **[LLM Reliability Rescue Kit — $19](https://mhamedasskoure.gumroad.com/l/llm-reliability-rescue-kit)** — Python/FastAPI structured-output validation, strict Pydantic contracts, CLI tooling, regression corpus, tests, CI, and production guidance.
- **[Agent Runaway Guard Kit — $24](https://mhamedasskoure.gumroad.com/l/agent-runaway-guard-kit)** — local Python guardrails for repeated tool calls, cyclic loops, retry storms, token/API-cost boundaries, replay testing, and CI regression gates.

Both kits are one-time purchases and are intended for adaptation inside personal, internal, or client projects according to their included licenses.

## How I approach automation and rescue work

1. Reproduce or measure one concrete problem.
2. Define the expected contract or outcome.
3. Isolate the smallest failing component.
4. Add the smallest reliable fix.
5. Make failures explicit instead of silently inventing data.
6. Lock behavior with focused regression tests.
7. Document the handoff and keep known-good controls intact.

## Current commercial focus

I am open to remote contract, paid pilot, retainer or full-time work involving:

- AI automation
- workflow orchestration
- Python/FastAPI
- APIs and webhooks
- LLM / agent integration
- reliability and regression testing
- implementation and technical handoff

For a small automation or reliability problem, I can start with one bounded workflow or failing step and define an acceptance test before expanding scope.

## Work with me

- **Askoure Systems:** https://askoure-systems.floot.app
- **LLM Reliability Rescue Kit:** https://mhamedasskoure.gumroad.com/l/llm-reliability-rescue-kit
- **Agent Runaway Guard Kit:** https://mhamedasskoure.gumroad.com/l/agent-runaway-guard-kit
- **Automation Discovery:** https://automation-discovery.floot.app
- **ROI Calculator:** https://automation-roi-calculator.floot.app
- **Upwork:** https://www.upwork.com/freelancers/~01f95546c501a4254e
- **Fiverr:** https://www.fiverr.com/mhamedaskoure
- **LinkedIn:** https://www.linkedin.com/in/mhamed-askoure-1b02b7438/

---

**Current focus:** AI Automation · Python · FastAPI · APIs/Webhooks · LLM Reliability · Agent Guardrails · pytest · Docker · AWS
