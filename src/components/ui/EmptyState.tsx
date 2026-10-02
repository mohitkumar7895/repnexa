import React, { ReactNode } from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon = "📋",
  title,
  description,
  actionText,
  actionHref,
  children
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs space-y-3">
      <div className="text-4xl">{icon}</div>
      <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto">{description}</p>
      
      {actionText && actionHref && (
        <div className="pt-2">
          <Link
            href={actionHref}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            {actionText}
          </Link>
        </div>
      )}

      {children}
    </div>
  );
}
