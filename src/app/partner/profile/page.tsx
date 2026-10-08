import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { updatePartnerProfile } from "@/app/actions/portal-actions";
import { getPartnerProof, isDoorstepCleared, passedCheckCount } from "@/lib/verification";
import { PartnerChangePasswordCard } from "@/components/partner/PartnerChangePasswordCard";
import { ensurePortalTables } from "@/lib/portal-setup";

export default async function PartnerProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; saved?: string }>;
}) {
  const notice = searchParams ? await searchParams : {};
  const session: any = await getSession();
  let partnerRows: any[] = [];

  if (session?.id) {
    const [rows]: any = await db.query(`
      SELECT p.*, u.email, u.phone as contact_phone, c.name as city_name, s.name as state_name
      FROM partners p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN cities c ON p.city_id = c.id
      LEFT JOIN states s ON p.state_id = s.id
      WHERE p.user_id = ?
      LIMIT 1
    `, [session.id]);
    partnerRows = rows;
  }

  if (partnerRows.length === 0) {
    const [rows]: any = await db.query(`
      SELECT p.*, u.email, u.phone as contact_phone, c.name as city_name, s.name as state_name
      FROM partners p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN cities c ON p.city_id = c.id
      LEFT JOIN states s ON p.state_id = s.id
      ORDER BY p.id ASC
      LIMIT 1
    `);
    partnerRows = rows;
  }

  const partner = partnerRows[0];
  if (!partner) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Workshop profile"
          subtitle="This login is not linked to a partner workshop."
        />
        <p className="text-sm text-slate-600">
          Apply from Become a Partner. Until a workshop is linked, this account cannot accept home visits.
        </p>
      </div>
    );
  }

  await ensurePortalTables();
  const proof = await getPartnerProof(partner.id);
  const doorstepCleared = isDoorstepCleared(partner, passedCheckCount(proof));
  const [pinRows]: any = await db.query(
    "SELECT pincode FROM partner_pincodes WHERE partner_id = ? ORDER BY pincode",
    [partner.id]
  );
  const coveredPins = (pinRows || []).map((row: any) => row.pincode).join(", ");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Technician Partner Profile & KYC Credentials"
        subtitle="Manage your registered workshop information, government compliance IDs, and service radius"
        badge={`Code: ${partner.partner_code}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Status Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase text-slate-500">Account Status</span>
            <StatusBadge status={partner.kyc_status} />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-2xs uppercase font-semibold text-slate-400 block">Registration Code</span>
              <span className="font-mono font-bold text-slate-800">{partner.partner_code}</span>
            </div>
            <div>
              <span className="text-2xs uppercase font-semibold text-slate-400 block">Registered Email</span>
              <span className="font-medium text-slate-800">{partner.email}</span>
            </div>
            <div>
              <span className="text-2xs uppercase font-semibold text-slate-400 block">Primary City / Hub</span>
              <span className="font-semibold text-purple-700">{partner.city_name}, {partner.state_name}</span>
            </div>
            <div>
              <span className="text-2xs uppercase font-semibold text-slate-400 block">Doorstep proof</span>
              <span className={`inline-flex items-center font-bold mt-0.5 ${doorstepCleared ? "text-emerald-700" : "text-rose-700"}`}>
                {doorstepCleared
                  ? "Cleared for home visits"
                  : `${passedCheckCount(proof)}/4. Add Aadhaar or PAN.`}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Business Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100 mb-4">
            Workshop & Operations Details
          </h2>

          {notice.error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{notice.error}</p>
          )}
          {notice.saved && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">Profile saved.</p>
          )}
          <form action={async (formData: FormData) => {
            "use server";
            const result = await updatePartnerProfile(formData);
            if (!result?.success) {
              redirect(`/partner/profile?error=${encodeURIComponent(result?.error || "Could not save.")}`);
            }
            redirect("/partner/profile?saved=1");
          }} className="space-y-4">
            <input type="hidden" name="partnerId" value={partner.id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Business / Agency Name *</label>
                <input
                  type="text"
                  name="businessName"
                  defaultValue={partner.business_name}
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Primary Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={partner.contact_phone}
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Experience (Years)</label>
                <input
                  type="number"
                  name="experience"
                  defaultValue={partner.experience_years || 1}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Service Radius (KM)</label>
                <input
                  type="number"
                  name="serviceRadius"
                  defaultValue={partner.service_radius_km || 20}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">GST Identification (GSTIN)</label>
                <input
                  type="text"
                  name="gstNumber"
                  defaultValue={partner.gst_number || ""}
                  placeholder="Optional"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none uppercase font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Permanent Account Number (PAN)</label>
                <input
                  type="text"
                  name="panNumber"
                  defaultValue={partner.pan_number || ""}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Aadhaar Card Number</label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  defaultValue={partner.aadhaar_number || ""}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Operating City / Hub *</label>
                <input
                  type="text"
                  name="cityName"
                  defaultValue={partner.city_name || ""}
                  placeholder="e.g. New Delhi, Noida, Mumbai"
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Pincodes you cover *</label>
              <input
                type="text"
                name="pincodes"
                defaultValue={coveredPins}
                required
                placeholder="110001, 110002"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none font-mono"
              />
              <p className="text-2xs text-slate-500 mt-1">Only these pins send you a lead.</p>
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Workshop / Base Address *</label>
              <textarea
                name="address"
                rows={2}
                defaultValue={partner.business_address}
                required
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Partner Password Security Card */}
      <PartnerChangePasswordCard />
    </div>
  );
}
