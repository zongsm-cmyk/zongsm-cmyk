# n8n JSON export: a 10-minute preflight checklist

*A free, practical review for automation builders before handing a workflow to a client. By Askoure Systems. No signup or purchase required.*

An n8n workflow that looks correct on the canvas can still need credential rebinding, environment setup or a real end-to-end test on the destination instance. Use this checklist **before** importing or activating anything in a client's environment.

## Quick diagnosis: what a JSON export can and cannot tell you

Before importing a workflow into another n8n instance, spend 90 seconds on three concrete checks:

1. **Does the file parse as JSON?** Try `python -m json.tool workflow.json > /dev/null` in a local terminal (omit the redirect on Windows if needed). If parsing fails, stop: the file is not valid JSON.
2. **Do the node names and connections agree?** In the `connections` map, each named source and target should correspond to a node in the `nodes` array. A mismatch is worth investigating; do not assume every disconnected node is a bug.
3. **Are the runtime dependencies available?** List credentials, linked workflows, environment variables, community nodes and n8n version. A syntactically valid export can still fail after import when these are missing.

**Common real-world trap:** exporting a node with a credential name does not prove that the destination has a valid matching credential **ID**. Rebind credentials inside the destination n8n instance and run a non-production execution before activation. A static JSON checker cannot establish that the remote credential exists or works.

**Free manual path:** follow steps 1–10 below; no purchase required. **Optional shortcut:** the [offline n8n Preflight Auditor ($9)](https://mhamedasskoure.gumroad.com/l/n8n-workflow-preflight-auditor?utm_source=github&utm_medium=free_guide&utm_campaign=preflight_90_seconds_20261108) reviews selected structural checks and offers a handoff report, but it does **not** run workflows, validate credential access or guarantee production readiness.

---

## 1. Work on a sanitized copy, never the only production export

Export the workflow through n8n's supported workflow export path. Keep the original securely and make a separate copy for review. **Before sharing an export outside your team, inspect its node parameters and expressions for secrets and personal data** (such as pasted API tokens, passwords, email addresses and example payloads). Do not assume the export or a static checker has removed them.

## 2. Read the basic graph shape

In a text editor, open the exported plain JSON file and look for the major fields:

- `nodes` should be an array of node definitions.
- `connections` should describe how node outputs connect to other nodes.
- Workflow-specific `settings`, `pinData` and metadata may vary with n8n version and export path. Do not treat optional-field absence as a universal error.

Check whether each node has an understandable, unique name and a useful type. Repeated names or IDs are **review candidates**; the decisive validation is importing into a compatible n8n version, not assuming every schema or node type is identical.

## 3. Follow every important connection

For each entry in `connections`, check that its source and referenced target nodes make sense in the same export. Ask whether all expected error branches, Merge/If paths and downstream writes are present. A disconnected node may be intentional; document why.

## 4. Treat credentials as a destination-specific task

Identify every node that requires a connection to an external service. On the destination n8n instance, the owner must **create, select or rebind the appropriate credentials with least-privilege access**. Never paste raw keys into the export or share real customer credentials over chat.

## 5. List environment and version dependencies

Record values and services that may not travel with the JSON file: environment variables, webhook URLs, public domains, workflow IDs, linked subworkflows, community nodes, package versions, and external data stores. Verify the destination instance supports the relevant nodes.

## 6. Scan for obvious unsafe assumptions

Look for test URLs, sample IDs, placeholder emails, hardcoded paths and expressions whose source data may be missing. A superficial text search will miss secrets embedded in other forms; use your organization's security process separately.

## 7. Review pinned and sample execution data

Pinned data and examples are helpful for development, but real customer payloads should not be distributed accidentally. Re-check any included `pinData` and test data for personal or confidential information.

## 8. Make the first import non-production

Import into an isolated or test n8n instance. Confirm that the graph renders and that required credentials, nodes and variables can be configured there. **Do not activate customer-facing triggers yet.**

## 9. Test the execution paths for real

Run representative success, failure and empty-data cases with test accounts. Check API rate limits, idempotency for writes, error handling, notification recipients and downstream side effects. **An offline JSON scan cannot prove runtime behavior or production safety.**

## 10. Handoff with a short acceptance record

Use a checklist like this one:

| Check | Owner / Evidence |
| --- | --- |
| Workflow export source and version | |
| Credential rebinding completed | |
| External node and environment prerequisites | |
| Trigger/webhook setup confirmed | |
| Successful test with non-production data | |
| Error path and retry handling reviewed | |
| Manual owner acceptance and rollback plan | |

For a production rollout, have the client owner review the planned activation and rollback procedure.

---

## Optional downloadable kit

The checklist above is usable **for free**. If you want an offline browser utility that opens plain JSON exports locally, checks selected structural issues and produces a report, see the independent **[n8n Workflow Preflight Auditor — $9 one-time](https://mhamedasskoure.gumroad.com/l/n8n-workflow-preflight-auditor?utm_source=github&utm_medium=free_sample&utm_campaign=n8n_preflight_20261107)**. I created this paid kit. It includes fictional clean/broken examples, regression tests and a handoff checklist. It **does not** execute workflows, inspect live credentials, perform a comprehensive secrets scan or certify production readiness. It is not affiliated with n8n.

**Optional faster checkout:** If you have reviewed the product scope and want the $9 auditor, [continue directly to Gumroad's payment page](https://mhamedasskoure.gumroad.com/l/n8n-workflow-preflight-auditor?wanted=true&utm_source=github&utm_medium=free_guide&utm_campaign=n8n_preflight_direct_checkout_20261108). Otherwise, [read the product details first](https://mhamedasskoure.gumroad.com/l/n8n-workflow-preflight-auditor). This is not a required purchase.

## Official documentation

- [n8n workflow sharing and credential permission model](https://docs.n8n.io/workflows/sharing/)
- [n8n security audit (a separate runtime/instance process)](https://docs.n8n.io/hosting/securing/security-audit/)
- [n8n workflow execution history](https://docs.n8n.io/workflows/executions/all-executions/)

*Last reviewed: 7 November 2026. Product capabilities and runtime documentation can change; always check the current n8n docs.*
