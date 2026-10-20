"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Clipboard,
  ClipboardCheck,
  Globe2,
  Monitor,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

function quote(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "my-run";
}

export default function RunComposer() {
  const [task, setTask] = useState("Verify the admin endpoint");
  const [url, setUrl] = useState("http://127.0.0.1:4311/api/admin/users");
  const [native, setNative] = useState(true);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    try {
      const value = new URL(url);
      if (value.protocol !== "http:" && value.protocol !== "https:") {
        return { ok: false, error: "Use an http:// or https:// URL." };
      }
      if (value.username || value.password) {
        return { ok: false, error: "Remove credentials from the URL." };
      }
      return { ok: true, error: "" };
    } catch {
      return { ok: false, error: "Enter a complete, valid URL." };
    }
  }, [url]);

  const cleanTask = task.trim();
  const valid = parsed.ok && cleanTask.length >= 3;
  const out = `data/runs/${slugify(cleanTask)}.json`;

  const command = [
    "node scripts/record-run.mjs \\",
    `  --task ${quote(cleanTask || "Untitled run")} \\`,
    `  --url ${quote(url)} \\`,
    ...(native ? ["  --native \\"] : []),
    `  --out ${out} \\`,
    "  --yes",
  ].join("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* The command is visible and selectable. */
    }
  }

  return (
    <div className="rounded-xl border border-line bg-paper-2/25 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="mono-label">Plan a capture</p>
          <p className="mt-1 text-[11px] leading-relaxed text-mist">
            Compose the command here. Nothing runs from this page.
          </p>
        </div>
        <span className="chip">
          <ShieldCheck size={9} /> no submit path
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.2fr]">
        <label className="block">
          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-mist">
            what are you proving?
          </span>
          <input
            value={task}
            onChange={(event) => setTask(event.target.value)}
            maxLength={120}
            className="mt-1.5 w-full rounded-md border border-line bg-panel px-3 py-2 text-[12px] text-ink outline-none transition-colors placeholder:text-mist/60 focus:border-line-strong"
            placeholder="Verify the admin endpoint"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-mist">
            one url to open
          </span>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            inputMode="url"
            className={`mt-1.5 w-full rounded-md border bg-panel px-3 py-2 font-mono text-[11px] text-ink outline-none transition-colors placeholder:text-mist/60 ${
              parsed.ok ? "border-line focus:border-line-strong" : "border-ember/50"
            }`}
            placeholder="http://127.0.0.1:4311/"
          />
        </label>
      </div>

      {!parsed.ok && (
        <p className="mt-2 flex items-center gap-1.5 text-[10px] text-ember">
          <TriangleAlert size={11} /> {parsed.error}
        </p>
      )}

      <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-lg border border-line bg-panel/60 p-3">
        <input
          type="checkbox"
          checked={native}
          onChange={(event) => setNative(event.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 accent-[#d83a1d]"
        />
        <span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink">
            <Monitor size={11} /> Add one native observation
          </span>
          <span className="mt-0.5 block text-[10px] leading-relaxed text-mist">
            Read-only. The raw screen output is replaced with a redaction marker
            before the event is sealed.
          </span>
        </span>
      </label>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-panel/60 p-3">
          <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-mist">
            planned events
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              "list tabs",
              "open tab",
              "wait",
              "snapshot",
              "screenshot",
              ...(native ? ["native look"] : []),
              "release",
            ].map((step, index) => (
              <span
                key={step}
                className="inline-flex items-center gap-1 rounded border border-line px-1.5 py-0.5 font-mono text-[7px] text-mist"
              >
                <span className="text-ink/45">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step}
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3 font-mono text-[8px] uppercase tracking-[0.08em] text-mist/70">
            <span className="inline-flex items-center gap-1">
              <Globe2 size={9} /> 6 browser
            </span>
            {native && (
              <span className="inline-flex items-center gap-1">
                <Monitor size={9} /> 1 native
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-panel/60 p-3">
          <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-mist">
            gates in this plan
          </p>
          <div className="mt-2 grid gap-1 text-[10px] text-mist">
            <span className="flex items-center gap-1.5">
              <Check size={10} className="text-mint" /> 2 confirmed mutations
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={10} className="text-mint" /> 0 approvals
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={10} className="text-mint" /> 0 submit / send / pay
            </span>
          </div>
          <p className="mt-2 text-[9px] leading-relaxed text-mist/70">
            Opening a tab and releasing refs are the only mutations. The
            recorder has no click, type, or submit call.
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-[#f0ebdf]">
        <div className="flex items-center justify-between border-b border-line bg-paper-2/50 px-3 py-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-mist">
            terminal
          </span>
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.1em] text-mist transition-colors hover:text-ink"
          >
            {copied ? <ClipboardCheck size={10} /> : <Clipboard size={10} />}
            {copied ? "copied" : "copy"}
          </button>
        </div>
        <pre className="max-h-[190px] overflow-auto p-3.5 font-mono text-[9px] leading-[1.8] text-ink/85">
          {command}
        </pre>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[8px] uppercase tracking-[0.08em] text-mist/70">
          output: {out}
        </p>
        <Link
          href="/runs/run-admin"
          className="inline-flex items-center gap-1 text-[10px] text-mist transition-colors hover:text-ink"
        >
          See a sealed result <ArrowUpRight size={10} />
        </Link>
      </div>
    </div>
  );
}
