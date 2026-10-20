import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  Cloud,
  Eye,
  FileJson,
  Fingerprint,
  Globe2,
  Hash,
  Layers3,
  LockKeyhole,
  MessageSquare,
  Monitor,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import {
  featuredRun,
  runs,
  runSurfaces,
} from "@/lib/runs";
import { formatDuration } from "@/lib/format";
import RunCard from "@/components/RunCard";
import EnginePanel from "@/components/EnginePanel";
import IntegritySeal from "@/components/IntegritySeal";
import {
  SectionHeading,
  Stat,
  StatusDot,
  SurfaceBadge,
} from "@/components/Bits";

const stats = [
  { value: "21", label: "engine tools", note: "17 Browsy · 4 Clinqy" },
  {
    value: String(featuredRun.events.length),
    label: "events in the live run",
    note: "2 surfaces",
  },
  { value: "46", label: "MCP tools", note: "jobs · memory · workflows" },
  { value: "0", label: "bytes uploaded", note: "by default" },
];

const steps = [
  {
    icon: ScanLine,
    title: "Capture",
    body: "Browsy and Clinqy stream every tool call into the recorder: arguments, results, screenshots, and approval state.",
    code: "browser_snapshot → event",
  },
  {
    icon: LockKeyhole,
    title: "Seal",
    body: "Events are canonicalized and chained with SHA-256. Native captures are redacted before they reach the chain.",
    code: "sha256(prev | event)",
  },
  {
    icon: Eye,
    title: "Review",
    body: "Replay the timeline, verify the chain in your browser, export the JSON. This site is a renderer, not a backend.",
    code: "verifyRun(run) → true",
  },
];

