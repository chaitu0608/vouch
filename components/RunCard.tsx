import Link from "next/link";
import { ArrowUpRight, Clock3, Hash, Layers3 } from "lucide-react";
import type { Run } from "@/lib/types";
import { formatDate, formatDuration } from "@/lib/format";
import { evidenceCount, mutationCount, runSurfaces } from "@/lib/runs";
import { ModeBadge, SurfaceBadge } from "./Bits";

export default function RunCard({
  run,
  featured = false,
}: {
  run: Run;
  featured?: boolean;
}) {
  const surfaces = runSurfaces(run);
  const events = run.events.slice(0, 18);

  return (
    <Link
      href={`/runs/${run.id}`}
      className={`panel panel-hover group relative flex flex-col overflow-hidden ${
        featured ? "p-6 sm:p-7" : "p-5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <ModeBadge mode={run.mode} />
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-mist">
          {formatDate(run.startedAt)}
        </span>
      </div>

      <h3
        className={`mt-5 text-ink ${
          featured
            ? "display text-[30px] leading-[0.98] sm:text-[34px]"
            : "text-[18px] font-medium leading-snug tracking-[-0.02em]"
        }`}
      >
        {run.title}
      </h3>
      <p
        className={`mt-2 text-[12px] leading-relaxed text-mist ${
          featured ? "line-clamp-3" : "line-clamp-2"
        }`}
      >
        {run.summary}
      </p>

      <div className="mt-6">
        <div className="flex h-8 items-end gap-[3px] border-b border-line pb-1">
          {events.map((event) => {
            const mutation = !event.readOnly;
            return (
              <span
                key={event.id}
                title={`${event.title}${mutation ? " · mutation" : " · read"}`}
                className={`min-w-[3px] flex-1 rounded-t-[1px] ${
                  event.surface === "native" ? "bg-lime/70" : "bg-sky/55"
                } ${mutation ? "opacity-100" : "opacity-55"}`}
                style={{ height: mutation ? "100%" : "52%" }}
              />
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 font-mono text-[8px] uppercase tracking-[0.1em] text-mist/70">
          <span>{run.events.length} events</span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-sky/60" /> web
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-lime/70" /> native
            </span>
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-[10px] text-mist">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={11} /> {formatDuration(run.durationMs)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Layers3 size={11} /> {evidenceCount(run)} evidence
        </span>
        <span>{mutationCount(run)} mutations</span>
        <span className="ml-auto inline-flex items-center gap-1.5">
          {surfaces.map((surface) => (
            <SurfaceBadge key={surface} surface={surface} />
          ))}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-mist/70">
          <Hash size={9} /> {run.integrity.algorithm} ·{" "}
          {run.integrity.events} blocks
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink transition-colors group-hover:text-lime">
          Open run <ArrowUpRight size={12} />
        </span>
      </div>
    </Link>
  );
}
