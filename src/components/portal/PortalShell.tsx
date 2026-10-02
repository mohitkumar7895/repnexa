import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
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
  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar Navigation - Full Light in light theme, Deep Navy/Dark in dark theme */}
      <aside className="w-64 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-xs shrink-0 transition-colors duration-200">
        <div className="p-3.5 bg-white dark:bg-slate-950 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
          <Link href={logoHref} className="flex items-center space-x-2">
            <div className="relative w-32 h-8">
              <Image 
                src="/logo.png" 
                alt="Repnexa" 
                fill 
                className="object-contain object-left" 
                priority
              />
            </div>
            <span className={`text-2xs font-bold px-2 py-0.5 rounded text-white shrink-0 ${portalBadge.colorClass}`}>
              {portalBadge.text}
            </span>
          </Link>
        </div>

        {/* Navigation list */}
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
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white transition-colors"
                  >
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 rounded-full text-2xs font-bold ${item.badge.colorClass}`}>
                        {item.badge.text}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile & Logout in Sidebar Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors duration-200">
          <div className="flex items-center space-x-2 min-w-0">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${userProfile.avatarColorClass || "bg-purple-600"}`}>
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
            <button type="submit" className="text-2xs font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 cursor-pointer transition-colors ml-2">
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center shrink-0 transition-colors duration-200">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60">
              {headerTitle}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{headerSubtitle}</span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-medium">
            <ThemeToggle showLabel={true} />
            {headerRightContent}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
          {children}
        </div>
      </main>
    </div>
  );
}
