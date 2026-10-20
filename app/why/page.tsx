import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  FileCheck2,
  Fingerprint,
  Globe2,
  LockKeyhole,
  Minus,
  Monitor,
  ShieldCheck,
  Waypoints,
} from "lucide-react";
import { SectionHeading } from "@/components/Bits";

export const metadata = {
  title: "Why Vouch",
  description:
    "Browser-only agents see the tab. Desktop-only agents see the app. Vouch records both in one sealed, reviewable run.",
};

type Support = "yes" | "partial" | "no";

const columns = ["Browser-only agents", "Desktop-only agents", "Vouch"] as const;

const rows: {
  label: string;
  detail: string;
  values: [Support, Support, Support];
}[] = [
  {
    label: "Real logged-in browser",
    detail: "The tab you are already signed into, not a headless clone.",
    values: ["yes", "no", "yes"],
  },
  {
    label: "Native macOS context",
    detail: "The app, the sheet, the screen the browser cannot see.",
    values: ["no", "yes", "yes"],
  },
  {
    label: "One cross-surface timeline",
    detail: "Web and native events in the order they happened.",
    values: ["no", "no", "yes"],
  },
  {
    label: "Approval state on the event",
    detail: "Read-only, confirmed, or approved — stored beside the action.",
    values: ["partial", "partial", "yes"],
  },
  {
    label: "Tamper-evident chain",
    detail: "Every event commits to the one before it, plus a manifest.",
    values: ["no", "no", "yes"],
  },
  {
    label: "Offline verifier",
    detail: "Check the run from a terminal without this site.",
    values: ["no", "no", "yes"],
  },
  {
    label: "Redaction before sealing",
    detail: "Native output is withheld before it enters the artifact.",
    values: ["no", "partial", "yes"],
  },
  {
    label: "Share without an account",
    detail: "One JSON file. No workspace, no viewer login.",
    values: ["partial", "partial", "yes"],
  },
  {
    label: "Deterministic, replayable scope",
    detail: "An explicit sequence you can inspect, not an opaque loop.",
    values: ["partial", "partial", "yes"],
  },
];

const split = [
  {
    icon: Globe2,
    label: "Browser-only",
    title: "Stops at the tab.",
    body: "Great at page structure and logged-in web work. Blind to the native app the user checks next to it. The trace rarely leaves the vendor.",
    className: "text-sky",
  },
  {
    icon: Monitor,
    label: "Desktop-only",
    title: "Stops at the app.",
    body: "Great at the Mac: Accessibility, OCR, native controls. Blind to the browser session and the tab that started the task. Evidence is a history, not an artifact.",
    className: "text-lime",
  },
  {
    icon: Waypoints,
    label: "Vouch",
    title: "Records the crossing.",
    body: "The browser and the Mac in one ordered run, with approvals, evidence, and a chain that can be checked by someone who was not there.",
    className: "text-ink",
  },
];

const promises = [
  [
    "No auto-submit",
    "The shipped recorder has no submit path. It cannot send a message, pay an invoice, or delete a record.",
  ],
  [
    "No raw native capture",
    "The native runtime is used for one read-only observation. The raw screen never reaches the JSON.",
  ],
  [
    "No hosted execution",
    "The viewer is static. The recorder, the browser, and the native runtime all run on your machine.",
  ],
  [
    "No sample sold as live",
    "Every run is labeled live, sample, or imported. The viewer never upgrades a sample.",
  ],
];

const anatomy = [
  [
    "01",
    "Identity",
    "A run id, task, mode, timestamp, and author string. Enough to know what this file claims to be.",
  ],
  [
    "02",
    "Events",
    "Tool, surface, arguments, result excerpt, evidence, approval state. The actual sequence, not a summary.",
  ],
  [
    "03",
    "Chain",
    "prevHash and hash on every event, plus a manifest that commits to the title, verdict, and event head.",
  ],
  [
    "04",
    "Portability",
    "A JSON file with relative evidence paths. Open it here, verify it offline, archive it, or hand it to a client.",
  ],
];

function Mark({ value }: { value: Support }) {
  if (value === "yes") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-mint/30 bg-mint/[0.06] text-mint">
        <Check size={12} strokeWidth={2.2} />
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-line bg-paper-2/50 text-mist">
        <Minus size={12} strokeWidth={2.2} />
      </span>
    );
  }
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-line text-mist/40">
      <Minus size={12} strokeWidth={2.2} />
    </span>
  );
}

