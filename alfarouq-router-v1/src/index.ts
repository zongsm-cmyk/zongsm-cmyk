import { Hono } from "hono";
import { Pool } from "pg";
import { decide } from "./router";

const app = new Hono();
const FAST_SECRET = Bun.env.FAST_INGRESS_SECRET || "";
const PRIVATE_KEY_B64 = Bun.env.CONTROLLER_PRIVATE_KEY_B64 || "";
const DATABASE_URL = Bun.env.DATABASE_URL || "";
const DEVICE_ID = Bun.env.DEVICE_ID || "ALFAROUQ";
const ARCH = "abu-phase0-v1";
const pool = new Pool({ connectionString: DATABASE_URL, connectionTimeoutMillis: 5000, query_timeout: 5000 });
pool.on("error", () => console.error("FAST_INGRESS_DATABASE_ERROR"));
const BUILD = "fast-ingress-http-v2";

function canonicalize(obj:any):string{
  if(obj===null) return "null";
  if(typeof obj==="boolean") return obj?"true":"false";
  if(typeof obj==="number") return JSON.stringify(obj);
  if(typeof obj==="string") return JSON.stringify(obj);
  if(Array.isArray(obj)) return "["+obj.map(canonicalize).join(",")+"]";
  if(typeof obj==="object"){
    return "{"+Object.keys(obj).sort().map(k=>JSON.stringify(k)+":"+canonicalize(obj[k])).join(",")+"}";
  }
  return JSON.stringify(obj);
}
function b64urlDecodeText(s:string){
  let x=s.replace(/-/g,"+").replace(/_/g,"/");
  while(x.length%4)x+="=";
  return Buffer.from(x,"base64").toString("utf8");
}
async function hmacHex(secret:string,data:string){
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const mac=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(data));
  return Array.from(new Uint8Array(mac)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
function safeEq(a:string,b:string){
  if(a.length!==b.length)return false; let d=0;
  for(let i=0;i<a.length;i++) d|=a.charCodeAt(i)^b.charCodeAt(i);
  return d===0;
}
async function importKey(){
  const pem=Buffer.from(PRIVATE_KEY_B64,"base64").toString("utf8");
  const body=pem.replace(/-----BEGIN PRIVATE KEY-----/,"").replace(/-----END PRIVATE KEY-----/,"").replace(/\s/g,"");
  const der=Buffer.from(body,"base64");
  return crypto.subtle.importKey("pkcs8",der,{name:"Ed25519"},false,["sign"]);
}
async function sha256b64(s:string){
  const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));
  return Buffer.from(h).toString("base64");
}
app.use("*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  await next();
});
app.onError(() => Response.json({error:"ingress unavailable"}, {status:503, headers:{"Cache-Control":"no-store"}}));
app.get("/health",c=>c.json({ok:true,service:"alfarouq-fast-ingress",version:BUILD,
  revision:Bun.env.RAILWAY_GIT_COMMIT_SHA || null, command_path:"/v1/chatgpt/command"}));
app.get("/ready", async c => {
  if (!FAST_SECRET || !PRIVATE_KEY_B64 || !DATABASE_URL) return c.json({ok:false,error:"not configured"},503);
  await importKey();
  await pool.query("SELECT 1 FROM commands LIMIT 0");
  return c.json({ok:true,service:"alfarouq-fast-ingress",version:BUILD});
});

