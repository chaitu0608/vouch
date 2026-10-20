import Link from "next/link";
import {
  ArrowUpRight,
  FileJson,
  Fingerprint,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  Upload,
} from "lucide-react";
import ImportRun from "@/components/ImportRun";
import RunComposer from "@/components/RunComposer";
import CodeBlock from "@/components/CodeBlock";
import { SectionHeading } from "@/components/Bits";

export const metadata = {
  title: "Capture",
  description:
    "Record a real browser + native run on your Mac, seal it, and bring the JSON into the Vouch evidence room.",
};

const schema = `{
  "id": "run-2026-10-20",
  "mode": "live",
  "startedAt": "2026-10-20T15:37:10+05:30",
  "task": "Verify the admin endpoint",
  "events": [
    {
      "id": "evt_01",
      "tool": "browser_snapshot",
      "surface": "web",
      "readOnly": true,
      "status": "ok",
      "args": { "tabId": 42 },
      "result": { "excerpt": "…" },
      "evidence": [
        { "kind": "screenshot", "src": "/evidence/admin-route.jpg" }
      ],
      "at": "2026-10-20T15:37:12+05:30",
      "prevHash": "GENESIS",
      "hash": "…"
    }
  ],
  "integrity": {
    "algorithm": "SHA-256",
    "head": "…",
    "events": 1,
    "manifest": "…"
  }
}`;

const steps = [
  {
    icon: ScanLine,
    title: "Record locally",
    body: "Start the local bridge, open Chrome with the extension, and run the recorder. It speaks MCP over stdio and keeps every call on your machine.",
  },
  {
    icon: LockKeyhole,
    title: "Seal the chain",
    body: "Each event is canonicalized and chained with SHA-256; the run gets a manifest seal. npm run seal re-seals every file, and npm run verify checks one offline.",
  },
  {
    icon: Upload,
    title: "Bring it here",
    body: "Export the JSON from any run, or import a file below. The viewer checks the chain in your browser — nothing is uploaded.",
  },
];

const touches = [
  ["browser_list_tabs", "read-only", "find the disposable tab"],
  ["browser_open_tab / navigate", "confirm", "only the URL you pass"],
  ["browser_wait", "read-only", "let the page settle"],
  ["browser_snapshot / screenshot", "read-only", "the evidence"],
  ["native_look (opt-in)", "read-only", "stored as a redacted event"],
  ["browser_release", "confirm", "drop refs, not the tab"],
];

