"use client";

import { useEffect, useState } from "react";

export function ThemeToggle({
  className = "",
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("repnexa-theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      applyTheme(stored);
    } else {
      // Default to light as requested by user ("full light ho jaiye sarey dashboard")
      setTheme("light");
      applyTheme("light");
    }

    const handleThemeEvent = () => {
      const current = localStorage.getItem("repnexa-theme") as "light" | "dark" || "light";
      setTheme(current);
    };

    window.addEventListener("repnexa-theme-change", handleThemeEvent);
    return () => window.removeEventListener("repnexa-theme-change", handleThemeEvent);
  }, []);

  const applyTheme = (newTheme: "light" | "dark") => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.setAttribute("data-theme", "light");
    }
    localStorage.setItem("repnexa-theme", newTheme);
    document.cookie = `repnexa-theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new Event("repnexa-theme-change"));
  };

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={`p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 opacity-70 ${className}`}
      >
        <span className="text-sm">☀️</span>
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      title={isDark ? "Switch to Full Light Theme" : "Switch to Dark Theme"}
      className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer shadow-2xs ${
        isDark
          ? "bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-300 hover:text-amber-200"
          : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900"
      } ${className}`}
    >
      <span className="text-sm transition-transform duration-300 group-hover:scale-115">
        {isDark ? "🌙" : "☀️"}
      </span>
      {showLabel && (
        <span className="text-2xs font-bold uppercase tracking-wider">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}
