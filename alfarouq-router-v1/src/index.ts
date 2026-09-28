import { Hono } from "hono";
import { decide } from "./router";

const app = new Hono();
const TOKEN = Bun.env.ROUTER_TOKEN || "";

app.get("/health", c => c.json({
  ok: true,
  service: "alfarouq-router-service",
  version: "1.0.0-rc1",
  mode: "shadow",
  live_execution_enabled: false
}));

app.post("/v1/decision", async c => {
  if (!TOKEN) return c.json({error:"router_not_configured"},503);

  const auth = c.req.header("Authorization") || "";
  if (auth !== `Bearer ${TOKEN}`) {
    return c.json({error:"unauthorized"},401);
  }

  let task:any;
  try {
    task = await c.req.json();
  } catch {
    return c.json({error:"invalid_json"},400);
  }

  if (!task?.task_id || !task?.task_type) {
    return c.json({error:"missing_task_fields"},400);
  }

  c.header("Cache-Control","no-store");
  return c.json(decide(task),200);
});

export default app;
