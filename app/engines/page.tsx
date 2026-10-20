import Link from "next/link";
import {
  ArrowUpRight,
  Fingerprint,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
  TerminalSquare,
} from "lucide-react";
import { engineTools, totalEngineTools } from "@/lib/tools";
import EnginePanel from "@/components/EnginePanel";
import LiveCheck from "@/components/LiveCheck";
import ToolAtlas from "@/components/ToolAtlas";
import CodeBlock from "@/components/CodeBlock";
import ToolMix from "@/components/bencho/ToolMix";
import { SafetyChip, SectionHeading } from "@/components/Bits";

export const metadata = {
  title: "Surfaces",
  description:
    "The 17 browser tools and 4 native tools behind Vouch, and the safety gates that keep a run reviewable.",
};

const safety = [
  {
    level: "read" as const,
    title: "Read-only",
    body: "No state change. These are the sensors: page structure, screenshots, tab inventory, native screen observations, and runtime stats.",
    examples:
      "browser_snapshot · browser_get_html · browser_screenshot · native_look · native_stats",
  },
  {
    level: "confirm" as const,
    title: "Confirm",
    body: "A mutation that is not a submit: opening tabs, navigating, typing, scrolling, releasing refs, or a fixed native handoff.",
    examples:
      "browser_navigate · browser_type · browser_press_key · browser_release · native_handoff",
  },
  {
    level: "approve" as const,
    title: "Approve",
    body: "A submit/send/pay/delete click, or a whole-Mac task. These are refused unless the human explicitly approves the action.",
    examples: "browser_click (submit-class) · native_run",
  },
];

const mcpConfig = `{
  "mcpServers": {
    "vouch": {
      "command": "node",
      "args": ["/absolute/path/to/vouch-bridge.js"]
    }
  }
}`;

const verifyCommand = `$ npm run verify -- data/runs/run-admin.json

ok · 10 events · chain intact · manifest matches
head 693b25b94d76… · SHA-256`;

export default function SurfacesPage() {
  return (
    <div>
      <div className="border-b border-line pb-8">
        <p className="eyebrow">Surfaces</p>
        <h1 className="display mt-3 max-w-4xl text-[46px] leading-[0.93] text-ink sm:text-[58px]">
          Two surfaces. One record.
        </h1>
        <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-mist">
          Vouch reaches the web through your real Chrome session and the Mac
          through a native accessibility runtime. Both speak MCP, both feed the
          same recorder, and the surface stays visible on every event.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="chip">17 browser</span>
          <span className="chip">4 native</span>
          <span className="chip">{totalEngineTools} total</span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <EnginePanel
          engine="browser"
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
          status="Chrome 118+ · extension"
        />
        <EnginePanel
          engine="native"
          title="The Mac, as a first-class surface."
          description="A native runtime that uses the Mac like a person: Accessibility tree, OCR, AppleScript fallback, and a companion cursor. It exposes look, stats, run, and one fixed handoff."
          count={4}
          tools={["native_look", "native_stats", "native_run", "native_handoff"]}
          status="macOS 14+ · Apple silicon"
        />
      </div>

      <div className="mt-3 grid gap-2 text-[10px] leading-relaxed text-mist sm:grid-cols-2">
        <p>
          <span className="font-medium text-ink">Browser:</span> Chrome shows its
          debugger banner while a tab is controlled. Opening DevTools or
          dismissing the banner can detach the debugger; take a fresh snapshot
          before continuing.
        </p>
        <p>
          <span className="font-medium text-ink">Native:</span> the runtime asks
          before Pay, Buy, Send, Submit, Delete, and similar actions. It has a
          one-click stop, a 30-second watchdog, dry run, and local history.
        </p>
      </div>

      <div className="mt-4">
        <LiveCheck />
      </div>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Tool atlas"
          title="Every surface, mapped."
          action={
            <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-mist">
              {engineTools.length} engine tools
            </span>
          }
        >
          Search by name, read the arguments, and see the safety class. This is
          the exact surface the recorder can call.
        </SectionHeading>
        <ToolAtlas />
      </section>

      <section className="mt-16">
        <SectionHeading eyebrow="Safety model" title="Read. Confirm. Approve.">
          The recorder stores the approval state, not just the action. That is
          how a run can show what the agent did and what the human allowed.
        </SectionHeading>

        <div className="grid gap-3 md:grid-cols-3">
          {safety.map((item) => (
            <div key={item.level} className="panel p-5">
              <div className="flex items-center justify-between gap-2">
                <SafetyChip safety={item.level} />
                {item.level === "read" ? (
                  <ShieldCheck size={14} className="text-mist" />
                ) : item.level === "confirm" ? (
                  <LockKeyhole size={14} className="text-sky" />
                ) : (
                  <ShieldAlert size={14} className="text-lime" />
                )}
              </div>
              <h3 className="mt-4 text-[14px] font-medium text-ink">
                {item.title}
              </h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-mist">
                {item.body}
              </p>
              <p className="mt-3 break-words font-mono text-[8px] leading-relaxed text-mist/70">
                {item.examples}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-lg border border-lime/25 bg-lime/[0.035] p-3.5 text-[11px] leading-relaxed text-lime">
          <ShieldAlert size={13} className="mt-0.5 shrink-0" />
          <span>
            Vouch never submits an application, sends a message, or clicks a
            pay/delete control on its own. A recorded approval is evidence of
            human consent — not a substitute for it.
          </span>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Under the recorder"
          title={`${totalEngineTools} tools behind two surfaces.`}
        >
          One local bridge exposes both surfaces with one event shape. The mix
          below is the exact set the recorder can call, grouped by what each
          tool does and which gate it passes through.
        </SectionHeading>

        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="panel p-5">
            <ToolMix />
          </div>

          <div className="panel p-5">
            <div className="flex items-center gap-2">
              <TerminalSquare size={14} className="text-lime" />
              <h3 className="text-[13px] font-medium text-ink">
                One local bridge
              </h3>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-mist">
              Point any MCP client at the bridge. Vouch records the calls; the
              bridge still enforces its own confirmation and approval gates.
            </p>
            <div className="mt-4">
              <CodeBlock code={mcpConfig} label="mcp config" />
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-line bg-paper-2/40 p-3 text-[10px] leading-relaxed text-mist">
              <Fingerprint size={12} className="mt-0.5 shrink-0 text-sky" />
              <span>
                The recorder stores a public alias for each tool. The bridge
                maps the alias to the runtime call, so the artifact stays
                readable without leaking implementation names.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="panel p-5">
            <p className="eyebrow">Independent check</p>
            <h3 className="display mt-2 text-[28px] leading-[1.02] text-ink">
              Verify it without the browser.
            </h3>
            <p className="mt-2 text-[11px] leading-relaxed text-mist">
              The same chain the viewer checks in the browser can be checked
              from a terminal. No account, no network, no trust in this site.
            </p>
            <div className="mt-4">
              <CodeBlock code={verifyCommand} label="verify a run" />
            </div>
          </div>

          <div className="panel p-5">
            <p className="eyebrow">Boundary</p>
            <h3 className="display mt-2 text-[28px] leading-[1.02] text-ink">
              The recorder is not the agent.
            </h3>
            <p className="mt-2 text-[11px] leading-relaxed text-mist">
              Vouch observes an explicit sequence of tool calls. It does not
              choose the next call, widen a permission, or retry a mutation. That
              keeps the record honest: the agent acts, the human approves, the
              recorder writes it down.
            </p>
            <Link
              href="/capture"
              className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-ink transition-colors hover:text-lime"
            >
              Record a run <ArrowUpRight size={11} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
