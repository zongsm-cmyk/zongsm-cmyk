# Askoure Systems — portable affiliate fallback site

## Purpose
An independent, light, Arabic **fallback landing page** for the existing Askoure Systems affiliate project. It does NOT replace or migrate the existing live Floot application. It reuses verified public resources and one confirmed personal systeme.io referral URL.

- Main live site: https://askoure-systems.floot.app/
- This project's source: `affiliate-fallback/index.html`
- Free original Arabic checklist: https://github.com/zongsm-cmyk/zongsm-cmyk/blob/main/resources/checklist-landing-page-ar.md
- Verified referral URL embedded: https://systeme.io/fr?sa=sa0284636962507f2a1b5beb2d42ca71bf15989a0b
- Hosting status: **source committed; deployment must be verified separately before claiming any public backup URL.**

## Option 1 — Render static site (an authorized workspace must first be confirmed by its owner)
In [Render](https://dashboard.render.com/static/new), select existing GitHub repository `zongsm-cmyk/zongsm-cmyk`, branch `main`.

- **Type:** Static Site
- **Name:** `askoure-affiliate-backup` (if available)
- **Build command:** `mkdir -p public && cp affiliate-fallback/index.html public/index.html`
- **Publish path:** `public`
- **Auto-deploy:** On, only when explicitly intended
- **Cost:** Free static hosting is offered subject to workspace bandwidth and pipeline limits; verify no unexpected billing.
- **No backend, form, SMTP or database required.**

Test the public URL as issued by Render; do not invent one. Check mobile width, direct resource link, affiliate URL, and the disclosure.

## Option 2 — Cloudflare Pages via GitHub
If Cloudflare Pages is authorized for your account, connect `zongsm-cmyk/zongsm-cmyk` via GitHub.

- Build command: `mkdir -p public && cp affiliate-fallback/index.html public/index.html`
- Output directory: `public`
- Deploy from `main`; enable only the intended source changes.

Cloudflare Pages Free plan currently documents **500 builds per month**, subject to other limits: https://developers.cloudflare.com/pages/platform/limits/

## Option 3 — Netlify via GitHub
Same repository and build command; publish directory `public`. Free plan has a monthly credit allowance; site can pause when exhausted.

## Rules
1. **Do not use Vercel Hobby** to host this affiliate-business site; its free plan restricts commercial uses.
2. **Do not deploy this as a primarily commercial site on GitHub Pages**; GitHub's published use restrictions disallow it.
3. Do not invent affiliates for other programs; only the verified systeme.io personal URL is included.
4. No form promises automated delivery; the file is directly accessible, so it works without marketing sender validation.
5. Track visitors and commissions separately. A live page is not a sale.
6. Once a public backup URL exists, append a dated update to the affiliate MASTER CHECKPOINT, with a proof of successful retrieval.
7. This is a fallback surface; its static content does not mirror or replace Floot's dynamic landing-page audit.
