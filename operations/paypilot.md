# PayPilot — Paid Pilot Payment & Delivery Layer

Status: Phase 0 specification / no payment processor replacement.

## Goal
Turn an approved Askoure Systems paid pilot into a controlled flow:
Offer accepted -> PayPal payment request/invoice -> verified payment -> delivery job opened -> work delivered -> follow-up/retainer.

## Rules
- PayPal remains the payment processor. PayPilot never stores card data.
- Never mark PAID from a client screenshot, email text, or redirect alone.
- PAID requires authoritative PayPal transaction/invoice verification once official PayPal API/webhook credentials are connected.
- Until that integration exists, payment verification is a human/account-owner gate.
- No execution begins before payment verification unless explicitly approved as a free/diagnostic task.
- Every transition is timestamped and idempotent.
- No fabricated invoice, payment, client, contract, or revenue status.

## States
LEAD -> SCOPED -> OFFER_SENT -> ACCEPTED -> PAYMENT_PENDING -> PAID -> DELIVERY_OPEN -> IN_PROGRESS -> DELIVERED -> FOLLOW_UP -> RETAINER|CLOSED

Failure/exception states:
PAYMENT_FAILED, REFUNDED, DISPUTED, CANCELLED, DELIVERY_BLOCKED.

## Minimal record
pilot_id
client_name
client_email
scope
price
currency
payment_provider=paypal
paypal_invoice_or_order_id
payment_status
delivery_status
created_at
updated_at
evidence_refs

## Phase 1 integration
1. Generate a bounded paid-pilot scope and price.
2. Create/send PayPal invoice/order using official PayPal integration.
3. Receive PayPal webhook.
4. Verify webhook signature and transaction status server-side.
5. Transition PAYMENT_PENDING -> PAID exactly once.
6. Create delivery task in the existing execution stack.
7. Send client confirmation and ETA.
8. Deliver artifact + proof.
9. Send follow-up offering extension/retainer.

## Security
Secrets only in environment/secret store.
Verify PayPal webhook signatures.
Allowlist state transitions.
Idempotency keys for payment and delivery creation.
Audit log without payment-card data.
No public exposure of internal ALFAROUQ ports or tokens.

## Current blocker
No direct PayPal connector/API credentials are available to the current ChatGPT tool session. Therefore no live PayPal invoice/webhook is claimed as configured yet.

## Acceptance
A sandbox/live test is accepted only when an official PayPal event is verified, one and only one delivery job is opened, and the audit trail records the transition without secrets.
