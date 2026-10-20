import Link from "next/link";
import { ArrowUpRight, Clock3, Layers3 } from "lucide-react";
import type { Run } from "@/lib/types";
import { formatDate, formatDuration } from "@/lib/format";
import {
  evidenceCount,
  mutationCount,
  runSurfaces,
} from "@/lib/runs";
import { ModeBadge, SurfaceBadge } from "./Bits";

export default function RunCard({
  run,
  featured = false,
}: {
  run: Run;
  featured?: boolean;
}) {
  const surfaces = runSurfaces(run);
  const events = run.events.slice(0, 14);

  return (
    <Link
      href={`/runs/${run.id}`}
      className={`panel panel-hover group relative flex flex-col overflow-hidden ${
        featured ? "p-6 sm:p-7" : "p-5"
      }`}
    >
      {featured && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-lime/[0.07] blur-[70px]"
        />
      )}

      <div className="relative flex items-center justify-between gap-3">
        <ModeBadge mode={run.mode} />
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-mist/70">
          {formatDate(run.startedAt)}
        </span>
      </div>

      <h3
        className={`relative mt-4 font-semibold tracking-[-0.03em] text-chalk ${
          featured ? "text-xl sm:text-2xl" : "text-[17px]"
        }`}
      >
        {run.title}
      </h3>
      <p
        className={`relative mt-2 text-[13px] leading-relaxed text-mist ${
          featured ? "line-clamp-3" : "line-clamp-2"
        }`}
      >
        {run.summary}
      </p>

      <div className="relative mt-5 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-1">
          {events.map((event, index) => (
            <span
              key={event.id}
              title={event.title}
              className={`h-1.5 flex-1 rounded-full ${
                event.surface === "native"
                  ? "bg-lime/70"
                  : "bg-sky/50"
              } ${index === 0 ? "opacity-100" : "opacity-60"}`}
            />
          ))}
        </div>
        <span className="shrink-0 whitespace-nowrap font-mono text-[9px] text-mist/60">
          {run.events.length} ev
        </span>
      </div>

      <div className="relative mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.06] pt-4 text-[11px] text-mist">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={12} /> {formatDuration(run.durationMs)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Layers3 size={12} /> {evidenceCount(run)} evidence
        </span>
        <span className="inline-flex items-center gap-1.5">
          {mutationCount(run)} mutations
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5">
          {surfaces.map((surface) => (
            <SurfaceBadge key={surface} surface={surface} />
          ))}
        </span>
      </div>

      <div className="relative mt-4 flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-mist/60">
          {run.integrity.algorithm} · {run.integrity.events} blocks
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-chalk transition-colors group-hover:text-lime">
          Open run <ArrowUpRight size={13} />
        </span>
      </div>
    </Link>
  );
}