app.post("/v1/decision", async c => {
  const token = Bun.env.ROUTER_TOKEN || "";
  if (!token) return c.json({error:"router_not_configured"},503);
  const auth = c.req.header("Authorization") || "";
  if (auth !== `Bearer ${token}`) return c.json({error:"unauthorized"},401);
  let task:any;
  try { task = await c.req.json(); } catch { return c.json({error:"invalid_json"},400); }
  if (!task?.task_id || !task?.task_type) return c.json({error:"missing_task_fields"},400);
  c.header("Cache-Control","no-store");
  return c.json(decide(task),200);
});
app.on(["GET", "POST"],"/v1/chatgpt/command",async c=>{
  c.header("Cache-Control","no-store");
  if(!FAST_SECRET||!PRIVATE_KEY_B64||!DATABASE_URL) return c.json({error:"not configured"},503);
  let input:any = c.req.query();
  if (c.req.method === "POST") {
    if (Number(c.req.header("content-length") || 0) > 16384) return c.json({error:"payload too large"},413);
    const raw = await c.req.text();
    if (raw.length > 16384) return c.json({error:"payload too large"},413);
    try { input = JSON.parse(raw); } catch { return c.json({error:"invalid json"},400); }
  }
  if (!input || typeof input !== "object") return c.json({error:"invalid ingress envelope"},400);
  const {p, e} = input;
  const s = typeof input.s === "string" ? input.s.toLowerCase() : "";
  if (typeof p !== "string" || typeof e !== "string") return c.json({error:"invalid ingress envelope"},400);
  if(!p||p.length>12000||!/^\d{10}$/.test(e)||!/^[a-f0-9]{64}$/.test(s)) return c.json({error:"invalid ingress envelope"},400);
  const now=Math.floor(Date.now()/1000), exp=Number(e);
  if(!Number.isFinite(exp)||exp<now-5||exp>now+120) return c.json({error:"expired"},401);
  if(!safeEq(await hmacHex(FAST_SECRET,`${e}.${p}`),s)) return c.json({error:"unauthorized"},401);
  let intent:any; try{intent=JSON.parse(b64urlDecodeText(p));}catch{return c.json({error:"invalid payload"},400);}
  if (!intent || typeof intent !== "object" || Array.isArray(intent)) return c.json({error:"invalid payload"},400);
  const req=["request_id","idempotency_key","architecture_version","action","args","risk_class","result_capability","expires_in_sec"];
  for(const f of req) if(!(f in intent)||intent[f]===null||intent[f]==="") return c.json({error:`missing field: ${f}`},400);
  if(intent.architecture_version!==ARCH) return c.json({error:"architecture mismatch"},409);
  if(!/^[a-z0-9_]{2,64}$/.test(intent.action)) return c.json({error:"invalid action"},400);
  if(!["read_only","reversible","irreversible","destructive"].includes(intent.risk_class)) return c.json({error:"invalid risk class"},400);
  if(["irreversible","destructive"].includes(intent.risk_class)&&intent.human_approved!==true) return c.json({error:"explicit human approval required"},403);
  const ttl=Number(intent.expires_in_sec);
  if(!Number.isInteger(ttl)||ttl<30||ttl>900) return c.json({error:"invalid expires_in_sec"},400);
  if(typeof intent.request_id!=="string"||intent.request_id.length<1||intent.request_id.length>256||
     typeof intent.idempotency_key!=="string"||intent.idempotency_key.length<1||intent.idempotency_key.length>256||
     typeof intent.result_capability!=="string"||intent.result_capability.length<16||intent.result_capability.length>256)
    return c.json({error:"invalid identifier/capability length"},400);
  const ex=await pool.query("SELECT request_id FROM commands WHERE request_id=$1",[intent.request_id]);
  if(ex.rows.length) return c.json({request_id:intent.request_id,status:"duplicate"},200);
  const t=new Date();
  const envelope={
    request_id:intent.request_id,idempotency_key:intent.idempotency_key,architecture_version:ARCH,
    issued_at:t.toISOString(),expires_at:new Date(t.getTime()+ttl*1000).toISOString(),
    action:intent.action,args:intent.args,risk_class:intent.risk_class,nonce:crypto.randomUUID()
  };
  const key=await importKey();
  const sig=await crypto.subtle.sign("Ed25519",key,new TextEncoder().encode(canonicalize(envelope)));
  const full={...envelope,signature:Buffer.from(sig).toString("base64")};
  const capHash=await sha256b64(intent.result_capability);
  const inserted = await pool.query("INSERT INTO commands (request_id,device_id,envelope,status,result_cap_sha256) VALUES ($1,$2,$3,'pending',$4) ON CONFLICT (request_id) DO NOTHING RETURNING request_id",
    [intent.request_id,DEVICE_ID,JSON.stringify(full),capHash]);
  if (!inserted.rows.length) return c.json({request_id:intent.request_id,status:"duplicate"},200);
  console.log(`FAST_INGRESS_QUEUED request_id=${intent.request_id} action=${intent.action}`);
  return c.json({request_id:intent.request_id,status:"pending"},202);
});

