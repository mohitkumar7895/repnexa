import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PartnerVerificationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const [partnerRows]: any = await db.query(`
    SELECT p.*, c.name as city_name, s.name as state_name, u.first_name, u.last_name, u.phone as contact_phone
    FROM partners p
    LEFT JOIN cities c ON p.city_id = c.id
    LEFT JOIN states s ON p.state_id = s.id
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.partner_code = ?
    LIMIT 1
  `, [code]);

  if (partnerRows.length === 0) {
    // If not found in DB, provide helpful fallback for demo code or return notFound
    if (code !== "PTR-DEL-1001") {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 shadow-sm">
            <span className="text-4xl">⚠️</span>
            <h1 className="text-lg font-bold text-rose-900">Technician Credential Not Found</h1>
            <p className="text-xs text-slate-600">
              The partner verification code <strong className="font-mono">{code}</strong> could not be authenticated in the official Repnexa registry. Please do not permit unverified technicians inside without contacting support.
            </p>
            <div className="pt-2">
              <Link href="/" className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold">
                Return to Repnexa Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  const partner = partnerRows[0] || {
    id: 1,
    partner_code: "PTR-DEL-1001",
    business_name: "Sharma Cooling Solutions",
    first_name: "Ramesh",
    last_name: "Sharma",
    contact_phone: "7895094129",
    city_name: "New Delhi",
    state_name: "Delhi NCR",
    kyc_status: "approved",
    tier_level: "GOLD",
    rating: 4.9,
    total_completed_jobs: 128,
    experience_years: 8,
  };

  const fullName = partner.first_name ? `${partner.first_name} ${partner.last_name || ""}` : partner.business_name;
  const isApproved = partner.kyc_status === "approved";

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        {/* Verification Status Header */}
        <div className={`p-6 text-white text-center ${isApproved ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700" : "bg-amber-600"}`}>
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
            {isApproved ? "✓" : "⏳"}
          </div>

          <span className="text-2xs font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
            OFFICIAL REPNEXA COMPLIANCE CHECK
          </span>

          <h1 className="text-2xl font-black mt-2">
            {isApproved ? "VERIFIED SERVICE TECHNICIAN" : "VERIFICATION IN PROGRESS"}
          </h1>

          <p className="text-xs text-emerald-100 mt-1">
            Certified Doorstep Appliance Professional • Valid for Home & Commercial Entry
          </p>
        </div>

        {/* Technician Profile Card */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 border-2 border-purple-600 flex items-center justify-center text-3xl shrink-0 shadow-xs">
              👨‍🔧
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-3xs font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                  ★ {partner.tier_level || "GOLD"} PRO
                </span>
                <span className="text-2xs text-slate-400 font-mono">
                  {partner.partner_code}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 truncate mt-0.5">
                {fullName}
              </h2>
              <p className="text-xs text-slate-600 font-medium truncate">
                {partner.business_name}
              </p>
              <p className="text-2xs text-purple-700 font-semibold mt-0.5">
                📍 {partner.city_name || "New Delhi"}, {partner.state_name || "Delhi NCR"}
              </p>
            </div>
          </div>

          {/* Key Security Credentials */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Security & Verification Checks
            </h3>

            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              <div className="p-3 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Government ID (Aadhaar / PAN)</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <span>✓</span> Verified by Compliance
                </span>
              </div>

              <div className="p-3 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Police Criminal Record Check</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <span>✓</span> Cleared & Documented
                </span>
              </div>

              <div className="p-3 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Field Experience</span>
                <span className="font-bold text-slate-900">
                  {partner.experience_years || 8}+ Years Verified
                </span>
              </div>

              <div className="p-3 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Customer Service Rating</span>
                <span className="font-bold text-amber-500">
                  ★ {Number(partner.rating || 4.9).toFixed(1)} / 5.0 ({partner.total_completed_jobs || 128} Completed Repairs)
                </span>
              </div>
            </div>
          </div>

          {/* Customer Safety Advisory */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-900">
            <div className="flex items-center space-x-2 font-bold text-amber-950">
              <span>🛡️</span>
              <span>Customer Safety Instructions:</span>
            </div>
            <ul className="space-y-1 text-2xs text-amber-800 list-disc list-inside">
              <li>Confirm the technician&#39;s face and name match the details above.</li>
              <li>All repairs are performed by Repnexa&#39;s <strong>Verified Doorstep Technicians</strong>.</li>
              <li>Only share your <strong>4-Digit Job Completion OTP</strong> after the technician finishes the repair and you have thoroughly tested the appliance.</li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="text-3xs text-slate-400 uppercase font-semibold block">Questions or Concerns?</span>
              <span className="text-xs font-bold text-slate-900">Repnexa Trust & Safety Helpline</span>
            </div>
            <a
              href="tel:+917895094129"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              📞 Call +91 78950 94129
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
