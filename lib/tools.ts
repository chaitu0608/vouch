export type ToolEngine = "browsy" | "clinqy";
export type ToolCategory = "observe" | "act" | "navigate" | "native";
export type ToolSafety = "read" | "confirm" | "approve";

export interface ToolSpec {
  name: string;
  engine: ToolEngine;
  title: string;
  description: string;
  category: ToolCategory;
  safety: ToolSafety;
  args: string;
  returns: string;
}

export const engineTools: ToolSpec[] = [
  {
    name: "browser_list_tabs",
    engine: "browsy",
    title: "List tabs",
    description:
      "List every open Chrome tab with id, title, URL, active state, and window. The starting point for every web action.",
    category: "observe",
    safety: "read",
    args: "none",
    returns: "tab[]",
  },
  {
    name: "browser_snapshot",
    engine: "browsy",
    title: "Snapshot page",
    description:
      "A compact view of the page: title, URL, headings, interactive elements with short-lived refs, and visible text.",
    category: "observe",
    safety: "read",
    args: "tabId",
    returns: "refs + text",
  },
  {
    name: "browser_get_html",
    engine: "browsy",
    title: "Read HTML",
    description:
      "Outer HTML of the page or a CSS selector, truncated. Used for structured extraction rather than clicking.",
    category: "observe",
    safety: "read",
    args: "tabId, selector?, maxLength?",
    returns: "html",
  },
  {
    name: "browser_screenshot",
    engine: "browsy",
    title: "Capture viewport",
    description:
      "A downscaled JPEG of the visible viewport. Brings the tab to the foreground and returns a durable evidence image.",
    category: "observe",
    safety: "read",
    args: "tabId",
    returns: "image/jpeg",
  },
  {
    name: "browser_wait",
    engine: "browsy",
    title: "Wait for settle",
    description:
      "Wait up to 10 seconds for navigation, hydration, or a lazy render to settle before taking a fresh snapshot.",
    category: "observe",
    safety: "read",
    args: "tabId, milliseconds?",
    returns: "ok",
  },
  {
    name: "browser_open_tab",
    engine: "browsy",
    title: "Open tab",
    description:
      "Open an http(s) URL in a new tab, in the background by default. Returns the new tab id.",
    category: "navigate",
    safety: "confirm",
    args: "url, active?, confirmed",
    returns: "tab",
  },
  {
    name: "browser_focus_tab",
    engine: "browsy",
    title: "Focus tab",
    description: "Bring a tab to the foreground in its window before a visual check.",
    category: "navigate",
    safety: "confirm",
    args: "tabId, confirmed",
    returns: "ok",
  },
  {
    name: "browser_close_tab",
    engine: "browsy",
    title: "Close tab",
    description: "Close a tab and discard its page state. Recorded as a mutation.",
    category: "navigate",
    safety: "confirm",
    args: "tabId, confirmed",
    returns: "ok",
  },
  {
    name: "browser_navigate",
    engine: "browsy",
    title: "Navigate",
    description:
      "Navigate a tab to a new http(s) URL. Preferred over opening a new tab when the flow is linear.",
    category: "navigate",
    safety: "confirm",
    args: "tabId, url, confirmed",
    returns: "ok",
  },
  {
    name: "browser_back",
    engine: "browsy",
    title: "Go back",
    description: "Move back in the tab's history. Useful when a flow branches and returns.",
    category: "navigate",
    safety: "confirm",
    args: "tabId, confirmed",
    returns: "ok",
  },
  {
    name: "browser_forward",
    engine: "browsy",
    title: "Go forward",
    description: "Move forward in the tab's history.",
    category: "navigate",
    safety: "confirm",
    args: "tabId, confirmed",
    returns: "ok",
  },
  {
    name: "browser_reload",
    engine: "browsy",
    title: "Reload",
    description: "Reload the tab. Often paired with a wait and a fresh snapshot.",
    category: "navigate",
    safety: "confirm",
    args: "tabId, confirmed",
    returns: "ok",
  },
  {
    name: "browser_click",
    engine: "browsy",
    title: "Click",
    description:
      "Click by snapshot ref, CSS selector, or x/y. Submit, send, pay, and delete controls are refused without approved=true.",
    category: "act",
    safety: "approve",
    args: "tabId, ref | selector | x+y, confirmed, approved?",
    returns: "ok + inspection",
  },
  {
    name: "browser_type",
    engine: "browsy",
    title: "Type",
    description:
      "Type into an input, textarea, select, or contenteditable by ref or selector. Replaces the value by default.",
    category: "act",
    safety: "confirm",
    args: "tabId, ref | selector, text, replaceExisting?",
    returns: "ok",
  },
  {
    name: "browser_press_key",
    engine: "browsy",
    title: "Press key",
    description: "Press a key or chord on the focused element, such as Enter, Tab, Escape, or Meta+a.",
    category: "act",
    safety: "confirm",
    args: "tabId, key, confirmed",
    returns: "ok",
  },
  {
    name: "browser_scroll",
    engine: "browsy",
    title: "Scroll",
    description: "Scroll the page by pixels to load lazy content before the next snapshot.",
    category: "act",
    safety: "confirm",
    args: "tabId, direction, amount?, confirmed",
    returns: "ok",
  },
  {
    name: "browser_release",
    engine: "browsy",
    title: "Release refs",
    description:
      "Clear the short-lived element ref map for a tab. A clean end to a web flow; refs are never reused.",
    category: "act",
    safety: "confirm",
    args: "tabId, confirmed",
    returns: "ok",
  },
  {
    name: "clinqy_look",
    engine: "clinqy",
    title: "Look at screen",
    description:
      "Ask the native Clinqy app to look at the current page or screen and describe what it sees. Read-only.",
    category: "native",
    safety: "read",
    args: "mode? (page | read | url)",
    returns: "observation",
  },
  {
    name: "clinqy_stats",
    engine: "clinqy",
    title: "Usage stats",
    description:
      "Clinqy's own run history: turns, model time, action time, and the latest plan. Useful for a recorder health check.",
    category: "native",
    safety: "read",
    args: "days?, last?",
    returns: "stats",
  },
  {
    name: "clinqy_run",
    engine: "clinqy",
    title: "Native task",
    description:
      "Run a natural-language task in the native app. Can click and type anywhere on the Mac, so it requires explicit approval; dry=true previews without acting.",
    category: "native",
    safety: "approve",
    args: "task, dry?, timeout?, confirmed",
    returns: "plan + result",
  },
  {
    name: "clinqy_open",
    engine: "clinqy",
    title: "Native handoff",
    description:
      "Open a fixed Clinqy handoff: watch mode, workflow recorder, browser pairing, or extension reload. No arbitrary URLs.",
    category: "native",
    safety: "confirm",
    args: "target (clinqy://...)",
    returns: "opened",
  },
];

