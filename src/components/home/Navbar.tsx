"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Appliance Services" },
  { href: "/customer/dashboard", label: "Track Booking" },
  { href: "/become-partner", label: "Partner with Us", accent: true },
];

const menuLinks = [...links, { href: "/support", label: "Support" }];

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-1.5 sm:gap-2">
        <Link href="/" className="flex items-center shrink-0" onClick={() => setOpen(false)}>
          <div className="relative w-16 sm:w-44 h-8 sm:h-12">
            <Image
              src="/logo.png"
              alt="Repnexa"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={link.accent ? "text-orange-600 hover:text-orange-700 transition-colors" : "hover:text-purple-600 transition-colors"}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <ThemeToggle className="max-sm:!px-1.5 max-sm:!py-1" />
          <Link
            href="/support"
            className="hidden lg:inline-flex h-9 px-3.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 hover:text-purple-700 font-bold text-xs shadow-2xs transition-all items-center gap-1"
          >
            <span className="hidden sm:inline">🎧</span>
            <span>Support</span>
          </Link>
          <Link
            href="/login"
            className="h-8 sm:h-9 px-2 sm:px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-[11px] sm:text-xs shadow-2xs transition-all inline-flex items-center gap-1"
          >
            <span className="hidden sm:inline">🔐</span>
            <span>Login</span>
          </Link>
          <Link
            href="/book"
            className="h-8 sm:h-9 px-2 sm:px-5 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-bold text-[11px] sm:text-xs shadow-md hover:opacity-95 transition-all whitespace-nowrap inline-flex items-center"
          >
            <span className="hidden sm:inline">⚡ </span>
            Book Repair
          </Link>
          <button
            type="button"
            className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-slate-200 text-slate-800 flex flex-col items-center justify-center gap-1"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="block w-4 h-0.5 bg-current rounded" />
            <span className="block w-4 h-0.5 bg-current rounded" />
            <span className="block w-4 h-0.5 bg-current rounded" />
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col">
          {menuLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`py-3 text-sm font-bold border-b border-slate-100 last:border-0 ${link.accent ? "text-orange-600" : "text-slate-800"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
