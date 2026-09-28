export type Task = {
  task_id: string;
  task_type: string;
  risk_class?: "read_only" | "reversible" | "irreversible" | "destructive";
  needs_sso?: boolean;
  high_value?: boolean;
};

const PRIMARY: Record<string,string> = {
  browser_form: "direct_playwright",
  browser_navigation: "direct_playwright",
  upload: "direct_playwright",
  submit: "direct_playwright",
  workflow: "n8n",
  scheduled_workflow: "n8n",
  webhook_flow: "n8n",
  stateful_automation: "n8n",
  simple_file_edit: "local_executor",
  file_ops: "local_executor",
  git_routine: "local_executor",
  docker_routine: "local_executor",
  log_reading: "local_executor",
  config_simple: "local_executor",
  api_deterministic: "local_executor",
  test_routine: "local_executor",
  service_status: "local_executor",
  service_restart: "local_executor",
  search: "local_search",
  web_lookup: "local_search",
  scrape: "local_extraction",
  extract: "local_extraction",
  document_parse: "local_extraction",
  code_edit: "opencode",
  debug_simple: "opencode",
  refactor_small: "opencode",
  architecture_complex: "ollama_qwen",
  debug_difficult: "ollama_qwen",
  refactor_high_risk: "ollama_qwen",
  production_incident: "ollama_qwen"
};

export function decide(task: Task) {
  const chosen = PRIMARY[task.task_type] ?? "ollama_qwen";
  return {
    router_version: "1.0.0-rc1",
    mode: "shadow",
    task_id: task.task_id,
    task_type: task.task_type,
    would_route_to: chosen,
    executed: false
  };
}
