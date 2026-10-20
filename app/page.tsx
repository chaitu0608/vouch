import Link from "next/link";
import {
  ArrowUpRight,
  FileCheck2,
  GitCompare,
  Globe2,
  Hash,
  LockKeyhole,
  Monitor,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  evidenceCount,
  featuredRun,
  mutationCount,
  runs,
  runSurfaces,
} from "@/lib/runs";
import { formatDuration } from "@/lib/format";
import RunCard from "@/components/RunCard";
import EnginePanel from "@/components/EnginePanel";
import IntegritySeal from "@/components/IntegritySeal";
import ReviewChecklist from "@/components/bencho/ReviewChecklist";
import { SectionHeading, Stat } from "@/components/Bits";

const stats = [
  {
    value: "21",
    label: "engine tools",
    note: "17 browser · 4 native",
  },
  {
    value: "2",
    label: "surfaces",
    note: "one sealed timeline",
  },
  {
    value: "1",
    label: "artifact",
    note: "JSON + manifest",
  },
  {
    value: "0",
    label: "bytes uploaded",
    note: "the viewer is static",
  },
];

const gaps = [
  {
    title: "The call",
    body: "You know browser_click ran. You do not know what was on screen, which element it hit, or what changed after it.",
    missing: "surface + result",
  },
  {
    title: "The screenshot",
    body: "Pixels are not a sequence. A still has no approval state and no proof that it was not edited before it reached you.",
    missing: "order + integrity",
  },
  {
    title: "The transcript",
    body: "A chat log is a story. It is not an artifact you can replay, diff, archive, or hand to a client as evidence.",
    missing: "a durable receipt",
  },
];

const steps = [
  {
    n: "01",
    title: "Capture",
    body: "A local recorder drives a known sequence through one bridge: open a tab, settle, snapshot, screenshot, optionally ask the native runtime for one observation. Each call becomes an event.",
    code: "browser_snapshot → event",
  },
  {
    n: "02",
    title: "Seal",
    body: "Events are canonicalized — sorted keys, stable JSON — then chained with SHA-256. A manifest seals the run metadata and the chain head.",
    code: "sha256(prev + event)",
  },
  {
    n: "03",
    title: "Review",
    body: "The evidence room verifies the chain in your browser, lets you replay the timeline, inspect evidence, and export the JSON. No account. No upload.",
    code: "verifyRun(run) → true",
  },
];

