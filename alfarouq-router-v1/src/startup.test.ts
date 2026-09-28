import {expect,test} from "bun:test";
import {fileURLToPath} from "node:url";

for (const root of ["../", "../../"]) {
  test(`real process serves PORT persistently from ${root}`, async () => {
    const reservation=Bun.serve({hostname:"127.0.0.1",port:0,fetch:()=>new Response()});
    const port=reservation.port;
    await reservation.stop(true);
    const proc=Bun.spawn([process.execPath,"run","src/index.ts"],{
      cwd:fileURLToPath(new URL(root,import.meta.url)),
      env:{...process.env,PORT:String(port),FAST_INGRESS_SECRET:"",CONTROLLER_PRIVATE_KEY_B64:"",DATABASE_URL:"",ENABLE_GITHUB_POLL:"false"},
      stdout:"pipe",stderr:"pipe"
    });
    try {
      const url=`http://127.0.0.1:${port}`;
      let healthy=false;
      for (let i=0;i<40;i++) {
        try { healthy=(await fetch(`${url}/health`)).status===200; } catch {}
        if(healthy) break;
        await Bun.sleep(50);
      }
      expect(healthy).toBe(true);
      for (let i=0;i<3;i++) {
        expect((await fetch(`${url}/health`)).status).toBe(200);
        expect((await fetch(`${url}/v1/chatgpt/command`)).status).toBe(503);
      }
      expect((await fetch(`${url}/ready`)).status).toBe(503);
      expect(proc.exitCode).toBe(null);
    } finally {
      proc.kill();
      await proc.exited;
    }
  });
}
