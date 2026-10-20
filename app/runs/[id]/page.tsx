import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock3,
  Info,
  Layers3,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import {
  evidenceCount,
  getRun,
  mutationCount,
  runs,
  runSurfaces,
} from "@/lib/runs";
import { formatDate, formatDuration } from "@/lib/format";
import { ModeBadge, SurfaceBadge } from "@/components/Bits";
import RunPlayer from "@/components/RunPlayer";

export function generateStaticParams() {
  return runs.map((run) => ({ id: run.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const run = getRun(id);
  return run
    ? { title: run.title, description: run.summary }
    : { title: "Run not found" };
}

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const run = getRun(id);
  if (!run) notFound();

  const surfaces = runSurfaces(run);
  const events = run.events.length;
  const proofPoints = [
    `${events} sealed events`,
    `${mutationCount(run)} confirmed mutations`,
    `${evidenceCount(run)} evidence items`,
    surfaces.includes("native")
      ? "Native observation redacted"
      : "Web-only capture",
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/runs"
          className="inline-flex items-center gap-1.5 text-xs text-mist hover:text-chalk"
        >
          <ArrowLeft size={13} /> All runs
        </Link>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-mist/45">
          {run.id}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <ModeBadge mode={run.mode} />
        <span className="chip">
          <Clock3 size={10} /> {formatDate(run.startedAt)}
        </span>
        <span className="chip">{formatDuration(run.durationMs)}</span>
        <span className="chip">
          <Layers3 size={10} /> {events} events
        </span>
        {surfaces.map((surface) => (
          <span key={surface} className="chip">
            <SurfaceBadge surface={surface} />
          </span>
        ))}
      </div>

      <h1 className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.045em] text-chalk sm:text-4xl">
        {run.title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-mist">
        {run.summary}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {run.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-mist/60"
          >
            {tag}
          </span>
        ))}
      </div>

      {run.mode === "sample" ? (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-sky/20 bg-sky/[0.03] p-3 text-xs leading-relaxed text-sky">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>
            <span className="font-medium">Sample run.</span> The events and
            evidence here are synthetic, created to demonstrate the viewer. The
            live admin capture is the run to inspect for real evidence.
          </span>
        </div>
      ) : (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-lime/20 bg-lime/[0.03] p-3 text-xs leading-relaxed text-lime">
          <ShieldCheck size={14} className="mt-0.5 shrink-0" />
          <span>
            <span className="font-medium">Live capture.</span> Recorded against
            a disposable local Chrome session pointed at a synthetic corpus app.
            Native screen output is redacted before it enters the chain.
          </span>
        </div>
      )}

      <div className="mt-5 grid items-start gap-3 lg:grid-cols-[1.35fr_1fr]">
        <div
          className={`rounded-2xl border p-5 ${
            run.verdict.tone === "find"
              ? "border-ember/25 bg-ember/[0.035]"
              : run.verdict.tone === "clear"
                ? "border-lime/25 bg-lime/[0.035]"
                : "border-sky/20 bg-sky/[0.03]"
          }`}
        >
          <p className="eyebrow">Verdict</p>
          <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-chalk">
            {run.verdict.label}
          </h2>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-mist">
            {run.verdict.detail}
          </p>
          <ul className="mt-4 grid gap-2 border-t border-white/[0.07] pt-4 text-[11px] text-mist sm:grid-cols-2">
            {proofPoints.map((item) => (
              <li key={item} className="flex items-start gap-1.5">
                <Check size={11} className="mt-0.5 shrink-0 text-lime/80" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="panel p-5">
          <p className="eyebrow">Run facts</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
            <Fact label="Events" value={String(events)} />
            <Fact label="Mutations" value={String(mutationCount(run))} />
            <Fact label="Evidence" value={String(evidenceCount(run))} />
            <Fact
              label="Seal"
              value={`${run.integrity.events} events${
                run.integrity.manifest ? " + manifest" : ""
              }`}
            />
            <div className="col-span-2 border-t border-white/[0.06] pt-3">
              <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-mist/50">
                Task
              </dt>
              <dd className="mt-1 text-[12px] leading-relaxed text-chalk/85">
                {run.task}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-mist/50">
                Agent
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-[12px] text-chalk/85">
                <LockKeyhole size={11} className="text-lime/70" />
                {run.agent ?? "Unknown"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <RunPlayer run={run} />

      <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/[0.06] pt-5 text-xs text-mist sm:flex-row sm:items-center">
        <p>
          Run seal:{" "}
          <span className="font-mono text-[10px] text-chalk/70">
            {run.integrity.algorithm}
          </span>{" "}
          · head{" "}
          <span className="font-mono text-[10px] text-chalk/70">
            {run.integrity.head.slice(0, 16)}…
          </span>
          {run.integrity.manifest ? " · manifest included" : ""}
        </p>
        <div className="flex gap-4">
          <Link href="/engines" className="hover:text-chalk">
            Tool atlas
          </Link>
          <Link href="/capture" className="hover:text-chalk">
            Import another run
          </Link>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-mist/50">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-[11px] text-chalk/85">{value}</dd>
    </div>
  );
}