export const toolGroups = [
  {
    name: "Jobs",
    count: 17,
    note: "The Job Pilot surface: scan, score, capture, apply packets, briefs. Never auto-submits.",
    names: [
      "jobpilot_status",
      "jobpilot_scan",
      "jobpilot_scan_x",
      "jobpilot_scan_reddit",
      "jobpilot_list_jobs",
      "jobpilot_get_job",
      "jobpilot_set_status",
      "jobpilot_digest",
      "jobpilot_apply_packet",
      "jobpilot_apply",
      "jobpilot_fill_current",
      "jobpilot_capture",
      "jobpilot_import_capture",
      "jobpilot_rescore",
      "jobpilot_research_plan",
      "jobpilot_research_list",
      "jobpilot_brief",
    ],
  },
  {
    name: "Memory",
    count: 3,
    note: "Durable local facts in SQLite. Remember a preference once; it survives sessions.",
    names: ["memory_remember", "memory_recall", "memory_forget"],
  },
  {
    name: "Workflows",
    count: 5,
    note: "Record browser steps, replay them, and keep the human in the loop for mutations.",
    names: [
      "workflow_record_start",
      "workflow_record_stop",
      "workflow_list",
      "workflow_run",
      "workflow_delete",
    ],
  },
];

export const totalMcpTools = 46;

export function getEngineTool(name: string): ToolSpec | undefined {
  return engineTools.find((tool) => tool.name === name);
}

export const safetyLabel: Record<ToolSafety, string> = {
  read: "Read-only",
  confirm: "Confirm",
  approve: "Needs approval",
};

export const categoryLabel: Record<ToolCategory, string> = {
  observe: "Observe",
  act: "Act",
  navigate: "Navigate",
  native: "Native",
};
