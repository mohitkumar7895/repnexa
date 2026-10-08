import Image from "next/image";
import Link from "next/link";
import { SUPPORT_HOURS } from "@/lib/contact";

const qualityPoints = [
  { title: "4 checks first", detail: "ID, mobile, workshop, background." },
  { title: "Your city", detail: "No technician from another city." },
  { title: "Pay after test", detail: "OTP only after the test." },
];

export function HeroBanner() {
  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Repnexa doorstep care</p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.05]">
            Home repair. Cleared technician.
          </h1>
          <p className="text-sm text-slate-600">
            AC, fridge, washer, TV. Green ID, then work starts. Helpdesk {SUPPORT_HOURS}.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/book"
              className="px-5 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800"
            >
              Book a visit
            </Link>
            <Link
              href="/customer/dashboard"
              className="px-5 py-3 rounded-xl border border-slate-300 text-slate-800 font-bold text-sm hover:bg-slate-50"
            >
              Track with your mobile
            </Link>
          </div>
          <ul className="grid sm:grid-cols-3 gap-3">
            {qualityPoints.map((point) => (
              <li key={point.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-900">{point.title}</p>
                <p className="text-2xs text-slate-500 mt-1 leading-relaxed">{point.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
          <Image
            src="/hero-banner.jpg"
            alt="Technician repairing a home appliance at the customer's door"
            fill
            className="object-cover"
            priority
            sizes="(min-width: 1024px) 560px, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
