"use client";

import { useState } from "react";
import { QrCodeSvg } from "@/components/ui/QrCodeSvg";
import Link from "next/link";

interface DigitalIdCardProps {
  partner: {
    id: number;
    partner_code: string;
    business_name: string;
    first_name?: string;
    last_name?: string;
    contact_phone?: string;
    city_name?: string;
    state_name?: string;
    kyc_status?: string;
    tier_level?: string;
    experience_years?: number;
    created_at?: string;
  };
}

export function DigitalIdCard({ partner }: DigitalIdCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://repnexa.com";
  const verifyUrl = `${baseUrl}/verify/${partner.partner_code}`;

  const fullName = partner.first_name ? `${partner.first_name} ${partner.last_name || ""}` : partner.business_name;
  const tier = partner.tier_level || "GOLD";

  const handlePrint = () => {
    window.print();
  };

  const handleCopyVerifyUrl = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden during print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-100 rounded-xl border border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🪪</span>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase">
              Official Repnexa Technician Identity Badge
            </h4>
            <p className="text-2xs text-slate-500">
              Show this ID card to customers at doorstep or building security for instant entry approval.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            type="button"
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
          >
            🔄 Flip to {isFlipped ? "Front" : "Back"}
          </button>

          <button
            onClick={handleCopyVerifyUrl}
            type="button"
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
          >
            {copied ? "✓ Link Copied!" : "🔗 Copy Verification Link"}
          </button>

          <button
            onClick={handlePrint}
            type="button"
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <span>🖨️</span>
            <span>Print PVC Badge</span>
          </button>

          <Link
            href={`/verify/${partner.partner_code}`}
            target="_blank"
            className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all"
          >
            🔍 Test Live QR
          </Link>
        </div>
      </div>

      {/* Printable Badge Container */}
      <div className="flex justify-center p-4">
        {!isFlipped ? (
          /* FRONT SIDE */
          <div className="w-full max-w-md bg-white rounded-2xl border-2 border-slate-800 shadow-xl overflow-hidden print:border print:shadow-none print:m-0">
            {/* Top Lanyard Slot */}
            <div className="bg-slate-900 px-6 py-2 flex justify-between items-center text-white text-3xs font-mono uppercase tracking-wider">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400 font-bold">VERIFIED REPNEXA CREW</span>
              </span>
              <span>ID: {partner.partner_code}</span>
            </div>

            {/* Brand Header */}
            <div className="bg-gradient-to-r from-orange-600 via-purple-600 to-indigo-700 px-6 py-4 text-white flex justify-between items-center relative">
              <div>
                <span className="text-2xs font-extrabold tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-full">
                  OFFICIAL SERVICE TECHNICIAN
                </span>
                <h3 className="text-xl font-black tracking-tight mt-1">REPNEXA</h3>
                <p className="text-3xs text-orange-100">DOORSTEP HOME APPLIANCE CARE</p>
              </div>

              {/* Holographic Security Shield */}
              <div className="w-12 h-12 rounded-full bg-white/15 border-2 border-amber-300/80 flex flex-col items-center justify-center text-amber-200 shadow-inner">
                <span className="text-sm">🛡️</span>
                <span className="text-4xs font-black tracking-tighter uppercase text-amber-300">GENUINE</span>
              </div>
            </div>

            {/* Main Body */}
            <div className="p-6 space-y-4">
              <div className="flex gap-4 items-center">
                {/* Photo / Avatar with Verified Ring */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-100 to-orange-100 border-2 border-purple-600 flex items-center justify-center text-3xl shadow-sm">
                    👨‍🔧
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white text-3xs font-black px-1.5 py-0.5 rounded-full border border-white shadow-xs">
                    ✓ PASS
                  </div>
                </div>

                <div className="space-y-0.5 flex-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 rounded text-3xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                    ★ {tier} TECHNICIAN
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 truncate">
                    {fullName}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium truncate">
                    {partner.business_name}
                  </p>
                  <p className="text-2xs text-purple-700 font-semibold">
                    📍 {partner.city_name || "New Delhi"}, {partner.state_name || "Delhi NCR"}
                  </p>
                </div>
              </div>

              {/* Official Credential Attributes */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 grid grid-cols-2 gap-2 text-2xs">
                <div>
                  <span className="text-3xs text-slate-400 uppercase font-semibold block">Partner Code</span>
                  <span className="font-mono font-bold text-slate-900">{partner.partner_code}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 uppercase font-semibold block">Contact Helpline</span>
                  <span className="font-mono font-bold text-slate-900">+91 {partner.contact_phone || "7895094129"}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 uppercase font-semibold block">Experience</span>
                  <span className="font-semibold text-slate-900">{partner.experience_years || 5}+ Years Field Pro</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 uppercase font-semibold block">Validity</span>
                  <span className="font-semibold text-emerald-700">2026 – 2027 (Active)</span>
                </div>
              </div>

              {/* Compliance Stamps */}
              <div className="flex items-center justify-between text-3xs font-bold text-slate-600 border-t border-b border-slate-100 py-2">
                <span className="flex items-center text-emerald-700">
                  <span className="mr-1">✓</span> Govt Aadhaar
                </span>
                <span className="flex items-center text-emerald-700">
                  <span className="mr-1">✓</span> Police Verified
                </span>
                <span className="flex items-center text-emerald-700">
                  <span className="mr-1">✓</span> Skill Certified
                </span>
              </div>

              {/* QR Code Verification Section */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="text-2xs space-y-1">
                  <span className="font-bold text-slate-900 block">Scan to Verify Authenticity</span>
                  <p className="text-3xs text-slate-500 leading-tight">
                    Customers & Security: Scan QR code with any smartphone camera to view live Repnexa background verification.
                  </p>
                  <span className="text-3xs font-mono font-bold text-purple-700 block">
                    repnexa.com/verify/{partner.partner_code}
                  </span>
                </div>
                <div className="shrink-0">
                  <QrCodeSvg value={verifyUrl} size={90} />
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-slate-900 text-white text-center py-2 text-3xs font-semibold tracking-wider uppercase">
              Official Property of Repnexa Services India Pvt Ltd • Toll-Free: 1800-419-7890
            </div>
          </div>
        ) : (
          /* BACK SIDE */
          <div className="w-full max-w-md bg-white rounded-2xl border-2 border-slate-800 shadow-xl overflow-hidden print:border print:shadow-none p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <span className="font-bold text-xs uppercase text-slate-800">Cardholder Terms & Safety Protocol</span>
              <span className="text-3xs font-mono text-slate-400">REV-2026.1</span>
            </div>

            <div className="space-y-2.5 text-2xs text-slate-600">
              <p>
                <strong>1. Doorstep Entry:</strong> The technician must display this badge upon arrival and wear safety gear when handling refrigerant gas or high-voltage appliances.
              </p>
              <p>
                <strong>2. Customer 4-Digit OTP:</strong> Work is verified only when the customer inspects the machine and provides their 4-digit completion OTP.
              </p>
              <p>
                <strong>3. Doorstep Professional Standards:</strong> All repairs are conducted using standard diagnostic equipment and verified safety protocols.
              </p>
              <p>
                <strong>4. Lost / Found:</strong> If found, please return to: Repnexa Hub, Ground Floor, Electronics Center, Sector 18, New Delhi NCR, 110001.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center space-y-1">
              <span className="text-3xs uppercase font-bold text-purple-800 block">Emergency & Escalation Desk</span>
              <span className="text-xs font-mono font-bold text-purple-950 block">+91 78950 94129</span>
              <span className="text-3xs text-purple-700 block">Available 24x7 for customer dispute resolution</span>
            </div>

            <div className="border-t border-slate-200 pt-3 text-center text-3xs text-slate-400">
              Authorized Signature • Compliance & Security Operations Desk
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
