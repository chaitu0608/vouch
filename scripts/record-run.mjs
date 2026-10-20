#!/usr/bin/env node
/**
 * Vouch recorder — a deliberately small MCP stdio client for the local bridge.
 *
 * It drives the read-only browser surface, opens exactly one URL, captures a
 * snapshot + screenshot, optionally asks the native runtime for one redacted
 * observation, releases the refs, and seals the whole exchange into a
 * hash-chained run.
 *
 * It never clicks, types, submits, sends, or runs a native task.
 *
 * Usage:
 *   node scripts/record-run.mjs \
 *     --task "Verify the admin endpoint" \
 *     --url http://127.0.0.1:4311/api/admin/users \
 *     --native \
 *     --out data/runs/my-run.json \
 *     --yes
 *
 * --yes acknowledges the two confirmed browser mutations (open + release).
 * --native is opt-in; native raw output is never written to the run.
 */
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

function usage() {
  console.log(`Vouch recorder

  --task <text>     what this run is proving (required)
  --url <http(s)>   the one page to open and capture (required)
  --out <file>      output JSON (default: data/runs/run-<timestamp>.json)
  --native          ask the native runtime for one redacted screen observation
  --yes             acknowledge the open + release mutations
  --help            show this help

The recorder speaks MCP over stdio to the local bridge. Set VOUCH_MCP to
override the default server path.
`);
}

function parseArgs(argv) {
  const out = { native: false, yes: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--native") out.native = true;
    else if (arg === "--yes" || arg === "-y") out.yes = true;
    else if (arg === "--task") out.task = argv[++i];
    else if (arg === "--url") out.url = argv[++i];
    else if (arg === "--out") out.out = argv[++i];
    else if (arg.startsWith("--task=")) out.task = arg.slice("--task=".length);
    else if (arg.startsWith("--url=")) out.url = arg.slice("--url=".length);
    else if (arg.startsWith("--out=")) out.out = arg.slice("--out=".length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  usage();
  process.exit(0);
}
if (!args.task || !args.url) {
  usage();
  process.exit(1);
}
if (!/^https?:\/\//i.test(args.url)) {
  console.error("--url must start with http:// or https://");
  process.exit(1);
}
if (!args.yes) {
  console.error(
    "Refusing to open a tab without --yes. Review the URL, then re-run with --yes."
  );
  process.exit(1);
}

/* ---------------------------------------------------------------- hashing */

function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
    .join(",")}}`;
}

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/* ------------------------------------------------------------- MCP client */

const mcpPath =
  process.env.VOUCH_MCP ||
  path.resolve(root, "..", "jobpilot", "server", "mcp.js");

if (!fs.existsSync(mcpPath)) {
  console.error(
    `Local bridge not found at ${mcpPath}\nSet VOUCH_MCP to its absolute path.`
  );
  process.exit(1);
}

const child = spawn(process.execPath, [mcpPath], {
  cwd: path.dirname(path.dirname(mcpPath)),
  env: { ...process.env },
  stdio: ["pipe", "pipe", "pipe"],
});

if (process.env.VOUCH_DEBUG) {
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
}

let buffer = "";
let nextId = 1;
const pending = new Map();

child.stdout.setEncoding("utf8");
child.stdout.on("data", (chunk) => {
  buffer += chunk;
  let newline;
  while ((newline = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (!line) continue;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      continue;
    }
    if (message.id == null || !pending.has(message.id)) continue;
    const request = pending.get(message.id);
    pending.delete(message.id);
    clearTimeout(request.timer);
    if (message.error) {
      request.reject(new Error(message.error.message || "MCP error"));
    } else {
      request.resolve(message.result);
    }
  }
});

child.on("exit", (code) => {
  for (const request of pending.values()) {
    clearTimeout(request.timer);
    request.reject(new Error(`MCP server exited (${code ?? "signal"})`));
  }
  pending.clear();
});

function rpc(method, params, timeoutMs = 120_000) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`${method} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    pending.set(id, { resolve, reject, timer });
    child.stdin.write(
      `${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`
    );
  });
}

async function callTool(name, toolArgs) {
  const result = await rpc("tools/call", { name, arguments: toolArgs }, 90_000);
  const blocks = Array.isArray(result?.content) ? result.content : [];
  const text = blocks
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
  const images = blocks
    .filter((block) => block.type === "image" && block.data)
    .map((block) => ({
      mimeType: block.mimeType || "image/png",
      data: block.data,
    }));

  if (result?.isError) {
    throw new Error(text || `${name} failed`);
  }
  return { text, images };
}

/* ---------------------------------------------------------------- recorder */

