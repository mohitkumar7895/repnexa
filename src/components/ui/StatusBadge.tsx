import React from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "purple";

interface StatusBadgeProps {
  status?: string | null;
  variant?: BadgeVariant;
  className?: string;
}

export function StatusBadge({ status, variant, className = "" }: StatusBadgeProps) {
  const label = (status || "UNKNOWN").toString();
  const normalized = label.toUpperCase().replace(/\s+/g, "_");

  let deducedVariant: BadgeVariant = variant || "neutral";

  if (!variant) {
    if (["ACTIVE", "APPROVED", "COMPLETED", "SUCCESS", "PAID"].includes(normalized)) {
      deducedVariant = "success";
    } else if (["PENDING", "ASSIGNED", "SCHEDULED", "MATCHING", "CHANGES_REQUESTED", "PARTNER_ON_THE_WAY"].includes(normalized)) {
      deducedVariant = "warning";
    } else if (["REJECTED", "CANCELLED", "FAILED", "SUSPENDED", "BLOCKED"].includes(normalized)) {
      deducedVariant = "error";
    } else if (["NEW", "VIEWED", "OPEN", "INFO"].includes(normalized)) {
      deducedVariant = "info";
    } else if (["IN_PROGRESS", "WORK_IN_PROGRESS", "ACCEPTED", "ARRIVED"].includes(normalized)) {
      deducedVariant = "purple";
    }
  }

  const variantStyles: Record<BadgeVariant, string> = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    error: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
    info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    neutral: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider border font-mono ${variantStyles[deducedVariant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {label.replace(/_/g, " ")}
    </span>
  );
}
