"use client";

/**
 * Adapted from Bencho's "Step player" block (MIT).
 * https://bencho.dev/blocks/step-player
 *
 * The original is a row of pills where the current step stretches into a
 * bar and fills while it runs. Here the run player owns the step and the
 * play state, so the rail is a controlled navigation/progress surface.
 */

export default function StepRail({
  count,
  at,
  playing,
  onPick,
}: {
  count: number;
  at: number;
  playing: boolean;
  onPick: (index: number) => void;
}) {
  const safeCount = Math.max(0, count);
  const safeAt = Math.min(Math.max(0, at), Math.max(0, safeCount - 1));

  return (
    <div
      className="vch-step"
      role="group"
      aria-label={`Step ${safeAt + 1} of ${safeCount}`}
    >
      <div className="vch-step-track">
        {Array.from({ length: safeCount }).map((_, index) => {
          const active = index === safeAt;
          const done = index < safeAt;
          return (
            <button
              key={index}
              type="button"
              className="vch-step-dot"
              data-active={active}
              data-done={done}
              data-playing={active && playing}
              style={{ width: active ? 38 : 7 }}
              onClick={() => onPick(index)}
              aria-label={`Step ${index + 1}`}
              aria-current={active ? "step" : undefined}
              title={`Step ${index + 1}`}
            >
              <span
                className="vch-step-ink"
                key={active ? `${index}-${playing}` : undefined}
              />
            </button>
          );
        })}
      </div>
      <span className="vch-step-count">
        {String(safeAt + 1).padStart(2, "0")} /{" "}
        {String(safeCount).padStart(2, "0")}
      </span>
    </div>
  );
}
