import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center min-w-0">
          <div className="relative w-28 sm:w-40 h-9 sm:h-11 shrink-0">
            <Image src="/logo.png" alt="Repnexa" fill className="object-contain object-left" priority sizes="160px" />
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Link href="/#services" className="hover:text-purple-600">Services</Link>
          <Link href="/customer/dashboard" className="hover:text-purple-600">Track</Link>
          <Link href="/become-partner" className="text-orange-600 hover:text-orange-700">Partner</Link>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <ThemeToggle />
          <Link href="/support" className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center">
            <span className="sm:hidden">Help</span>
            <span className="hidden sm:inline">Support</span>
          </Link>
          <Link href="/login" className="hidden sm:inline-flex h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 items-center">
            Login
          </Link>
          <Link href="/book" className="h-9 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold inline-flex items-center">
            Book
          </Link>
        </div>
      </div>
    </header>
  );
}