const useCases = [
  {
    icon: Search,
    label: "debug · handoff",
    title: "Incident review",
    body: "Reconstruct the page, the native context, and the approval path when an agent fails or surprises you.",
    record: "the exact surface state at each step",
  },
  {
    icon: FileCheck2,
    label: "agency · freelance",
    title: "Proof of work",
    body: "Send a client a sealed receipt of the run: what was read, what was touched, what was submitted, and what was never approved.",
    record: "a file the client can verify",
  },
  {
    icon: GitCompare,
    label: "evals · regression",
    title: "Agent QA",
    body: "Keep a known-good run as a fixture. Re-record after a prompt, model, or browser change and diff the evidence instead of re-watching a screen recording.",
    record: "a comparable, ordered artifact",
  },
  {
    icon: ShieldCheck,
    label: "safety · compliance",
    title: "Approval audit",
    body: "Show that a consequential click was gated and approved by a human — not inferred from a log line or a sentence in a chat.",
    record: "approval state beside the action",
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
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-14 -z-10 h-[420px] grid-lines opacity-70"
        />
        <div className="grid items-center gap-12 lg:grid-cols-[1.03fr_0.97fr] lg:gap-16">
          <div>
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-mist">
              <span className="rec-dot" />
              Browser × Native · local-first
            </div>

            <h1 className="display mt-5 text-[54px] leading-[0.91] tracking-[-0.045em] text-ink sm:text-[76px] lg:text-[82px]">
              Agent work,
              <br />
              <em className="italic text-lime">with receipts.</em>
            </h1>

            <p className="mt-6 max-w-[535px] text-[15px] leading-[1.7] text-mist">
              Vouch records a run across the browser and the Mac, seals each
              event into a SHA-256 chain, and gives you a page you can replay,
              verify, and hand to someone else.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Link href={`/runs/${featuredRun.id}`} className="btn-primary">
                Open the live run <ArrowUpRight size={14} />
              </Link>
              <Link href="/why" className="btn-ghost">
                Why Vouch
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-[0.12em] text-mist">
              <span className="inline-flex items-center gap-1.5">
                <Globe2 size={10} /> 17 browser tools
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Monitor size={10} /> 4 native tools
              </span>
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole size={10} /> 0 bytes uploaded
              </span>
            </div>
          </div>

          {/* The receipt */}
          <div className="relative mx-auto w-full max-w-[560px] lg:mx-0">
            <div className="panel relative overflow-hidden shadow-paper">
              <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="rec-dot" />
                  <span className="truncate font-mono text-[10px] text-ink">
                    run-admin
                  </span>
                  <span className="rounded-full border border-lime/30 bg-lime/[0.05] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-lime">
                    live
                  </span>
                </div>
                <span className="stamp shrink-0">sealed</span>
              </div>

              <div className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-mist">
                    GET /api/admin/users
                  </span>
                  <span className="rounded border border-lime/30 bg-lime/[0.05] px-2 py-0.5 font-mono text-[9px] text-lime">
                    200 OK · anonymous
                  </span>
                </div>

                <div className="mt-3 overflow-hidden rounded-md border border-line">
                  <div className="flex items-center justify-between gap-2 border-b border-line bg-paper-2/60 px-3 py-2">
                    <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-mist">
                      response body
                    </span>
                    <span className="font-mono text-[8px] text-mist">
                      {adminBytes} bytes
                    </span>
                  </div>
                  <pre className="max-h-[184px] overflow-auto bg-[#fbf9f3] p-3.5 font-mono text-[10px] leading-[1.7] text-ink/80">
                    {prettyResponse}
                  </pre>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <HeroFact label="users" value={String(adminUsers)} />
                  <HeroFact label="auth" value="none" />
                  <HeroFact label="surfaces" value={surfaces.join(" + ")} />
                </div>

                <div className="mt-3 overflow-hidden rounded-md border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/evidence/admin-route.jpg"
                    alt="Browser screenshot of the unauthenticated admin response"
                    className="h-[112px] w-full bg-paper-2 object-cover object-top"
                  />
                  <div className="flex items-center justify-between gap-2 border-t border-line bg-paper-2/60 px-3 py-2">
                    <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-mist">
                      screenshot evidence · 1600 × 1016
                    </span>
                    <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-mist">
                      Browser
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                  <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-mist">
                    {featuredRun.events.length} events · SHA-256 ·{" "}
                    {formatDuration(featuredRun.durationMs)}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.1em] text-mint">
                    <ShieldCheck size={11} /> verified in-browser
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-3 rounded-lg border border-line bg-paper-2/45 p-3">
              <Monitor size={13} className="mt-0.5 shrink-0 text-lime" />
              <p className="text-[11px] leading-relaxed text-mist">
                <span className="font-medium text-ink">Native check:</span> the
                runtime looked at the Mac, but the raw observation is withheld by
                the recorder&apos;s privacy filter before it enters the chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-panel px-5 py-4">
            <Stat value={stat.value} label={stat.label} note={stat.note} />
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-3 rounded-xl border border-line bg-paper-2/45 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] leading-relaxed text-mist">
          <span className="font-medium text-ink">
            Browser-only agents stop at the tab.
          </span>{" "}
          <span className="font-medium text-ink">
            Desktop-only agents stop at the app.
          </span>{" "}
          Vouch records both — and gives you the receipt.
        </p>
        <Link
          href="/why"
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-lime transition-colors hover:opacity-70"
        >
          See the difference <ArrowUpRight size={11} />
        </Link>
      </div>

      {/* The gap */}
      <section className="mt-24">
        <SectionHeading
          eyebrow="01 / The gap"
          title="Cloud traces stop at the API boundary."
        >
          A prompt and a tool name are not a record of what happened. The
          consequential part — the logged-in tab, the native window, the
          approval before a submit — is exactly what ordinary observability
          never sees.
        </SectionHeading>

        <div className="grid gap-3 md:grid-cols-3">
          {gaps.map((gap, index) => (
            <div key={gap.title} className="panel flex flex-col p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-mist">
                  0{index + 1}
                </span>
                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-mist/70">
                  missing: {gap.missing}
                </span>
              </div>
              <h3 className="mt-5 text-[15px] font-medium text-ink">
                {gap.title}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-mist">
                {gap.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-5 rounded-xl bg-ink p-6 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper/45">
              The missing layer
            </p>
            <p className="display mt-1 text-[28px] leading-none text-paper sm:text-[32px]">
              A record that can be checked.
            </p>
          </div>
          <p className="max-w-md text-[12px] leading-relaxed text-paper/65">
            Vouch binds the surface, the action, the evidence, and the approval
            into one ordered artifact. The question stops being “what did the
            model say?” and becomes “what actually happened?”
          </p>
        </div>
      </section>

      {/* The record */}
      <section id="record" className="mt-24 scroll-mt-24">
        <SectionHeading eyebrow="02 / The record" title="Capture. Seal. Review.">
          A small recorder where the work happens. A static viewer that asks for
          nothing but a file.
        </SectionHeading>

        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="panel relative p-5">
              <div className="flex items-center justify-between">
                <span className="display text-[28px] leading-none text-lime">
                  {step.n}
                </span>
                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-mist/70">
                  local
                </span>
              </div>
              <h3 className="mt-5 text-[15px] font-medium text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-mist">
                {step.body}
              </p>
              <code className="mt-4 block rounded-md border border-line bg-paper-2/55 px-2.5 py-2 font-mono text-[9px] text-mist">
                {step.code}
              </code>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-3 border-l-2 border-lime pl-4">
          <p className="max-w-3xl text-[12px] leading-relaxed text-mist">
            <span className="font-medium text-ink">
              A recorder, not a proxy.
            </span>{" "}
            v0.1 drives an explicit sequence and records each call. It does not
            intercept an arbitrary agent session yet. That boundary is
            deliberate: the record stays small enough to read, diff, and trust.
          </p>
        </div>
      </section>

      {/* Use cases */}
      <section className="mt-24">
        <SectionHeading
          eyebrow="03 / Where it pays"
          title="Four jobs a trace cannot do."
        >
          The same artifact answers different questions. The common thread is
          that someone else needs to believe the run without watching it happen.
        </SectionHeading>

        <div className="grid gap-3 sm:grid-cols-2">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <div key={useCase.title} className="panel group p-5">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-mist">
                    <Icon size={14} strokeWidth={1.7} />
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-mist/70">
                    {useCase.label}
                  </span>
                </div>
                <h3 className="mt-5 text-[17px] font-medium text-ink">
                  {useCase.title}
                </h3>
                <p className="mt-2 text-[12px] leading-relaxed text-mist">
                  {useCase.body}
                </p>
                <div className="mt-4 flex items-center gap-2 border-t border-line pt-3 font-mono text-[8px] uppercase tracking-[0.1em] text-mist/70">
                  <span className="h-1 w-1 rounded-full bg-lime" />
                  on the record: {useCase.record}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live run */}
      <section className="mt-24">
        <SectionHeading
          eyebrow="04 / Live evidence"
          title="A real run, not a mock."
          action={
            <Link
              href="/runs"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-mist transition-colors hover:text-ink"
            >
              All runs <ArrowUpRight size={12} />
            </Link>
          }
        >
          One live capture against a disposable local corpus, plus two labeled
          samples for range. Every run is a real JSON document with a hash
          chain.
        </SectionHeading>

        <div className="grid items-start gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <RunCard run={featuredRun} featured />

          <div className="space-y-4">
            <div className="panel p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow">Verdict</p>
                <span className="stamp">exposure</span>
              </div>
              <h3 className="display mt-3 text-[30px] leading-[0.98] text-ink">
                {featuredRun.verdict.label}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-mist">
                {featuredRun.verdict.detail}
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4">
                <Fact
                  label="Evidence"
                  value={`${evidenceCount(featuredRun)} items`}
                />
                <Fact
                  label="Mutations"
                  value={`${mutationCount(featuredRun)} confirmed`}
                />
                <Fact label="Surfaces" value={surfaces.join(" + ")} />
                <Fact
                  label="Duration"
                  value={formatDuration(featuredRun.durationMs)}
                />
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <IntegritySeal run={featuredRun} compact />
                <span className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.1em] text-mist">
                  <Hash size={9} /> {featuredRun.integrity.events} blocks +
                  manifest
                </span>
              </div>

              <Link
                href={`/runs/${featuredRun.id}`}
                className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-ink transition-colors hover:text-lime"
              >
                Open the full timeline <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="panel p-5">
              <ReviewChecklist
                items={[
                  {
                    id: "snapshot",
                    label: "Read the admin response",
                    note: `Snapshot evt_07 · ${adminBytes} bytes`,
                  },
                  {
                    id: "screenshot",
                    label: "Inspect the screenshot",
                    note: "Browser · real viewport capture",
                  },
                  {
                    id: "redaction",
                    label: "Confirm the native redaction",
                    note: "Native look · raw screen withheld",
                  },
                  {
                    id: "seal",
                    label: "Verify the chain",
                    note: "SHA-256 · 10 events + manifest",
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* More runs */}
      <section className="mt-16">
        <SectionHeading eyebrow="More surfaces" title="Web, native, or both.">
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

      {/* Surfaces */}
      <section className="mt-24">
        <SectionHeading
          eyebrow="05 / The surfaces"
          title="The browser sees the tab. The Mac sees the app."
          action={
            <Link
              href="/engines"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-mist transition-colors hover:text-ink"
            >
              Tool atlas <ArrowUpRight size={12} />
            </Link>
          }
        >
          Both are MCP surfaces. Vouch records the calls in one timeline, without
          pretending they are the same kind of evidence.
        </SectionHeading>

        <div className="grid gap-4 md:grid-cols-2">
          <EnginePanel
            engine="browser"
            title="The web, in your real session."
            description="Tabs, snapshots, screenshots, clicks, typing, and navigation. No hosted control server, no remote debugging port, no separate profile to keep in sync."
            count={17}
            tools={[
              "browser_list_tabs",
              "browser_snapshot",
              "browser_screenshot",
              "browser_click",
              "browser_navigate",
            ]}
            status="Chrome 118+ · extension"
          />
          <EnginePanel
            engine="native"
            title="The Mac, as a first-class surface."
            description="Accessibility tree, OCR, AppleScript fallback, and a companion cursor. Three runtime tools, one fixed handoff, and a redaction step before anything is sealed."
            count={4}
            tools={["native_look", "native_stats", "native_run", "native_handoff"]}
            status="macOS 14+ · Apple silicon"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[8px] uppercase tracking-[0.1em] text-mist/70">
          <span>
            Native safety: asks before pay / buy / send / submit / delete
          </span>
          <span>one-click stop · 30s watchdog · dry run</span>
        </div>
      </section>

      {/* Boundaries */}
      <section className="mt-24">
        <SectionHeading
          eyebrow="06 / Boundaries"
          title="Local by default. Evidence by choice."
        >
          The recorder runs where the agent runs. The viewer asks for a file,
          not an account, and never receives one unless you hand it over.
        </SectionHeading>

        <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "No backend",
              "The evidence room is a static Next.js site. Imports use the File API and localStorage.",
            ],
            [
              "Native redaction",
              "Raw native observations are replaced with a marker before the run is sealed.",
            ],
            [
              "No auto-submit",
              "The shipped recorder has no submit path. It never clicks, types, sends, or pays.",
            ],
            [
              "No account",
              "Open a run, inspect it, export it. There is nothing to sign into and no telemetry.",
            ],
          ].map(([title, body]) => (
            <div key={title} className="bg-panel p-5">
              <p className="text-[13px] font-medium text-ink">{title}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-mist">
                {body}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-3 font-mono text-[8px] uppercase leading-relaxed tracking-[0.1em] text-mist/70">
          The viewer may check a local bridge at 127.0.0.1:8787. On a hosted
          deployment that check fails closed — it can only reach your machine.
        </p>
      </section>

      {/* CTA */}
      <section className="mt-24 rounded-xl bg-ink p-7 text-paper sm:p-10">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-paper/45">
          07 / Record
        </p>
        <div className="mt-3 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="display max-w-xl text-[38px] leading-[0.95] text-paper sm:text-[48px]">
              Give the next run a receipt.
            </h2>
            <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-paper/65">
              Start with a disposable Chrome profile, record a known sequence,
              seal it, and open the JSON here. The record is yours; the viewer is
              just a room to read it in.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/capture"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white"
            >
              Read the recorder guide <ArrowUpRight size={14} />
            </Link>
            <Link
              href={`/runs/${featuredRun.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-paper/20 px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-paper/10"
            >
              Open the live run
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-paper-2/40 px-2.5 py-2">
      <p className="font-mono text-[7px] uppercase tracking-[0.12em] text-mist">
        {label}
      </p>
      <p className="mt-1 font-mono text-[10px] text-ink">{value}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[8px] uppercase tracking-[0.12em] text-mist/70">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-[10px] text-ink">{value}</dd>
    </div>
  );
}
