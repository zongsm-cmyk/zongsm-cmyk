import csv
import io
import json
import unittest

from crm_webhook import process_jsonl


def event(event_id="e1", email="FIRST@EXAMPLE.ORG", full_name="Amina Test", company="Demo Ltd"):
    return {"event_id": event_id, "event_type": "contact.upsert", "data": {"email": email, "full_name": full_name, "company": company}}


def run(items):
    lines = [item if isinstance(item, str) else json.dumps(item) for item in items]
    result, audit = process_jsonl(lines)
    return list(csv.DictReader(io.StringIO(result))), audit


class CRMWebhookProofTests(unittest.TestCase):
    def test_valid_event(self):
        rows, audit = run([event()])
        self.assertEqual(rows[0]["email"], "first@example.org")
        self.assertEqual(audit["counts"], {"accepted": 1, "duplicates": 0, "rejected": 0})

    def test_duplicate_is_skipped(self):
        rows, audit = run([event(), event()])
        self.assertEqual(len(rows), 1)
        self.assertEqual(audit["counts"]["duplicates"], 1)

    def test_case_normalized_duplicate_is_skipped(self):
        rows, audit = run([event(), event(email="first@example.org")])
        self.assertEqual(len(rows), 1)
        self.assertEqual(audit["counts"]["duplicates"], 1)

    def test_conflicting_replay_is_rejected(self):
        rows, audit = run([event(), event(company="Another company")])
        self.assertEqual(len(rows), 1)
        self.assertEqual(audit["audit"][0]["code"], "event_id_conflict")

    def test_missing_email_is_rejected(self):
        bad = event()
        del bad["data"]["email"]
        rows, audit = run([bad])
        self.assertEqual(len(rows), 0)
        self.assertEqual(audit["audit"][0]["code"], "missing_required_field")

    def test_missing_contact_object_is_rejected(self):
        bad = event()
        bad["data"] = None
        _, audit = run([bad])
        self.assertEqual(audit["audit"][0]["code"], "invalid_data")

    def test_bad_email_rejected(self):
        for bad in ("nobody", "a@.com", "a@dom.", " a@b.com", "=HYPERLINK@b.com"):
            with self.subTest(bad=bad):
                _, audit = run([event(email=bad)])
                self.assertEqual(audit["counts"]["rejected"], 1)

    def test_unsupported_event_rejected(self):
        bad = event()
        bad["event_type"] = "contact.delete"
        _, audit = run([bad])
        self.assertEqual(audit["audit"][0]["code"], "unsupported_event_type")

    def test_json_syntax_error_is_rejected_without_raw_details(self):
        _, audit = run(["{malformed"]) 
        self.assertEqual(audit["audit"][0]["code"], "invalid_json")
        self.assertNotIn("malformed", json.dumps(audit))

    def test_csv_formula_injection_is_neutralized(self):
        rows, _ = run([event(full_name="=1+1", company="@SUM(A1:A3)")])
        self.assertEqual(rows[0]["full_name"], "'=1+1")
        self.assertEqual(rows[0]["company"], "'@SUM(A1:A3)")

    def test_control_characters_rejected(self):
        _, audit = run([event(full_name="Bad\nInput")])
        self.assertEqual(audit["audit"][0]["code"], "invalid_full_name")

    def test_no_pii_in_audit(self):
        _, audit = run([event(email="invalid-email", full_name="Private Name")])
        audit_string = json.dumps(audit)
        self.assertNotIn("Private Name", audit_string)
        self.assertNotIn("invalid-email", audit_string)

    def test_invalid_event_before_valid_same_id(self):
        bad = event()
        bad["data"].pop("company")
        rows, audit = run([bad, event()])
        self.assertEqual(len(rows), 1)
        self.assertEqual(audit["counts"]["rejected"], 1)

    def test_non_object_rejected(self):
        _, audit = run(["[]", "null", "123"])
        self.assertEqual(audit["counts"]["rejected"], 3)

    def test_empty_batch_has_csv_header(self):
        csv_data, audit = process_jsonl([])
        self.assertEqual(csv_data, "source_event_id,email,full_name,company\n")
        self.assertEqual(audit["counts"]["accepted"], 0)

    def test_unicode_kept(self):
        rows, audit = run([event(full_name="أمينة التجريبية", company="Société Exemple")])
        self.assertEqual(rows[0]["full_name"], "أمينة التجريبية")
        self.assertEqual(audit["counts"]["rejected"], 0)

    def test_invalid_event_id_rejected(self):
        _, audit = run([event(event_id="../unsafe")])
        self.assertEqual(audit["audit"][0]["code"], "invalid_event_id")

    def test_mixed_status_counts(self):
        rows, audit = run([event(), event(), event(event_id="e2"), "broken"])
        self.assertEqual(len(rows), 2)
        self.assertEqual(audit["counts"], {"accepted": 2, "duplicates": 1, "rejected": 1})


if __name__ == "__main__":
    unittest.main()