export default function HomePage() {
  const surfaces = runSurfaces(featuredRun);
  const adminSnapshot = featuredRun.events.find(
    (event) => event.id === "evt_07"
  );
  const adminResponse = adminSnapshot?.result?.excerpt ?? "";
  let prettyResponse = adminResponse;
  try {
    prettyResponse = JSON.stringify(JSON.parse(adminResponse), null, 2);
  } catch {
    /* keep the raw excerpt */
  }
  let adminUsers = 1;
  try {
    const parsed = JSON.parse(adminResponse) as { users?: unknown[] };
    if (Array.isArray(parsed.users)) adminUsers = parsed.users.length;
  } catch {
    /* keep the fallback */
  }
  const adminBytes = new TextEncoder().encode(adminResponse).length;

  return (
    <div>
      {/* Hero */}
      <section className="relative grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-lime/20 bg-lime/[0.04] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-lime">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-lime" />
            cross-surface agent observability
          </div>

          <h1 className="mt-5 text-balance text-[44px] font-semibold leading-[0.98] tracking-[-0.06em] text-chalk sm:text-[58px]">
            Every agent action,
            <br />
            <span className="bg-gradient-to-r from-lime via-mint to-sky bg-clip-text text-transparent">
              on the record.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-mist">
            Browsy sees the web in your real Chrome session. Clinqy sees the
            Mac. Witness turns both into a verifiable run — every action,
            snapshot, and screen check, sealed with a SHA-256 chain.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={`/runs/${featuredRun.id}`}
              className="btn-primary"
            >
              Open the live run <ArrowUpRight size={15} />
            </Link>
            <Link href="/engines" className="btn-ghost">
              See the engines <Globe2 size={15} />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-[0.14em] text-mist/65">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-lime" /> local-first
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers3 size={11} /> 21 engine tools
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Hash size={11} /> tamper-evident
            </span>
          </div>
        </div>

        {/* Hero evidence */}
        <div className="relative mx-auto w-full max-w-[560px] lg:mx-0">
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-lime/[0.1] via-transparent to-sky/[0.1] blur-2xl"
          />

          <div className="browser-frame relative overflow-hidden rounded-2xl">
            <div className="flex items-center gap-2 border-b border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5">
              <span className="h-2 w-2 rounded-full bg-ember/70" />
              <span className="h-2 w-2 rounded-full bg-[#ffc857]/70" />
              <span className="h-2 w-2 rounded-full bg-mint/70" />
              <span className="ml-2 flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-white/[0.06] bg-black/30 px-2 py-1 font-mono text-[9px] text-mist/65">
                <Globe2 size={9} />
                <span className="truncate">127.0.0.1:4311/api/admin/users</span>
              </span>
              <span className="rounded border border-ember/25 bg-ember/[0.08] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-ember">
                200
              </span>
            </div>

            <div className="relative p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-ember/35 bg-ember/10 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-ember">
                  <span className="h-1 w-1 rounded-full bg-ember" />
                  200 OK · anonymous
                </span>
                <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-mist/45">
                  response body · formatted
                </span>
              </div>

              <div className="mt-3 overflow-hidden rounded-lg border border-white/[0.07] bg-black/35">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
                  <span className="font-mono text-[9px] text-chalk/70">
                    GET /api/admin/users
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-ember/80">
                    no authorization header
                  </span>
                </div>
                <pre className="max-h-[260px] overflow-auto p-3.5 font-mono text-[10px] leading-[1.7] text-chalk/85">
                  {prettyResponse}
                </pre>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-lime">
                  <span className="h-1 w-1 rounded-full bg-lime" />
                  {adminUsers} user record{adminUsers === 1 ? "" : "s"} exposed
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-mist/45">
                  <FileJson size={9} /> {adminBytes} bytes · real capture
                </span>
              </div>
            </div>

            <div className="relative border-t border-white/[0.07]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/evidence/admin-route.jpg"
                alt="The actual Browsy screenshot of the unauthenticated admin response"
                className="h-20 w-full bg-[#0b0e12] object-cover object-top opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute inset-x-3 bottom-2 flex items-end justify-between gap-2">
                <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-mist/60">
                  screenshot evidence · 1600 × 1016
                </span>
                <span className="rounded border border-white/15 bg-black/40 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-mist/60 backdrop-blur-md">
                  Browsy
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-xl border border-sky/20 bg-sky/[0.03] p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lime/[0.08] text-lime">
              <Monitor size={13} strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-lime">
                Clinqy · native check
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-mist">
                Raw screen observation withheld by the recorder&apos;s privacy
                filter.
              </p>
            </div>
            <span className="hidden shrink-0 items-center gap-1 font-mono text-[8px] uppercase tracking-[0.12em] text-sky sm:inline-flex">
              <LockKeyhole size={9} /> redacted
            </span>
          </div>

          <div className="absolute -right-4 -top-6 hidden w-[198px] sm:block">
            <div className="panel bg-ink/90 p-3.5 shadow-panel backdrop-blur-xl">
              <div className="flex items-center gap-2 text-lime">
                <ShieldCheck size={12} />
                <span className="font-mono text-[9px] uppercase tracking-[0.14em]">
                  chain sealed
                </span>
              </div>
              <p className="mt-1.5 font-mono text-[9px] text-mist/60">
                SHA-256 · {featuredRun.events.length} blocks
              </p>
              <p className="mt-1 truncate font-mono text-[10px] text-chalk/80">
                {featuredRun.integrity.head}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-[10px] text-mist sm:hidden">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-lime" /> chain sealed
            </span>
            <span className="text-mist/30">/</span>
            <span className="inline-flex items-center gap-1.5">
              <Monitor size={11} className="text-lime" /> Clinqy redacted
            </span>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#070b10] px-5 py-4">
            <Stat value={stat.value} label={stat.label} note={stat.note} />
          </div>
        ))}
      </div>

      {/* Gap */}
      <section className="mt-24">
        <SectionHeading
          eyebrow="The blind spot"
          title="Cloud observability stops at the API boundary."
        >
          Your agent&apos;s most consequential work happens in a logged-in tab
          and a native window. Traditional tracing never sees it.
        </SectionHeading>

        <div className="grid gap-3 md:grid-cols-3">
          <GapCard
            icon={Cloud}
            title="Cloud traces"
            body="Requests, spans, and tokens. The screen, the approval, and the consequence are missing."
          />
          <GapCard
            icon={MessageSquare}
            title="Chat transcripts"
            body="A wall of text. You cannot replay it, verify it, or tell what actually happened."
          />
          <GapCard
            icon={Fingerprint}
            title="Witness runs"
            body="Cross-surface events, real evidence, and approvals — chained into a record you can verify."
            highlight
          />
        </div>
      </section>

      {/* Loop */}
      <section className="mt-24">
        <SectionHeading eyebrow="The loop" title="Capture. Seal. Review.">
          A recorder where the agent runs. A viewer that asks for nothing but a
          file.
        </SectionHeading>

        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="panel relative p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-mist/35">
                    0{index + 1}
                  </span>
                  <Icon size={16} className="text-lime/80" strokeWidth={1.6} />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em] text-chalk">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-mist">
                  {step.body}
                </p>
                <code className="mt-4 block rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-2 font-mono text-[9px] text-mist/65">
                  {step.code}
                </code>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured run */}
      <section className="mt-24">
        <SectionHeading
          eyebrow="Live evidence"
          title="A real run, not a mock."
          action={
            <Link
              href="/runs"
              className="inline-flex items-center gap-1 text-xs font-medium text-mist hover:text-chalk"
            >
              All runs <ArrowUpRight size={13} />
            </Link>
          }
        >
          One live capture from a disposable Chrome session, plus two labeled
          samples for range. Every run is a real JSON document with a hash
          chain.
        </SectionHeading>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <RunCard run={featuredRun} featured />

          <div className="panel relative flex flex-col overflow-hidden p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-ember/[0.06] blur-[70px]"
            />
            <p className="eyebrow relative">Verdict</p>
            <div className="relative mt-3 flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-ember" />
              <h3 className="text-xl font-semibold tracking-[-0.03em] text-chalk">
                {featuredRun.verdict.label}
              </h3>
            </div>
            <p className="relative mt-2 text-[13px] leading-relaxed text-mist">
              {featuredRun.verdict.detail}
            </p>

            <div className="relative mt-5 space-y-3">
              {featuredRun.events.slice(0, 4).map((event) => (
                <div key={event.id} className="flex items-start gap-2.5">
                  <span className="mt-1.5">
                    <StatusDot status={event.status} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-chalk/90">
                      {event.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[9px] text-mist/50">
                      {event.tool}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative mt-auto space-y-3 pt-6">
              <div className="flex items-center gap-3 text-[10px] text-mist">
                <span>{formatDuration(featuredRun.durationMs)}</span>
                <span className="text-mist/25">/</span>
                <span>{featuredRun.events.length} events</span>
                <span className="text-mist/25">/</span>
                <span className="flex items-center gap-1.5">
                  {surfaces.map((surface) => (
                    <SurfaceBadge key={surface} surface={surface} />
                  ))}
                </span>
              </div>
              <IntegritySeal run={featuredRun} compact />
              <Link
                href={`/runs/${featuredRun.id}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-chalk transition-colors hover:text-lime"
              >
                Open the full timeline <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* More runs */}
      <section className="mt-20">
        <SectionHeading
          eyebrow="More surfaces"
          title="Web, native, or both."
        >
          A job qualification and a cross-app finance check — the same recorder,
          different surfaces.
        </SectionHeading>
        <div className="grid gap-4 md:grid-cols-2">
          {runs
            .filter((run) => run.id !== featuredRun.id)
            .map((run) => (
              <RunCard key={run.id} run={run} />
            ))}
        </div>
      </section>

      {/* Engines */}
      <section className="mt-24">
        <SectionHeading
          eyebrow="The sensors"
          title="Two engines. One record."
          action={
            <Link
              href="/engines"
              className="inline-flex items-center gap-1 text-xs font-medium text-mist hover:text-chalk"
            >
              Tool atlas <ArrowUpRight size={13} />
            </Link>
          }
        >
          Browsy handles the web in your real Chrome session. Clinqy handles the
          Mac. Witness does not care which surface the action came from.
        </SectionHeading>
        <div className="grid gap-4 md:grid-cols-2">
          <EnginePanel
            engine="browsy"
            title="The web, in your real session."
            description="Tabs, DOM snapshots, screenshots, navigation, and gated mutations. No headless clone, no lost login state."
            count={17}
            tools={[
              "browser_snapshot",
              "browser_click",
              "browser_screenshot",
              "browser_navigate",
              "browser_wait",
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
      </section>

      {/* Privacy */}
      <section className="mt-24">
        <div className="panel relative overflow-hidden p-7 sm:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 dot-grid opacity-[0.18]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-lime/[0.06] blur-[90px]"
          />
          <div className="relative max-w-2xl">
            <p className="eyebrow">Local-first by design</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-chalk sm:text-3xl">
              The recorder runs where the agent runs.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              Browser screenshots, DOM, and native observations never leave your
              Mac unless you export a run. There is no upload endpoint. This
              site is a renderer, not a backend — and the raw native screen is
              redacted by default.
            </p>
          </div>

          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["No account", "Open the site, open a run. No sign-in."],
              ["No telemetry", "No analytics, no phone-home, no queue."],
              ["Redaction first", "Native captures are withheld by policy."],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
              >
                <p className="text-xs font-medium text-chalk">{title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-mist">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20 flex flex-col items-start justify-between gap-6 rounded-2xl border border-lime/20 bg-gradient-to-br from-lime/[0.06] via-transparent to-sky/[0.05] p-7 sm:flex-row sm:items-center sm:p-9">
        <div>
          <p className="eyebrow text-lime/80">Start recording</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-chalk">
            Give your agent a memory with receipts.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist">
            Run the recorder beside Job Pilot, capture a real session, and drop
            the JSON into this room.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/capture" className="btn-primary">
            Capture a run <ArrowUpRight size={15} />
          </Link>
          <Link href="/runs" className="btn-ghost">
            Browse runs
          </Link>
        </div>
      </section>
    </div>
  );
}

function GapCard({
  icon: Icon,
  title,
  body,
  highlight = false,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-lime/25 bg-lime/[0.035]"
          : "border-white/[0.07] bg-white/[0.015]"
      }`}
    >
      <Icon
        size={17}
        strokeWidth={1.6}
        className={highlight ? "text-lime" : "text-mist/60"}
      />
      <h3 className="mt-4 text-sm font-medium text-chalk">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-mist">{body}</p>
    </div>
  );
}
