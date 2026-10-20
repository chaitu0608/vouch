import Link from "next/link";
import {
  ArrowUpRight,
  Boxes,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
  TerminalSquare,
} from "lucide-react";
import { engineTools, toolGroups, totalMcpTools } from "@/lib/tools";
import EnginePanel from "@/components/EnginePanel";
import LiveCheck from "@/components/LiveCheck";
import ToolAtlas from "@/components/ToolAtlas";
import CodeBlock from "@/components/CodeBlock";
import { SafetyChip, SectionHeading } from "@/components/Bits";

export const metadata = {
  title: "Engines",
  description:
    "The 21 Browsy and Clinqy tools Witness records, plus the 46-tool Job Pilot MCP surface underneath.",
};

const safety = [
  {
    level: "read" as const,
    title: "Read-only",
    body: "No state change. These are the sensors: page structure, screenshots, tab inventory, and native screen observations.",
    examples:
      "browser_snapshot · browser_get_html · browser_screenshot · browser_wait · clinqy_look",
  },
  {
    level: "confirm" as const,
    title: "Confirm",
    body: "A mutation that is not a submit: opening tabs, navigating, typing, scrolling, releasing refs, or opening a Clinqy handoff.",
    examples:
      "browser_navigate · browser_type · browser_press_key · browser_release · clinqy_open",
  },
  {
    level: "approve" as const,
    title: "Approve",
    body: "A submit/send/pay/delete click, or a whole-Mac task. These are refused unless the human explicitly approves the action.",
    examples: "browser_click (submit-class) · clinqy_run",
  },
];

const mcpConfig = `{
  "mcpServers": {
    "jobpilot": {
      "command": "node",
      "args": ["/absolute/path/to/jobpilot/server/mcp.js"]
    }
  }
}`;

export default function EnginesPage() {
  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Sensors</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-chalk sm:text-4xl">
            Two engines. One record.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">
            Browsy is the web in your real Chrome session. Clinqy is the Mac as
            a first-class surface. Both speak MCP, and both feed the same
            recorder.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="chip">17 Browsy</span>
          <span className="chip">4 Clinqy</span>
          <span className="chip">{totalMcpTools} MCP tools</span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <EnginePanel
          engine="browsy"
          title="The web, in your real session."
          description="Tabs, DOM snapshots, screenshots, navigation, and gated mutations. No headless clone, no lost login state, no separate browser to keep in sync."
          count={17}
          tools={[
            "browser_snapshot",
            "browser_get_html",
            "browser_screenshot",
            "browser_click",
            "browser_navigate",
          ]}
          status="Chrome extension"
        />
        <EnginePanel
          engine="clinqy"
          title="The Mac, as a first-class surface."
          description="Screen observations, native app tasks, dry-run previews, and controlled handoffs. The place browser-only tools cannot see."
          count={4}
          tools={["clinqy_look", "clinqy_stats", "clinqy_run", "clinqy_open"]}
          status="Native macOS app"
        />
      </div>

      <div className="mt-4">
        <LiveCheck />
      </div>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Tool atlas"
          title="Every sensor, mapped."
          action={
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-mist/50">
              {engineTools.length} engine tools
            </span>
          }
        >
          Search by name, read the arguments, and see the safety class. This is
          the exact surface the recorder logs.
        </SectionHeading>
        <ToolAtlas />
      </section>

      <section className="mt-16">
        <SectionHeading eyebrow="Safety model" title="Read. Confirm. Approve.">
          The recorder records the approval state, not just the action. That is
          how a run can show what the agent did and what the human allowed.
        </SectionHeading>

        <div className="grid gap-3 md:grid-cols-3">
          {safety.map((item) => (
            <div key={item.level} className="panel p-5">
              <div className="flex items-center justify-between gap-2">
                <SafetyChip safety={item.level} />
                {item.level === "read" ? (
                  <ShieldCheck size={15} className="text-lime/70" />
                ) : item.level === "confirm" ? (
                  <LockKeyhole size={15} className="text-sky/70" />
                ) : (
                  <ShieldAlert size={15} className="text-ember/80" />
                )}
              </div>
              <h3 className="mt-4 text-sm font-medium text-chalk">
                {item.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-mist">
                {item.body}
              </p>
              <p className="mt-3 break-words font-mono text-[9px] leading-relaxed text-mist/50">
                {item.examples}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl border border-ember/20 bg-ember/[0.03] p-3 text-xs leading-relaxed text-ember">
          <ShieldAlert size={14} className="mt-0.5 shrink-0" />
          <span>
            Witness never submits an application, sends a message, or clicks a
            pay/delete control on its own. A recorded approval is evidence of
            human consent — not a substitute for it.
          </span>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Under the recorder"
          title={`${totalMcpTools} MCP tools behind the sensors.`}
        >
          The engine tools sit inside the Job Pilot MCP server. Jobs, memory,
          and recorded workflows are the other 25 tools — same process, same
          local SQLite state.
        </SectionHeading>

        <div className="grid gap-3 md:grid-cols-3">
          {toolGroups.map((group) => (
            <div key={group.name} className="panel flex flex-col p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Boxes size={14} className="text-sky/80" />
                  <h3 className="text-sm font-medium text-chalk">
                    {group.name}
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-mist/50">
                  {group.count}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-mist">
                {group.note}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {group.names.slice(0, 6).map((name) => (
                  <span
                    key={name}
                    className="rounded border border-white/[0.06] bg-white/[0.02] px-1.5 py-0.5 font-mono text-[8px] text-mist/60"
                  >
                    {name}
                  </span>
                ))}
                {group.names.length > 6 && (
                  <span className="px-1 py-0.5 font-mono text-[8px] text-mist/40">
                    +{group.names.length - 6}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <div className="panel p-5">
            <div className="flex items-center gap-2">
              <TerminalSquare size={15} className="text-lime" />
              <h3 className="text-sm font-medium text-chalk">
                One local server
              </h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-mist">
              Point any MCP client at the Job Pilot server. Witness records the
              calls; the server still enforces its own confirmation and approval
              gates.
            </p>
            <div className="mt-4">
              <CodeBlock code={mcpConfig} label="mcp config" />
            </div>
          </div>

          <div className="panel relative overflow-hidden p-5">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-sky/[0.06] blur-[70px]"
            />
            <p className="eyebrow relative">Boundary</p>
            <h3 className="relative mt-2 text-lg font-semibold tracking-[-0.03em] text-chalk">
              The recorder is not the agent.
            </h3>
            <p className="relative mt-2 text-xs leading-relaxed text-mist">
              Witness observes the MCP exchange. It does not choose the next
              tool call, widen a permission, or retry a mutation. That keeps the
              record honest: the agent acts, the human approves, the recorder
              witnesses.
            </p>
            <Link
              href="/capture"
              className="relative mt-4 inline-flex items-center gap-1 text-xs font-medium text-lime hover:text-[#dcff8a]"
            >
              Record a run <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