/**
 * The bridge keeps compatibility names on the wire. The artifact uses the
 * public Vouch aliases so a run stays readable without leaking implementation
 * names into the evidence room.
 */
const publicToolName = (tool) =>
  ({
    clinqy_look: "native_look",
    clinqy_stats: "native_stats",
    clinqy_run: "native_run",
    clinqy_open: "native_handoff",
  })[tool] ?? tool;

const startedAt = new Date();
const events = [];
const evidenceDir = path.join(root, "public", "evidence");

function at() {
  return new Date().toISOString();
}

function addEvent(event) {
  events.push({
    id: `evt_${String(events.length + 1).padStart(2, "0")}`,
    prevHash: "",
    hash: "",
    ...event,
  });
}

async function record(tool, toolArgs, options = {}) {
  const eventAt = at();
  const readOnly = options.readOnly ?? true;
  const payload = readOnly
    ? { ...toolArgs }
    : { ...toolArgs, confirmed: true };

  const result = await callTool(tool, payload);

  let excerpt = result.text.slice(0, 5000);
  if (options.redact) excerpt = options.redact;

  const evidence = [];
  if (tool === "browser_screenshot" && result.images.length > 0) {
    const image = result.images[0];
    fs.mkdirSync(evidenceDir, { recursive: true });
    const extension = image.mimeType.includes("png") ? "png" : "jpg";
    const file = `rec-${Date.now()}-${String(events.length + 1).padStart(
      2,
      "0"
    )}.${extension}`;
    fs.writeFileSync(
      path.join(evidenceDir, file),
      Buffer.from(image.data, "base64")
    );
    evidence.push({
      kind: "screenshot",
      label: "Viewport capture",
      src: `/evidence/${file}`,
      note: image.mimeType,
    });
  }

  if (options.nativeRedaction) {
    evidence.push({
      kind: "screen",
      label: "Native screen observation",
      content:
        "The native runtime observed the current screen. The raw description is withheld by the recorder's privacy policy.",
      note: "redacted by policy",
      redacted: true,
    });
  }

  addEvent({
    at: eventAt,
    tool: publicToolName(tool),
    title: options.title || publicToolName(tool),
    summary: options.summary || "",
    surface: tool.startsWith("clinqy_")
      ? "native"
      : tool.startsWith("browser_")
        ? "web"
        : "system",
    readOnly,
    ...(options.approved ? { approved: true } : {}),
    status: options.status || "ok",
    ...(options.target ? { target: options.target } : {}),
    args: payload,
    result: {
      excerpt,
      ...(options.meta ? { meta: options.meta } : {}),
    },
    ...(evidence.length > 0 ? { evidence } : {}),
  });

  console.log(`  ${readOnly ? "·" : "!"} ${publicToolName(tool)}`);
  return result;
}

function parseTabList(text) {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.tabs)) return parsed.tabs;
  } catch {
    /* fall through */
  }
  return [];
}

/* ------------------------------------------------------------------- main */

let childClosed = false;
function closeChild() {
  if (childClosed) return;
  childClosed = true;
  try {
    child.stdin.end();
  } catch {
    /* already closed */
  }
  child.kill();
}

