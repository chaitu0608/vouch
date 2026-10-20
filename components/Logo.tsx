import Link from "next/link";

export function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="32" height="32" rx="10" fill="#c8ff4a" />
      <circle cx="16" cy="16" r="7.4" stroke="#05070a" strokeWidth="2.4" />
      <circle cx="16" cy="16" r="2.1" fill="#05070a" />
      <path
        d="M4.5 16h4.2M23.3 16h4.2"
        stroke="#05070a"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Logo({ withVersion = true }: { withVersion?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <Mark />
      <span className="text-[16px] font-semibold tracking-[-0.03em] text-chalk">
        witness
      </span>
      {withVersion && (
        <span className="rounded-full border border-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-mist">
          v0.1
        </span>
      )}
    </Link>
  );
}
