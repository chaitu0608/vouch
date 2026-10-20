"use client";

import { useMemo, useState } from "react";
import { engineTools, type ToolCategory, type ToolSafety } from "@/lib/tools";

/**
 * Adapted from Bencho's "Stacked bars" block (MIT).
 * https://bencho.dev/blocks/stacked-bars
 *
 * The original is a month of visits; this is the 21 engine tools grouped by
 * what they do, with the safety class stacked inside each bar. Hover a
 * column to see the exact mix.
 */

const ORDER: ToolCategory[] = ["observe", "navigate", "act", "native"];
const LABEL: Record<ToolCategory, string> = {
  observe: "Observe",
  navigate: "Navigate",
  act: "Act",
  native: "Native",
};
const SAFETY_ORDER: ToolSafety[] = ["read", "confirm", "approve"];
const SAFETY_LABEL: Record<ToolSafety, string> = {
  read: "read-only",
  confirm: "confirm",
  approve: "approval",
};
const SAFETY_COLOR: Record<ToolSafety, string> = {
  read: "var(--line-strong)",
  confirm: "var(--web)",
  approve: "var(--signal)",
};

export default function ToolMix() {
  const [hovered, setHovered] = useState<ToolCategory | null>(null);

  const groups = useMemo(
    () =>
      ORDER.map((category) => {
        const tools = engineTools.filter((tool) => tool.category === category);
        const bySafety = SAFETY_ORDER.map((safety) => ({
          safety,
          count: tools.filter((tool) => tool.safety === safety).length,
        })).filter((row) => row.count > 0);
        return { category, tools, bySafety, total: tools.length };
      }),
    []
  );
  const max = Math.max(...groups.map((group) => group.total));
  const active = groups.find((group) => group.category === hovered);

  return (
    <div className="vch-mix">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="mono-label">Safety mix</p>
          <p className="mt-1 text-[11px] leading-relaxed text-mist">
            {engineTools.length} engine tools, by category and gate.
          </p>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          {SAFETY_ORDER.map((safety) => (
            <span
              key={safety}
              className="inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-mist"
            >
              <span
                className="h-2 w-2 rounded-[2px]"
                style={{ background: SAFETY_COLOR[safety] }}
              />
              {SAFETY_LABEL[safety]}
            </span>
          ))}
        </div>
      </div>

      <div className="vch-mix-plot mt-5">
        {groups.map((group) => (
          <button
            key={group.category}
            type="button"
            className="vch-mix-col"
            data-on={hovered === group.category}
            data-dim={hovered !== null && hovered !== group.category}
            onMouseEnter={() => setHovered(group.category)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(group.category)}
            onBlur={() => setHovered(null)}
            aria-label={`${LABEL[group.category]}: ${group.total} tools`}
          >
            <span
              className="vch-mix-stack"
              style={{ height: Math.max(12, (group.total / max) * 132) }}
            >
              {group.bySafety.map((row) => (
                <span
                  key={row.safety}
                  className="vch-mix-seg"
                  style={{
                    height: `${(row.count / group.total) * 100}%`,
                    background: SAFETY_COLOR[row.safety],
                  }}
                />
              ))}
            </span>
          </button>
        ))}
      </div>
      <div className="vch-mix-labels">
        {groups.map((group) => (
          <span key={group.category} className="vch-mix-label">
            {LABEL[group.category]}
            <span className="ml-1 text-ink/60">{group.total}</span>
          </span>
        ))}
      </div>

      {active && (
        <div className="vch-mix-tip">
          <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-mist">
            {LABEL[active.category]} · {active.total} tools
          </p>
          <div className="mt-1.5 grid gap-1">
            {active.bySafety.map((row) => (
              <div
                key={row.safety}
                className="flex items-center justify-between gap-4 text-[10px] text-ink"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: SAFETY_COLOR[row.safety] }}
                  />
                  {SAFETY_LABEL[row.safety]}
                </span>
                <span className="font-mono text-mist">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
