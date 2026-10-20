#!/usr/bin/env node
/**
 * Verify a Vouch run without the browser.
 *
 * Recomputes the SHA-256 event chain and the run manifest from the JSON file.
 * Exits non-zero on the first broken link, so it can be used in CI.
 *
 *   npm run verify -- data/runs/run-admin.json
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

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

function runManifest(run) {
  return {
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
  };
}

function verify(file) {
  const run = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(run.events) || run.events.length === 0) {
    throw new Error("Run has no events.");
  }
  if (run.integrity?.algorithm !== "SHA-256") {
    throw new Error("Run is not sealed with SHA-256.");
  }

  let prev = "GENESIS";
  for (const event of run.events) {
    if (event.prevHash !== prev) {
      throw new Error(`Broken link at ${event.id}: prevHash mismatch.`);
    }
    const { hash: _hash, prevHash: _prev, offsetMs, ...rest } = event;
    const body =
      offsetMs != null
        ? { ...rest, at: new Date(new Date(run.startedAt).getTime() + offsetMs).toISOString() }
        : rest;
    const digest = sha256(`${prev}|${canonicalize(body)}`);
    if (digest !== event.hash) {
      throw new Error(`Broken hash at ${event.id}.`);
    }
    prev = digest;
  }

  if (prev !== run.integrity.head) {
    throw new Error("Chain head mismatch.");
  }

  if (run.integrity.manifest) {
    const manifest = sha256(canonicalize(runManifest(run)));
    if (manifest !== run.integrity.manifest) {
      throw new Error("Manifest mismatch.");
    }
  }

  return {
    events: run.events.length,
    head: run.integrity.head,
    manifest: Boolean(run.integrity.manifest),
  };
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: npm run verify -- <run.json> [run.json ...]");
  process.exit(1);
}

let failed = false;
for (const file of files) {
  const full = path.resolve(process.cwd(), file);
  try {
    const result = verify(full);
    console.log(
      `ok · ${path.basename(full)} · ${result.events} events · chain intact${
        result.manifest ? " · manifest matches" : ""
      }`
    );
    console.log(`     head ${result.head.slice(0, 24)}…`);
  } catch (error) {
    failed = true;
    console.error(
      `FAIL · ${path.basename(full)} · ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

process.exitCode = failed ? 1 : 0;
