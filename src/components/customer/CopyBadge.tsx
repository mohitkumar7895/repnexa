"use client";

import { useState } from "react";

export default function CopyBadge({
  text,
  label,
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Click to copy"
      className={`inline-flex items-center space-x-1.5 font-mono text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer select-all ${
        copied
          ? "bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-400/20"
          : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-800 border-slate-200"
      } ${className}`}
    >
      <span>{label || text}</span>
      <span className="text-3xs text-slate-400 font-sans">
        {copied ? "✓ Copied" : "📋"}
      </span>
    </button>
  );
}
