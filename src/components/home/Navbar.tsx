import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <div className="relative w-44 h-12 flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Repnexa" 
              fill 
              className="object-contain object-left" 
              priority
            />
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Link href="/" className="hover:text-purple-600 transition-colors">
            Home
          </Link>
          <Link href="/#services" className="hover:text-purple-600 transition-colors">
            Appliance Services
          </Link>
          <Link href="/customer/dashboard" className="hover:text-purple-600 transition-colors">
            Track Booking
          </Link>
          <Link href="/become-partner" className="text-orange-600 hover:text-orange-700 transition-colors">
            Partner with Us
          </Link>
        </nav>

        {/* Action Portals */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link 
            href="/support" 
            className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 hover:text-purple-700 font-bold text-xs shadow-2xs transition-all flex items-center space-x-1"
          >
            <span>🎧</span>
            <span>Support</span>
          </Link>
          <Link 
            href="/login" 
            className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition-all flex items-center space-x-1.5"
          >
            <span>🔐</span>
            <span>Login</span>
          </Link>
          <Link 
            href="/book" 
            className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all whitespace-nowrap"
          >
            ⚡ Book Repair
          </Link>
        </div>
      </div>
    </header>
  );
}
