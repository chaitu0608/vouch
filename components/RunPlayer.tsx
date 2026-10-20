"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ChevronRight,
  Globe2,
  Hash,
  LockKeyhole,
  Monitor,
  Pause,
  Play,
  TriangleAlert,
} from "lucide-react";
import type { Evidence, Run, RunEvent } from "@/lib/types";
import { formatDuration, formatOffset, formatTime, offsetMs } from "@/lib/format";
import { getEngineTool } from "@/lib/tools";
import { shortHash } from "@/lib/chain";
import { ModeBadge, StatusDot, SurfaceBadge } from "./Bits";
import CopyButton from "./CopyButton";
import IntegritySeal from "./IntegritySeal";

const filters = [
  { id: "all", label: "All" },
  { id: "web", label: "Web" },
  { id: "native", label: "Native" },
  { id: "mutations", label: "Mutations" },
] as const;

type Filter = (typeof filters)[number]["id"];

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value) ?? String(value);
}

export default function RunPlayer({ run }: { run: Run }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState(run.events[0]?.id ?? "");
  const [playing, setPlaying] = useState(false);

  const visible = useMemo(
    () =>
      run.events.filter((event) => {
        if (filter === "web") return event.surface === "web";
        if (filter === "native") return event.surface === "native";
        if (filter === "mutations") return !event.readOnly;
        return true;
      }),
    [filter, run.events]
  );

  const selected =
    run.events.find((event) => event.id === selectedId) ??
    visible[0] ??
    run.events[0];
  const selectedIndex = Math.max(
    0,
    run.events.findIndex((event) => event.id === selected?.id)
  );
  const visibleIndex = visible.findIndex((event) => event.id === selected?.id);
  const progress =
    visible.length > 0 ? ((visibleIndex + 1) / visible.length) * 100 : 0;

  useEffect(() => {
    if (visible.length > 0 && !visible.some((event) => event.id === selectedId)) {
      setSelectedId(visible[0].id);
    }
  }, [visible, selectedId]);

  useEffect(() => {
    if (!playing) return;
    const index = visible.findIndex((event) => event.id === selectedId);
    if (index === -1) {
      setSelectedId(visible[0]?.id ?? "");
      return;
    }
    if (index >= visible.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(
      () => setSelectedId(visible[index + 1].id),
      2600
    );
    return () => window.clearTimeout(timer);
  }, [playing, selectedId, visible]);

  function togglePlay() {
    if (!playing && visibleIndex === visible.length - 1) {
      setSelectedId(visible[0]?.id ?? selectedId);
    }
    setPlaying((value) => !value);
  }

  function download() {
    const blob = new Blob([JSON.stringify(run, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${run.id}.witness.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,355px)_minmax(0,1fr)]">
      <section className="panel h-fit overflow-hidden lg:sticky lg:top-6">
        <div className="border-b border-white/[0.06] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="mono-label">Timeline</span>
              <ModeBadge mode={run.mode} />
            </div>
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-chalk transition-colors hover:border-lime/30 hover:text-lime"
            >
              {playing ? <Pause size={10} /> : <Play size={10} />}
              {playing ? "Pause" : "Play run"}
            </button>
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-lime transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {filters.map((item) => {
              const count =
                item.id === "all"
                  ? run.events.length
                  : item.id === "web"
                    ? run.events.filter((event) => event.surface === "web").length
                    : item.id === "native"
                      ? run.events.filter((event) => event.surface === "native").length
                      : run.events.filter((event) => !event.readOnly).length;
              const active = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${
                    active
                      ? "border-lime/30 bg-lime/[0.08] text-lime"
                      : "border-white/10 text-mist hover:border-white/20 hover:text-chalk"
                  }`}
                >
                  {item.label}
                  <span className="text-mist/50">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-h-[560px] overflow-y-auto p-2 lg:max-h-[660px]">
          {visible.map((event) => {
            const index = run.events.findIndex((item) => item.id === event.id);
            const active = selected?.id === event.id;
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setSelectedId(event.id);
                }}
                className={`group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                  active
                    ? "bg-white/[0.055]"
                    : "hover:bg-white/[0.025]"
                }`}
              >
                <span
                  className={`mt-1 font-mono text-[9px] ${
                    active ? "text-lime" : "text-mist/45"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                    event.surface === "native"
                      ? "bg-lime/[0.08] text-lime"
                      : "bg-sky/[0.07] text-sky"
                  }`}
                >
                  {event.surface === "native" ? (
                    <Monitor size={12} strokeWidth={1.8} />
                  ) : (
                    <Globe2 size={12} strokeWidth={1.8} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[12px] font-medium text-chalk">
                      {event.title}
                    </span>
                    {!event.readOnly && (
                      <LockKeyhole
                        size={10}
                        className="shrink-0 text-ember/70"
                        aria-label="Mutation"
                      />
                    )}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[9px] text-mist/60">
                    <span className="truncate">{event.tool}</span>
                    <span>·</span>
                    <span>{formatOffset(offsetMs(run.startedAt, event.at))}</span>
                  </span>
                </span>
                <span className="mt-1.5">
                  <StatusDot status={event.status} />
                </span>
              </button>
            );
          })}
          {visible.length === 0 && (
            <p className="px-4 py-8 text-center text-xs text-mist">
              No events match this filter.
            </p>
          )}
        </div>
      </section>

      <section className="min-w-0 space-y-4">
        {selected ? (
          <EventInspector
            run={run}
            event={selected}
            index={selectedIndex}
          />
        ) : (
          <div className="panel p-8 text-center text-sm text-mist">
            This run has no events.
          </div>
        )}

        <div className="panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="mono-label">Run integrity</p>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-mist">
                Each event commits to the one before it, and the run manifest
                commits to the title, verdict, mode, and event head. Change a
                field and the verifier fails — it runs in your browser.
              </p>
            </div>
            <button
              type="button"
              onClick={download}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-mist transition-colors hover:border-white/20 hover:text-chalk"
            >
              <ArrowDownToLine size={11} /> Export JSON
            </button>
          </div>

          <div className="mt-4">
            {run.integrity?.head ? (
              <IntegritySeal run={run} />
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-sky/20 bg-sky/[0.04] px-4 py-3 text-xs text-sky">
                <TriangleAlert size={14} />
                Unsealed import — this run has no hash chain yet.
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
            {run.events.map((event, index) => (
              <button
                key={event.id}
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setSelectedId(event.id);
                }}
                className={`h-10 min-w-[76px] shrink-0 rounded-md border px-2 text-left font-mono transition-colors ${
                  selected?.id === event.id
                    ? "border-lime/30 bg-lime/[0.06]"
                    : "border-white/[0.07] bg-white/[0.015] hover:border-white/15"
                }`}
              >
                <span className="block text-[8px] text-mist/50">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="block truncate text-[9px] text-chalk/70">
                  {event.hash ? shortHash(event.hash, 6) : "unsealed"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function EventInspector({
  run,
  event,
  index,
}: {
  run: Run;
  event: RunEvent;
  index: number;
}) {
  const tool = getEngineTool(event.tool);

  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-white/[0.06] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist/60">
            Event {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-mist/30">/</span>
          <SurfaceBadge surface={event.surface} />
          <span className="ml-auto flex items-center gap-2">
            <span className="chip">
              {event.readOnly
                ? "read-only"
                : event.approved
                  ? "approved mutation"
                  : "confirmed mutation"}
            </span>
            <StatusDot status={event.status} />
          </span>
        </div>

        <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-chalk sm:text-2xl">
          {event.title}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-mist">
          {event.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px]">
          <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-chalk/80">
            {event.tool}
          </span>
          {event.target && (
            <span className="max-w-full truncate rounded-md border border-white/[0.06] px-2 py-1 text-mist/70">
              {event.target}
            </span>
          )}
          <span className="text-mist/45">{formatTime(event.at)} UTC</span>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {event.args && Object.keys(event.args).length > 0 && (
          <div>
            <p className="mono-label">Arguments</p>
            <div className="mt-2 overflow-hidden rounded-xl border border-white/[0.06] bg-black/20">
              {Object.entries(event.args).map(([key, value]) => (
                <div
                  key={key}
                  className="flex gap-3 border-b border-white/[0.05] px-3 py-2 last:border-0"
                >
                  <span className="w-28 shrink-0 font-mono text-[10px] text-mist/55">
                    {key}
                  </span>
                  <span className="min-w-0 break-all font-mono text-[10px] text-chalk/85">
                    {formatValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {event.result?.excerpt && (
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="mono-label">Result</p>
              <CopyButton value={event.result.excerpt} />
            </div>
            <pre className="mt-2 max-h-[230px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/[0.06] bg-black/25 p-4 font-mono text-[11px] leading-relaxed text-chalk/80">
              {event.result.excerpt}
            </pre>
            {event.result.meta && (
              <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-mist/50">
                {event.result.meta}
              </p>
            )}
          </div>
        )}

        {event.evidence?.map((evidence, evidenceIndex) => (
          <EvidenceView
            key={`${evidence.label}-${evidenceIndex}`}
            evidence={evidence}
            event={event}
          />
        ))}

        <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4 font-mono text-[9px] text-mist/55">
          <Hash size={10} />
          <span>
            prev {event.prevHash ? shortHash(event.prevHash) : "unsealed"}
          </span>
          <ChevronRight size={10} />
          <span className="text-lime/70">
            {event.hash ? shortHash(event.hash) : "unsealed"}
          </span>
          <span className="ml-auto uppercase tracking-[0.1em]">
            {tool?.category ?? "tool"} · {formatDuration(run.durationMs)}
          </span>
        </div>
      </div>
    </div>
  );
}

function EvidenceView({
  evidence,
  event,
}: {
  evidence: Evidence;
  event: RunEvent;
}) {
  if (evidence.kind === "screenshot" && evidence.src) {
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="mono-label">{evidence.label}</p>
          <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-mist/45">
            {evidence.note}
          </span>
        </div>
        <div className="browser-frame mt-2 overflow-hidden rounded-xl">
          <div className="flex items-center gap-1.5 border-b border-white/[0.07] bg-white/[0.03] px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-ember/70" />
            <span className="h-2 w-2 rounded-full bg-[#ffc857]/70" />
            <span className="h-2 w-2 rounded-full bg-mint/70" />
            <span className="ml-2 min-w-0 flex-1 truncate rounded-md bg-black/30 px-2 py-0.5 font-mono text-[9px] text-mist/60">
              {event.target ?? evidence.label}
            </span>
            <span className="font-mono text-[8px] uppercase tracking-wider text-mist/40">
              JPEG
            </span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={evidence.src}
            alt={evidence.label}
            className="w-full bg-[#0b0e12]"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  if (evidence.kind === "screen") {
    return (
      <div
        className={`rounded-xl border p-4 ${
          evidence.redacted
            ? "border-sky/20 bg-sky/[0.03]"
            : "border-lime/15 bg-lime/[0.02]"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Monitor
            size={13}
            className={evidence.redacted ? "text-sky" : "text-lime"}
          />
          <span className="mono-label">{evidence.label}</span>
          {evidence.redacted && (
            <span className="rounded-full border border-sky/25 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-sky">
              redacted
            </span>
          )}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-chalk/75">
          {evidence.content}
        </p>
        {evidence.note && (
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.08em] text-mist/45">
            {evidence.note}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="mono-label">{evidence.label}</p>
        <div className="flex items-center gap-3">
          {evidence.note && (
            <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-mist/45">
              {evidence.note}
            </span>
          )}
          {evidence.content && <CopyButton value={evidence.content} />}
        </div>
      </div>
      <pre className="mt-2 max-h-[260px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/[0.06] bg-black/25 p-4 font-mono text-[11px] leading-relaxed text-chalk/75">
        {evidence.content}
      </pre>
    </div>
  );
}
