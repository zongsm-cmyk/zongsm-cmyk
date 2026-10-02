import fs from "node:fs";

function readStdin() {
  return fs.readFileSync(0, "utf8").trim();
}

function normalizeCell(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim().replace(/\s+/g, " ");
}

function normalizeHeader(v, i) {
  const s = normalizeCell(v).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return s || `column_${i + 1}`;
}

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (ch !== "\r") cell += ch;
  }
  row.push(cell);
  if (row.length > 1 || row[0] !== "") rows.push(row);
  return rows;
}

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function toCsv(rows) {
  return rows.map(r => r.map(csvEscape).join(",")).join("\n") + "\n";
}

function stableKey(obj, keys) {
  if (keys?.length) return keys.map(k => JSON.stringify(obj[k] ?? null)).join("|");
  return JSON.stringify(obj, Object.keys(obj).sort());
}

function processJson(data, opts) {
  const parsed = JSON.parse(data);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  let rows = arr.map(x => {
    if (x && typeof x === "object" && !Array.isArray(x)) {
      return Object.fromEntries(Object.entries(x).map(([k,v]) => [opts.normalize_headers ? normalizeHeader(k,0) : k, typeof v === "string" && opts.trim_whitespace ? normalizeCell(v) : v]));
    }
    return { value: typeof x === "string" && opts.trim_whitespace ? normalizeCell(x) : x };
  });
  const before = rows.length;
  if (opts.remove_empty_rows) rows = rows.filter(x => Object.values(x).some(v => v !== "" && v !== null && v !== undefined));
  if (opts.dedupe) {
    const seen = new Set();
    rows = rows.filter(x => {
      const k = stableKey(x, opts.key_fields);
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
  }
  if (opts.sort_key) rows.sort((a,b) => String(a[opts.sort_key] ?? "").localeCompare(String(b[opts.sort_key] ?? "")));
  return { output: JSON.stringify(rows, null, 2), count_before: before, count_after: rows.length };
}

function processCsv(data, opts) {
  const matrix = parseCsv(data);
  if (!matrix.length) throw new Error("CSV input is empty");
  let headers = matrix[0].map((h,i) => opts.normalize_headers ? normalizeHeader(h,i) : normalizeCell(h));
  const objects = matrix.slice(1).map(r => Object.fromEntries(headers.map((h,i) => [h, opts.trim_whitespace ? normalizeCell(r[i] ?? "") : (r[i] ?? "")])));
  const before = objects.length;
  let rows = objects;
  if (opts.remove_empty_rows) rows = rows.filter(x => Object.values(x).some(v => v !== ""));
  if (opts.dedupe) {
    const seen = new Set();
    rows = rows.filter(x => {
      const k = stableKey(x, opts.key_fields);
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
  }
  if (opts.sort_key) rows.sort((a,b) => String(a[opts.sort_key] ?? "").localeCompare(String(b[opts.sort_key] ?? "")));
  return { output: toCsv([headers, ...rows.map(x => headers.map(h => x[h] ?? ""))]), count_before: before, count_after: rows.length };
}

function main(order) {
  const inputs = order?.inputs ?? order?.input ?? {};
  const format = String(inputs.format ?? "csv").toLowerCase();
  const data = String(inputs.data ?? inputs.raw_data ?? "");
  if (!data.trim()) throw new Error("Missing required input: data");

  const opts = {
    trim_whitespace: inputs.trim_whitespace !== false,
    normalize_headers: inputs.normalize_headers === true,
    remove_empty_rows: inputs.remove_empty_rows !== false,
    dedupe: inputs.dedupe !== false,
    key_fields: Array.isArray(inputs.key_fields) ? inputs.key_fields.map(String) : String(inputs.key_fields ?? "").split(",").map(s => s.trim()).filter(Boolean),
    sort_key: String(inputs.sort_key ?? "").trim() || null
  };

  const result = format === "json" ? processJson(data, opts) : processCsv(data, opts);
  const removed = result.count_before - result.count_after;
  const qa = {
    format,
    input_records: result.count_before,
    output_records: result.count_after,
    removed_rows_or_duplicates: removed,
    operations: opts
  };
  return [
    "# Cleaned data",
    "",
    "~~~" + (format === "json" ? "json" : "csv"),
    result.output.trimEnd(),
    "~~~",
    "",
    "# QA summary",
    "",
    "~~~json",
    JSON.stringify(qa, null, 2),
    "~~~",
    "",
    "No records or values were invented; transformations are limited to the requested deterministic cleanup operations."
  ].join("\n");
}

try {
  const raw = readStdin();
  const order = JSON.parse(raw || "{}");
  process.stdout.write(main(order));
} catch (err) {
  console.error("WORKER_ERROR:", err instanceof Error ? err.message : String(err));
  process.exit(1);
}
