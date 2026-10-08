import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable } from "@/components/ui/DataTable";
import Link from "next/link";

export default async function SuperAdminDashboard() {
  // 1. Partner Metrics
  const [partnerStats]: any = await db.query(`
    SELECT 
      COUNT(*) as total_partners,
      SUM(CASE WHEN kyc_status = 'approved' THEN 1 ELSE 0 END) as active_partners,
      SUM(CASE WHEN kyc_status = 'pending' THEN 1 ELSE 0 END) as pending_partners,
      SUM(wallet_balance) as total_wallet_balance
    FROM partners
  `);

  // 2. Lead Metrics
  const [leadStats]: any = await db.query(`
    SELECT 
      COUNT(*) as total_leads,
      SUM(CASE WHEN status = 'NEW' THEN 1 ELSE 0 END) as new_leads,
      SUM(CASE WHEN status = 'MATCHING' OR status = 'ASSIGNED' THEN 1 ELSE 0 END) as matching_leads,
      SUM(CASE WHEN status = 'ACCEPTED' OR status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_leads,
      SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_leads
    FROM leads
  `);

  // 3. Job & Revenue Metrics
  const [jobStats]: any = await db.query(`
    SELECT 
      COUNT(*) as total_jobs,
      SUM(platform_commission) as total_commission,
      SUM(final_amount) as total_revenue
    FROM jobs
  `);

  // 4. Pending Withdrawals
  const [withdrawalStats]: any = await db.query(`
    SELECT COUNT(*) as pending_withdrawals, SUM(amount) as pending_amount 
    FROM withdrawals 
    WHERE status = 'PENDING'
  `);

  // 5. Recent Leads
  const [recentLeads]: any = await db.query(`
    SELECT l.id, l.lead_code, l.customer_name, l.customer_phone, l.status, l.lead_fee,
           l.created_at, s.title as service_title, c.name as city_name,
           p.business_name as partner_name, p.partner_code
    FROM leads l
    LEFT JOIN services s ON l.service_id = s.id
    LEFT JOIN cities c ON l.city_id = c.id
    LEFT JOIN partners p ON l.assigned_partner_id = p.id
    ORDER BY l.id DESC
    LIMIT 6
  `);

  const pTotal = partnerStats[0]?.total_partners || 0;
  const pActive = partnerStats[0]?.active_partners || 0;
  const pPending = partnerStats[0]?.pending_partners || 0;
  const walletSum = Number(partnerStats[0]?.total_wallet_balance || 0);

  const lTotal = leadStats[0]?.total_leads || 0;
  const lNew = leadStats[0]?.new_leads || 0;
  const lMatching = leadStats[0]?.matching_leads || 0;
  const lInProgress = leadStats[0]?.in_progress_leads || 0;
  const lCompleted = leadStats[0]?.completed_leads || 0;

  const totalRev = Number(jobStats[0]?.total_revenue || 0);
  const totalComm = Number(jobStats[0]?.total_commission || 0);
  const pendingWthCount = Number(withdrawalStats[0]?.pending_withdrawals || 0);
  const pendingWthAmount = Number(withdrawalStats[0]?.pending_amount || 0);
  const pipelineTotal = Math.max(Number(lTotal) || 0, 1);
  const updatedLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Operations Dashboard"
        subtitle={`Platform metrics, dispatch pipeline and revenue · Updated ${updatedLabel}`}
        badge="Live"
      >
        <Link 
          href="/super-admin/services" 
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
        >
          Services
        </Link>
        <Link 
          href="/super-admin/staff" 
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
        >
          Staff
        </Link>
        <Link 
          href="/super-admin/leads" 
          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          All Leads ({lTotal})
        </Link>
      </PageHeader>

      {/* 2. Action Required Bar (Only if needed) */}
      {(pPending > 0 || pendingWthCount > 0 || lNew > 0) && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
            <span className="font-semibold text-amber-900">
              Action Required:
            </span>
            <span className="text-amber-800">
              {[
                pPending > 0 ? `${pPending} KYC pending` : null,
                pendingWthCount > 0 ? `${pendingWthCount} payouts · ₹${pendingWthAmount.toLocaleString("en-IN")}` : null,
                lNew > 0 ? `${lNew} new leads` : null
              ].filter(Boolean).join(" · ")}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {pPending > 0 && (
              <Link 
                href="/super-admin/partners" 
                className="px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-2xs transition-colors shadow-2xs"
              >
                Review KYC
              </Link>
            )}
            {pendingWthCount > 0 && (
              <Link 
                href="/super-admin/withdrawals" 
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-2xs transition-colors shadow-2xs"
              >
                Settle Payouts
              </Link>
            )}
            {lNew > 0 && (
              <Link
                href="/super-admin/leads"
                className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-2xs transition-colors shadow-2xs"
              >
                Dispatch Leads
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 3. Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Active Partners"
          value={pActive}
          subtext={`${pPending} KYC Pending • ${pTotal} Total`}
          badge="Verified"
          badgeColor="emerald"
          icon="👥"
        />

        <StatCard
          label="Total Leads"
          value={lTotal}
          subtext={`${lCompleted} Done • ${lInProgress} Active`}
          badge={`${lNew + lMatching} Queued`}
          badgeColor="purple"
          valueColor="text-purple-700 dark:text-purple-300"
          icon="📋"
        />

        <StatCard
          label="Partner Float"
          value={`₹${walletSum.toLocaleString('en-IN')}`}
          subtext="Prepaid wallet balance"
          badge="Float"
          badgeColor="emerald"
          valueColor="text-emerald-700 dark:text-emerald-400"
          icon="💳"
        />

        <StatCard
          label="Platform Revenue"
          value={`₹${totalComm.toLocaleString('en-IN')}`}
          subtext={`Commission · ₹${totalRev.toLocaleString('en-IN')} billed`}
          badge="Net"
          badgeColor="orange"
          valueColor="text-orange-600 dark:text-orange-300"
          icon="📈"
        />
      </div>

      {/* 4. Operations Pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Order Pipeline
            </h2>
            <p className="text-2xs text-slate-400">Current lifecycle distribution</p>
          </div>
          <span className="text-3xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
            Real-Time
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {[
            { step: "1. New", value: lNew, hint: "Customer booked", bar: "bg-blue-500", text: "text-blue-700 dark:text-blue-300" },
            { step: "2. Matching", value: lMatching, hint: "Waiting for a technician", bar: "bg-purple-500", text: "text-purple-700 dark:text-purple-300" },
            { step: "3. In Progress", value: lInProgress, hint: "Field visit active", bar: "bg-amber-500", text: "text-amber-700 dark:text-amber-300" },
            { step: "4. Completed", value: lCompleted, hint: "OTP verified", bar: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300" },
          ].map((stage) => (
            <div key={stage.step} className="bg-slate-50/70 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
              <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">{stage.step}</span>
              <div className={`text-2xl font-black mt-1 ${stage.text}`}>{stage.value}</div>
              <span className="text-2xs text-slate-500 font-medium">{stage.hint}</span>
              <div className="mt-2 h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${stage.bar}`}
                  style={{ width: `${Math.round((Number(stage.value) / pipelineTotal) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Live Service Requests Stream */}
      <DataTable
        title="Recent Leads"
        subtitle="Latest service activity across all hubs"
        count={recentLeads.length}
        headerAction={
          <Link href="/super-admin/leads" className="text-xs font-semibold text-purple-600 hover:text-purple-800">
            View All →
          </Link>
        }
      >
        <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 text-2xs uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Lead Code</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Hub City</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Technician</th>
              <th className="px-4 py-3 text-right">Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {recentLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-xs text-slate-500">
                  No leads yet. New customer bookings will appear here.
                </td>
              </tr>
            )}
            {recentLeads.map((lead: any) => (
              <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-slate-900">
                  {lead.lead_code}
                  <span className="text-2xs text-slate-400 block font-normal font-sans">
                    {lead.created_at
                      ? new Date(lead.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {lead.service_title || "General Inspection"}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{lead.customer_name}</div>
                  <div className="text-slate-400 font-mono text-2xs">{lead.customer_phone}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 font-medium">
                  {lead.city_name || "Delhi NCR"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {lead.partner_name ? (
                    <div>
                      <span className="font-semibold text-purple-700">{lead.partner_name}</span>
                      <span className="text-2xs font-mono text-slate-400 block">{lead.partner_code}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic bg-slate-100 px-2 py-0.5 rounded text-2xs">
                      Matching...
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                  ₹{Number(lead.lead_fee || 0).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>

      {/* 6. Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
        <Link 
          href="/super-admin/services" 
          className="p-3.5 bg-white rounded-2xl border border-slate-200/90 hover:border-purple-300 hover:shadow-xs transition-all flex items-center space-x-3"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-base shrink-0">
            📦
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">Services</div>
            <div className="text-2xs text-slate-400">Pricing & catalog</div>
          </div>
        </Link>

        <Link 
          href="/super-admin/partners" 
          className="p-3.5 bg-white rounded-2xl border border-slate-200/90 hover:border-purple-300 hover:shadow-xs transition-all flex items-center space-x-3"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center text-base shrink-0">
            👨‍🔧
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">Partners</div>
            <div className="text-2xs text-slate-400">KYC verification</div>
          </div>
        </Link>

        <Link 
          href="/super-admin/withdrawals" 
          className="p-3.5 bg-white rounded-2xl border border-slate-200/90 hover:border-purple-300 hover:shadow-xs transition-all flex items-center space-x-3"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-base shrink-0">
            🏦
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">Payouts</div>
            <div className="text-2xs text-slate-400">Settlements</div>
          </div>
        </Link>

        <Link 
          href="/super-admin/settings" 
          className="p-3.5 bg-white rounded-2xl border border-slate-200/90 hover:border-purple-300 hover:shadow-xs transition-all flex items-center space-x-3"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center text-base shrink-0">
            ⚙️
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">Settings</div>
            <div className="text-2xs text-slate-400">System config</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
