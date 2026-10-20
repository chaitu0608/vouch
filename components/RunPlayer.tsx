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
import StepRail from "./bencho/StepRail";
import ReviewChecklist from "./bencho/ReviewChecklist";

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
  const activeIndex = Math.max(0, visibleIndex);

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
    if (visible.length === 0) return;
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
    anchor.download = `${run.id}.vouch.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const evidenceItems = run.events.reduce(
    (total, event) => total + (event.evidence?.length ?? 0),
    0
  );
  const snapshotEvents = run.events.filter(
    (event) => event.tool === "browser_snapshot"
  ).length;

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <section className="panel h-fit overflow-hidden lg:sticky lg:top-24">
        <div className="border-b border-line p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="mono-label">Timeline</span>
              <ModeBadge mode={run.mode} />
            </div>
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex items-center gap-1.5 rounded border border-line bg-paper-2/45 px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-ink transition-colors hover:border-line-strong hover:text-lime"
            >
              {playing ? <Pause size={10} /> : <Play size={10} />}
              {playing ? "Pause" : "Play run"}
            </button>
          </div>

          <div className="mt-4">
            {visible.length > 0 ? (
              <StepRail
                count={visible.length}
                at={activeIndex}
                playing={playing}
                onPick={(index) => {
                  setPlaying(false);
                  setSelectedId(visible[index].id);
                }}
              />
            ) : (
              <div className="h-2 w-full rounded-full bg-line" />
            )}
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
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] transition-colors ${
                    active
                      ? "border-lime/30 bg-lime/[0.06] text-lime"
                      : "border-line text-mist hover:border-line-strong hover:text-ink"
                  }`}
                >
                  {item.label}
                  <span className="text-mist/60">{count}</span>
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
                className={`group flex w-full items-start gap-3 rounded-md px-3 py-3 text-left transition-colors ${
                  active ? "bg-paper-2" : "hover:bg-paper-2/55"
                }`}
              >
                <span
                  className={`mt-1 font-mono text-[8px] ${
                    active ? "text-lime" : "text-mist/60"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border ${
                    event.surface === "native"
                      ? "border-lime/25 bg-lime/[0.05] text-lime"
                      : "border-sky/25 bg-sky/[0.05] text-sky"
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
                    <span className="truncate text-[12px] font-medium text-ink">
                      {event.title}
                    </span>
                    {!event.readOnly && (
                      <LockKeyhole
                        size={9}
                        className="shrink-0 text-lime"
                        aria-label="Mutation"
                      />
                    )}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[8px] text-mist">
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
          <EventInspector run={run} event={selected} index={selectedIndex} />
        ) : (
          <div className="panel p-8 text-center text-sm text-mist">
            This run has no events.
          </div>
        )}

        <div className="panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="mono-label">Run integrity</p>
              <p className="mt-1 max-w-md text-[11px] leading-relaxed text-mist">
                Each event commits to the one before it, and the run manifest
                commits to the title, verdict, mode, and event head. Change a
                field and the verifier fails — it runs in your browser.
              </p>
            </div>
            <button
              type="button"
              onClick={download}
              className="inline-flex items-center gap-1.5 rounded border border-line bg-paper-2/45 px-3 py-2 font-mono text-[8px] uppercase tracking-[0.1em] text-mist transition-colors hover:border-line-strong hover:text-ink"
            >
              <ArrowDownToLine size={10} /> Export JSON
            </button>
          </div>

          <div className="mt-4">
            {run.integrity?.head ? (
              <IntegritySeal run={run} />
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-sky/25 bg-sky/[0.04] px-4 py-3 text-[11px] text-sky">
                <TriangleAlert size={13} />
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
                className={`h-10 min-w-[76px] shrink-0 rounded border px-2 text-left font-mono transition-colors ${
                  selected?.id === event.id
                    ? "border-lime/40 bg-lime/[0.05]"
                    : "border-line bg-paper-2/40 hover:border-line-strong"
                }`}
              >
                <span className="block text-[7px] text-mist">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="block truncate text-[8px] text-ink/75">
                  {event.hash ? shortHash(event.hash, 6) : "unsealed"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <ReviewChecklist
            items={[
              {
                id: "snapshot",
                label: "Read the page state",
                note: `${snapshotEvents} snapshot event${
                  snapshotEvents === 1 ? "" : "s"
                } in this run`,
              },
              {
                id: "evidence",
                label: "Inspect the evidence",
                note: `${evidenceItems} evidence item${
                  evidenceItems === 1 ? "" : "s"
                } · screenshots or text`,
              },
              {
                id: "chain",
                label: "Verify the chain",
                note: `${run.integrity.algorithm} · ${run.events.length} events${
                  run.integrity.manifest ? " + manifest" : ""
                }`,
              },
              {
                id: "export",
                label: "Keep the receipt",
                note: "Export JSON · it stays on your machine",
              },
            ]}
          />
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
      <div className="border-b border-line p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-mist">
            Event {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-mist/40">/</span>
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

        <h2 className="mt-3 text-[24px] font-medium leading-tight tracking-[-0.025em] text-ink sm:text-[28px]">
          {event.title}
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-mist">
          {event.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[9px]">
          <span className="rounded border border-line bg-paper-2/50 px-2 py-1 text-ink/80">
            {event.tool}
          </span>
          {event.target && (
            <span className="max-w-full truncate rounded border border-line px-2 py-1 text-mist">
              {event.target}
            </span>
          )}
          <span className="text-mist/70">{formatTime(event.at)} UTC</span>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {event.args && Object.keys(event.args).length > 0 && (
          <div>
            <p className="mono-label">Arguments</p>
            <div className="mt-2 overflow-hidden rounded-lg border border-line bg-paper-2/40">
              {Object.entries(event.args).map(([key, value]) => (
                <div
                  key={key}
                  className="flex gap-3 border-b border-line px-3 py-2 last:border-0"
                >
                  <span className="w-28 shrink-0 font-mono text-[9px] text-mist">
                    {key}
                  </span>
                  <span className="min-w-0 break-all font-mono text-[9px] text-ink/85">
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
            <pre className="mt-2 max-h-[230px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-line bg-[#f0ebdf] p-4 font-mono text-[10px] leading-relaxed text-ink/85">
              {event.result.excerpt}
            </pre>
            {event.result.meta && (
              <p className="mt-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-mist/70">
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

        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4 font-mono text-[8px] text-mist">
          <Hash size={9} />
          <span>
            prev {event.prevHash ? shortHash(event.prevHash) : "unsealed"}
          </span>
          <ChevronRight size={9} />
          <span className="text-lime">
            {event.hash ? shortHash(event.hash) : "unsealed"}
          </span>
          <span className="ml-auto uppercase tracking-[0.08em]">
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
          <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-mist/70">
            {evidence.note}
          </span>
        </div>
        <div className="browser-frame mt-2 overflow-hidden rounded-lg">
          <div className="flex items-center gap-1.5 border-b border-line bg-paper-2/60 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-ember/60" />
            <span className="h-2 w-2 rounded-full bg-[#c59a3a]/60" />
            <span className="h-2 w-2 rounded-full bg-mint/50" />
            <span className="ml-2 min-w-0 flex-1 truncate rounded bg-paper px-2 py-0.5 font-mono text-[8px] text-mist">
              {event.target ?? evidence.label}
            </span>
            <span className="font-mono text-[7px] uppercase tracking-wider text-mist/60">
              JPEG
            </span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={evidence.src}
            alt={evidence.label}
            className="w-full bg-paper-2"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  if (evidence.kind === "screen") {
    return (
      <div
        className={`rounded-lg border p-4 ${
          evidence.redacted
            ? "border-sky/25 bg-sky/[0.03]"
            : "border-lime/20 bg-lime/[0.02]"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Monitor
            size={12}
            className={evidence.redacted ? "text-sky" : "text-lime"}
          />
          <span className="mono-label">{evidence.label}</span>
          {evidence.redacted && (
            <span className="rounded-full border border-sky/25 px-2 py-0.5 font-mono text-[7px] uppercase tracking-[0.12em] text-sky">
              redacted
            </span>
          )}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-ink/80">
          {evidence.content}
        </p>
        {evidence.note && (
          <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.08em] text-mist/70">
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
            <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-mist/70">
              {evidence.note}
            </span>
          )}
          {evidence.content && <CopyButton value={evidence.content} />}
        </div>
      </div>
      <pre className="mt-2 max-h-[260px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-line bg-[#f0ebdf] p-4 font-mono text-[10px] leading-relaxed text-ink/80">
        {evidence.content}
      </pre>
    </div>
  );
}
