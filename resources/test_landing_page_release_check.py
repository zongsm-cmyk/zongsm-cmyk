"""Deterministic offline tests for the read-only landing-page QA checker."""
from landing_page_release_check import audit

URL = "https://example.com/guide"
SITEMAP = {"status": 200, "text": f"<urlset><url><loc>{URL}</loc></url></urlset>"}
ROBOTS = {"status": 200, "text": "User-agent: *\nAllow: /"}
DOC = """<!DOCTYPE html><html><head>
<title>Example guide to collecting new leads</title>
<meta name="description" content="A practical guide to collecting opt-in leads, verifying your signup form, and following up without making misleading promises.">
<link rel="canonical" href="https://example.com/guide">
</head><body><h1>Collect leads safely</h1>
<p>Affiliate disclosure: we may earn a commission.</p>
<a href="https://systeme.io/fr?sa=sa123" rel="sponsored noopener noreferrer" target="_blank">Try systeme</a>
</body></html>"""
DATA = {"status": 200, "ctype": "text/html", "text": DOC, "oversize": False}
AUX = {"robots": ROBOTS, "sitemap": SITEMAP}


def test_passing():
    out = audit(URL, DATA, AUX)
    assert out["passed"] == 13, out
    assert out["affiliate_links_found"] == 1


def test_missing_disclosure_and_rel():
    broken = DATA | {"text": DOC.replace("Affiliate disclosure: we may earn a commission.", "").replace("sponsored noopener noreferrer", "noreferrer")}
    out = audit(URL, broken, AUX)
    bad = {x["name"] for x in out["checks"] if not x["passed"]}
    assert {"affiliate_disclosure", "affiliate_link_rel", "safe_external_tabs"} <= bad, bad


def test_javascript_shell_is_not_accepted():
    broken = DATA | {"text": '<html><head><title>Site</title></head><body><div id="root"></div></body></html>'}
    out = audit(URL, broken, AUX)
    bad = {x["name"] for x in out["checks"] if not x["passed"]}
    assert {"title", "description", "h1", "canonical"} <= bad


def test_sitemap_not_listed():
    aux = AUX | {"sitemap": {"status": 200, "text": "<urlset></urlset>"}}
    out = audit(URL, DATA, aux)
    assert not [c for c in out["checks"] if c["name"] == "sitemap_contains_url"][0]["passed"]


def test_wrong_canonical():
    broken = DATA | {"text": DOC.replace('https://example.com/guide"', 'https://example.com/old"')}
    out = audit(URL, broken, AUX)
    assert not [c for c in out["checks"] if c["name"] == "canonical"][0]["passed"]

def test_arabic_disclosure_supported():
    arabic = DATA | {"text": DOC.replace(
        "Affiliate disclosure: we may earn a commission.",
        "إفصاح عن روابط الإحالة: قد نحصل على عمولة عند شراء مؤهل."
    )}
    out = audit(URL, arabic, AUX)
    assert out["passed"] == 13, out


def test_arabic_generic_mention_is_not_disclosure():
    generic = DATA | {"text": DOC.replace(
        "Affiliate disclosure: we may earn a commission.",
        "هذه أداة مجانية تساعدك في اختيار برنامج لإحالة زوار الصفحة."
    )}
    out = audit(URL, generic, AUX)
    failed = {c["name"] for c in out["checks"] if not c["passed"]}
    assert "affiliate_disclosure" in failed, failed


if __name__ == "__main__":
    cases = [
        test_passing,
        test_missing_disclosure_and_rel,
        test_javascript_shell_is_not_accepted,
        test_sitemap_not_listed,
        test_wrong_canonical,
        test_arabic_disclosure_supported,
        test_arabic_generic_mention_is_not_disclosure,
    ]
    for case in cases:
        case()
        print("PASS", case.__name__)
    print(f"{len(cases)}/{len(cases)} offline fixture tests passed.")