app.post("/v1/github-command", async c => {
  if (!FAST_SECRET || !PRIVATE_KEY_B64 || !DATABASE_URL) return c.json({error:"not configured"},503);
  const raw = new Uint8Array(await c.req.arrayBuffer());
  const sigHeader = c.req.header("x-hub-signature-256") || "";
  if (!sigHeader.startsWith("sha256=")) return c.json({error:"unauthorized"},401);
  const expected = sigHeader.slice(7).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(expected)) return c.json({error:"unauthorized"},401);
  const actual = await hmacHex(FAST_SECRET, new TextDecoder().decode(raw));
  if (!safeEq(actual, expected)) return c.json({error:"unauthorized"},401);

  if ((c.req.header("x-github-event") || "") !== "issues") return c.json({ignored:true},202);
  let payload:any;
  try { payload = JSON.parse(new TextDecoder().decode(raw)); }
  catch { return c.json({error:"invalid json"},400); }
  if (payload?.action !== "opened") return c.json({ignored:true},202);

  const issue = payload?.issue;
  if (!issue || issue?.user?.login !== "zongsm-cmyk") return c.json({error:"forbidden"},403);
  if (typeof issue.title !== "string" || !issue.title.startsWith("[ALFAROUQ]")) return c.json({ignored:true},202);

  let intent:any;
  try { intent = JSON.parse(issue.body || "{}"); }
  catch { return c.json({error:"invalid issue body"},400); }

  intent.request_id = intent.request_id || ("gh-" + String(issue.id));
  intent.idempotency_key = intent.idempotency_key || intent.request_id;
  intent.architecture_version = intent.architecture_version || ARCH;
  intent.result_capability = intent.result_capability || crypto.randomUUID().replaceAll("-","");
  intent.expires_in_sec = intent.expires_in_sec || 600;

  const req=["request_id","idempotency_key","architecture_version","action","args","risk_class","result_capability","expires_in_sec"];
  for(const f of req) if(!(f in intent)||intent[f]===null||intent[f]==="") return c.json({error:`missing field: ${f}`},400);
  if(intent.architecture_version!==ARCH) return c.json({error:"architecture mismatch"},409);
  if(!/^[a-z0-9_]{2,64}$/.test(intent.action)) return c.json({error:"invalid action"},400);
  if(!["read_only","reversible","irreversible","destructive"].includes(intent.risk_class)) return c.json({error:"invalid risk class"},400);
  const ttl=Number(intent.expires_in_sec);
  if(!Number.isInteger(ttl)||ttl<30||ttl>900) return c.json({error:"invalid expires_in_sec"},400);

  const ex=await pool.query("SELECT request_id FROM commands WHERE request_id=$1",[intent.request_id]);
  if(ex.rows.length) return c.json({request_id:intent.request_id,status:"duplicate"},200);

  const t=new Date();
  const envelope={
    request_id:intent.request_id,idempotency_key:intent.idempotency_key,architecture_version:ARCH,
    issued_at:t.toISOString(),expires_at:new Date(t.getTime()+ttl*1000).toISOString(),
    action:intent.action,args:intent.args,risk_class:intent.risk_class,nonce:crypto.randomUUID()
  };
  const key=await importKey();
  const sig=await crypto.subtle.sign("Ed25519",key,new TextEncoder().encode(canonicalize(envelope)));
  const full={...envelope,signature:Buffer.from(sig).toString("base64")};
  const capHash=await sha256b64(intent.result_capability);
  await pool.query("INSERT INTO commands (request_id,device_id,envelope,status,result_cap_sha256) VALUES ($1,$2,$3,'pending',$4)",
    [intent.request_id,DEVICE_ID,JSON.stringify(full),capHash]);
  console.log(`GITHUB_INGRESS_QUEUED request_id=${intent.request_id} action=${intent.action}`);
  return c.json({request_id:intent.request_id,status:"pending"},202);
});


