# Landing Page Release Checker (Python, zero dependencies)

A small **read-only, bounded** command-line checklist for developers and
no-code operators preparing a public landing page for launch.

This is a **pre-launch quality aid**, not an automated accessibility audit,
conversion rate test, full security scan, or claim of Google indexing.

## Run

Python 3.10+ is required. Download the files in this directory and run:

```bash
python3 resources/landing_page_release_check.py https://example.com/offer
python3 resources/landing_page_release_check.py https://example.com/offer --json

# Offline deterministic tests (no network or sign-in required)
python3 resources/test_landing_page_release_check.py
```

The checker uses only the Python standard library: `html.parser`,
`urllib`, and `json`. It issues **GET** requests for the page and the
page's `robots.txt` and `sitemap.xml`; it never submits a contact form,
logs into an account, or sends data to marketing services.

A bounded fetch reads at most 2 MB and times out after 10 seconds.

## The 13 checks

| Group | Check |
|---|---|
| HTTP | Returns 200 |
| HTTP | Responds with `text/html` |
| HTTP | Document is at most 2 MB |
| SEO | Meaningful server-rendered `<title>` |
| SEO | Meta description |
| SEO | Exactly one visible-in-HTML `<h1>` element |
| SEO | Canonical URL agrees with the page |
| Discovery | `robots.txt` accessible |
| Discovery | `sitemap.xml` accessible |
| Discovery | Page listed in sitemap |
| Disclosure | Affiliate affiliation disclosed where the link is used |
| Disclosure | `rel="sponsored"` on systeme.io referral links |
| Browser hygiene | `rel="noopener"` on links opening new tabs |

A PASS is **not** proof that a real signup completes or that any
visitor becomes a paying customer. Test the signup in the vendor dashboard
separately. If the page is JavaScript-only and doesn't contain its content
in the first HTML response, the headline and title checks will flag it.

## Verified application

The checker was run against the Askoure Systems public site, after publication.
It reported **13/13 for each** of the following pages on October 24, 2026:

- [English lead capture setup guide](https://askoure-systems.floot.app/guides/systeme-io-free-landing-page)
- [French lead capture setup guide](https://askoure-systems.floot.app/fr/guide-page-capture-gratuite-systeme-io)
- [10-step interactive self-assessment](https://askoure-systems.floot.app/tools/landing-page-audit)

That result is a technical smoke check at one point in time, **not** a
traffic, registration, or commission result. The bundled offline test
fixtures (5/5) check both successful and failing cases.

## Who it helps

- Technical founders launching an opt-in funnel.
- Automation builders connecting a form to follow-up systems.
- Agencies checking page metadata before sharing a client's public URL.
- Indie developers who need a quick, reproducible release gate.

For a nontechnical checklist, use the
[free interactive 10-point audit](https://askoure-systems.floot.app/tools/landing-page-audit).
For a step-by-step no-code setup, read the
[independent systeme.io landing-page guide](https://askoure-systems.floot.app/guides/systeme-io-free-landing-page).

**Affiliate note:** The setup guide includes a disclosed referral link
to systeme.io. The checker itself does not need systeme.io, does not
create accounts, and is free to use.

## Limitations

- No JavaScript is executed.
- No real form submissions are performed.
- Accessibility and keyboard flows require separate testing.
- Sitemaps that require a namespace/prefix different from the simple
  `<urlset` form are outside this basic tool's scope.
- It is a generic smoke check, with specific affiliate handling only
  for systeme.io referral links.
- Requests made from a restricted terminal without internet access will fail.
  Run it from a normal networked environment, or use the fixture tests offline.
