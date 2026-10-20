import type { ReactNode } from "react";
import { Globe2, Monitor, TerminalSquare } from "lucide-react";
import type { EventStatus, RunMode, Surface } from "@/lib/types";
import { modeLabel } from "@/lib/runs";

export function ModeBadge({ mode }: { mode: RunMode }) {
  const styles: Record<RunMode, string> = {
    live: "border-lime/30 bg-lime/[0.06] text-lime",
    sample: "border-line text-mist",
    imported: "border-mint/30 bg-mint/[0.05] text-mint",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.16em] ${styles[mode]}`}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {modeLabel[mode]}
    </span>
  );
}

export function SurfaceBadge({ surface }: { surface: Surface }) {
  const map = {
    web: { label: "Web", icon: Globe2, className: "text-sky" },
    native: { label: "Native", icon: Monitor, className: "text-lime" },
    system: { label: "System", icon: TerminalSquare, className: "text-mist" },
  } as const;
  const item = map[surface];
  const Icon = item.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.16em] ${item.className}`}
    >
      <Icon size={10} strokeWidth={1.8} />
      {item.label}
    </span>
  );
}

export function StatusDot({ status }: { status: EventStatus }) {
  const color =
    status === "ok"
      ? "bg-mint"
      : status === "redacted"
        ? "bg-sky"
        : "bg-ember";
  return <span className={`h-1.5 w-1.5 rounded-full ${color}`} />;
}

export function Stat({
  value,
  label,
  note,
}: {
  value: string;
  label: string;
  note?: string;
}) {
  return (
    <div className="px-1 py-1">
      <div className="display text-[34px] leading-none text-ink">{value}</div>
      <div className="mt-2 text-[11px] font-medium text-ink">{label}</div>
      {note && (
        <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.12em] text-mist">
          {note}
        </div>
      )}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 border-t border-line pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="display mt-2 text-[30px] leading-[1.02] text-ink sm:text-[38px]">
            {title}
          </h2>
          {children && (
            <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-mist">
              {children}
            </p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}

export function SafetyChip({
  safety,
}: {
  safety: "read" | "confirm" | "approve";
}) {
  const map = {
    read: "border-line text-mist",
    confirm: "border-sky/30 bg-sky/[0.05] text-sky",
    approve: "border-lime/30 bg-lime/[0.05] text-lime",
  } as const;
  const label = {
    read: "read-only",
    confirm: "confirm",
    approve: "approval",
  } as const;
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] ${map[safety]}`}
    >
      {label[safety]}
    </span>
  );
}
