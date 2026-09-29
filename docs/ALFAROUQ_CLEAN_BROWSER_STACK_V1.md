# ALFAROUQ Clean Browser Stack v1

## Architecture

ChatGPT / task prompt
→ Goose CLI (local planner)
→ Ollama / Qwen local model
→ Playwright MCP
→ official Playwright Extension
→ existing logged-in Chrome profile

Fallback only:
→ Nanobrowser + Ollama

## One Browser Owner

- Primary browser owner: Playwright MCP through the official Playwright Extension.
- Nanobrowser is installed as fallback but must remain idle while Playwright/Goose is running.
- chrome-use V1–V10 is retired from production use.
- Desktop Commander and TinyFish are not part of the primary path.

## Safety / loop guards

- max identical tool repetitions: 2
- bounded turns
- no coordinate clicking
- verify state after material actions
- human-only gates: MFA, CAPTCHA, identity verification, real payment confirmation, irreversible personal decisions
- no live Lemon Squeezy store activation unless explicitly requested

## Cost

- Playwright MCP: open source / local
- Playwright Extension: free
- Goose: open source / local
- Ollama + Qwen: local
- Nanobrowser: open source / local-first

No browser-cloud credits are required for the primary path.

## One-time human setup

1. Add official Playwright Extension to Chrome.
2. Add Nanobrowser to Chrome.
3. Copy the Playwright extension authentication token once into the installer prompt.

After setup, Playwright MCP can reuse the active Chrome profile, cookies, sessions and logged-in state.

## Current task

A dedicated launcher is generated for Lemon Squeezy Test Mode:
- product: Reliable Forms Notify Pro
- Monthly: $3.99 / month
- Annual: $29.99 / year
- license keys enabled
- activation limit: 1
- TEST MODE only

## Source of truth

Branch: `alfarouq-playwright-goose-v1`
Installer: `tools/setup-alfarouq-clean-browser-stack.ps1`
Validation: `.github/workflows/validate-clean-browser-stack.yml`
