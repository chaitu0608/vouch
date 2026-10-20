import type { Run, RunEvent } from "./types";

/**
 * Deterministic JSON: sorted keys, no whitespace. The recorder and the
 * verifier must canonicalize identically, or the chain will not verify.
 */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(obj[key])}`)
    .join(",")}}`;
}

export function sealableEvent(event: RunEvent): Record<string, unknown> {
  const { prevHash: _prev, hash: _hash, ...rest } = event;
  return rest as Record<string, unknown>;
}

/**
 * The run-level manifest commits to everything that is not an event:
 * identity, title, verdict, mode, tags, and the event-chain head. Sealing the
 * manifest means a published run cannot be relabeled without breaking the
 * verifier.
 */
export function runManifest(run: Run): Record<string, unknown> {
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

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export interface VerifyResult {
  ok: boolean;
  head: string;
  brokenAt?: string;
}

export async function verifyRun(run: Run): Promise<VerifyResult> {
  let prev = "GENESIS";
  for (const event of run.events) {
    if (event.prevHash !== prev) {
      return { ok: false, head: prev, brokenAt: event.id };
    }
    const payload = canonicalize(sealableEvent(event));
    const hash = await sha256Hex(`${prev}|${payload}`);
    if (hash !== event.hash) {
      return { ok: false, head: prev, brokenAt: event.id };
    }
    prev = hash;
  }
  if (prev !== run.integrity.head) {
    return { ok: false, head: prev, brokenAt: "event head" };
  }
  if (run.integrity.manifest) {
    const manifest = await sha256Hex(canonicalize(runManifest(run)));
    if (manifest !== run.integrity.manifest) {
      return { ok: false, head: prev, brokenAt: "manifest" };
    }
  }
  return { ok: true, head: prev };
}

export function shortHash(hash: string, length = 10): string {
  if (!hash || hash === "GENESIS") return hash;
  return `${hash.slice(0, length)}…${hash.slice(-4)}`;
}
