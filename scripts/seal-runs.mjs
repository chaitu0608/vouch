/**
 * Seal every run in data/runs with a deterministic SHA-256 chain.
 *
 * The browser verifier in lib/chain.ts must canonicalize identically. If you
 * change one side, change both and re-seal.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const runsDir = path.join(here, "..", "data", "runs");

function canonicalize(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
    .join(",")}}`;
}

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

const files = fs
  .readdirSync(runsDir)
  .filter((file) => file.endsWith(".json"))
  .sort();

for (const file of files) {
  const full = path.join(runsDir, file);
  const run = JSON.parse(fs.readFileSync(full, "utf8"));
  const start = new Date(run.startedAt).getTime();
  let prev = "GENESIS";

  run.events = run.events.map((event) => {
    const { hash: _hash, prevHash: _prev, offsetMs, ...rest } = event;
    const at =
      offsetMs != null ? new Date(start + offsetMs).toISOString() : event.at;
    const body = { ...rest, at };
    const digest = sha256(`${prev}|${canonicalize(body)}`);
    const sealed = { ...body, prevHash: prev, hash: digest };
    prev = digest;
    return sealed;
  });

  run.integrity = {
    algorithm: "SHA-256",
    head: prev,
    events: run.events.length,
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

  fs.writeFileSync(full, `${JSON.stringify(run, null, 2)}\n`);
  console.log(
    `sealed ${file} · ${run.events.length} events · ${prev.slice(0, 12)}… · manifest ${run.integrity.manifest.slice(0, 12)}…`
  );
}
