import Link from "next/link";
import {
  ArrowUpRight,
  FileJson,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  Upload,
} from "lucide-react";
import ImportRun from "@/components/ImportRun";
import CodeBlock from "@/components/CodeBlock";
import { SectionHeading } from "@/components/Bits";

export const metadata = {
  title: "Capture",
  description:
    "Record a real Browsy + Clinqy run on your Mac, seal it, and bring the JSON into the evidence room.",
};

const recordCommand = `# 1. Job Pilot server + Chrome with the extension
# 2. From the witness repo:
node scripts/record-run.mjs \\
  --task "Verify the admin endpoint" \\
  --url http://127.0.0.1:4311/api/admin/users \\
  --native \\
  --out data/runs/my-run.json \\
  --yes`;

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
    body: "Start Job Pilot, open Chrome with the extension, and run the recorder. It speaks MCP over stdio to the same 46-tool server.",
  },
  {
    icon: LockKeyhole,
    title: "Seal the chain",
    body: "Each event is chained with SHA-256 and the run gets a manifest seal. npm run seal re-seals every file; prebuild runs it automatically.",
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
  ["browser_snapshot / screenshot", "read-only", "the evidence"],
  ["browser_wait", "read-only", "let the page settle"],
  ["browser_release", "confirm", "drop refs, not the tab"],
  ["clinqy_look (opt-in)", "read-only", "stored as a redacted event"],
];

export default function CapturePage() {
  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Capture</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-chalk sm:text-4xl">
            A run starts on your Mac.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">
            The recorder wraps the Job Pilot MCP server, drives Browsy for the
            web, and asks Clinqy for one native observation. The output is a
            single JSON file with a hash chain and a manifest seal.
          </p>
        </div>
        <Link href="/engines" className="btn-ghost shrink-0">
          See the 21 tools <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="panel p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-mist/35">
                  0{index + 1}
                </span>
                <Icon size={15} className="text-lime/80" strokeWidth={1.6} />
              </div>
              <h2 className="mt-4 text-sm font-medium text-chalk">
                {step.title}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-mist">
                {step.body}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-12 grid items-start gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="panel p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime/[0.08] text-lime">
              <ScanLine size={15} strokeWidth={1.7} />
            </span>
            <div>
              <h2 className="text-sm font-medium text-chalk">
                Record a real session
              </h2>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-mist/55">
                node · MCP stdio · local only
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-mist">
            The recorder opens the URL you provide, waits, takes a snapshot and
            a screenshot, asks Clinqy for one observation (redacted before it is
            written), and releases the refs. It never clicks, types, submits, or
            sends.
          </p>

          <div className="mt-4">
            <CodeBlock code={recordCommand} label="record a run" />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-mist/50">
                Requires
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-mist">
                Job Pilot at{" "}
                <code className="font-mono text-chalk/80">127.0.0.1:8787</code>,
                Chrome with the extension, and Clinqy for the native check.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-mist/50">
                Then
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-mist">
                <code className="font-mono text-chalk/80">npm run seal</code>{" "}
                writes the chain,{" "}
                <code className="font-mono text-chalk/80">npm run dev</code>{" "}
                opens the room, and Export JSON gives you a file to import
                anywhere.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-ember/20 bg-ember/[0.03] p-3 text-[11px] leading-relaxed text-ember">
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
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky/[0.08] text-sky">
              <FileJson size={15} strokeWidth={1.7} />
            </span>
            <div>
              <h2 className="text-sm font-medium text-chalk">
                Already have a run?
              </h2>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-mist/55">
                reader · localStorage · no upload
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-mist">
            Drop a Witness JSON file here. The viewer verifies the chain in your
            browser and keeps the run in{" "}
            <code className="font-mono text-chalk/80">localStorage</code>.
          </p>

          <div className="mt-4">
            <ImportRun />
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-mist/70">
            No known-good file?{" "}
            <Link
              href="/runs/run-admin"
              className="text-lime hover:text-[#dcff8a]"
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
                className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4"
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-lime/80">
                  {title}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-mist">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Scope"
          title="What the recorder touches."
        >
          A deliberately small surface. If a tool is not on this list, the
          recorder does not call it.
        </SectionHeading>

        <div className="overflow-hidden rounded-2xl border border-white/[0.07]">
          {touches.map(([tool, safety, note]) => (
            <div
              key={tool}
              className="grid gap-2 border-b border-white/[0.06] bg-white/[0.015] px-4 py-3 last:border-0 sm:grid-cols-[1.3fr_0.5fr_1fr] sm:items-center"
            >
              <span className="font-mono text-[10px] text-chalk/80">{tool}</span>
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.12em] ${
                  safety === "read-only" ? "text-mist" : "text-sky"
                }`}
              >
                {safety}
              </span>
              <span className="text-[11px] text-mist">{note}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-lime/20 bg-lime/[0.03] p-3 text-xs leading-relaxed text-lime">
          <ShieldCheck size={14} className="mt-0.5 shrink-0" />
          <span>
            The recorder has no submit path, no message sender, and no arbitrary
            native task. Clinqy is used for one read-only observation, and its
            raw output is withheld.
          </span>
        </div>
      </section>

      <section className="mt-16 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
        <p className="eyebrow">Privacy</p>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-chalk">
          The import is a file read, not a network call.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist">
          This deployment has no database and no upload endpoint. Opening a run
          reads bundled JSON; importing one uses the File API and{" "}
          <code className="font-mono text-chalk/80">localStorage</code>. The only
          network call is the optional local-bridge check, which can only reach
          your own machine.
        </p>
      </section>
    </div>
  );
}
