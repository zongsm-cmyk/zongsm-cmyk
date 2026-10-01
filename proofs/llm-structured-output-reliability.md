# LLM Structured Output Reliability — From Fragile JSON to Tested Contract

**Public engineering proof — Askoure Systems**

This proof packages the already-public `llm-reliability-rescue-demo` into a concise engineering case study focused on a common production failure mode: downstream automation breaking because model output is malformed, drifts from the expected schema, or silently changes type.

## Problem

LLM output often looks correct to a human while still being unsafe for software:

- malformed JSON
- missing required fields
- wrong field types
- extra commentary around JSON
- schema drift after prompt/model changes
- retries that mask the real failure

## Reliability pattern implemented

The public demo separates the problem into explicit stages:

1. extract a JSON candidate safely
2. parse without `eval` or invented repair
3. validate against a strict Pydantic v2 contract
4. return structured failure states when the contract is broken
5. expose the behavior through FastAPI
6. lock the expected behavior with regression tests

## Verified public evidence

- public repository: https://github.com/zongsm-cmyk/llm-reliability-rescue-demo
- CI workflow is public
- 11/11 regression tests were documented as passing in the public project state
- FastAPI service is packaged for Docker
- AWS Lambda deployment is public
- live API docs: https://7hjfrxuwyxgke2h7fqhaubykda0benzq.lambda-url.us-east-1.on.aws/docs

## Why this matters commercially

A model integration is not reliable because one prompt worked once.

The useful engineering boundary is a contract that downstream code can trust:

`LLM response → safe extraction → strict validation → explicit success/failure → regression test`

This makes failures visible and testable instead of letting malformed output propagate into CRMs, databases, workflow engines or customer-facing actions.

## What this proof does not claim

- no claim that every malformed LLM response can be automatically repaired
- no claim of prior paid-client delivery
- no claim that one schema or retry strategy fits every production system
- no fabricated accuracy, latency or ROI percentage

## Suitable paid scope

A bounded implementation can start with one failing structured-output step:

- reproduce the actual failure
- define the expected schema
- add safe parsing and strict validation
- add explicit failure handling
- add focused regression coverage
- return a clean patch plus a concise handoff

## Related proof

- [Agent Runaway Guard](https://github.com/zongsm-cmyk/agent-runaway-guard-demo)
- [Automation Reliability Proof](https://askoure-systems.floot.app/proof/reliability)
- [Recovery Engineering](https://github.com/zongsm-cmyk/zongsm-cmyk/blob/main/proofs/recovery-engineering.md)
- [Deployment Runtime Verification](https://github.com/zongsm-cmyk/zongsm-cmyk/blob/main/proofs/deployment-runtime-verification.md)