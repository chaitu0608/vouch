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
      className={`overflow-hidden rounded-lg border border-line bg-[#eee9dd] ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-2">
        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-mist">
          {label}
        </span>
        <CopyButton value={code} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[10px] leading-relaxed text-ink/80">
        {code}
      </pre>
    </div>
  );
}
