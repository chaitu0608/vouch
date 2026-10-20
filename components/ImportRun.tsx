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

export const IMPORT_STORAGE_KEY = "vouch:lastRun";

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
          "That JSON does not look like a Vouch run. It needs id, title, and events[]."
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
        className={`cursor-pointer rounded-lg border border-dashed p-6 text-center transition-colors ${
          dragging
            ? "border-lime/50 bg-lime/[0.04]"
            : "border-line bg-paper-2/30 hover:border-line-strong hover:bg-paper-2/60"
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
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-line bg-panel text-mist">
          <Upload size={16} strokeWidth={1.6} />
        </span>
        <p className="mt-3 text-[12px] font-medium text-ink">
          Drop a Vouch JSON file
        </p>
        <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em] text-mist">
          or click to choose · it stays in this browser
        </p>
      </div>

      {state.kind === "error" && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-ember/25 bg-ember/[0.04] p-3 text-[10px] leading-relaxed text-ember">
          <TriangleAlert size={13} className="mt-0.5 shrink-0" />
          {state.message}
        </div>
      )}

      {state.kind === "ok" && (
        <div className="mt-4 rounded-lg border border-mint/25 bg-mint/[0.035] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck size={13} className="text-mint" />
            <span className="text-[11px] font-medium text-ink">
              {state.run.title}
            </span>
            <span className="ml-auto font-mono text-[8px] uppercase tracking-[0.1em] text-mint">
              {state.run.events.length} events
            </span>
          </div>
          <p className="mt-1.5 text-[10px] leading-relaxed text-mist">
            Loaded into this browser only. The file was not uploaded.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Link
              href="/runs/local"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-lime hover:opacity-70"
            >
              Open imported run <ArrowUpRight size={11} />
            </Link>
            <Link
              href="/runs/run-admin"
              className="inline-flex items-center gap-1 text-[10px] text-mist hover:text-ink"
            >
              <FileJson size={11} /> See a sealed example
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
