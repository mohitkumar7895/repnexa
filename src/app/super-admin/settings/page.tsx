import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ChangeOwnPasswordCard } from "@/components/super-admin/ChangeOwnPasswordCard";
import { MasterPasswordResetCard } from "@/components/super-admin/MasterPasswordResetCard";

export default async function SuperAdminSettingsPage() {
  const [settingsRows]: any = await db.query("SELECT * FROM system_settings ORDER BY setting_group ASC, id ASC");

  const settingsMap: any = {};
  for (const row of settingsRows) {
    settingsMap[row.setting_key] = row.setting_value;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Configuration & Business Rules</h1>
        <p className="text-xs text-slate-500 mt-0.5">Control lead distribution models, commissions, wallet thresholds, and operational rules dynamically</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <form action={async (formData: FormData) => {
          "use server";
          const updates = [
            ['company_name', formData.get('company_name')],
            ['support_phone', formData.get('support_phone')],
            ['support_email', formData.get('support_email')],
            ['default_lead_fee', formData.get('default_lead_fee')],
            ['default_commission_pct', formData.get('default_commission_pct')],
            ['minimum_wallet_balance', formData.get('minimum_wallet_balance')],
            ['service_radius_km', formData.get('service_radius_km')],
            ['mandatory_job_otp', formData.get('mandatory_job_otp') ? 'true' : 'false'],
            ['lead_expiry_hours', formData.get('lead_expiry_hours')]
          ];

          for (const [k, v] of updates) {
            if (v !== null && v !== undefined) {
              await db.query("UPDATE system_settings SET setting_value = ? WHERE setting_key = ?", [v, k]);
            }
          }
          revalidatePath("/super-admin/settings");
        }} className="p-6 sm:p-8 space-y-8">
          {/* Section 1: Business Identity */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-200">
              Company Identity & Contacts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Company Registered Name</label>
                <input 
                  type="text" 
                  name="company_name" 
                  defaultValue={settingsMap['company_name'] || 'Repnexa Services India Pvt Ltd'}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Customer Helpline</label>
                <input 
                  type="text" 
                  name="support_phone" 
                  defaultValue={settingsMap['support_phone'] || '+91 78950 94129'}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Support Email</label>
                <input 
                  type="email" 
                  name="support_email" 
                  defaultValue={settingsMap['support_email'] || 'support@repnexa.com'}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-purple-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Lead & Marketplace Rules */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-200">
              Lead Dispatch & Pricing Rules (Non-Hardcoded)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Default Lead Fee (₹)</label>
                <input 
                  type="number" 
                  step="5"
                  name="default_lead_fee" 
                  defaultValue={settingsMap['default_lead_fee'] || '50.00'}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-mono focus:border-purple-600 focus:outline-none"
                />
                <span className="text-2xs text-slate-400 mt-1 block">Upfront deduction upon lead acceptance</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Platform Commission (%)</label>
                <input 
                  type="number" 
                  step="0.5"
                  name="default_commission_pct" 
                  defaultValue={settingsMap['default_commission_pct'] || '15.00'}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-mono focus:border-purple-600 focus:outline-none"
                />
                <span className="text-2xs text-slate-400 mt-1 block">Percentage on job completion invoice</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Minimum Partner Wallet Float (₹)</label>
                <input 
                  type="number" 
                  step="50"
                  name="minimum_wallet_balance" 
                  defaultValue={settingsMap['minimum_wallet_balance'] || '500.00'}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-mono focus:border-purple-600 focus:outline-none"
                />
                <span className="text-2xs text-slate-400 mt-1 block">Required to participate in lead matching</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Matching Radius (KM)</label>
                <input 
                  type="number" 
                  name="service_radius_km" 
                  defaultValue={settingsMap['service_radius_km'] || '25'}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-mono focus:border-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Lead Expiry (Hours)</label>
                <input 
                  type="number" 
                  name="lead_expiry_hours" 
                  defaultValue={settingsMap['lead_expiry_hours'] || '24'}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-mono focus:border-purple-600 focus:outline-none"
                />
              </div>
              <div className="flex items-center space-x-3 pt-4">
                <input 
                  type="checkbox" 
                  id="otpToggle"
                  name="mandatory_job_otp" 
                  defaultChecked={settingsMap['mandatory_job_otp'] !== 'false'}
                  className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="otpToggle" className="text-xs font-semibold text-slate-700">
                  Enforce Customer Completion OTP verification
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              Save Configuration Changes
            </button>
          </div>
        </form>
      </div>

      {/* Super Admin Security & Master Password Management */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Security & Master Password Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Change your own Super Admin credentials or immediately reset passwords for any partner, technician, customer, or staff account
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChangeOwnPasswordCard />
          <MasterPasswordResetCard />
        </div>
      </div>
    </div>
  );
}
