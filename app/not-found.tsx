import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="panel mx-auto mt-10 max-w-lg p-8 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-mist">
        <FileQuestion size={20} strokeWidth={1.6} />
      </span>
      <p className="eyebrow mt-5">404 · no such record</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-chalk">
        This run is not in the room.
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-mist">
        It may have been renamed, or it may live in a local export that was
        never imported. Known runs are listed in the evidence room.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/runs" className="btn-primary">
          <ArrowLeft size={14} /> Browse runs
        </Link>
        <Link href="/capture" className="btn-ghost">
          Import a file
        </Link>
      </div>
    </div>
  );
}
