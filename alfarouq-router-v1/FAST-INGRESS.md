# Fast Ingress HTTP

Selected solution: a normal GitHub-backed Railway Docker service.

## Diagnosis

Base: alfarouq-router-v1-shadow at 43a2644f56a029b74f3914882589b1f2278bfabc.

The root application was a shadow router without the ingress route. The nested application contained Fast Ingress. Both bootstrap-once and local-probe currently use the function-bun:1.4.0 image and embedded ./run.sh code, not the GitHub branch. Repository edits cannot update those embedded artifacts.

Live bootstrap /health returned the old package bootstrap body; /v1/chatgpt/command returned 404. Successful deployment 9e8b1d68-53f9-42af-a349-0ab076fe274e installed only hono, while the intended ingress imports pg. The running artifact is not the intended ingress.

Local-probe deployment 8c994d43-1861-4f97-90cf-ce73ea389209 is FAILED with no build/runtime logs returned. Its precise underlying failure remains unknown. Current Railway status reports no pending staged/applying work; the historical EnvironmentPatch APPLYING is not reproduced now. Application code cannot repair a platform control-plane patch.

Redeploy reuses the selected deployment's source/configuration. Deploy the new Git commit instead: https://docs.railway.com/deployments/deployment-actions

## Implementation

Both entrypoints explicitly listen on 0.0.0.0:$PORT using Bun.serve, with graceful shutdown. GitHub polling is opt-in. Docker pins Bun 1.4.2, Hono 4.13.10 and pg 8.23.0 with frozen lockfiles.

/health identifies fast-ingress-http-v2 and the command route. /ready imports the signing key and checks the existing commands table; Railway uses /ready. No Broker, schema, Agent, Bridge, Control Plane or Native Guard changes.

GET /v1/chatgpt/command retains p/e/s compatibility. POST accepts the same fields as JSON. p=base64url(JSON intent), e=decimal Unix expiry string (at most 120 seconds ahead), s=hex HMAC-SHA256(secret, e + "." + p). Intent fields: request_id, idempotency_key, architecture_version=abu-phase0-v1, action, args, risk_class, result_capability, expires_in_sec (30..900). Existing human_approved checks remain.

Existing Broker/Postgres queue and signed envelope format are preserved. The existing commands.request_id primary key atomically suppresses concurrent duplicate insertion. This is request-id deduplication, not a new nonce-store protocol. No database migration.

## Tests and limits

14 tests / 66 assertions passed: HTTP requests, health and empty browser_sequence envelopes, independent Ed25519 verification, capability hashing, HMAC/expiry rejection, concurrent deduplication, readiness failures and persistent processes from both roots. Database calls in ingress tests are mocked.

Docker build passed. Actual container listened on PORT=18437: health 200, missing-configuration readiness 503 and command 503 (not 404), then stopped cleanly. Test container removed.

Production insertion, Agent consumption and downstream Native Guard HTTP 200 have NOT been verified with this new ingress; deployment is still required. No remote push or Railway mutation was performed.

## Manual Finish

1. Apply fast-ingress.patch at the repository root on alfarouq-router-v1-shadow, commit and push; the ZIP contains the complete source as well.
2. Connect alfarouq-local-probe to that repository/branch, replacing its Function image source. Root=/alfarouq-router-v1; config=/alfarouq-router-v1/railway.json; Dockerfile=Dockerfile; start=bun run src/index.ts; healthcheck=/ready. Clear the old ./run.sh override; use no cron or sleep/serverless mode.
3. Copy existing FAST_INGRESS_SECRET, CONTROLLER_PRIVATE_KEY_B64 and DATABASE_URL once; DEVICE_ID=ALFAROUQ; ENABLE_GITHUB_POLL=false. Preserve the controller key already trusted by the Agent.
4. Deploy Latest Commit once; align the domain target port with PORT. Confirm /health version=fast-ingress-http-v2 and /ready=200, then point the existing signed ChatGPT caller to that domain.
5. Submit health, then browser_sequence with args={"steps":[]}, using distinct request/idempotency IDs and capabilities. Confirm Agent results and downstream HTTP 200. Subsequent commands use HTTP only.
