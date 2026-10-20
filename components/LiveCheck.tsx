"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, PlugZap, Unplug } from "lucide-react";

type LiveResponse = {
  live: boolean;
  browser?: boolean;
  native?: boolean;
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
        error: "The local bridge did not answer.",
      });
    } finally {
      setStatus("done");
    }
  }

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Local bridge</p>
          <h3 className="mt-1 text-[16px] font-medium text-ink">
            This site cannot see your Mac. That is the design.
          </h3>
          <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-mist">
            On Vercel,{" "}
            <code className="font-mono text-[10px] text-ink">
              127.0.0.1:8787
            </code>{" "}
            is unreachable. Run the viewer locally next to the bridge to turn
            this into a live surface check.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void check()}
          disabled={status === "loading"}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded border border-line bg-paper-2/45 px-4 py-2.5 text-[11px] font-medium text-ink transition-colors hover:border-line-strong hover:text-lime disabled:opacity-60"
        >
          {status === "loading" ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <PlugZap size={13} />
          )}
          {status === "loading" ? "Checking…" : "Check this Mac"}
        </button>
      </div>

      <div className="grid gap-px bg-line sm:grid-cols-2">
        <EngineRow
          name="Browser"
          detail="Chrome extension · 17 tools"
          connected={data?.browser}
          checked={status === "done"}
        />
        <EngineRow
          name="Native"
          detail="macOS runtime · 4 tools"
          connected={data?.native}
          checked={status === "done"}
        />
      </div>

      {status === "done" && !data?.live && (
        <div className="flex items-start gap-2 border-t border-line bg-sky/[0.04] px-5 py-3 text-[10px] leading-relaxed text-sky">
          <Unplug size={12} className="mt-0.5 shrink-0" />
          <span>
            No local bridge from this deployment — expected. To go live:{" "}
            <code className="font-mono">npm run dev</code> beside the bridge.
          </span>
        </div>
      )}

      {status === "done" && data?.live && (
        <div className="flex items-center gap-2 border-t border-line bg-mint/[0.04] px-5 py-3 text-[10px] text-mint">
          <CheckCircle2 size={12} /> Local bridge connected. Both surfaces can
          report their state.
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
        <p className="text-[12px] font-medium text-ink">{name}</p>
        <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-mist">
          {detail}
        </p>
      </div>
      <span
        className={`inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] ${
          !checked
            ? "text-mist/70"
            : connected
              ? "text-mint"
              : "text-mist"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            !checked ? "bg-mist/40" : connected ? "bg-mint" : "bg-mist/50"
          }`}
        />
        {!checked ? "not checked" : connected ? "connected" : "offline"}
      </span>
    </div>
  );
}