export default function WhyPage() {
  return (
    <div>
      <div className="border-b border-line pb-8">
        <p className="eyebrow">Why Vouch</p>
        <h1 className="display mt-3 max-w-4xl text-[48px] leading-[0.92] text-ink sm:text-[64px]">
          One run. Both surfaces.
          <br />
          <em className="italic text-lime">A receipt that survives.</em>
        </h1>
        <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-mist">
          Agent tools are built to act. Vouch is built to make the acting
          believable after the tab closes: what was seen, what was touched, what
          a human approved, and what the artifact proves.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/runs/run-admin" className="btn-primary">
            Open the live run <ArrowUpRight size={14} />
          </Link>
          <Link href="/capture" className="btn-ghost">
            Read the recorder guide
          </Link>
        </div>
      </div>

      <section className="mt-10 grid gap-3 md:grid-cols-3">
        {split.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="panel p-5">
              <div className="flex items-center justify-between">
                <span className={`flex h-8 w-8 items-center justify-center rounded-md border border-line ${item.className}`}>
                  <Icon size={15} strokeWidth={1.7} />
                </span>
                <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-mist">
                  {item.label}
                </span>
              </div>
              <h2 className="display mt-5 text-[28px] leading-[1.02] text-ink">
                {item.title}
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-mist">
                {item.body}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="The difference"
          title="Where the categories stop."
        >
          A feature matrix without a winner fantasy. The check is what the
          artifact can prove, not what a demo can show once.
        </SectionHeading>

        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-paper-2/55">
                <th className="px-4 py-3 font-mono text-[8px] uppercase tracking-[0.12em] text-mist">
                  capability
                </th>
                {columns.map((column) => (
                  <th
                    key={column}
                    className={`px-4 py-3 font-mono text-[8px] uppercase tracking-[0.12em] ${
                      column === "Vouch"
                        ? "bg-lime/[0.035] text-lime"
                        : "text-mist"
                    }`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-line last:border-0">
                  <td className="px-4 py-3.5">
                    <p className="text-[12px] font-medium text-ink">
                      {row.label}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-mist">
                      {row.detail}
                    </p>
                  </td>
                  {row.values.map((value, index) => (
                    <td
                      key={`${row.label}-${index}`}
                      className={`px-4 py-3.5 ${
                        index === 2 ? "bg-lime/[0.025]" : ""
                      }`}
                    >
                      <Mark value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-[8px] uppercase tracking-[0.1em] text-mist/70">
          <span className="inline-flex items-center gap-1.5">
            <Check size={10} className="text-mint" /> native
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Minus size={10} /> partial or absent
          </span>
          <span>“Deterministic scope” means an explicit sequence, not a model loop.</span>
        </div>
      </section>

      <section className="mt-16 grid items-start gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="panel p-6">
          <p className="eyebrow">The artifact</p>
          <h2 className="display mt-2 text-[34px] leading-[0.98] text-ink">
            The run is the product.
          </h2>
          <p className="mt-3 text-[12px] leading-relaxed text-mist">
            Chat is a rendering. A screen recording is evidence you cannot
            query. Vouch makes the run itself the durable thing: a file with
            enough structure to verify, diff, and archive.
          </p>
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-line bg-paper-2/40 p-3 text-[10px] leading-relaxed text-mist">
            <Fingerprint size={13} className="mt-0.5 shrink-0 text-sky" />
            <span>
              The manifest commits to the run identity and event head. Change a
              title, a verdict, or a byte of evidence metadata and verification
              fails at that point.
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          {anatomy.map(([n, title, body]) => (
            <div
              key={n}
              className="grid grid-cols-[34px_1fr] gap-3 rounded-lg border border-line bg-panel p-4"
            >
              <span className="font-mono text-[9px] text-lime">{n}</span>
              <div>
                <p className="text-[12px] font-medium text-ink">{title}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-mist">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading eyebrow="Boundaries" title="Four things we refuse to fake.">
          The product is defined as much by the path it will not take as by the
          one it will.
        </SectionHeading>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map(([title, body], index) => (
            <div key={title} className="panel p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-mist">
                  0{index + 1}
                </span>
                <LockKeyhole size={13} className="text-lime" />
              </div>
              <h3 className="mt-4 text-[13px] font-medium text-ink">{title}</h3>
              <p className="mt-1.5 text-[10px] leading-relaxed text-mist">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-paper-2/40 p-6">
          <FileCheck2 size={17} className="text-sky" />
          <h2 className="display mt-3 text-[30px] leading-none text-ink">
            For the person who has to believe it.
          </h2>
          <p className="mt-2 text-[11px] leading-relaxed text-mist">
            An incident reviewer, a client, an eval harness, or a compliance
            lead. They were not watching when the run happened. The receipt is
            for them.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-paper-2/40 p-6">
          <ShieldCheck size={17} className="text-lime" />
          <h2 className="display mt-3 text-[30px] leading-none text-ink">
            For the person who has to run it.
          </h2>
          <p className="mt-2 text-[11px] leading-relaxed text-mist">
            A disposable Chrome profile, one local bridge, an explicit sequence.
            No account, no cloud runner, no surprise permission. The record is
            yours before it is anyone else&apos;s.
          </p>
        </div>
      </section>

      <section className="mt-16 rounded-xl bg-ink p-7 text-paper sm:p-10">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-paper/45">
          Start here
        </p>
        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="display max-w-xl text-[36px] leading-[0.96] text-paper sm:text-[46px]">
            The work happened. Bring back the receipt.
          </h2>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/runs/run-admin"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white"
            >
              Inspect a live run <ArrowUpRight size={14} />
            </Link>
            <Link
              href="/capture"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-paper/20 px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-paper/10"
            >
              Record your own
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
