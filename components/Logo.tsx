import Link from "next/link";

export function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="26" height="26" rx="7" fill="#161512" />
      <circle cx="13" cy="13" r="4.1" fill="#d83a1d" />
      <circle cx="13" cy="13" r="6.7" stroke="#f4f1e9" strokeOpacity="0.22" />
    </svg>
  );
}

export default function Logo({ withVersion = true }: { withVersion?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Vouch home">
      <Mark />
      <span className="text-[17px] font-semibold tracking-[-0.045em] text-ink">
        vouch
      </span>
      {withVersion && (
        <span className="rounded-full border border-line px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-mist">
          beta
        </span>
      )}
    </Link>
  );
}
