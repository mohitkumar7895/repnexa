import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  badge?: string;
  badgeColor?: "emerald" | "purple" | "orange" | "slate" | "blue";
  valueColor?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  badge,
  badgeColor = "purple",
  valueColor = "text-slate-900 dark:text-white",
  icon,
  className = ""
}: StatCardProps) {
  const badgeStyles: Record<string, string> = {
    emerald: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60",
    purple: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60",
    orange: "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200/80 dark:border-orange-800/60",
    blue: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60",
    slate: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700",
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-sm shrink-0">{icon}</span>}
          <span className="text-2xs sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </span>
        </div>
        {badge && (
          <span className={`px-2 py-0.5 rounded-full text-3xs sm:text-2xs font-bold border ${badgeStyles[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>

      <div className={`mt-2.5 text-2xl sm:text-3xl font-black font-mono tracking-tight ${valueColor}`}>
        {value}
      </div>

      {subtext && (
        <span className="text-2xs text-slate-400 dark:text-slate-500 mt-1 block font-medium truncate">
          {subtext}
        </span>
      )}
    </div>
  );
}
