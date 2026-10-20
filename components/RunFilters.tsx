"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Run } from "@/lib/types";
import RunCard from "./RunCard";

const filters = ["All", "Live", "Sample", "Web + native", "Native"] as const;
type Filter = (typeof filters)[number];

export default function RunFilters({ runs }: { runs: Run[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return runs.filter((run) => {
      const haystack = [run.title, run.summary, run.verdict.detail, ...run.tags]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      const hasWeb = run.events.some((event) => event.surface === "web");
      const hasNative = run.events.some((event) => event.surface === "native");
      const matchesFilter =
        filter === "All" ||
        (filter === "Live" && run.mode === "live") ||
        (filter === "Sample" && run.mode === "sample") ||
        (filter === "Web + native" && hasWeb && hasNative) ||
        (filter === "Native" && hasNative);
      return matchesQuery && matchesFilter;
    });
  }, [runs, query, filter]);

  return (
    <div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search runs, tags, outcomes…"
            className="w-full rounded-md border border-line bg-panel py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-mist/60 focus:border-line-strong focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full border px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.1em] transition-colors ${
                filter === item
                  ? "border-lime/30 bg-lime/[0.06] text-lime"
                  : "border-line text-mist hover:border-line-strong hover:text-ink"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="mono-label">
          {filtered.length} run{filtered.length === 1 ? "" : "s"}
        </p>
        <p className="inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-mist/70">
          <SlidersHorizontal size={10} /> filtered locally
        </p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {filtered.map((run) => (
          <RunCard key={run.id} run={run} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="panel mt-4 p-10 text-center">
          <p className="text-sm text-mist">
            No runs match. Try “live”, “native”, or clear the filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("All");
            }}
            className="mt-3 text-xs font-medium text-lime hover:opacity-70"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
