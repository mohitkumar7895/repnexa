import React, { ReactNode } from "react";

interface DataTableProps {
  title: string;
  subtitle?: string;
  count?: number;
  headerAction?: ReactNode;
  children: ReactNode;
}

export function DataTable({ title, subtitle, count, headerAction, children }: DataTableProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors duration-200">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50 dark:bg-slate-900/60">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">{title}</h2>
            {count !== undefined && (
              <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {count}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        {headerAction && (
          <div className="flex items-center space-x-2">
            {headerAction}
          </div>
        )}
      </div>

      <div className="overflow-x-auto text-slate-800 dark:text-slate-200">
        {children}
      </div>
    </div>
  );
}
