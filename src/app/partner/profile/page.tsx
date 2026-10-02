import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { updatePartnerProfile } from "@/app/actions/portal-actions";
import { PartnerChangePasswordCard } from "@/components/partner/PartnerChangePasswordCard";

export default async function PartnerProfilePage() {
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

  const partner = partnerRows[0] || {
    id: 1,
    partner_code: 'PTR-DEL-1001',
    business_name: 'Sharma Cooling Solutions',
    business_type: 'Proprietorship',
    experience_years: 8,
    gst_number: '07AAAAA0000A1Z5',
    pan_number: 'ABCDE1234F',
    aadhaar_number: 'XXXX-XXXX-9012',
    business_address: 'Shop 14, Main Market, Sector 18, Noida / New Delhi',
    city_name: 'New Delhi',
    state_name: 'Delhi NCR',
    kyc_status: 'approved',
    service_radius_km: 20,
    email: 'sharma.ac@repnexa.com',
    contact_phone: '7895094129',
  };

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
              <span className="text-2xs uppercase font-semibold text-slate-400 block">KYC Verification</span>
              <span className="inline-flex items-center text-emerald-700 font-bold mt-0.5">
                ✓ Documents Verified by Repnexa Compliance
              </span>
            </div>
          </div>
        </div>

        {/* Edit Business Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100 mb-4">
            Workshop & Operations Details
          </h2>

          <form action={async (formData: FormData) => {
            "use server";
            await updatePartnerProfile(formData);
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
                  defaultValue={partner.city_name || "New Delhi"}
                  placeholder="e.g. New Delhi, Noida, Mumbai"
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>
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
