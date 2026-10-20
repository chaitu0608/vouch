"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import type { Run } from "@/lib/types";
import { verifyRun } from "@/lib/chain";

type SealState = "checking" | "ok" | "bad";

export default function IntegritySeal({
  run,
  compact = false,
}: {
  run: Run;
  compact?: boolean;
}) {
  const [state, setState] = useState<SealState>("checking");
  const [brokenAt, setBrokenAt] = useState<string | null>(null);

  const check = useCallback(async () => {
    if (!run.integrity?.head) {
      setBrokenAt("missing head");
      setState("bad");
      return;
    }
    setState("checking");
    const result = await verifyRun(run);
    setBrokenAt(result.ok ? null : result.brokenAt ?? "unknown");
    setState(result.ok ? "ok" : "bad");
  }, [run]);

  useEffect(() => {
    void check();
  }, [check]);

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] ${
          state === "ok"
            ? "border-lime/25 bg-lime/[0.06] text-lime"
            : state === "bad"
              ? "border-ember/25 bg-ember/[0.06] text-ember"
              : "border-white/10 text-mist"
        }`}
      >
        {state === "checking" ? (
          <Loader2 size={10} className="animate-spin" />
        ) : state === "ok" ? (
          <ShieldCheck size={10} />
        ) : (
          <ShieldAlert size={10} />
        )}
        {state === "ok"
          ? run.integrity.manifest
            ? "run sealed"
            : "chain intact"
          : state === "bad"
            ? "seal broken"
            : "verifying"}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          state === "ok"
            ? "bg-lime/10 text-lime"
            : state === "bad"
              ? "bg-ember/10 text-ember"
              : "bg-white/[0.05] text-mist"
        }`}
      >
        {state === "checking" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : state === "ok" ? (
          <ShieldCheck size={16} />
        ) : (
          <ShieldAlert size={16} />
        )}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-chalk">
          {state === "ok"
            ? run.integrity.manifest
              ? "Run sealed"
              : "Chain intact"
            : state === "bad"
              ? "Seal could not be verified"
              : "Verifying seal…"}
        </div>
        <div className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.1em] text-mist/70">
          SHA-256 · {run.events.length} events
          {run.integrity.manifest ? " + manifest" : ""} · head{" "}
          {run.integrity?.head?.slice(0, 10) ?? "missing"}…
        </div>
        {state === "bad" && brokenAt && (
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ember/80">
            failed at {brokenAt}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => void check()}
        className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-mist transition-colors hover:border-white/20 hover:text-chalk"
      >
        <RefreshCw size={10} /> Re-check
      </button>
    </div>
  );
}
