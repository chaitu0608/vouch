import Link from "next/link";
import { ArrowUpRight, LockKeyhole, Plus } from "lucide-react";
import { evidenceCount, runs } from "@/lib/runs";
import RunFilters from "@/components/RunFilters";

export const metadata = {
  title: "Runs",
  description:
    "The Witness evidence room: sealed, replayable runs from Browsy and Clinqy.",
};

export default function RunsPage() {
  const totalEvents = runs.reduce((total, run) => total + run.events.length, 0);
  const totalEvidence = runs.reduce(
    (total, run) => total + evidenceCount(run),
    0
  );

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Evidence room</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-chalk sm:text-4xl">
            Runs
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist">
            A run is a sealed JSON document: every tool call, the arguments it
            received, the evidence it produced, and the hash chain that binds
            them together.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="chip">{runs.length} runs</span>
          <span className="chip">{totalEvents} events</span>
          <span className="chip">{totalEvidence} evidence</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/capture" className="btn-primary">
          <Plus size={15} /> New capture
        </Link>
        <Link href="/runs/local" className="btn-ghost">
          Imported run <ArrowUpRight size={14} />
        </Link>
      </div>

      <RunFilters runs={runs} />

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
        <LockKeyhole size={14} className="mt-0.5 shrink-0 text-lime" />
        <p className="text-xs leading-relaxed text-mist">
          <span className="font-medium text-chalk">
            Rendered from local exports.
          </span>{" "}
          There is no database behind this page. The live run is a real capture;
          the other two are clearly labeled sample runs used to show the range
          of the recorder.
        </p>
      </div>
    </div>
  );
}
