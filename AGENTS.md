# ALFAROUQ Browser Automation

Use `chrome-use` for every browser task on Windows in this project.

Rules:
- Start with `chrome-use skills get core`.
- Use one explicit session only: `--session ALFAROUQ`.
- Reuse the existing logged-in Chrome browser through the chrome-use extension/native-messaging path.
- Do not use Codex built-in browser, Playwright MCP, raw CDP, Desktop Commander, TinyFish, coordinate clicking, or launch a second browser owner unless the user explicitly requests a fallback.
- Core loop: open/read -> `snapshot -i` -> act on @refs -> `snapshot -i --diff`.
- Never create a new tab when an existing ALFAROUQ tab can be selected/adopted.
- Stop after an authoritative page signal confirms success. Do not replay an action whose result is uncertain.
- Human intervention is allowed only for MFA, CAPTCHA, browser-extension permission, or irreversible personal decisions.
- Keep all browser control local; do not route browser actions through Railway.
