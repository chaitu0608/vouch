import Link from "next/link";
import { ArrowUpRight, LockKeyhole, Plus } from "lucide-react";
import { evidenceCount, runs } from "@/lib/runs";
import RunFilters from "@/components/RunFilters";

export const metadata = {
  title: "Runs",
  description:
    "The Vouch evidence room: sealed, replayable runs from the browser and the Mac.",
};

export default function RunsPage() {
  const totalEvents = runs.reduce((total, run) => total + run.events.length, 0);
  const totalEvidence = runs.reduce(
    (total, run) => total + evidenceCount(run),
    0
  );

  return (
    <div>
      <div className="border-b border-line pb-8">
        <p className="eyebrow">Evidence room</p>
        <h1 className="display mt-3 text-[54px] leading-[0.92] text-ink sm:text-[64px]">
          Runs
        </h1>
        <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-mist">
          A run is a sealed JSON document: every tool call, the arguments it
          received, the evidence it produced, and the hash chain that binds them
          together.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="chip">{runs.length} runs</span>
          <span className="chip">{totalEvents} events</span>
          <span className="chip">{totalEvidence} evidence</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/capture" className="btn-primary">
            <Plus size={14} /> New capture
          </Link>
          <Link href="/runs/local" className="btn-ghost">
            Imported run <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-lg border border-line bg-paper-2/45 p-4">
        <LockKeyhole size={14} className="mt-0.5 shrink-0 text-lime" />
        <p className="text-[11px] leading-relaxed text-mist">
          <span className="font-medium text-ink">
            Rendered from local exports.
          </span>{" "}
          There is no database behind this page. The live run is a real capture;
          the other two are clearly labeled sample runs used to show the range
          of the recorder.
        </p>
      </div>

      <RunFilters runs={runs} />
    </div>
  );
}
