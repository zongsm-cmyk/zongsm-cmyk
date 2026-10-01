# Deployment Reality Check — Verify Runtime, Not Saved Configuration

**Sanitized engineering proof — Askoure Systems**

This case study documents a real cloud deployment failure mode: the configuration/source visible in a control plane can look correct while the runtime serving production traffic is still running a different source image.

## Symptom

A signed control route was present in the saved function source, but the public runtime still returned `404 page not found` for the expected command endpoint.

A normal redeploy and even a semantically neutral configuration refresh created a new deployment object, but the same `404` remained.

That falsified the hypothesis that the problem was only a stale deployment snapshot.

## What changed the diagnosis

The investigation separated three different facts:

1. the route existed in the saved source;
2. the cloud service reported a successful deployment object;
3. the actual public runtime still did not serve the route.

Those are not equivalent forms of evidence.

## Smallest correction

The deployment path was changed to the provider's actual Functions workflow through the official Railway CLI:

- link the Functions context
- pull the current Functions source
- push the verified function source
- wait for the real function deployment to complete
- test the public route again

No broad architecture rebuild was required.

## Verified result

After the real Function source was pushed:

- signed ingress accepted the request with `HTTP 202`
- the remote agent claimed and executed the command
- the public result endpoint returned `HTTP 200`
- the result status was `ok`
- the verified execution path reached the guarded local executor

This converted the diagnosis from a vague deployment problem into a concrete source/runtime synchronization issue with a reproducible deployment procedure.

## Engineering lesson

Do not treat any of these as interchangeable:

- code visible in a dashboard
- saved configuration
- a successful deployment record
- the source image actually serving production traffic

Acceptance must be based on the runtime behavior that matters to the user.

## Recovery pattern

`Observe runtime → Compare saved source → Falsify stale-snapshot hypothesis → Deploy through the canonical provider path → Re-run the external acceptance test`

## Public/private boundary

This proof intentionally omits credentials, signing material, internal service identifiers, private URLs, local paths and proprietary implementation details.

Related public proof:

- [Automation Reliability Proof](https://askoure-systems.floot.app/proof/reliability)
- [Recovery Engineering](https://github.com/zongsm-cmyk/zongsm-cmyk/blob/main/proofs/recovery-engineering.md)
- [Askoure Systems](https://askoure-systems.floot.app)