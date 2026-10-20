"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({
  value,
  label = "Copy",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className={`inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.12em] text-mist transition-colors hover:text-ink ${className}`}
    >
      {copied ? <Check size={10} className="text-mint" /> : <Copy size={10} />}
      {copied ? "Copied" : label}
    </button>
  );
}
