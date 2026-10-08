"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export interface NavItem {
  href: string;
  label: string;
  badge?: {
    text: string;
    colorClass: string;
  };
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export interface UserProfileConfig {
  name: string;
  subtitle: string;
  avatarText: string;
  avatarColorClass?: string;
}

export interface PortalShellProps {
  portalBadge: {
    text: string;
    colorClass: string;
  };
  logoHref: string;
  navSections: NavSection[];
  userProfile: UserProfileConfig;
  logoutAction: () => Promise<void>;
  headerTitle: string;
  headerSubtitle: string;
  headerRightContent?: ReactNode;
  children: ReactNode;
}

function isNavActive(href: string, pathname: string) {
  if (href.includes("#")) return false;
  const path = href.split("?")[0];
  if (path.endsWith("/dashboard")) return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function PortalShell({
  portalBadge,
  logoHref,
  navSections,
  userProfile,
  logoutAction,
  headerTitle,
  headerSubtitle,
  headerRightContent,
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-xs shrink-0 transition-transform duration-200 ${
          menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-3.5 bg-white dark:bg-slate-950 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <Link href={logoHref} className="flex items-center space-x-2 min-w-0">
            <div className="relative w-28 h-8 shrink-0">
              <Image
                src="/logo.png"
                alt="Repnexa"
                fill
                sizes="112px"
                className="object-contain object-left"
                priority
              />
            </div>
            <span className={`text-2xs font-bold px-2 py-0.5 rounded text-white shrink-0 ${portalBadge.colorClass}`}>
              {portalBadge.text}
            </span>
          </Link>
          <button
            type="button"
            className="lg:hidden text-xs font-bold text-slate-500 px-2 py-1"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3 text-xs font-semibold">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                {section.title && (
                  <div className="pt-4 pb-1">
                    <span className="px-3 text-2xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
                      {section.title}
                    </span>
                  </div>
                )}
                {section.items.map((item) => {
                  const active = isNavActive(item.href, pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-colors ${
                        active
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white"
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 rounded-full text-2xs font-bold shrink-0 ${
                          active ? "bg-white/15 text-white dark:bg-slate-900 dark:text-white" : item.badge.colorClass
                        }`}>
                          {item.badge.text}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${userProfile.avatarColorClass || "bg-purple-600"}`}>
              {userProfile.avatarText}
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-bold text-slate-800 dark:text-white truncate" title={userProfile.name}>
                {userProfile.name}
              </div>
              <div className="text-2xs text-slate-400 dark:text-slate-500 truncate">
                {userProfile.subtitle}
              </div>
            </div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="text-2xs font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 ml-2">
              Logout
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex justify-between items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 truncate">
              {headerTitle}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 truncate hidden sm:inline">{headerSubtitle}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium shrink-0">
            <ThemeToggle />
            {headerRightContent}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
          {children}
        </div>
      </main>
    </div>
  );
}
