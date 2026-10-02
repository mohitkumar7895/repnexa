import React from "react";

export type BadgeVariant = 
  | "success" 
  | "warning" 
  | "error" 
  | "info" 
  | "neutral" 
  | "purple";

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

export function StatusBadge({ status, variant, className = "" }: StatusBadgeProps) {
  // Automatically deduce variant if not provided
  const normalized = status.toUpperCase().replace(/\s+/g, "_");

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
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    neutral: "bg-slate-50 text-slate-700 border-slate-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider border font-mono ${variantStyles[deducedVariant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {status.replace(/_/g, " ")}
    </span>
  );
}
