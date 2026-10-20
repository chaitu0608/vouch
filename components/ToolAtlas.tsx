"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  categoryLabel,
  engineLabel,
  engineTools,
  safetyLabel,
  type ToolCategory,
  type ToolEngine,
} from "@/lib/tools";
import { SafetyChip } from "./Bits";

const engineTabs: { id: "all" | ToolEngine; label: string }[] = [
  { id: "all", label: `All ${engineTools.length}` },
  { id: "browser", label: "Browser 17" },
  { id: "native", label: "Native 4" },
];

const categoryTabs: { id: "all" | ToolCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "observe", label: "Observe" },
  { id: "act", label: "Act" },
  { id: "navigate", label: "Navigate" },
  { id: "native", label: "Native" },
];

export default function ToolAtlas() {
  const [engine, setEngine] = useState<"all" | ToolEngine>("all");
  const [category, setCategory] = useState<"all" | ToolCategory>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return engineTools.filter((tool) => {
      const matchesEngine = engine === "all" || tool.engine === engine;
      const matchesCategory = category === "all" || tool.category === category;
      const haystack =
        `${tool.name} ${tool.title} ${tool.description} ${tool.args}`.toLowerCase();
      return matchesEngine && matchesCategory && (!q || haystack.includes(q));
    });
  }, [engine, category, query]);

  return (
    <div id="atlas" className="scroll-mt-8">
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-paper-2/40 p-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tool names, args…"
            className="w-full rounded-md border border-line bg-panel py-2 pl-9 pr-3 text-xs text-ink placeholder:text-mist/60 focus:border-line-strong focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 sm:ml-auto">
          {engineTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setEngine(tab.id)}
              className={`rounded-full border px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.1em] transition-colors ${
                engine === tab.id
                  ? "border-lime/30 bg-lime/[0.06] text-lime"
                  : "border-line text-mist hover:border-line-strong hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategory(tab.id)}
            className={`rounded px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] transition-colors ${
              category === tab.id
                ? "bg-paper-2 text-ink"
                : "text-mist/70 hover:bg-paper-2/60 hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-[8px] uppercase tracking-[0.1em] text-mist/70">
          {filtered.length} / {engineTools.length} tools
        </span>
      </div>

      <p className="mt-2 font-mono text-[8px] leading-relaxed tracking-[0.04em] text-mist/70">
        Browser tools run inside your real Chrome session. Native tools run
        behind the local bridge. Vouch records both with the same event shape.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {filtered.map((tool) => (
          <div key={tool.name} className="panel panel-hover flex flex-col p-5">
            <div className="flex items-center justify-between gap-3">
              <span
                className={`font-mono text-[8px] uppercase tracking-[0.16em] ${
                  tool.engine === "browser" ? "text-sky" : "text-lime"
                }`}
              >
                {engineLabel[tool.engine]}
              </span>
              <SafetyChip safety={tool.safety} />
            </div>

            <div className="mt-3 font-mono text-[10px] text-ink">
              {tool.name}
            </div>
            <h4 className="mt-1 text-[13px] font-medium text-ink">
              {tool.title}
            </h4>
            <p className="mt-2 flex-1 text-[11px] leading-relaxed text-mist">
              {tool.description}
            </p>

            <div className="mt-4 grid gap-2 border-t border-line pt-3 font-mono text-[8px] text-mist">
              <div className="flex gap-2">
                <span className="w-14 shrink-0 uppercase tracking-[0.1em] text-mist/60">
                  args
                </span>
                <span className="min-w-0 break-all">{tool.args}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-14 shrink-0 uppercase tracking-[0.1em] text-mist/60">
                  returns
                </span>
                <span>{tool.returns}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.1em] text-mist/60">
              <span>{categoryLabel[tool.category]}</span>
              <span>{safetyLabel[tool.safety]}</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="panel mt-4 p-10 text-center text-sm text-mist">
          No tools match that search.
        </div>
      )}
    </div>
  );
}
