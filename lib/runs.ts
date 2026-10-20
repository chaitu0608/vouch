import adminRun from "@/data/runs/run-admin.json";
import payoutRun from "@/data/runs/run-payout.json";
import supabaseRun from "@/data/runs/run-supabase.json";
import type { Run, RunMode, Surface } from "./types";

export const runs: Run[] = [
  adminRun as unknown as Run,
  supabaseRun as unknown as Run,
  payoutRun as unknown as Run,
];

export const featuredRun =
  runs.find((run) => run.mode === "live") ?? runs[0];

export function getRun(id: string): Run | undefined {
  return runs.find((run) => run.id === id);
}

export function runSurfaces(run: Run): Surface[] {
  return Array.from(new Set(run.events.map((event) => event.surface)));
}

export function mutationCount(run: Run): number {
  return run.events.filter((event) => !event.readOnly).length;
}

export function evidenceCount(run: Run): number {
  return run.events.reduce(
    (total, event) => total + (event.evidence?.length ?? 0),
    0
  );
}

export function nativeCount(run: Run): number {
  return run.events.filter((event) => event.surface === "native").length;
}

export const modeLabel: Record<RunMode, string> = {
  live: "Live capture",
  sample: "Sample",
  imported: "Imported",
};

export const modeDescription: Record<RunMode, string> = {
  live: "Recorded against a real browser session.",
  sample: "Synthetic run for demonstration.",
  imported: "Loaded from a local file.",
};
