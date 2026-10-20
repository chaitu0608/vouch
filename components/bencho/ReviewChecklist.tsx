"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

/**
 * Adapted from Bencho's "Checklist" block (MIT).
 * https://bencho.dev/blocks/checklist
 *
 * The box fills and the tick draws itself. This version is a reviewer's
 * checklist for one run: the reader ticks what they have inspected, and the
 * state stays in the browser.
 */

export type ReviewItem = {
  id: string;
  label: string;
  note?: string;
};

export default function ReviewChecklist({ items }: { items: ReviewItem[] }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const total = items.length;
  const checked = items.filter((item) => done[item.id]).length;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="mono-label">Reviewer&apos;s checklist</p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] tabular-nums text-mist">
            {checked} / {total}
          </span>
          {checked > 0 && (
            <button
              type="button"
              onClick={() => setDone({})}
              className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.1em] text-mist transition-colors hover:text-ink"
            >
              <RotateCcw size={9} /> reset
            </button>
          )}
        </div>
      </div>

      <div className="vch-check mt-2">
        {items.map((item) => {
          const on = Boolean(done[item.id]);
          return (
            <button
              key={item.id}
              type="button"
              role="checkbox"
              aria-checked={on}
              data-on={on}
              className="vch-check-row"
              onClick={() =>
                setDone((current) => ({ ...current, [item.id]: !current[item.id] }))
              }
            >
              <span className="vch-check-box" aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  <path d="M2.8 8.4 6.2 11.6 13.2 4.4" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="vch-check-label">{item.label}</span>
                {item.note && <span className="vch-check-note block">{item.note}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.1em] text-mist/70">
        local to this browser · not part of the seal
      </p>
    </div>
  );
}
