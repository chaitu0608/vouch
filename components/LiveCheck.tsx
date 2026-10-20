"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  PlugZap,
  Unplug,
} from "lucide-react";

type LiveResponse = {
  live: boolean;
  browsy?: boolean;
  clinqy?: boolean;
  error?: string;
};

export default function LiveCheck() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [data, setData] = useState<LiveResponse | null>(null);

  async function check() {
    setStatus("loading");
    try {
      const response = await fetch("/api/live", { cache: "no-store" });
      const json = (await response.json()) as LiveResponse;
      setData(json);
    } catch {
      setData({
        live: false,
        error: "The local runtime did not answer.",
      });
    } finally {
      setStatus("done");
    }
  }

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Local bridge</p>
          <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-chalk">
            This site cannot see your Mac. That is the design.
          </h3>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-mist">
            On Vercel, <code className="font-mono text-[11px] text-chalk/80">127.0.0.1:8787</code>{" "}
            is unreachable. Run the viewer locally next to Job Pilot to turn
            this into a live engine check.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void check()}
          disabled={status === "loading"}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-chalk transition-colors hover:border-lime/30 hover:text-lime disabled:opacity-60"
        >
          {status === "loading" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <PlugZap size={14} />
          )}
          {status === "loading" ? "Checking…" : "Check this Mac"}
        </button>
      </div>

      <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2">
        <EngineRow
          name="Browsy"
          detail="Chrome extension · 17 tools"
          connected={data?.browsy}
          checked={status === "done"}
        />
        <EngineRow
          name="Clinqy"
          detail="Native app · 4 tools"
          connected={data?.clinqy}
          checked={status === "done"}
        />
      </div>

      {status === "done" && !data?.live && (
        <div className="flex items-start gap-2 border-t border-white/[0.06] bg-sky/[0.03] px-5 py-3 text-[11px] leading-relaxed text-sky">
          <Unplug size={13} className="mt-0.5 shrink-0" />
          <span>
            No local runtime from this deployment — expected. To go live:{" "}
            <code className="font-mono">npm run dev</code> beside{" "}
            <code className="font-mono">jobpilot/server/http.js</code>.
          </span>
        </div>
      )}

      {status === "done" && data?.live && (
        <div className="flex items-center gap-2 border-t border-white/[0.06] bg-lime/[0.03] px-5 py-3 text-[11px] text-lime">
          <CheckCircle2 size={13} /> Local runtime connected. Engine actions are
          available to the agent.
        </div>
      )}
    </div>
  );
}

function EngineRow({
  name,
  detail,
  connected,
  checked,
}: {
  name: string;
  detail: string;
  connected?: boolean;
  checked: boolean;
}) {
  return (
    <div className="flex items-center justify-between bg-panel px-5 py-4">
      <div>
        <p className="text-sm font-medium text-chalk">{name}</p>
        <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-mist/55">
          {detail}
        </p>
      </div>
      <span
        className={`inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] ${
          !checked
            ? "text-mist/50"
            : connected
              ? "text-lime"
              : "text-mist/60"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            !checked
              ? "bg-mist/40"
              : connected
                ? "bg-lime"
                : "bg-mist/40"
          }`}
        />
        {!checked ? "not checked" : connected ? "connected" : "offline"}
      </span>
    </div>
  );
}
