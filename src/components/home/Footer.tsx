import Link from "next/link";
import Image from "next/image";
import { SUPPORT_EMAIL, SUPPORT_HOURS, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from "@/lib/contact";

export function Footer() {
  return (
    <footer className="mt-auto bg-white border-t border-slate-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="relative w-36 h-9">
              <Image src="/logo.png" alt="Repnexa" fill className="object-contain object-left" />
            </div>
            <p className="text-xs text-slate-500">Cleared technician. Your city.</p>
          </div>

          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-900">Helpdesk</p>
            <a href={`tel:${SUPPORT_PHONE_TEL}`} className="block font-semibold text-purple-700">{SUPPORT_PHONE_DISPLAY}</a>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="block">{SUPPORT_EMAIL}</a>
            <p>{SUPPORT_HOURS}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
          <div className="flex flex-wrap gap-4">
            <Link href="/book" className="hover:text-purple-700">Book a visit</Link>
            <Link href="/services" className="hover:text-purple-700">Services</Link>
            <Link href="/customer/dashboard" className="hover:text-purple-700">Track booking</Link>
            <Link href="/support" className="hover:text-purple-700">Support</Link>
            <Link href="/become-partner" className="hover:text-purple-700">Become a partner</Link>
          </div>
          <p className="text-2xs text-slate-400 font-medium">© {new Date().getFullYear()} Repnexa</p>
        </div>
      </div>
    </footer>
  );
}
