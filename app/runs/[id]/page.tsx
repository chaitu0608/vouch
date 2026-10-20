import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
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
          className="inline-flex items-center gap-1.5 text-[11px] text-mist transition-colors hover:text-ink"
        >
          <ArrowLeft size={12} /> All runs
        </Link>
        <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-mist/70">
          {run.id}
        </span>
      </div>

      <div className="mt-6 border-b border-line pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <ModeBadge mode={run.mode} />
          <span className="chip">
            <Clock3 size={9} /> {formatDate(run.startedAt)}
          </span>
          <span className="chip">{formatDuration(run.durationMs)}</span>
          <span className="chip">
            <Layers3 size={9} /> {events} events
          </span>
          {surfaces.map((surface) => (
            <span key={surface} className="chip">
              <SurfaceBadge surface={surface} />
            </span>
          ))}
        </div>

        <h1 className="display mt-5 max-w-4xl text-[42px] leading-[0.95] text-ink sm:text-[56px]">
          {run.title}
        </h1>
        <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-mist">
          {run.summary}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {run.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-line bg-paper-2/40 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-mist"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {run.mode === "sample" ? (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-sky/25 bg-sky/[0.04] p-3.5 text-[11px] leading-relaxed text-sky">
          <Info size={13} className="mt-0.5 shrink-0" />
          <span>
            <span className="font-medium">Sample run.</span> The events and
            evidence here are synthetic, created to demonstrate the viewer. The
            live admin capture is the run to inspect for real evidence.
          </span>
        </div>
      ) : (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-mint/25 bg-mint/[0.04] p-3.5 text-[11px] leading-relaxed text-mint">
          <ShieldCheck size={13} className="mt-0.5 shrink-0" />
          <span>
            <span className="font-medium">Live capture.</span> Recorded against
            a disposable local Chrome session pointed at a synthetic corpus app.
            Native screen output is redacted before it enters the chain.
          </span>
        </div>
      )}

      <div className="mt-5 grid items-start gap-3 lg:grid-cols-[1.35fr_1fr]">
        <div
          className={`rounded-xl border p-5 ${
            run.verdict.tone === "find"
              ? "border-lime/30 bg-lime/[0.035]"
              : run.verdict.tone === "clear"
                ? "border-mint/30 bg-mint/[0.035]"
                : "border-sky/25 bg-sky/[0.03]"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow">Verdict</p>
            <span className="stamp">
              {run.verdict.tone === "find" ? "finding" : run.verdict.tone}
            </span>
          </div>
          <h2 className="display mt-3 text-[32px] leading-[0.98] text-ink">
            {run.verdict.label}
          </h2>
          <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-mist">
            {run.verdict.detail}
          </p>
          <ul className="mt-4 grid gap-2 border-t border-line pt-4 text-[10px] text-mist sm:grid-cols-2">
            {proofPoints.map((item) => (
              <li key={item} className="flex items-start gap-1.5">
                <Check size={11} className="mt-0.5 shrink-0 text-lime" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="panel p-5">
          <p className="eyebrow">Run facts</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
            <Fact label="Events" value={String(events)} />
            <Fact label="Mutations" value={String(mutationCount(run))} />
            <Fact label="Evidence" value={String(evidenceCount(run))} />
            <Fact
              label="Seal"
              value={`${run.integrity.events} events${
                run.integrity.manifest ? " + manifest" : ""
              }`}
            />
            <div className="col-span-2 border-t border-line pt-3">
              <dt className="font-mono text-[8px] uppercase tracking-[0.12em] text-mist/70">
                Task
              </dt>
              <dd className="mt-1 text-[11px] leading-relaxed text-ink/85">
                {run.task}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="font-mono text-[8px] uppercase tracking-[0.12em] text-mist/70">
                Agent
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-[11px] text-ink/85">
                <LockKeyhole size={10} className="text-lime" />
                {run.agent ?? "Unknown"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <RunPlayer run={run} />

      <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-line pt-5 text-[11px] text-mist sm:flex-row sm:items-center">
        <p>
          Run seal:{" "}
          <span className="font-mono text-[9px] text-ink">
            {run.integrity.algorithm}
          </span>{" "}
          · head{" "}
          <span className="font-mono text-[9px] text-ink">
            {run.integrity.head.slice(0, 16)}…
          </span>
          {run.integrity.manifest ? " · manifest included" : ""}
        </p>
        <div className="flex gap-4">
          <Link
            href="/engines"
            className="inline-flex items-center gap-1 transition-colors hover:text-ink"
          >
            Tool atlas <ArrowUpRight size={11} />
          </Link>
          <Link
            href="/capture"
            className="inline-flex items-center gap-1 transition-colors hover:text-ink"
          >
            Import another run <ArrowUpRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[8px] uppercase tracking-[0.12em] text-mist/70">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-[10px] text-ink">{value}</dd>
    </div>
  );
}
