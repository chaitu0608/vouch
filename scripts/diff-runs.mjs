#!/usr/bin/env node
/**
 * Compare two Vouch runs.
 *
 * This is the eval loop: keep a known-good run, re-record after a prompt,
 * model, or browser change, then diff the ordered evidence.
 *
 *   npm run diff -- data/runs/run-a.json data/runs/run-b.json
 *   npm run diff -- a.json b.json --fail
 */
import fs from "node:fs";
import path from "node:path";

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortValue(value[key])])
    );
  }
  return value;
}

function stable(value) {
  return JSON.stringify(sortValue(value));
}

function walk(a, b, key, out) {
  if (out.length >= 60) return;
  if (stable(a) === stable(b)) return;
  const aObj = a && typeof a === "object" && !Array.isArray(a);
  const bObj = b && typeof b === "object" && !Array.isArray(b);
  if (aObj && bObj) {
    for (const child of new Set([...Object.keys(a), ...Object.keys(b)])) {
      walk(a[child], b[child], `${key}.${child}`, out);
    }
    return;
  }
  out.push({ key, a, b });
}

function truncate(value) {
  if (value === undefined) return "—";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 72 ? `${text.slice(0, 69)}…` : text;
}

function compare(a, b) {
  const metaA = {
    title: a.title,
    task: a.task,
    mode: a.mode,
    verdict: a.verdict,
    tags: a.tags,
    agent: a.agent,
  };
  const metaB = {
    title: b.title,
    task: b.task,
    mode: b.mode,
    verdict: b.verdict,
    tags: b.tags,
    agent: b.agent,
  };
  const meta = [];
  walk(metaA, metaB, "run", meta);

  const events = [];
  const length = Math.max(a.events.length, b.events.length);
  for (let index = 0; index < length; index += 1) {
    const ea = a.events[index];
    const eb = b.events[index];
    if (!ea || !eb) {
      events.push({
        index,
        key: ea ? "removed" : "added",
        detail: ea ? "event only in A" : "event only in B",
      });
      continue;
    }
    const changes = [];
    walk(
      {
        tool: ea.tool,
        title: ea.title,
        surface: ea.surface,
        readOnly: ea.readOnly,
        approved: ea.approved,
        status: ea.status,
        args: ea.args,
        result: ea.result,
        evidence: ea.evidence,
      },
      {
        tool: eb.tool,
        title: eb.title,
        surface: eb.surface,
        readOnly: eb.readOnly,
        approved: eb.approved,
        status: eb.status,
        args: eb.args,
        result: eb.result,
        evidence: eb.evidence,
      },
      "event",
      changes
    );
    if (changes.length > 0) {
      events.push({ index, key: ea.id, changes });
    }
  }

  return { meta, events };
}

const argv = process.argv.slice(2).filter((arg) => arg !== "--fail");
const failOnDiff = process.argv.includes("--fail");
if (argv.length !== 2) {
  console.error(
    "Usage: npm run diff -- <run-a.json> <run-b.json> [--fail]"
  );
  process.exit(1);
}

let a;
let b;
try {
  a = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), argv[0]), "utf8"));
  b = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), argv[1]), "utf8"));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const result = compare(a, b);
const changes = result.meta.length + result.events.length;

console.log(`${a.id}  vs  ${b.id}`);
console.log(
  `${a.events.length} events  vs  ${b.events.length} events  ·  ${changes} difference${changes === 1 ? "" : "s"}`
);

if (result.meta.length > 0) {
  console.log("\nrun");
  for (const item of result.meta) {
    console.log(`  ${item.key}`);
    console.log(`    a  ${truncate(item.a)}`);
    console.log(`    b  ${truncate(item.b)}`);
  }
}

if (result.events.length > 0) {
  console.log("\nevents");
  for (const item of result.events) {
    if (item.changes) {
      console.log(`  ${String(item.index + 1).padStart(2, "0")} ${item.key}`);
      for (const change of item.changes) {
        console.log(`    ${change.key}`);
        console.log(`      a  ${truncate(change.a)}`);
        console.log(`      b  ${truncate(change.b)}`);
      }
    } else {
      console.log(`  ${String(item.index + 1).padStart(2, "0")} ${item.key} · ${item.detail}`);
    }
  }
}

if (changes === 0) {
  console.log("\nidentical event surface");
}

if (failOnDiff && changes > 0) process.exitCode = 1;
