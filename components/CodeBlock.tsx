import CopyButton from "./CopyButton";

export default function CodeBlock({
  code,
  label = "snippet",
  className = "",
}: {
  code: string;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-white/[0.07] bg-black/30 ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-3.5 py-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-mist/55">
          {label}
        </span>
        <CopyButton value={code} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-chalk/80">
        {code}
      </pre>
    </div>
  );
}
