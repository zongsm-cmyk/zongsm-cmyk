# Recovery Engineering — Isolate the Smallest Broken Component

**Sanitized engineering proof — Askoure Systems**

This case study documents a real recovery pattern from an automation control system without exposing private source code, credentials, internal endpoints, or proprietary implementation details.

## Situation

Several auxiliary cloud services had failed builds or authentication problems around the same time that the main automation path was being inspected.

A broad conclusion such as “the automation stack is down” would have been easy — and wrong.

## What was measured

The production broker was independently verified as healthy while the remote Windows agent continued to:

- send heartbeat requests successfully (HTTP 200)
- poll the broker for work successfully (HTTP 200)

A separate, read-only request was then sent through an auxiliary GitHub ingress. That request reached the broker-facing route but returned HTTP 401.

The evidence therefore supported a narrower diagnosis:

> the accepted broker + agent pull channel remained live, while the auxiliary GitHub ingress had an authentication/HMAC mismatch.

## Recovery rule used

`Observe → Confirm → Isolate → Repair smallest component → Smoke → Regression → Resume`

The purpose of the rule is to protect known-good infrastructure from unnecessary changes.

## Controls deliberately preserved

- one browser owner
- guarded execution
- previously accepted regression gates
- the production broker
- the durable command path
- existing browser/profile constraints

## Shortcuts deliberately avoided

- no full architecture rebuild
- no secret export
- no casual secret rotation just to gain access
- no guard weakening
- no second browser owner
- no primary-browser CDP bypass
- no repeated redeploy loop

## Why this matters

A recovery process is part of the product.

A system is easier to trust when operators can distinguish:

1. a noisy side-service failure,
2. a degraded optional ingress,
3. a broken production execution path,
4. and a security control correctly refusing an unsafe request.

The engineering value was not “we saw a 401.” The value was reducing the incident from a vague platform outage to a specific, evidence-backed boundary while leaving healthy components untouched.

## Related public proof

- [Automation Reliability Proof](https://askoure-systems.floot.app/proof/reliability)
- [Connector-First Outreach Operations Proof](https://askoure-systems.floot.app/proof/outreach-ops)
- [Askoure Systems](https://askoure-systems.floot.app)

## Public/private boundary

This document intentionally omits:

- secrets and signing material
- internal ports and private URLs
- private source code
- machine/session identifiers
- proprietary control-stack internals

The purpose is to demonstrate the recovery method and verified behavior without publishing the private implementation.