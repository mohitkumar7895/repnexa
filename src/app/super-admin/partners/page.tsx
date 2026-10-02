import { db } from "@/lib/db";
import { updatePartnerStatus } from "@/app/actions/portal-actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BulkPartnerImportModal } from "@/components/super-admin/BulkPartnerImportModal";
import { ResetPasswordModal } from "@/components/super-admin/ResetPasswordModal";
import Link from "next/link";

export default async function SuperAdminPartnersPage() {
  const [partners]: any = await db.query(`
    SELECT p.*, u.email, u.phone, u.first_name, u.last_name, c.name as city_name, s.name as state_name
    FROM partners p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN cities c ON p.city_id = c.id
    LEFT JOIN states s ON p.state_id = s.id
    ORDER BY p.id DESC
  `);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Partner Verification & Roster"
        subtitle="Manage onboarded technician agencies, verification checks, and wallet limits"
        badge={`${partners.length} Partners`}
      >
        <BulkPartnerImportModal />
        <Link 
          href="/become-partner" 
          target="_blank"
          className="px-4 py-2 rounded-lg bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 shadow-xs flex items-center space-x-1"
        >
          <span>+</span>
          <span>Add Partner Application</span>
        </Link>
      </PageHeader>

      <DataTable title="All Service Partners" count={partners.length}>
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-3xs">
            <tr>
              <th className="px-4 py-3">Partner ID & Tier</th>
              <th className="px-4 py-3">Business & Contact</th>
              <th className="px-4 py-3">Operating Hub</th>
              <th className="px-4 py-3">Referral Info</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">KYC Verification</th>
              <th className="px-4 py-3">Wallet Float</th>
              <th className="px-4 py-3">Jobs & Rating</th>
              <th className="px-4 py-3 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {partners.map((p: any) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-mono font-bold text-slate-900">{p.partner_code || `PTR-${p.id}`}</div>
                  <span className={`inline-block text-4xs font-extrabold uppercase px-1.5 py-0.5 rounded mt-0.5 ${
                    p.tier_level === "DIAMOND" ? "bg-cyan-100 text-cyan-800" :
                    p.tier_level === "GOLD" ? "bg-amber-100 text-amber-800" :
                    p.tier_level === "SILVER" ? "bg-slate-200 text-slate-800" :
                    "bg-amber-50 text-amber-900"
                  }`}>
                    ★ {p.tier_level || "BRONZE"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-900">{p.business_name}</div>
                  <div className="text-slate-500">{p.first_name} {p.last_name} • <span className="font-mono">{p.phone}</span></div>
                  <div className="text-slate-400 text-2xs truncate max-w-xs">{p.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  <div>{p.city_name || "New Delhi"}</div>
                  <div className="text-2xs text-slate-400">{p.state_name || "Delhi NCR"}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  <div className="font-mono text-2xs font-bold text-purple-700">{p.referral_code || "—"}</div>
                  {p.referred_by && (
                    <div className="text-3xs text-slate-400">Ref by: <strong className="text-slate-700">{p.referred_by}</strong></div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {p.experience_years} Years
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.kyc_status} />
                </td>
                <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                  ₹{Number(p.wallet_balance).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  <div className="font-semibold">{p.total_completed_jobs} Jobs</div>
                  <div className="text-amber-500 font-bold">★ {Number(p.rating).toFixed(1)}</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <Link
                      href={`/verify/${p.partner_code}`}
                      target="_blank"
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-2xs uppercase"
                      title="Inspect Official ID Badge"
                    >
                      🪪 ID
                    </Link>
                    <ResetPasswordModal
                      userId={p.user_id}
                      userName={p.business_name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email}
                      userEmail={p.email}
                      roleType="Partner"
                      buttonLabel="🔑 Pwd"
                      buttonClassName="px-2 py-1 rounded bg-purple-700 hover:bg-purple-800 text-white font-bold text-2xs uppercase tracking-wider transition-all inline-flex items-center space-x-0.5 cursor-pointer shadow-xs"
                    />
                    {p.kyc_status !== "approved" && (
                      <form action={async () => {
                        "use server";
                        await updatePartnerStatus(p.id, "approved", "Approved by Super Admin");
                      }}>
                        <button type="submit" className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xs uppercase">
                          Approve
                        </button>
                      </form>
                    )}
                    {p.kyc_status === "approved" && (
                      <form action={async () => {
                        "use server";
                        await updatePartnerStatus(p.id, "changes_requested", "Compliance review requested");
                      }}>
                        <button type="submit" className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold text-2xs uppercase">
                          Review
                        </button>
                      </form>
                    )}
                    <form action={async () => {
                      "use server";
                      await updatePartnerStatus(p.id, "rejected", "Rejected due to invalid documentation");
                    }}>
                      <button type="submit" className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-2xs uppercase">
                        Reject
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
