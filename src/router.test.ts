import { describe, expect, test } from "bun:test";
import { decide } from "./router";

describe("router shadow behavior", () => {
  test("browser form -> direct playwright", () => {
    const x = decide({task_id:"t1",task_type:"browser_form"});
    expect(x.would_route_to).toBe("direct_playwright");
    expect(x.executed).toBe(false);
  });

  test("routine code -> opencode", () => {
    const x = decide({task_id:"t2",task_type:"code_edit"});
    expect(x.would_route_to).toBe("opencode");
    expect(x.executed).toBe(false);
  });

  test("complex architecture starts local", () => {
    const x = decide({task_id:"t3",task_type:"architecture_complex"});
    expect(x.would_route_to).toBe("ollama_qwen");
    expect(x.executed).toBe(false);
  });
});
