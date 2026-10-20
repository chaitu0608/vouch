"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  FileJson,
  ShieldCheck,
  TriangleAlert,
  Upload,
} from "lucide-react";
import type { Run } from "@/lib/types";

export const IMPORT_STORAGE_KEY = "witness:lastRun";

type ImportState =
  | { kind: "idle" }
  | { kind: "ok"; run: Run }
  | { kind: "error"; message: string };

function normalize(value: unknown): Run | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<Run>;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.title !== "string" ||
    !Array.isArray(candidate.events) ||
    candidate.events.length === 0
  ) {
    return null;
  }

  return {
    id: candidate.id,
    title: candidate.title,
    task: candidate.task ?? "Imported run",
    summary: candidate.summary ?? "No summary was provided in this export.",
    verdict: candidate.verdict ?? {
      label: "Imported",
      detail: "This export did not include a verdict.",
      tone: "info",
    },
    startedAt: candidate.startedAt ?? new Date().toISOString(),
    durationMs: Number(candidate.durationMs ?? 0),
    mode: "imported",
    agent: candidate.agent ?? "Imported",
    tags: Array.isArray(candidate.tags) ? candidate.tags : [],
    events: candidate.events,
    integrity: candidate.integrity ?? {
      algorithm: "SHA-256",
      head: "",
      events: candidate.events.length,
    },
  };
}

export default function ImportRun() {
  const [state, setState] = useState<ImportState>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const run = normalize(parsed);
      if (!run) {
        throw new Error(
          "That JSON does not look like a Witness run. It needs id, title, and events[]."
        );
      }
      window.localStorage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(run));
      setState({ kind: "ok", run });
    } catch (error) {
      setState({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "That file could not be read.",
      });
    }
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={`cursor-pointer rounded-2xl border border-dashed p-8 text-center transition-colors ${
          dragging
            ? "border-lime/50 bg-lime/[0.04]"
            : "border-white/[0.12] bg-white/[0.015] hover:border-white/25 hover:bg-white/[0.03]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-mist">
          <Upload size={18} strokeWidth={1.6} />
        </span>
        <p className="mt-4 text-sm font-medium text-chalk">
          Drop a Witness JSON file
        </p>
        <p className="mt-1 text-xs text-mist">
          or click to choose · it stays in this browser
        </p>
      </div>

      {state.kind === "error" && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-ember/20 bg-ember/[0.04] p-3 text-xs text-ember">
          <TriangleAlert size={14} className="mt-0.5 shrink-0" />
          {state.message}
        </div>
      )}

      {state.kind === "ok" && (
        <div className="mt-4 rounded-xl border border-lime/20 bg-lime/[0.03] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck size={14} className="text-lime" />
            <span className="text-xs font-medium text-chalk">
              {state.run.title}
            </span>
            <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-lime">
              {state.run.events.length} events
            </span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-mist">
            Loaded into this browser only. The file was not uploaded.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Link
              href="/runs/local"
              className="inline-flex items-center gap-1 text-xs font-medium text-lime hover:text-[#dcff8a]"
            >
              Open imported run <ArrowUpRight size={12} />
            </Link>
            <Link
              href="/runs/run-admin"
              className="inline-flex items-center gap-1 text-xs text-mist hover:text-chalk"
            >
              <FileJson size={12} /> See a sealed example
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
