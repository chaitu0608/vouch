"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  CircleDot,
  Cpu,
  Github,
  ListTree,
} from "lucide-react";
import Logo from "./Logo";

const nav = [
  { href: "/", label: "Overview", icon: Activity, exact: true },
  { href: "/runs", label: "Runs", icon: ListTree, exact: false },
  { href: "/engines", label: "Engines", icon: Cpu, exact: false },
  { href: "/capture", label: "Capture", icon: CircleDot, exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 grid-lines" />
        <div className="absolute -left-40 top-[-180px] h-[560px] w-[560px] rounded-full bg-lime/[0.055] blur-[130px]" />
        <div className="absolute right-[-120px] top-10 h-[460px] w-[460px] rounded-full bg-sky/[0.055] blur-[130px]" />
      </div>

      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[236px] flex-col border-r border-white/[0.06] bg-ink/70 px-5 py-6 backdrop-blur-xl lg:flex">
        <Logo />

        <nav className="mt-10 space-y-1">
          <p className="mb-3 px-3 font-mono text-[9px] uppercase tracking-[0.22em] text-mist/70">
            Evidence room
          </p>
          {nav.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${
                  active
                    ? "bg-white/[0.06] text-chalk"
                    : "text-mist hover:bg-white/[0.03] hover:text-chalk"
                }`}
              >
                <Icon
                  size={15}
                  strokeWidth={1.8}
                  className={active ? "text-lime" : "text-mist/80 group-hover:text-chalk"}
                />
                <span className="flex-1">{item.label}</span>
                {active && <span className="h-1 w-1 rounded-full bg-lime" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-mist">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-lime" />
              recorder local
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-mist">
              Browsy and Clinqy run on your Mac. This room only renders what you
              deliberately export.
            </p>
            <Link
              href="/capture"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-lime hover:text-[#dcff8a]"
            >
              Record a run <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] text-mist">
            <a
              href="https://github.com/chaitu0608/witness"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-chalk"
            >
              <Github size={13} /> Source
            </a>
            <span className="font-mono text-[9px] uppercase tracking-wider text-mist/60">
              21 tools
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink/85 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <Logo withVersion={false} />
          <a
            href="https://github.com/chaitu0608/witness"
            target="_blank"
            rel="noreferrer"
            className="text-mist hover:text-chalk"
            aria-label="GitHub"
          >
            <Github size={17} />
          </a>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2.5">
          {nav.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs ${
                  active
                    ? "bg-white/[0.07] text-chalk"
                    : "text-mist hover:bg-white/[0.03] hover:text-chalk"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="lg:pl-[236px]">
        <main className="mx-auto w-full max-w-[1120px] px-5 pb-16 pt-7 lg:px-10 lg:pt-11">
          {children}
        </main>

        <footer className="mx-auto w-full max-w-[1120px] border-t border-white/[0.06] px-5 py-6 lg:px-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-mist/45">
              Witness v0.1 · local-first evidence room
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-mist">
              <Link href="/runs" className="hover:text-chalk">
                Runs
              </Link>
              <Link href="/engines" className="hover:text-chalk">
                Engines
              </Link>
              <Link href="/capture" className="hover:text-chalk">
                Capture
              </Link>
              <a
                href="https://github.com/chaitu0608/witness"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-chalk"
              >
                GitHub <ArrowUpRight size={11} />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
