import React, { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, badge, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 transition-colors duration-200">
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2 flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
}