export default function CapturePage() {
  return (
    <div>
      <div className="border-b border-line pb-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Capture</p>
            <h1 className="display mt-3 text-[46px] leading-[0.93] text-ink sm:text-[58px]">
              A run starts on your Mac.
            </h1>
            <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-mist">
              The recorder speaks MCP over stdio to one local bridge, drives the
              browser surface, optionally asks the native runtime for one
              observation, and writes a single JSON file with a hash chain and a
              manifest seal.
            </p>
          </div>
          <Link href="/engines" className="btn-ghost shrink-0">
            See the 21 tools <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="panel p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-mist">
                  0{index + 1}
                </span>
                <Icon size={14} className="text-lime" strokeWidth={1.7} />
              </div>
              <h2 className="mt-4 text-[14px] font-medium text-ink">
                {step.title}
              </h2>
              <p className="mt-1.5 text-[11px] leading-relaxed text-mist">
                {step.body}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-12 grid items-start gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="panel p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded border border-line bg-paper-2/50 text-lime">
              <ScanLine size={15} strokeWidth={1.7} />
            </span>
            <div>
              <h2 className="text-[14px] font-medium text-ink">
                Record a real session
              </h2>
              <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-mist">
                node · MCP stdio · local only
              </p>
            </div>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-mist">
            The recorder opens the URL you provide, waits, takes a snapshot and
            a screenshot, asks the native runtime for one observation (redacted
            before it is written), and releases the refs. It never clicks, types,
            submits, or sends.
          </p>

          <div className="mt-4">
            <RunComposer />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-paper-2/40 p-3">
              <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-mist">
                Requires
              </p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-mist">
                The local bridge at{" "}
                <code className="font-mono text-ink">127.0.0.1:8787</code>,
                Chrome with the extension, and the native runtime for the
                optional check.
              </p>
            </div>
            <div className="rounded-lg border border-line bg-paper-2/40 p-3">
              <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-mist">
                Then
              </p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-mist">
                <code className="font-mono text-ink">npm run seal</code> writes
                the chain, <code className="font-mono text-ink">npm run dev</code>{" "}
                opens the room, and Export JSON gives you a file to import
                anywhere.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-lime/25 bg-lime/[0.035] p-3 text-[10px] leading-relaxed text-lime">
            <LockKeyhole size={13} className="mt-0.5 shrink-0" />
            <span>
              Do not point the recorder at a real admin endpoint, a banking
              session, or a native app with private data. Use a disposable
              profile and a corpus app you control.
            </span>
          </div>
        </section>

        <section className="panel p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded border border-line bg-paper-2/50 text-sky">
              <FileJson size={15} strokeWidth={1.7} />
            </span>
            <div>
              <h2 className="text-[14px] font-medium text-ink">
                Already have a run?
              </h2>
              <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-mist">
                reader · localStorage · no upload
              </p>
            </div>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-mist">
            Drop a Vouch JSON file here. The viewer verifies the chain in your
            browser and keeps the run in{" "}
            <code className="font-mono text-ink">localStorage</code>.
          </p>

          <div className="mt-4">
            <ImportRun />
          </div>

          <p className="mt-4 text-[10px] leading-relaxed text-mist/80">
            No known-good file?{" "}
            <Link
              href="/runs/run-admin"
              className="text-lime hover:opacity-70"
            >
              Open the live run
            </Link>{" "}
            and use Export JSON.
          </p>
        </section>
      </div>

      <section className="mt-16">
        <SectionHeading eyebrow="The artifact" title="What is inside a run.">
          A small, boring JSON document. That is the point: you can read it,
          diff it, sign it, or archive it without this site.
        </SectionHeading>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <CodeBlock code={schema} label="run schema (abridged)" />

          <div className="space-y-3">
            {[
              [
                "Events",
                "Tool name, surface, arguments, a result excerpt, and any evidence. Read-only and approval state are explicit.",
              ],
              [
                "Evidence",
                "A screenshot path or a text excerpt. Native observations are represented by a redaction marker, never the raw screen.",
              ],
              [
                "Seal",
                "prevHash and hash on every event, plus a head and a manifest seal in integrity. Change one byte and verification fails at that event.",
              ],
              [
                "Mode",
                "live, sample, or imported. The viewer never presents a sample as a live capture.",
              ],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-lg border border-line bg-paper-2/40 p-4"
              >
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-lime">
                  {title}
                </p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-mist">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading eyebrow="Scope" title="What the recorder touches.">
          A deliberately small surface. If a tool is not on this list, the
          recorder does not call it.
        </SectionHeading>

        <div className="overflow-hidden rounded-xl border border-line">
          {touches.map(([tool, safety, note]) => (
            <div
              key={tool}
              className="grid gap-2 border-b border-line bg-panel px-4 py-3 last:border-0 sm:grid-cols-[1.3fr_0.5fr_1fr] sm:items-center"
            >
              <span className="font-mono text-[9px] text-ink">{tool}</span>
              <span
                className={`font-mono text-[8px] uppercase tracking-[0.12em] ${
                  safety === "read-only" ? "text-mist" : "text-sky"
                }`}
              >
                {safety}
              </span>
              <span className="text-[10px] text-mist">{note}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-mint/25 bg-mint/[0.035] p-3 text-[10px] leading-relaxed text-mint">
          <ShieldCheck size={13} className="mt-0.5 shrink-0" />
          <span>
            The recorder has no submit path, no message sender, and no arbitrary
            native task. The native runtime is used for one read-only
            observation, and its raw output is withheld.
          </span>
        </div>
      </section>

      <section className="mt-16 rounded-xl border border-line bg-paper-2/40 p-6">
        <div className="flex items-start gap-3">
          <Fingerprint size={18} className="mt-0.5 shrink-0 text-sky" />
          <div>
            <p className="eyebrow">Privacy</p>
            <h2 className="display mt-2 text-[28px] leading-[1.02] text-ink">
              The import is a file read, not a network call.
            </h2>
            <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-mist">
              This deployment has no database and no upload endpoint. Opening a
              run reads bundled JSON; importing one uses the File API and{" "}
              <code className="font-mono text-ink">localStorage</code>. The only
              network call is the optional local-bridge check, which can only
              reach your own machine.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
