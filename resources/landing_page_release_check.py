#!/usr/bin/env python3
"""Read-only, bounded release checks for a public landing page.

Usage:
  python landing_page_release_check.py https://example.com/offer
  python landing_page_release_check.py https://example.com/offer --json

Uses only Python standard library. Checks are operational readiness signals,
not a substitute for real form submission, accessibility audits or sales data.
"""
from __future__ import annotations

import argparse
import json
import sys
from html.parser import HTMLParser
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse, urldefrag
from urllib.request import Request, urlopen

TIMEOUT_SECONDS = 10
MAX_BYTES = 2_000_000
USER_AGENT = "AskoureLandingQA/1.0 (read-only; personal page verification)"


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.h1 = []
        self.meta = {}
        self.links = []
        self.head_links = []
        self.forms = 0
        self._title = False
        self._h1 = False
        self._h1buf = ""

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self._title = True
        elif tag == "h1":
            self._h1 = True
            self._h1buf = ""
        elif tag == "meta":
            k = (a.get("name") or a.get("property") or "").lower()
            if k:
                self.meta[k] = a.get("content", "")
        elif tag == "link":
            self.head_links.append(a)
        elif tag == "a":
            self.links.append(a)
        elif tag == "form":
            self.forms += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self._title = False
        elif tag == "h1":
            self._h1 = False
            if self._h1buf.strip():
                self.h1.append(" ".join(self._h1buf.split()))

    def handle_data(self, data):
        if self._title:
            self.title += data
        if self._h1:
            self._h1buf += data


def fetch(url):
    req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html, */*"})
    try:
        with urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
            body = resp.read(MAX_BYTES + 1)
            return {"status": resp.status, "url": resp.geturl(), "ctype": resp.headers.get_content_type(),
                    "text": body[:MAX_BYTES].decode("utf-8", errors="replace"), "oversize": len(body) > MAX_BYTES}
    except HTTPError as e:
        return {"status": e.code, "url": url, "ctype": "", "text": "", "oversize": False}
    except (URLError, TimeoutError, OSError) as e:
        return {"status": 0, "url": url, "ctype": "", "text": "", "oversize": False,
                "error": type(e).__name__}


def audit(url, fetched=None, aux=None):
    p = urlparse(url)
    if p.scheme not in {"https", "http"} or not p.hostname or p.username or p.password:
        raise ValueError("Use an absolute public http(s) URL without credentials")
    data = fetched if fetched is not None else fetch(url)
    doc = Page()
    if data["ctype"] == "text/html":
        doc.feed(data["text"])
    origin = p.scheme + "://" + p.netloc
    aux = aux if aux is not None else {
        "robots": fetch(origin + "/robots.txt"),
        "sitemap": fetch(origin + "/sitemap.xml")
    }
    canonical = next((a.get("href", "") for a in doc.head_links if "canonical" in a.get("rel", "").lower()), "")
    affiliate_links = [a for a in doc.links if "sa=" in a.get("href", "") and "systeme.io" in urlparse(urljoin(url, a.get("href", ""))).netloc]
    wrong_rel = [a.get("href", "") for a in affiliate_links if "sponsored" not in a.get("rel", "").lower().split()]
    unsafe_blank = [a.get("href", "") for a in doc.links if a.get("target", "").lower() == "_blank" and "noopener" not in a.get("rel", "").lower().split()]
    sitemap_ok = aux["sitemap"]["status"] == 200 and "<urlset" in aux["sitemap"]["text"]
    robots_ok = aux["robots"]["status"] == 200 and "User-agent" in aux["robots"]["text"]
    canonical_url = urldefrag(urljoin(url, canonical))[0]
    target_url = urldefrag(url)[0]
    checks = [
        ("http_200", data["status"] == 200, "The page returns HTTP 200"),
        ("html", data["ctype"] == "text/html", "The URL serves HTML"),
        ("bounded_response", not data["oversize"], "HTML smaller than 2 MB"),
        ("title", bool(doc.title.strip()) and 15 <= len(doc.title.strip()) <= 110, "A useful HTML title is server-rendered"),
        ("description", 50 <= len(doc.meta.get("description", "")) <= 200, "Meta description is present"),
        ("h1", len(doc.h1) == 1, "One H1 is present in the HTML"),
        ("canonical", bool(canonical) and canonical_url == target_url, "Canonical URL matches page"),
        ("robots", robots_ok, "robots.txt is accessible"),
        ("sitemap", sitemap_ok, "sitemap.xml is accessible"),
        ("sitemap_contains_url", sitemap_ok and target_url in aux["sitemap"]["text"], "Sitemap lists the page"),
        ("affiliate_disclosure", not affiliate_links or ("affiliate" in data["text"].lower() or "affilié" in data["text"].lower() or ("إفصاح" in data["text"] and "عمولة" in data["text"])), "Affiliate relationship is disclosed where applicable"),
        ("affiliate_link_rel", not wrong_rel, "Affiliate links use rel=sponsored"),
        ("safe_external_tabs", not unsafe_blank, "External tabs use rel=noopener"),
    ]
    return {
        "url": url,
        "checks": [{"name": n, "passed": v, "meaning": m} for n,v,m in checks],
        "passed": sum(1 for _,v,_ in checks if v),
        "total": len(checks),
        "title": doc.title.strip(),
        "h1": doc.h1,
        "affiliate_links_found": len(affiliate_links),
        "http_status": data["status"],
        "note": "A PASS is not proof of form delivery, accessibility, search indexing or revenue."
    }


def main(argv=None):
    arg = argparse.ArgumentParser(description=__doc__)
    arg.add_argument("url", help="Public landing-page URL")
    arg.add_argument("--json", action="store_true", help="Print machine-readable JSON")
    args = arg.parse_args(argv)
    try:
        out = audit(args.url)
    except ValueError as exc:
        arg.error(str(exc))
    if args.json:
        print(json.dumps(out, indent=2, ensure_ascii=False))
    else:
        print(f"{out['passed']}/{out['total']} checks passing — {out['url']}")
        for item in out["checks"]:
            print(f"{'PASS' if item['passed'] else 'FAIL'} {item['name']}: {item['meaning']}")
        print(out["note"])
    return 0 if out["passed"] == out["total"] else 1


if __name__ == "__main__":
    sys.exit(main())
