# AI Studio Build — Askoure Offer Matcher (prototype, NOT a new deployed website)

**Goal:** Use Google AI Studio **Build Mode** to prototype a small decision assistant that helps a real visitor identify the right class of tools for their small business and directs only qualifying readers to one currently verified affiliate offer. The business value is better visitor qualification and relevance, not raw page count.

## Starting facts
- Existing live project: https://askoure-systems.floot.app/
- Arabic landing page: https://askoure-systems.floot.app/ar/systeme-io-free-funnel
- Verified personal affiliate URL, **systeme.io only**: https://systeme.io/fr?sa=sa0284636962507f2a1b5beb2d42ca71bf15989a0b
- GitHub knowledge: https://github.com/zongsm-cmyk/zongsm-cmyk
- Kit, n8n, CookieYes, ElevenLabs, Manychat: potential candidates only, **no confirmed personal referral URL yet**.

## Paste this specification into Google AI Studio's Build mode

Build a **client-side-only React + TypeScript Arabic RTL** interactive tool called **Askoure — اختر أداة مشروعك**. A polished, responsive 4-question wizard for freelancers and small business owners who are deciding how to attract and follow up with leads:
1. Primary problem: create a landing page / collect customer inquiries / email follow-up / automate repetitive workflows / create voice or video.
2. Experience: beginner / intermediate / technical.
3. Budget: free first / modest recurring budget / flexible.
4. Goal urgency: test idea / launch this month / compare options.

Generate recommendation cards for *categories of solutions*, based on clearly defined deterministic rules. For landing-page and lead-collection use cases, highlight systeme.io as a possible match (not the one true choice) and link to https://askoure-systems.floot.app/ar/systeme-io-free-funnel. Only after transparent choice should a clearly marked external referral link lead to https://systeme.io/fr?sa=sa0284636962507f2a1b5beb2d42ca71bf15989a0b with `rel="sponsored noopener noreferrer"`. For email marketing, automation, voice/video, do NOT invent personal affiliate URLs; display educational guidance and say partnership links will be offered only after program approval. Include a **"this may not fit you"** case if the user doesn't need SaaS.

Copy:
- Transparent Arabic disclosure near affiliate CTA: «قد نحصل على عمولة عند شراء اشتراك مؤهل عبر رابطنا، دون رسوم إضافية عليك».
- No profitability promises, fake ratings, testimonials, statistics or implied product testing.
- Propose a small free-step action a reader can do before any purchase.

Constraints:
- **No user registration, collecting personal data, cookie trackers, localStorage, analytics packages, payment forms, secret tokens or third-party APIs.**
- **No Gemini API calls at runtime**, since this quiz must remain zero token-cost when integrated into existing site. Pure deterministic client-side logic is enough.
- No database, no Firebase, no auth, no Cloud Run, no Google Cloud billing, no deployment.
- Do not modify the existing Floot site. This is only a prototype for later independent review and possible import.
- Accessibility: keyboard navigation, visible focus, large readable type, contrast, aria live result, responsive phone width.
- Include lightweight tests for each recommendation rule and for accurate affiliate disclosure/URL.
- Provide the full files, a demo preview, and instructions to export as ZIP or sync into a **new isolated directory** of the existing GitHub repository, without overwriting its README or main app.

Output only real working code and preview evidence, not claims of deployment. If AI Studio warns that this operation needs billing or a paid Gemini API key, stop without approving charges.

## Acceptance checks
1. At least five combinations tested, including irrelevant use-case path.
2. Correct RTL, mobile, and usable without API key.
3. Only verified systeme.io referral link exists.
4. Disclosure visible and correct `rel`.
5. No data capture / no paid services.
6. Code exportable; no publication claimed until a real public URL has been tested.

## Implementation after export
We will review code in ChatGPT, add its content to the **existing Floot site** as a bounded new feature (if measurements justify it), test TypeScript, and publish. Traffic acquisition and actual commissions remain separate tracked stages.
