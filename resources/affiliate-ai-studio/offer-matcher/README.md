# Askoure Offer Matcher — isolated prototype

**This directory is the original standalone prototype, not the hosted production source.** A small client-side Arabic RTL 4-question decision helper that was used for a Google AI Studio project and later adapted for our live website. **The adapted production tool is published at https://askoure-systems.floot.app/tools/choose-business-tool**. This directory itself remains an isolated, no-runtime-API prototype; do not mistake its privacy profile for every feature of the Floot-hosted site.

## Run

- `npm test` runs built-in Node tests, no dependencies / API keys needed.
- `npm run serve` then open `http://localhost:8787/` for a local preview (the source uses browser-native ES modules).
- The standalone files are a prototype for review; **the separate Floot adaptation is live**, but neither the prototype nor the live URL is evidence of a sale or commission.

## Import into Google AI Studio

Official instructions: https://ai.google.dev/gemini-api/docs/aistudio-build-mode — In **Build Mode**, click `+` → **Import from GitHub**, select the already authorized `zongsm-cmyk/zongsm-cmyk` repository and point the agent at `resources/affiliate-ai-studio/offer-matcher/`. Ask it to preserve the existing rule logic and build an accessible mobile RTL React interface in a **new isolated AI Studio project**. Do not sync back over your existing GitHub profile README or Floot site; use a separate branch or export ZIP first.

## Submission and reuse status

- The original static prototype has no user input uploads, no analytics and no runtime cloud dependency. The live Floot integration does emit aggregated anonymous business-goal/completion and affiliate-click events; the two distributions have **different privacy characteristics**.
- Editorial review request sent to Bluebird on 2026-10-24 for the original no-beacon prototype only. Submission is **not approval**, and no third-party hosting rights or new licence are granted by this README. If a platform considers distributing the code, the owner reviews its terms before granting any required license.

## Product and financial truth

The only verified personal affiliate here is `systeme.io` (exact link in `logic.mjs`). Links to Kit, n8n, Manychat, ElevenLabs, and CookieYes are not allowed until personal program approval. Affiliate disclosure is near the conversion CTA. No fabricated reviews, sales, lead stats, or income.

## Zero-cost and privacy properties

- No Gemini API calls, no environment variables, no analytics cookies, no localStorage, no passwords, no forms, no data collection, no database or paid cloud functions.
- Product discovery recommendation is **deterministic**, not a model output. The app is still useful for screening visitors even with zero API budget.
- The first link on qualifying routes leads to the **already published Arabic guide**. The second external link is the explicitly marked affiliate referral with `rel="sponsored noopener noreferrer"`.