import { afterAll, beforeEach, expect, mock, test } from "bun:test";
import { createHmac, createHash, generateKeyPairSync, verify } from "node:crypto";

const { privateKey, publicKey } = generateKeyPairSync("ed25519");
process.env.FAST_INGRESS_SECRET = "test-only-secret";
process.env.CONTROLLER_PRIVATE_KEY_B64 = Buffer.from(privateKey.export({format:"pem",type:"pkcs8"})).toString("base64");
process.env.DATABASE_URL = "postgres://test.invalid/test";
const rows = new Map<string, any[]>();
let unavailable = false;
mock.module("pg", () => ({Pool: class {
  on() {}
  async query(sql: string, values: any[] = []) {
    if (unavailable) throw new Error("do not expose database details");
    if (sql.startsWith("SELECT 1")) return {rows:[]};
    if (sql.startsWith("SELECT")) return {rows:rows.has(values[0]) ? [{request_id:values[0]}] : []};
    if (!sql.includes("ON CONFLICT (request_id) DO NOTHING")) throw new Error("non-atomic insert");
    if (rows.has(values[0])) return {rows:[]};
    rows.set(values[0],values);
    return {rows:[{request_id:values[0]}]};
  }
  async end() {}
}}));
const {app} = await import("./index");
const server = Bun.serve({hostname:"127.0.0.1",port:0,fetch:app.fetch});
const base = `http://127.0.0.1:${server.port}`;
afterAll(() => server.stop(true));
beforeEach(() => {rows.clear(); unavailable=false;});
const intent = (action="health") => ({request_id:crypto.randomUUID(),idempotency_key:crypto.randomUUID(),architecture_version:"abu-phase0-v1",action,args:action==="browser_sequence"?{steps:[]}:{},risk_class:"read_only",result_capability:"test-result-capability-123",expires_in_sec:60});
function sign(payload:any, expiry=Math.floor(Date.now()/1000)+60) {
  const p=Buffer.from(JSON.stringify(payload)).toString("base64url"), e=String(expiry);
  return {p,e,s:createHmac("sha256","test-only-secret").update(`${e}.${p}`).digest("hex")};
}
const post = (body:any) => fetch(`${base}/v1/chatgpt/command`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});

test("health identifies actual ingress and readiness checks dependencies", async () => {
  const health=await fetch(`${base}/health`);
  expect(health.headers.get("cache-control")).toBe("no-store");
  expect(await health.json()).toMatchObject({service:"alfarouq-fast-ingress",version:"fast-ingress-http-v2",command_path:"/v1/chatgpt/command"});
  expect((await fetch(`${base}/ready`)).status).toBe(200);
  unavailable=true;
  const failed=await fetch(`${base}/ready`);
  expect(failed.status).toBe(503);
  expect(await failed.text()).not.toContain("database details");
});
test("health then browser_sequence enqueue signed envelopes on one HTTP server", async () => {
  for (const action of ["health","browser_sequence"]) {
    const payload=intent(action);
    expect((await post(sign(payload))).status).toBe(202);
    const row=rows.get(payload.request_id)!;
    const {signature,...envelope}=JSON.parse(row[2]);
    expect(envelope).toMatchObject({action,args:payload.args,architecture_version:"abu-phase0-v1",request_id:payload.request_id});
    expect(Date.parse(envelope.expires_at)-Date.parse(envelope.issued_at)).toBe(60000);
    const canonical = JSON.stringify(envelope, Object.keys(envelope).concat("steps").sort());
    expect(verify(null,Buffer.from(canonical),publicKey,Buffer.from(signature,"base64"))).toBe(true);
    expect(row[1]).toBe("ALFAROUQ");
    expect(row[3]).toBe(createHash("sha256").update(payload.result_capability).digest("base64"));
  }
  expect(rows.size).toBe(2);
});
test("legacy GET is supported; repeated request is not enqueued twice", async () => {
  const query=new URLSearchParams(sign(intent()));
  expect((await fetch(`${base}/v1/chatgpt/command?${query}`)).status).toBe(202);
  expect((await fetch(`${base}/v1/chatgpt/command?${query}`)).status).toBe(200);
  expect(rows.size).toBe(1);
});
test("concurrent duplicate requests insert exactly once", async () => {
  const body=sign(intent());
  const responses=await Promise.all(Array.from({length:8},()=>post(body)));
  expect(responses.filter(r=>r.status===202)).toHaveLength(1);
  expect(responses.filter(r=>r.status===200)).toHaveLength(7);
  expect(rows.size).toBe(1);
});
test("rejects bad HMAC, stale expiry, future expiry, invalid signed payload and unapproved destructive intent", async () => {
  expect((await post({...sign(intent()),s:"0".repeat(64)})).status).toBe(401);
  expect((await post(sign(intent(),Math.floor(Date.now()/1000)-60))).status).toBe(401);
  expect((await post(sign(intent(),Math.floor(Date.now()/1000)+300))).status).toBe(401);
  for (const payload of [null,7,[],{}]) expect((await post(sign(payload))).status).toBe(400);
  expect((await post(sign({...intent(),risk_class:"destructive"}))).status).toBe(403);
  expect(rows.size).toBe(0);
});
test("registered route returns validation failure rather than 404", async () => {
  expect((await fetch(`${base}/v1/chatgpt/command`)).status).toBe(400);
  expect((await post(null)).status).toBe(400);
  expect((await post({p:"x".repeat(17000)})).status).toBe(413);
});
