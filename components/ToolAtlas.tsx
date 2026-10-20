"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  categoryLabel,
  engineTools,
  safetyLabel,
  type ToolCategory,
  type ToolEngine,
} from "@/lib/tools";
import { SafetyChip } from "./Bits";

const engineTabs: { id: "all" | ToolEngine; label: string }[] = [
  { id: "all", label: `All ${engineTools.length}` },
  { id: "browsy", label: "Browsy 17" },
  { id: "clinqy", label: "Clinqy 4" },
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
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist/50"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tool names, args…"
            className="w-full rounded-lg border border-white/10 bg-ink/50 py-2 pl-9 pr-3 text-xs text-chalk placeholder:text-mist/45 focus:border-lime/40 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 sm:ml-auto">
          {engineTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setEngine(tab.id)}
              className={`rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${
                engine === tab.id
                  ? "border-lime/30 bg-lime/[0.07] text-lime"
                  : "border-white/10 text-mist hover:border-white/20 hover:text-chalk"
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
            className={`rounded-md px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${
              category === tab.id
                ? "bg-white/[0.07] text-chalk"
                : "text-mist/60 hover:bg-white/[0.03] hover:text-chalk"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-mist/45">
          {filtered.length} / {engineTools.length} tools
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {filtered.map((tool) => (
          <div
            key={tool.name}
            className="panel panel-hover flex flex-col p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.16em] ${
                  tool.engine === "browsy" ? "text-sky" : "text-lime"
                }`}
              >
                {tool.engine}
              </span>
              <SafetyChip safety={tool.safety} />
            </div>

            <div className="mt-3 font-mono text-[11px] text-chalk">
              {tool.name}
            </div>
            <h4 className="mt-1 text-sm font-medium text-chalk">{tool.title}</h4>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-mist">
              {tool.description}
            </p>

            <div className="mt-4 grid gap-2 border-t border-white/[0.06] pt-3 font-mono text-[9px] text-mist/55">
              <div className="flex gap-2">
                <span className="w-14 shrink-0 uppercase tracking-[0.1em] text-mist/40">
                  args
                </span>
                <span className="min-w-0 break-all">{tool.args}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-14 shrink-0 uppercase tracking-[0.1em] text-mist/40">
                  returns
                </span>
                <span>{tool.returns}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.1em] text-mist/40">
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
