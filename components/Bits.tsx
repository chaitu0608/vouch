import type { ReactNode } from "react";
import { Globe2, Monitor, TerminalSquare } from "lucide-react";
import type { EventStatus, RunMode, Surface } from "@/lib/types";
import { modeLabel } from "@/lib/runs";

export function ModeBadge({ mode }: { mode: RunMode }) {
  const styles: Record<RunMode, string> = {
    live: "border-lime/25 bg-lime/[0.07] text-lime",
    sample: "border-sky/25 bg-sky/[0.07] text-sky",
    imported: "border-mint/25 bg-mint/[0.07] text-mint",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] ${styles[mode]}`}
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
    <span className={`inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] ${item.className}`}>
      <Icon size={11} strokeWidth={1.8} />
      {item.label}
    </span>
  );
}

export function StatusDot({ status }: { status: EventStatus }) {
  const color =
    status === "ok"
      ? "bg-lime"
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
      <div className="text-2xl font-semibold tracking-[-0.04em] text-chalk">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-medium text-mist">{label}</div>
      {note && (
        <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-mist/60">
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
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-chalk sm:text-[30px]">
          {title}
        </h2>
        {children && (
          <p className="mt-2 text-sm leading-relaxed text-mist">{children}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function SafetyChip({
  safety,
}: {
  safety: "read" | "confirm" | "approve";
}) {
  const map = {
    read: "border-white/10 text-mist",
    confirm: "border-sky/25 bg-sky/[0.06] text-sky",
    approve: "border-ember/25 bg-ember/[0.06] text-ember",
  } as const;
  const label = {
    read: "read-only",
    confirm: "confirm",
    approve: "approval",
  } as const;
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${map[safety]}`}
    >
      {label[safety]}
    </span>
  );
}
