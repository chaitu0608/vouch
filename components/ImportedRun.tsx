"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileJson, Lock, Upload } from "lucide-react";
import type { Run } from "@/lib/types";
import { IMPORT_STORAGE_KEY } from "./ImportRun";
import { ModeBadge } from "./Bits";
import RunPlayer from "./RunPlayer";
import { formatDate } from "@/lib/format";

export default function ImportedRun() {
  const [run, setRun] = useState<Run | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(IMPORT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Run;
        if (parsed?.events?.length) {
          setRun({ ...parsed, mode: "imported" });
        }
      }
    } catch {
      setRun(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    return (
      <div className="panel p-10 text-center text-sm text-mist">
        Reading the local run…
      </div>
    );
  }

  if (!run) {
    return (
      <div className="panel mx-auto max-w-xl p-8 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper-2/50 text-mist">
          <FileJson size={18} strokeWidth={1.6} />
        </span>
        <h1 className="display mt-4 text-[30px] leading-none text-ink">
          No imported run yet
        </h1>
        <p className="mt-2 text-[12px] leading-relaxed text-mist">
          Import a Vouch JSON file and it will render here, entirely in your
          browser. Nothing is uploaded.
        </p>
        <Link href="/capture" className="btn-primary mt-5 inline-flex">
          <Upload size={13} /> Import a run
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/capture"
        className="inline-flex items-center gap-1.5 text-[11px] text-mist transition-colors hover:text-ink"
      >
        <ArrowLeft size={12} /> Capture
      </Link>

      <div className="mt-6 border-b border-line pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <ModeBadge mode="imported" />
          <span className="chip">
            <Lock size={9} /> local only
          </span>
          <span className="chip">{formatDate(run.startedAt)}</span>
        </div>

        <h1 className="display mt-5 max-w-4xl text-[42px] leading-[0.95] text-ink sm:text-[54px]">
          {run.title}
        </h1>
        <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-mist">
          {run.summary}
        </p>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-lg border border-sky/25 bg-sky/[0.04] p-3.5 text-[11px] leading-relaxed text-sky">
        <Lock size={13} className="mt-0.5 shrink-0" />
        Imported from a local file. It was never uploaded, and this page has no
        backend to receive it.
      </div>

      <RunPlayer run={run} />
    </div>
  );
}
