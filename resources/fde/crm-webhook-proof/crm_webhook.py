"""Demonstration-only, offline webhook-to-CRM CSV validation.

No API credentials, network requests, contact storage, or delivery claims.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


CSV_COLUMNS = ("source_event_id", "email", "full_name", "company")
REQUIRED_FIELDS = ("email", "full_name", "company")


@dataclass(frozen=True)
class Rejection(Exception):
    code: str


def _safe_cell(value: object, field: str) -> str:
    if not isinstance(value, str):
        raise Rejection("invalid_" + field)
    value = value.strip()
    if not value or len(value) > 200 or any(ord(ch) < 32 for ch in value):
        raise Rejection("invalid_" + field)
    # CSV quoting does not stop Excel/LibreOffice formula execution.
    if value.lstrip().startswith(("=", "+", "-", "@")):
        value = "'" + value
    return value


def _validate(record: object) -> tuple[str, str, dict[str, str]]:
    if not isinstance(record, dict):
        raise Rejection("not_an_object")
    event_id = record.get("event_id")
    if not isinstance(event_id, str) or not (1 <= len(event_id) <= 80):
        raise Rejection("invalid_event_id")
    if not all(c.isascii() and (c.isalnum() or c in "-_.") for c in event_id):
        raise Rejection("invalid_event_id")
    if record.get("event_type") != "contact.upsert":
        raise Rejection("unsupported_event_type")
    data = record.get("data")
    if not isinstance(data, dict):
        raise Rejection("invalid_data")
    if any(key not in data for key in REQUIRED_FIELDS):
        raise Rejection("missing_required_field")
    email = data["email"]
    if not isinstance(email, str) or len(email) > 254 or "@" not in email or email.strip() != email:
        raise Rejection("invalid_email")
    local, domain = email.rsplit("@", 1)
    if (not local or "." not in domain or domain.startswith(".") or domain.endswith(".")
            or any(ch.isspace() for ch in email) or any(ch in email for ch in "=+,;\t\r\n")):
        raise Rejection("invalid_email")
    normalized = {
        "source_event_id": event_id,
        "email": email.lower(),
        "full_name": _safe_cell(data["full_name"], "full_name"),
        "company": _safe_cell(data["company"], "company"),
    }
    # Hash normalized payload, not the raw input, for deterministic replay checks.
    fingerprint = hashlib.sha256(
        json.dumps(normalized, sort_keys=True, ensure_ascii=False).encode("utf-8")
    ).hexdigest()
    return event_id, fingerprint, normalized


def process_jsonl(lines: Iterable[str]) -> tuple[str, dict]:
    """Return safe-to-import CSV and audit metadata; event IDs live for ONE BATCH ONLY."""
    seen: dict[str, str] = {}
    rows: list[dict[str, str]] = []
    audit: list[dict] = []
    counts = {"accepted": 0, "duplicates": 0, "rejected": 0}
    for index, line in enumerate(lines, 1):
        try:
            try:
                record = json.loads(line)
            except (ValueError, TypeError):
                raise Rejection("invalid_json") from None
            event_id, fingerprint, normalized = _validate(record)
            if event_id in seen:
                if seen[event_id] == fingerprint:
                    counts["duplicates"] += 1
                    audit.append({"line": index, "status": "duplicate", "code": "replayed_event"})
                else:
                    counts["rejected"] += 1
                    audit.append({"line": index, "status": "rejected", "code": "event_id_conflict"})
                continue
            seen[event_id] = fingerprint
            rows.append(normalized)
            counts["accepted"] += 1
        except Rejection as exc:
            counts["rejected"] += 1
            # Never echo incoming contact data or raw errors into the audit artifact.
            audit.append({"line": index, "status": "rejected", "code": exc.code})
    out = io.StringIO(newline="")
    writer = csv.DictWriter(out, fieldnames=CSV_COLUMNS, lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return out.getvalue(), {"counts": counts, "audit": audit}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="UTF-8 JSONL webhook events")
    parser.add_argument("--csv", type=Path, required=True, help="output CRM-import CSV")
    parser.add_argument("--audit", type=Path, required=True, help="output rejection and replay audit JSON")
    args = parser.parse_args()
    input_path, csv_path, audit_path = (p.resolve() for p in (args.input, args.csv, args.audit))
    if len({input_path, csv_path, audit_path}) != 3:
        parser.error("input, CSV output and audit output must be distinct paths")
    with args.input.open("r", encoding="utf-8") as source:
        csv_data, audit_data = process_jsonl(source)
    # Never overwrite source data and do not write contact PII to the audit file.
    args.csv.write_text(csv_data, encoding="utf-8")
    args.audit.write_text(json.dumps(audit_data, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(audit_data["counts"], sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())