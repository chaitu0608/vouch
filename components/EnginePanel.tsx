import Link from "next/link";
import { ArrowUpRight, Globe2, Monitor } from "lucide-react";

export default function EnginePanel({
  engine,
  title,
  description,
  count,
  tools,
  status,
}: {
  engine: "browsy" | "clinqy";
  title: string;
  description: string;
  count: number;
  tools: string[];
  status: string;
}) {
  const isBrowsy = engine === "browsy";
  const Icon = isBrowsy ? Globe2 : Monitor;

  return (
    <div className="panel panel-hover relative overflow-hidden p-6">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${
          isBrowsy ? "via-sky/50" : "via-lime/50"
        } to-transparent`}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isBrowsy
                ? "bg-sky/[0.08] text-sky"
                : "bg-lime/[0.08] text-lime"
            }`}
          >
            <Icon size={18} strokeWidth={1.7} />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
              {engine}
            </p>
            <p className="mt-0.5 text-[11px] text-mist/60">{status}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold tracking-[-0.05em] text-chalk">
            {count}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-mist/50">
            tools
          </div>
        </div>
      </div>

      <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-chalk">
        {title}
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-mist">{description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {tools.map((tool) => (
          <span
            key={tool}
            className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-1 font-mono text-[9px] text-mist/70"
          >
            {tool}
          </span>
        ))}
        {count > tools.length && (
          <span className="px-1 py-1 font-mono text-[9px] text-mist/40">
            +{count - tools.length} more
          </span>
        )}
      </div>

      <Link
        href="/engines#atlas"
        className="mt-5 inline-flex items-center gap-1 text-[11px] font-medium text-chalk transition-colors hover:text-lime"
      >
        Open the tool atlas <ArrowUpRight size={12} />
      </Link>
    </div>
  );
}
