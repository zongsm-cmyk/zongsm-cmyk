# One Python bug, one tested fix — $35 USD

A small, fixed-price pilot from Mhamed Askoure / Askoure Systems.

## What you receive

For one agreed, reproducible Python bug in an existing public GitHub repository:

- A failing reproduction or regression test.
- A focused fix, normally in no more than three production files.
- The relevant regression tests and exact commands/results.
- A pull request or patch with a short explanation and any remaining limitations.

Examples: an error path that leaves files modified, a checker mistaking process failure for success, JSON validation, or a retry/timeout handling defect.

## Agree the result before work

Send a public issue link, expected behavior, reproduction steps and the existing test command. Start with a synthetic example if the real input is private. We confirm feasibility, the target revision, scope, objective acceptance check and delivery date in writing before starting. The $35 price applies only after that scope is agreed; larger work receives a separate quote.

Payment: $35 USD after the agreed acceptance check passes, through a mutually supported route; PayPal preferred. Any provider fees and currency conversion are agreed before work. Where a freelance platform introduced the engagement, its payment rules apply.

One in-scope correction is included. The pilot excludes production deployment, paid API calls, third-party purchases, security certification and a new feature or application.

## Inspect the engineering evidence

These are open-source contribution examples, not paid client testimonials:

| Contribution | Reproduction evidence | Published verification |
| --- | --- | --- |
| [Go-Hybrid #1598: checker failure is not rejection evidence](https://github.com/limitlessprojects/Go-Hybrid/pull/1598) | Original author gate: four regressions fail before the fix. New specialized smoke gate: four additional cases fail on the earlier candidate. **16 focused checks passed** after both repairs (commit-reported). | [Current-head fork CI: `quick` + `compiler` SUCCESS](https://github.com/zongsm-cmyk/Go-Hybrid/actions/runs/40126865308), head `320ae04e` |
| [Go-Hybrid #1604: restore candidate files after exceptional exits](https://github.com/limitlessprojects/Go-Hybrid/pull/1604) | Five new cases fail on the original implementation; all seven pass after the fix | [Fork CI: quick and compiler passed](https://github.com/zongsm-cmyk/Go-Hybrid/actions/runs/40123982036) |

Both PRs were open and awaiting upstream review when this page was published on 24 October 2026. Passing fork CI does not establish an upstream merge or award.

Implementation, documentation and technical checks use disclosed AI assistance under Mhamed's authorization. Independent human engineering review is not included.

## Related technical proof for CRM/webhook inquiries

The **[Offline CRM webhook reliability proof](crm-webhook-proof/README.md)** reproduces duplicate/replayed contacts, conflicting event IDs, missing fields, CSV formula risks and data-safe error logs, with **18/18 local tests PASS** and a [successful GitHub Actions CI run](https://github.com/zongsm-cmyk/zongsm-cmyk/actions/runs/40161683500) on **Python 3.11 and 3.12** (25 October 2026). This is an independently built, synthetic **offline** demonstration, not a deployed CRM integration or client testimonial.

**Scope distinction:** the published **$35** pilot above covers one agreed reproducible bug in an existing *public Python repository*. Integrating a live CRM, customer data, authentication, deployment or third-party services requires a **separate written scope, quote and payout agreement**. No hidden upgrades or fees to apply.

## Request a fit check

**Fastest route:** [Open the structured pilot enquiry form](https://github.com/zongsm-cmyk/zongsm-cmyk/issues/new?template=paid-python-bugfix.yml). It asks for a public bug link, a redacted reproduction, an objective acceptance test, and desired scope; it does **not** require a payment or constitute a contract.

[Open an enquiry](https://github.com/zongsm-cmyk/zongsm-cmyk/issues/new?title=Python%20bugfix%20pilot%20enquiry) with the public repository, bug and expected result, or contact through the existing [Upwork profile](https://www.upwork.com/freelancers/~01f95546c501a4254e).

Do not post credentials, payment details, private customer data or private code in a public issue. An enquiry creates no payment or delivery obligation.
