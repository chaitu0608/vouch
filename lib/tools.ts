export type ToolEngine = "browser" | "native";
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
    engine: "browser",
    title: "List tabs",
    description:
      "List every open Chrome tab with id, title, URL, active state, and window. The starting point for every browser action.",
    category: "observe",
    safety: "read",
    args: "none",
    returns: "tab[]",
  },
  {
    name: "browser_snapshot",
    engine: "browser",
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
    engine: "browser",
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
    engine: "browser",
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
    engine: "browser",
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
    engine: "browser",
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
    engine: "browser",
    title: "Focus tab",
    description:
      "Bring a tab to the foreground in its window before a visual check.",
    category: "navigate",
    safety: "confirm",
    args: "tabId, confirmed",
    returns: "ok",
  },
  {
    name: "browser_close_tab",
    engine: "browser",
    title: "Close tab",
    description: "Close a tab and discard its page state. Recorded as a mutation.",
    category: "navigate",
    safety: "confirm",
    args: "tabId, confirmed",
    returns: "ok",
  },
  {
    name: "browser_navigate",
    engine: "browser",
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
    engine: "browser",
    title: "Go back",
    description:
      "Move back in the tab's history. Useful when a flow branches and returns.",
    category: "navigate",
    safety: "confirm",
    args: "tabId, confirmed",
    returns: "ok",
  },
  {
    name: "browser_forward",
    engine: "browser",
    title: "Go forward",
    description: "Move forward in the tab's history.",
    category: "navigate",
    safety: "confirm",
    args: "tabId, confirmed",
    returns: "ok",
  },
  {
    name: "browser_reload",
    engine: "browser",
    title: "Reload",
    description:
      "Reload the tab. Often paired with a wait and a fresh snapshot.",
    category: "navigate",
    safety: "confirm",
    args: "tabId, confirmed",
    returns: "ok",
  },
  {
    name: "browser_click",
    engine: "browser",
    title: "Click",
    description:
      "Click by snapshot ref, CSS selector, or x/y. Submit, send, pay, and delete controls are refused without explicit approval.",
    category: "act",
    safety: "approve",
    args: "tabId, ref | selector | x+y, confirmed, approved?",
    returns: "ok + inspection",
  },
  {
    name: "browser_type",
    engine: "browser",
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
    engine: "browser",
    title: "Press key",
    description:
      "Press a key or chord on the focused element, such as Enter, Tab, Escape, or Meta+a.",
    category: "act",
    safety: "confirm",
    args: "tabId, key, confirmed",
    returns: "ok",
  },
  {
    name: "browser_scroll",
    engine: "browser",
    title: "Scroll",
    description:
      "Scroll the page by pixels to load lazy content before the next snapshot.",
    category: "act",
    safety: "confirm",
    args: "tabId, direction, amount?, confirmed",
    returns: "ok",
  },
  {
    name: "browser_release",
    engine: "browser",
    title: "Release refs",
    description:
      "Clear the short-lived element ref map for a tab. A clean end to a browser flow; refs are never reused.",
    category: "act",
    safety: "confirm",
    args: "tabId, confirmed",
    returns: "ok",
  },
  {
    name: "native_look",
    engine: "native",
    title: "Observe the screen",
    description:
      "Ask the native runtime to look at the frontmost screen and describe what it sees. Read-only; raw output is withheld before the event is sealed.",
    category: "native",
    safety: "read",
    args: "mode? (page | read | url)",
    returns: "observation",
  },
  {
    name: "native_stats",
    engine: "native",
    title: "Runtime stats",
    description:
      "The native runtime's own history: turns, model time, action time, and the latest plan. Useful for a recorder health check.",
    category: "native",
    safety: "read",
    args: "days?, last?",
    returns: "stats",
  },
  {
    name: "native_run",
    engine: "native",
    title: "Native task",
    description:
      "Run a natural-language task in the macOS runtime. It can click and type anywhere, so it requires explicit approval; dry run previews without acting.",
    category: "native",
    safety: "approve",
    args: "task, dry?, timeout?, confirmed",
    returns: "plan + result",
  },
  {
    name: "native_handoff",
    engine: "native",
    title: "Native handoff",
    description:
      "Open a fixed native handoff: watch mode, workflow recorder, browser pairing, or extension reload. No arbitrary URLs.",
    category: "native",
    safety: "confirm",
    args: "target (vouch://...)",
    returns: "opened",
  },
];

export const totalEngineTools = engineTools.length;

export const engineLabel: Record<ToolEngine, string> = {
  browser: "Browser",
  native: "Native",
};

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
