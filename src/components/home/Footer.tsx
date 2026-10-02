import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="mt-auto bg-white border-t border-slate-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-36 h-9">
          <Image 
            src="/logo.png" 
            alt="Repnexa" 
            fill 
            className="object-contain object-left" 
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600">
          <Link href="/book" className="hover:text-purple-600 transition-colors">Book Service</Link>
          <Link href="/customer/dashboard" className="hover:text-purple-600 transition-colors">Track Booking</Link>
          <Link href="/become-partner" className="hover:text-purple-600 transition-colors">Become a Partner</Link>
          <Link href="/portals" className="text-purple-700 hover:text-purple-900 font-bold transition-colors">⚡ All Portals</Link>
          <Link href="/support" className="hover:text-purple-600 transition-colors">Support</Link>
        </div>

        <div className="text-2xs text-slate-400">
          © {new Date().getFullYear()} Repnexa. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
