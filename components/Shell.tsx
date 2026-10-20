"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Github } from "lucide-react";
import Logo from "./Logo";

const nav = [
  { href: "/runs", label: "Runs" },
  { href: "/engines", label: "Surfaces" },
  { href: "/why", label: "Why Vouch" },
  { href: "/capture", label: "Capture" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/92 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center gap-5 px-5 lg:px-8">
          <Logo />

          <nav className="ml-auto hidden items-center gap-6 md:flex">
            {nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-1 text-[13px] transition-colors ${
                    active ? "text-ink" : "text-mist hover:text-ink"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-1 left-0 h-px w-full bg-lime" />
                  )}
                </Link>
              );
            })}
            <a
              href="https://github.com/chaitu0608/vouch"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] text-mist transition-colors hover:text-ink"
            >
              <Github size={14} /> Source
            </a>
          </nav>

          <Link
            href="/runs/run-admin"
            className="btn-primary ml-auto h-9 px-3.5 py-0 text-[12px] md:ml-0"
          >
            <span className="rec-dot" />
            Open live run
            <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="border-t border-line md:hidden">
          <nav className="mx-auto flex w-full max-w-[1180px] items-center gap-1 overflow-x-auto px-3 py-2">
            {nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? "bg-paper-2 text-ink"
                      : "text-mist hover:bg-paper-2/70 hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href="https://github.com/chaitu0608/vouch"
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs text-mist hover:text-ink"
            >
              <Github size={13} /> Source
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1180px] px-5 pb-20 pt-10 lg:px-8 lg:pt-14">
        {children}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-10 sm:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
          <div>
            <Logo withVersion={false} />
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-mist">
              Receipts for agent work. A local-first record of what happened in
              the browser and on the Mac.
            </p>
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.12em] text-mist/70">
              v0.1 · 21 tools · 2 surfaces · 1 file
            </p>
          </div>

          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-mist">
              Evidence room
            </p>
            <div className="mt-3 grid gap-2 text-[13px]">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="w-fit text-mist transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/runs/run-admin"
                className="w-fit text-mist transition-colors hover:text-ink"
              >
                Live run
              </Link>
            </div>
          </div>

          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-mist">
              Under the hood
            </p>
            <div className="mt-3 grid gap-2 text-[13px]">
              <span className="text-mist">Next.js · static viewer</span>
              <span className="text-mist">MCP · local bridge</span>
              <a
                href="https://bencho.dev/licence"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-1 text-mist transition-colors hover:text-ink"
              >
                Motion: Bencho (MIT) <ArrowUpRight size={11} />
              </a>
              <a
                href="https://github.com/chaitu0608/vouch"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-1 text-mist transition-colors hover:text-ink"
              >
                Source <ArrowUpRight size={11} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-line">
          <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-2 px-5 py-4 font-mono text-[9px] uppercase tracking-[0.12em] text-mist/70 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <span>No backend · no account · no upload</span>
            <span>© 2026 Vouch</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
