# Agent Runaway Guard — Bounded Execution Before Dispatch

**Public engineering proof — Askoure Systems**

This proof packages the existing public `agent-runaway-guard-demo` into a concise case study about a production-relevant agent failure mode: an agent repeatedly calling the same tool, retrying without progress, or continuing after its operating budget should have stopped it.

## Problem

Agentic systems can fail in ways that look like activity rather than failure:

- repeated identical tool calls
- retry loops with no state change
- cost growth without progress
- no explicit success or stop condition
- actions continuing after a safe operating budget is exceeded

## Guard pattern implemented

The public demo places deterministic checks before dispatch rather than trusting the model to stop itself.

Core controls include:

1. detect repeated identical tool calls
2. track bounded execution state
3. estimate projected LLM/tool spend before the next action
4. reject work when a ceiling would be exceeded
5. return an explicit guard result instead of silently continuing

## Why the order matters

The guard runs before the next expensive or risky action.

`Agent intent → deterministic guard → allow / block → dispatch only when allowed`

A post-hoc alert is useful for observability, but it does not prevent the runaway action. A pre-dispatch guard can.

## Public evidence

- repository: https://github.com/zongsm-cmyk/agent-runaway-guard-demo
- runnable code and tests are public
- the implementation is presented as a self-built engineering proof, not prior paid-client work

## Commercial use

This pattern is relevant when an AI workflow can:

- call external APIs
- trigger browser actions
- create or modify records
- consume paid model/tool capacity
- loop across multiple planning steps

A bounded implementation can start with one failure mode and one measurable rule:

- define the risky repeated behavior
- add a deterministic stop condition
- add a budget/retry ceiling
- add a test that proves the action is blocked before dispatch
- document the receipt/error returned to the caller

## What this proof does not claim

- no claim that deterministic guards solve every agent-safety problem
- no claim of autonomous production certification
- no fabricated cost-saving percentage
- no claim of client deployment that has not been verified

## Related proof

- [LLM Structured Output Reliability](https://github.com/zongsm-cmyk/zongsm-cmyk/blob/main/proofs/llm-structured-output-reliability.md)
- [Automation Reliability Proof](https://askoure-systems.floot.app/proof/reliability)
- [Recovery Engineering](https://github.com/zongsm-cmyk/zongsm-cmyk/blob/main/proofs/recovery-engineering.md)
- [Deployment Runtime Verification](https://github.com/zongsm-cmyk/zongsm-cmyk/blob/main/proofs/deployment-runtime-verification.md)