try {
  console.log(`Vouch recorder · ${args.url}`);
  console.log(`  MCP ${mcpPath}`);

  await rpc(
    "initialize",
    {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "vouch-recorder", version: "0.1.0" },
    },
    20_000
  );
  child.stdin.write(
    `${JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/initialized",
      params: {},
    })}\n`
  );

  const tabsResult = await record(
    "browser_list_tabs",
    {},
    {
      title: "Discover the browser session",
      summary:
        "The browser surface listed the open tabs. The recorder kept the id of the first tab so every later event points at the same session.",
      meta: "read-only · tab inventory",
    }
  );

  const tabs = parseTabList(tabsResult.text);
  if (tabs.length === 0) {
    throw new Error(
      "The browser surface returned no tabs. Open Chrome with the extension first."
    );
  }
  let tabId = tabs[0].id;
  if (tabId == null) throw new Error("The first tab did not include an id.");

  const opened = await record(
    "browser_open_tab",
    { url: args.url, active: true },
    {
      readOnly: false,
      title: "Open the target URL",
      summary: `The browser surface opened ${args.url} in a focused tab. This is the only URL the recorder opened.`,
      target: args.url,
      meta: "confirmed mutation · target opened",
    }
  );

  try {
    const parsed = JSON.parse(opened.text);
    if (parsed?.id != null) tabId = parsed.id;
  } catch {
    /* keep the list-tabs id */
  }

  await record(
    "browser_wait",
    { tabId, milliseconds: 1200 },
    {
      title: "Wait for the page to settle",
      summary:
        "Waited for navigation and hydration before taking evidence, so the snapshot and screenshot describe the loaded page.",
      meta: "read-only · settled",
    }
  );

  const snapshot = await callTool("browser_snapshot", { tabId });
  addEvent({
    at: at(),
    tool: "browser_snapshot",
    title: "Snapshot the page",
    summary:
      "Captured a compact page snapshot: URL, headings, interactive refs, and visible text.",
    surface: "web",
    readOnly: true,
    status: "ok",
    target: args.url,
    args: { tabId },
    result: {
      excerpt: snapshot.text.slice(0, 5000),
      meta: "read-only · DOM snapshot",
    },
  });
  console.log("  · browser_snapshot");

  await record(
    "browser_screenshot",
    { tabId },
    {
      title: "Capture the viewport",
      summary:
        "The browser surface captured the visible viewport as downscaled JPEG evidence. The image is stored beside this run.",
      target: args.url,
      meta: "read-only · image/jpeg",
    }
  );

  if (args.native) {
    try {
      await record(
        "clinqy_look",
        { mode: "page" },
        {
          title: "Native context check",
          summary:
            "The native runtime looked at the current screen. The raw observation is withheld by policy; only the fact that it happened is recorded.",
          redact:
            "Native observation captured. Raw screen output withheld by the recorder's privacy policy.",
          nativeRedaction: true,
          status: "redacted",
          meta: "redacted by policy",
        }
      );
    } catch (error) {
      addEvent({
        at: at(),
        tool: "native_look",
        title: "Native context check",
        summary:
          "The native runtime was unavailable, so the observation was skipped. The browser record is unaffected.",
        surface: "native",
        readOnly: true,
        status: "blocked",
        args: { mode: "page" },
        result: {
          excerpt:
            error instanceof Error ? error.message : "The native runtime did not answer.",
          meta: "blocked · optional sensor",
        },
      });
      console.log("  × native_look (blocked)");
    }
  }

  await record(
    "browser_release",
    { tabId },
    {
      readOnly: false,
      title: "Release the element refs",
      summary:
        "Cleared the short-lived ref map for the tab. The tab was left open for review; no further actions were taken.",
      meta: "confirmed mutation · refs cleared",
    }
  );

  /* Seal the chain exactly like scripts/seal-runs.mjs and lib/chain.ts. */
  let prev = "GENESIS";
  const sealedEvents = events.map((event) => {
    const { prevHash: _prev, hash: _hash, ...rest } = event;
    const digest = sha256(`${prev}|${canonicalize(rest)}`);
    const sealed = { ...rest, prevHash: prev, hash: digest };
    prev = digest;
    return sealed;
  });

  const finishedAt = new Date();
  const slug = args.task
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 42);
  const run = {
    id: `run-${Date.now().toString(36)}-${slug || "capture"}`,
    title: args.task,
    task: args.task,
    summary:
      `A local capture of ${args.url}: tab discovery, one confirmed open, a snapshot, a screenshot, ` +
      `${args.native ? "one redacted native check, " : ""}and a release. No click, type, submit, or send was recorded.`,
    verdict: {
      label: "Recorded locally",
      detail:
        "The chain proves which events were recorded and in what order. Review the evidence, then edit this verdict before sharing.",
      tone: "info",
    },
    startedAt: startedAt.toISOString(),
    durationMs: Math.max(0, finishedAt.getTime() - startedAt.getTime()),
    mode: "live",
    agent: "Vouch local bridge",
    tags: ["recorded", "local", args.native ? "web + native" : "web"],
    events: sealedEvents,
    integrity: {
      algorithm: "SHA-256",
      head: prev,
      events: sealedEvents.length,
    },
  };

  run.integrity.manifest = sha256(
    canonicalize({
      id: run.id,
      title: run.title,
      task: run.task,
      summary: run.summary,
      verdict: run.verdict,
      startedAt: run.startedAt,
      durationMs: run.durationMs,
      mode: run.mode,
      agent: run.agent ?? null,
      tags: run.tags,
      head: run.integrity.head,
      events: run.integrity.events,
    })
  );

  const outPath = path.resolve(
    process.cwd(),
    args.out || `data/runs/run-${Date.now()}.json`
  );
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(run, null, 2)}\n`);

  console.log("");
  console.log(`✓ sealed ${sealedEvents.length} events`);
  console.log(`  file  ${outPath}`);
  console.log(`  head  ${prev.slice(0, 24)}…`);
  console.log("  next  npm run seal && npm run dev");
} catch (error) {
  console.error("");
  console.error(
    `✗ ${error instanceof Error ? error.message : String(error)}`
  );
  process.exitCode = 1;
} finally {
  closeChild();
}
