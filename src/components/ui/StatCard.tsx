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
  valueColor = "text-slate-900",
  icon,
  className = ""
}: StatCardProps) {
  const badgeStyles: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    purple: "bg-purple-50 text-purple-700 border-purple-200/80",
    orange: "bg-orange-50 text-orange-700 border-orange-200/80",
    blue: "bg-blue-50 text-blue-700 border-blue-200/80",
    slate: "bg-slate-100 text-slate-700 border-slate-200/80",
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-sm shrink-0">{icon}</span>}
          <span className="text-2xs sm:text-xs font-bold uppercase tracking-wider text-slate-500">
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
        <span className="text-2xs text-slate-400 mt-1 block font-medium truncate">
          {subtext}
        </span>
      )}
    </div>
  );
}
