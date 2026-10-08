import { db } from "@/lib/db";
import Link from "next/link";
import { DOORSTEP_CHECKS, getPartnerProof, isDoorstepCleared, passedCheckCount } from "@/lib/verification";
import { SUPPORT_PHONE_TEL } from "@/lib/contact";

export default async function PartnerVerificationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [partnerRows]: any = await db.query(
    `
    SELECT p.*, c.name as city_name, s.name as state_name, u.first_name, u.last_name, u.phone as contact_phone
    FROM partners p
    LEFT JOIN cities c ON p.city_id = c.id
    LEFT JOIN states s ON p.state_id = s.id
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.partner_code = ?
    LIMIT 1
  `,
    [code]
  );

  if (!partnerRows?.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 shadow-sm">
          <h1 className="text-lg font-bold text-rose-900">This ID is not in the Repnexa registry</h1>
          <p className="text-xs text-slate-600">
            Unknown code <strong className="font-mono">{code}</strong>. Do not allow entry.
          </p>
          <Link href="/support" className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold">
            Contact support
          </Link>
        </div>
      </div>
    );
  }

  const partner = partnerRows[0];
  const checks = await getPartnerProof(partner.id);
  const cleared = isDoorstepCleared(partner, passedCheckCount(checks));
  const fullName = partner.first_name ? `${partner.first_name} ${partner.last_name || ""}`.trim() : partner.business_name;
  const rating = Number(partner.rating) > 0 ? Number(partner.rating).toFixed(1) : null;
  const jobs = Number(partner.total_completed_jobs) || 0;
  const phone = String(partner.contact_phone || "");
  const maskedPhone = phone.length >= 4 ? `•••• ${phone.slice(-4)}` : "Not on file";

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        <div className={`p-6 text-white text-center ${cleared ? "bg-emerald-700" : "bg-rose-700"}`}>
          <p className="text-2xs font-extrabold uppercase tracking-widest">{cleared ? "Doorstep clearance passed" : "Do not allow entry"}</p>
          <h1 className="text-2xl font-black mt-2">{cleared ? "Cleared" : "Not cleared"}</h1>
          <p className="text-xs mt-2 text-white/80">
            {cleared ? "Match the name. Then start." : "No OTP. No entry."}
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <p className="text-xs font-mono text-slate-400">{partner.partner_code}</p>
            <h2 className="text-lg font-black text-slate-900">{fullName}</h2>
            <p className="text-sm text-slate-600">{partner.business_name}</p>
            <p className="text-xs text-slate-500 mt-1">
              {partner.city_name || "City on file"}{partner.state_name ? `, ${partner.state_name}` : ""} · Mobile {maskedPhone}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Proof checks</h3>
            {DOORSTEP_CHECKS.map((definition) => {
              const check = checks.find((item) => item.key === definition.key);
              const status = check?.status || "pending";
              const tone = status === "passed"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : status === "failed"
                  ? "border-rose-200 bg-rose-50 text-rose-900"
                  : "border-amber-200 bg-amber-50 text-amber-900";
              return (
                <div key={definition.key} className={`rounded-xl border px-3 py-2.5 ${tone}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold">{definition.label}</span>
                    <span className="text-3xs font-black uppercase">{status}</span>
                  </div>
                  <p className="text-2xs mt-1 opacity-80">{definition.detail}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-3xs uppercase font-bold text-slate-400">Rating</div>
              <div className="font-black text-slate-900 mt-1">{rating ? `★ ${rating}` : "No reviews yet"}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-3xs uppercase font-bold text-slate-400">Completed jobs</div>
              <div className="font-black text-slate-900 mt-1">{jobs}</div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">Before work</p>
            <p>Name must match.</p>
            <p>OTP only after the test, and only if this page is green.</p>
            <p>Red page: stop and call support.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <a href={`tel:${SUPPORT_PHONE_TEL}`} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold text-center">
              Call trust and safety
            </a>
            <Link href="/support" className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold text-center">
              Raise a complaint
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
