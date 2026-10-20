import Link from "next/link";
import { ArrowUpRight, Globe2, Monitor } from "lucide-react";
import { engineLabel, type ToolEngine } from "@/lib/tools";

export default function EnginePanel({
  engine,
  title,
  description,
  count,
  tools,
  status,
}: {
  engine: ToolEngine;
  title: string;
  description: string;
  count: number;
  tools: string[];
  status: string;
}) {
  const isBrowser = engine === "browser";
  const Icon = isBrowser ? Globe2 : Monitor;

  return (
    <div className="panel panel-hover relative overflow-hidden p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-md border ${
              isBrowser
                ? "border-sky/25 bg-sky/[0.05] text-sky"
                : "border-lime/25 bg-lime/[0.05] text-lime"
            }`}
          >
            <Icon size={16} strokeWidth={1.7} />
          </span>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink">
              {engineLabel[engine]}
            </p>
            <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-mist">
              {status}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="display text-[34px] leading-none text-ink">{count}</div>
          <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.12em] text-mist">
            tools
          </div>
        </div>
      </div>

      <h3 className="display mt-6 text-[26px] leading-[1.02] text-ink">
        {title}
      </h3>
      <p className="mt-2 text-[12px] leading-relaxed text-mist">{description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {tools.map((tool) => (
          <span
            key={tool}
            className="rounded border border-line bg-paper-2/45 px-2 py-1 font-mono text-[8px] text-mist"
          >
            {tool}
          </span>
        ))}
        {count > tools.length && (
          <span className="px-1 py-1 font-mono text-[8px] text-mist/60">
            +{count - tools.length} more
          </span>
        )}
      </div>

      <Link
        href="/engines#atlas"
        className="mt-5 inline-flex items-center gap-1 text-[11px] font-medium text-ink transition-colors hover:text-lime"
      >
        Open the tool atlas <ArrowUpRight size={12} />
      </Link>
    </div>
  );
}
