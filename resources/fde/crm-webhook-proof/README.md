# CRM webhook → CSV reliability (offline proof)

**Verified scope:** standalone Python validation and regression tests using fictional contact data. This is **not** a live CRM integration, paid-client delivery, or production deployment.

## Run the tests

```bash
cd resources/fde/crm-webhook-proof
python -m unittest discover -s tests -v
python crm_webhook.py --help
```

Run the CLI on a **synthetic JSONL input file** of `contact.upsert` events with `event_id` and a `data` object holding `email`, `full_name`, and `company`:

```bash
python crm_webhook.py INPUT.jsonl --csv contacts.csv --audit audit.json
```

Input and outputs must be different files. Output CSV is intended for **manual review** before CRM import. Audit stores error codes and line numbers, not raw contact data.

## Behaviors proved by tests

- A replayed event is not inserted twice **within the same batch**.
- A replay with the same event ID but different content is rejected as conflicting.
- Missing values, invalid emails, malformed JSON, and unsupported events are rejected with explicit reason codes.
- Spreadsheet formula prefixes in names/companies are escaped before CSV export.
- Synthetic Arabic and French names round-trip through UTF-8 unchanged.
- Rejected contact names and email addresses are not copied into the audit.

**Test evidence (local and GitHub-hosted CI):** On 25 October 2026, `python -m unittest discover -s tests -v` completed **18/18 PASS** locally using the published code and tests. Independently, the [GitHub Actions run #40161683500](https://github.com/zongsm-cmyk/zongsm-cmyk/actions/runs/40161683500) completed **successfully** on **Python 3.11 and 3.12**; in both jobs the `Run 18 offline unit tests` step passed. These are offline unit tests running in GitHub-hosted CI, **not** a deployed live CRM or external integration test. A separate, local synthetic fixture produced 2 accepted, 1 duplicate, 1 rejected; that fixture was not published to this repository.

## Known limits

- Duplicate suppression is **in-memory per batch**, not durable idempotency across workers or restarts.
- No HTTP endpoint, webhook signature validation, queue, durable database, retries/backoff, CRM API write, transactional export, or production observability.
- Email format check is deliberately simple; it does not establish address ownership or RFC completeness.
- CSV escaping should be independently confirmed against the destination app before handling untrusted production data.
- Do not submit personal contact data or credentials to public GitHub issues.

## What this proof supports commercially

This demonstrates a bounded repair-and-test approach that can be adapted to a real webhook / CRM import incident **only after** reviewing the client's stack, agreeing acceptance tests, revisions, fee, deadline and payout route. It does not demonstrate a prior client deployment or measurable customer ROI. It is separate from the [existing $35 Python bug-fix pilot](../python-bugfix-pilot.md), which applies only to a scoped bug in an existing public Python repository.

AI assistance was used during authorship; actual test scope and limitations are disclosed here.