async function pollGithubIssues(){
  try{
    const r=await fetch("https://api.github.com/repos/zongsm-cmyk/zongsm-cmyk/issues?state=open&per_page=20",{
      headers:{"Accept":"application/vnd.github+json","User-Agent":"ALFAROUQ-Ingress/1.0"}
    });
    if(!r.ok) return;
    const issues:any[]=await r.json();
    for(const issue of issues){
      if(issue?.pull_request) continue;
      if(issue?.user?.login!=="zongsm-cmyk") continue;
      if(typeof issue?.title!=="string"||!issue.title.startsWith("[ALFAROUQ]")) continue;

      let intent:any;
      try{ intent=JSON.parse(issue.body||"{}"); }catch{ continue; }

      intent.request_id=intent.request_id||("ghpoll-"+String(issue.id));
      intent.idempotency_key=intent.idempotency_key||intent.request_id;
      intent.architecture_version=intent.architecture_version||ARCH;
      intent.result_capability=intent.result_capability||crypto.randomUUID().replaceAll("-","");
      intent.expires_in_sec=intent.expires_in_sec||600;

      const req=["request_id","idempotency_key","architecture_version","action","args","risk_class","result_capability","expires_in_sec"];
      let bad=false; for(const f of req){ if(!(f in intent)||intent[f]===null||intent[f]===""){bad=true;break;} }
      if(bad||intent.architecture_version!==ARCH||!/^[a-z0-9_]{2,64}$/.test(intent.action)) continue;
      if(!["read_only","reversible","irreversible","destructive"].includes(intent.risk_class)) continue;
      const ttl=Number(intent.expires_in_sec);
      if(!Number.isInteger(ttl)||ttl<30||ttl>900) continue;

      const ex=await pool.query("SELECT request_id FROM commands WHERE request_id=$1",[intent.request_id]);
      if(ex.rows.length) continue;

      const t=new Date();
      const envelope={
        request_id:intent.request_id,idempotency_key:intent.idempotency_key,architecture_version:ARCH,
        issued_at:t.toISOString(),expires_at:new Date(t.getTime()+ttl*1000).toISOString(),
        action:intent.action,args:intent.args,risk_class:intent.risk_class,nonce:crypto.randomUUID()
      };
      const key=await importKey();
      const sig=await crypto.subtle.sign("Ed25519",key,new TextEncoder().encode(canonicalize(envelope)));
      const full={...envelope,signature:Buffer.from(sig).toString("base64")};
      const capHash=await sha256b64(intent.result_capability);
      await pool.query(
        "INSERT INTO commands (request_id,device_id,envelope,status,result_cap_sha256) VALUES ($1,$2,$3,'pending',$4)",
        [intent.request_id,DEVICE_ID,JSON.stringify(full),capHash]
      );
      console.log(`GITHUB_POLL_QUEUED request_id=${intent.request_id} action=${intent.action} issue=${issue.number}`);
    }
  }catch(err){
    console.error("GITHUB_POLL_ERROR");
  }
}
let pollTimer: ReturnType<typeof setInterval> | undefined;
export function startServer() {
  const port = Number(Bun.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  const server = Bun.serve({hostname:"0.0.0.0",port,fetch:app.fetch,maxRequestBodySize:16384});
  // The HTTP listener owns the process lifetime. Legacy polling is opt-in only.
  if (Bun.env.ENABLE_GITHUB_POLL === "true") pollTimer = setInterval(pollGithubIssues,60000);
  console.log(JSON.stringify({event:"FAST_INGRESS_LISTENING",port,build:BUILD}));
  let stopping = false;
  const shutdown = async () => {
    if (stopping) return;
    stopping = true;
    if (pollTimer) clearInterval(pollTimer);
    const deadline = setTimeout(() => process.exit(1),10000);
    deadline.unref();
    await server.stop();
    await pool.end();
    clearTimeout(deadline);
  };
  process.once("SIGTERM",shutdown);
  process.once("SIGINT",shutdown);
  return server;
}
export { app };
if (import.meta.main) startServer();
