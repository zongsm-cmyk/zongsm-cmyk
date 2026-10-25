#!/usr/bin/env python3
"""Read-only link release gate for Askoure's five-product buyer guide.

Default: offline checks only. --live checks our own site redirects/content,
never fires affiliate outbound requests or submits forms.
No third-party modules, API keys, browser cookies, or login automation.
"""
import argparse
import re
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen

BASE = Path(__file__).resolve().parent
GUIDE = BASE / "business-software-buyer-fit-2026.md"
AFFILIATE_ID = "sa0284636962507f2a1b5beb2d42ca71bf15989a0b"
SOURCE = "github_buyer_guide"
TRACK_TAG = "askoure_github_buyer_guide"
CHOOSER = f"https://askouresystems.com/en/choose-business-tool?src={SOURCE}"
CANONICAL = f"https://askoure-systems.floot.app/en/choose-business-tool?src={SOURCE}"
AFFILIATE = f"https://systeme.io/?sa={AFFILIATE_ID}&tk={TRACK_TAG}"
VENDORS = {
    "kit.com": "https://kit.com/",
    "manychat.com": "https://manychat.com/",
    "n8n.io": "https://n8n.io/",
    "www.cookieyes.com": "https://www.cookieyes.com/",
}
VALID_HOSTS = {"askouresystems.com", "askoure-systems.floot.app",
               "systeme.io", *VENDORS.keys()}
KEYS = {"sa", "tk", "ref", "affiliate", "aff", "clickid"}


def check(condition, label, errors):
    if not condition:
        errors.append(label)


def offline_check(text):
    errors = []
    anchors = re.findall(r"\[[^\]]+\]\((https://[^)\s]+)\)", text)
    check(bool(anchors), "No Markdown HTTPS links found", errors)
    for link in anchors:
        parsed = urlparse(link)
        check(parsed.scheme == "https" and parsed.netloc in VALID_HOSTS,
              f"Unexpected hostname or scheme: {link}", errors)
        check(not parsed.username and not parsed.password,
              f"Credentials unexpectedly embedded: {link}", errors)
    check(anchors.count(CHOOSER) == 2,
          "The buyer-guide chooser link must occur exactly twice, with correct source", errors)
    check(anchors.count(AFFILIATE) == 1,
          "Exact verified systeme.io affiliate link and source tag must occur once", errors)
    for host, expected in VENDORS.items():
        check(expected in anchors, f"Missing ordinary vendor link: {host}", errors)
    for link in anchors:
        parsed = urlparse(link)
        params = parse_qs(parsed.query)
        if parsed.hostname == "systeme.io" and (params.keys() & KEYS):
            check(link == AFFILIATE, f"Unapproved affiliate URL: {link}", errors)
        if parsed.hostname in VENDORS:
            check(not (params.keys() & KEYS),
                  f"Candidate vendor must have ordinary URL, not referral ID: {link}", errors)
        if parsed.hostname == "askouresystems.com":
            check(link == CHOOSER,
                  f"Unexpected Askoure redirect/path/source: {link}", errors)
    check("Affiliate disclosure:" in text and "Not our affiliate link" in text,
          "Missing accurate affiliate versus ordinary-link disclosures", errors)
    return errors, len(anchors)


def live_check():
    """Only request our own links, not vendor or referral links."""
    errors = []
    try:
        req = Request(CHOOSER, method="HEAD", headers={"User-Agent": "Askoure-link-QA/1.0"})
        with urlopen(req, timeout=8) as reply:
            final = reply.geturl()
            check(reply.status == 200, f"Chooser final HTTP={reply.status}", errors)
            check(final == CANONICAL,
                  f"Chooser redirect lost path/source: {final}", errors)
    except Exception as exc:
        errors.append(f"Own-site redirect check inconclusive/failed: {type(exc).__name__}: {exc}")
    return errors


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--live", action="store_true", help="Opt in to HEAD check of Askoure URL only")
    args = p.parse_args()
    if not GUIDE.is_file():
        print(f"FAIL: missing guide: {GUIDE}")
        return 1
    failures, n = offline_check(GUIDE.read_text(encoding="utf-8"))
    print(f"Scanned {n} published Markdown links; static failures: {len(failures)}")
    if args.live:
        failures.extend(live_check())
    for err in failures:
        print("FAIL:", err)
    if failures:
        return 1
    print("PASS: exact partner ID/tag, plain-vendor separation, two chooser sources" +
          (", and live own-site redirect" if args.live else ""))
    print("LIMIT: This does NOT prove cookie attribution, signups, or commissions.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
