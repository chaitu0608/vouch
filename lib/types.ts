export type Surface = "web" | "native" | "system";
export type EventStatus = "ok" | "redacted" | "blocked";
export type RunMode = "live" | "sample" | "imported";

export interface Evidence {
  kind: "screenshot" | "dom" | "screen" | "text";
  label: string;
  src?: string;
  content?: string;
  note?: string;
  redacted?: boolean;
}

export interface RunEvent {
  id: string;
  at: string;
  tool: string;
  title: string;
  summary: string;
  surface: Surface;
  readOnly: boolean;
  approved?: boolean;
  status: EventStatus;
  target?: string;
  args?: Record<string, unknown>;
  result?: { excerpt?: string; meta?: string };
  evidence?: Evidence[];
  prevHash: string;
  hash: string;
}

export interface RunIntegrity {
  algorithm: "SHA-256";
  head: string;
  events: number;
  manifest?: string;
}

export interface Run {
  id: string;
  title: string;
  task: string;
  summary: string;
  verdict: {
    label: string;
    detail: string;
    tone: "find" | "clear" | "info";
  };
  startedAt: string;
  durationMs: number;
  mode: RunMode;
  agent?: string;
  tags: string[];
  events: RunEvent[];
  integrity: RunIntegrity;
}
