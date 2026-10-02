import Image from "next/image";
import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-xl border border-slate-200 group">
          <Image
            src="/hero-banner.jpg"
            alt="Repnexa Doorstep Home Appliance Repair Services"
            fill
            className="object-cover object-center"
            priority
          />
          
          {/* Direct Booking & Partner Action Overlay */}
          <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 z-10 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-xl hover:opacity-95 transition-all flex items-center space-x-2"
            >
              <span>⚡ Book Doorstep Repair</span>
              <span>→</span>
            </Link>
            <Link
              href="/become-partner"
              className="px-5 py-3 rounded-xl bg-white/95 backdrop-blur-md text-slate-900 hover:bg-white font-bold text-xs sm:text-sm shadow-lg border border-white/60 transition-all hidden sm:inline-block"
            >
              👨‍🔧 Join as Partner
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
