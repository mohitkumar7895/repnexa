import { db } from "@/lib/db";
import { acceptLeadByPartner } from "@/app/actions/portal-actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";

export default async function PartnerDashboardPage() {
  // Fetch demo partner: Sharma Cooling Solutions
  const [partnerRows]: any = await db.query(`
    SELECT p.*, c.name as city_name, s.name as state_name, u.phone as contact_phone
    FROM partners p
    LEFT JOIN cities c ON p.city_id = c.id
    LEFT JOIN states s ON p.state_id = s.id
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.partner_code = 'PTR-DEL-1001' 
    LIMIT 1
  `);

  const partner = partnerRows[0] || { 
    id: 1, 
    partner_code: 'PTR-DEL-1001',
    wallet_balance: 0, 
    rating: 0.0, 
    total_completed_jobs: 0, 
    business_name: 'Partner Workspace',
    kyc_status: 'approved',
    city_name: 'New Delhi',
    state_name: 'Delhi NCR',
    service_radius_km: 20
  };

  // Fetch Available Leads
  const [availableLeads]: any = await db.query(`
    SELECT l.*, s.title as service_title, c.name as city_name
    FROM leads l
    LEFT JOIN services s ON l.service_id = s.id
    LEFT JOIN cities c ON l.city_id = c.id
    WHERE l.status IN ('NEW', 'MATCHING', 'ASSIGNED')
    ORDER BY l.id DESC
    LIMIT 5
  `);

  // Fetch Partner Active Jobs
  const [activeJobs]: any = await db.query(`
    SELECT j.*, l.lead_code, l.customer_name, l.customer_phone, l.customer_address, s.title as service_title
    FROM jobs j
    LEFT JOIN leads l ON j.lead_id = l.id
    LEFT JOIN services s ON l.service_id = s.id
    WHERE j.partner_id = ? AND j.status != 'COMPLETED' AND j.status != 'CANCELLED'
    ORDER BY j.id DESC
  `, [partner.id]);

  const floatBalance = Number(partner.wallet_balance || 0);
  const potentialLeads = Math.floor(floatBalance / 50);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title={partner.business_name}
        subtitle={`${partner.city_name || "Delhi NCR"} Hub • ${partner.service_radius_km || 20}km Service Area`}
        badge={`Tier: ${partner.tier_level || "GOLD"}`}
      >
        <Link 
          href="/partner/id-card" 
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
        >
          🪪 ID Card
        </Link>
        <Link 
          href="/partner/referrals" 
          className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          🎁 Refer (+₹100)
        </Link>
        <Link 
          href="/partner/wallet" 
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
        >
          Wallet
        </Link>
        <Link 
          href="/partner/leads" 
          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          Available Leads ({availableLeads.length})
        </Link>
      </PageHeader>

      {/* 2. Wallet & Float Quick Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-lg text-emerald-400 shrink-0">
            ₹
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-white tracking-tight">
                ₹{floatBalance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </span>
              <span className="text-3xs font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-full">
                Active Float
              </span>
            </div>
            <p className="text-2xs text-slate-400 mt-0.5">
              Capacity for ~{potentialLeads} leads • You keep 85% of customer billing
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            href="/partner/wallet"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-xs"
          >
            + Add Funds
          </Link>
          <Link
            href="/partner/withdrawals"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all shadow-xs"
          >
            Withdraw
          </Link>
        </div>
      </div>

      {/* 2B. Gamification Tier & Referral Quick Bar */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-purple-800/60 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-xl shadow-inner shrink-0">
            🥇
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-3xs font-extrabold uppercase px-2 py-0.5 rounded bg-amber-400 text-amber-950">
                ★ {partner.tier_level || "GOLD"} MASTER PRO
              </span>
              <span className="text-2xs text-purple-200">
                12% Commission (3% Preferred Rate)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Invite code: <strong className="font-mono text-amber-300">{partner.referral_code || "REF-DEL-1001"}</strong> • Earn ₹100 for every technician who joins Repnexa!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          <Link
            href="/partner/referrals"
            className="flex-1 md:flex-initial text-center px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition-all"
          >
            🎁 Refer & Earn (+₹100)
          </Link>
          <Link
            href="/partner/id-card"
            className="flex-1 md:flex-initial text-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
          >
            🪪 ID Badge
          </Link>
        </div>
      </div>

      {/* 3. Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Wallet Balance"
          value={`₹${floatBalance.toLocaleString('en-IN')}`}
          subtext={`~${potentialLeads} leads capacity`}
          badge="Live"
          badgeColor="emerald"
          valueColor="text-emerald-700"
          icon="💳"
        />

        <StatCard
          label="Active Jobs"
          value={activeJobs.length}
          subtext={activeJobs.length > 0 ? "Requires technician visit" : "All clear"}
          badge={activeJobs.length > 0 ? "In Field" : "Ready"}
          badgeColor={activeJobs.length > 0 ? "purple" : "slate"}
          valueColor="text-purple-700"
          icon="🛠️"
        />

        <StatCard
          label="Completed"
          value={partner.total_completed_jobs || 128}
          subtext="Verified completions"
          badge="Done"
          badgeColor="slate"
          icon="✅"
        />

        <StatCard
          label="Rating"
          value={`★ ${Number(partner.rating || 4.9).toFixed(1)}`}
          subtext="Customer verified"
          badge="Top Tech"
          badgeColor="orange"
          valueColor="text-amber-500"
          icon="⭐"
        />
      </div>

      {/* 4. Two-Column Operational Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Available Leads */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Available Leads ({availableLeads.length})
                </h2>
                <p className="text-2xs text-slate-400">Accept to unlock customer phone & address</p>
              </div>
              <Link href="/partner/leads" className="text-2xs font-semibold text-purple-600 hover:text-purple-800">
                View All →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {availableLeads.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <div className="text-xl mb-1">🎯</div>
                  No new leads right now. New bookings will appear here instantly.
                </div>
              ) : (
                availableLeads.map((lead: any) => (
                  <div key={lead.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-3xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60 font-mono">
                            {lead.lead_code}
                          </span>
                          <span className="text-2xs text-slate-400">
                            Slot: <strong className="text-slate-700">{lead.preferred_time || "Today"}</strong>
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-xs mt-1">{lead.service_title}</h3>
                        <p className="text-2xs text-slate-500 mt-0.5 line-clamp-1">{lead.problem_description}</p>
                        <div className="text-2xs text-slate-400 mt-1">
                          📍 {lead.city_name} • {lead.pincode || "110001"}
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end">
                        <span className="text-2xs font-medium text-slate-500">₹{Number(lead.lead_fee).toFixed(0)} fee</span>
                        <form action={async () => {
                          "use server";
                          await acceptLeadByPartner(lead.id, partner.id);
                        }} className="mt-1.5">
                          <button 
                            type="submit" 
                            disabled={floatBalance < Number(lead.lead_fee)}
                            className={`px-3 py-1.5 rounded-lg text-white font-semibold text-2xs transition-all cursor-pointer shadow-2xs ${
                              floatBalance >= Number(lead.lead_fee)
                                ? "bg-orange-600 hover:bg-orange-700"
                                : "bg-slate-300 cursor-not-allowed text-slate-500"
                            }`}
                          >
                            Accept Lead
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50/60 border-t border-slate-100 text-center">
            <Link href="/partner/leads" className="text-2xs font-semibold text-purple-700 hover:text-purple-900">
              Browse All Leads ({availableLeads.length}) →
            </Link>
          </div>
        </div>

        {/* Right: Active Field Jobs */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Active Jobs ({activeJobs.length})
                </h2>
                <p className="text-2xs text-slate-400">Doorstep visits in progress</p>
              </div>
              <Link href="/partner/jobs" className="text-2xs font-semibold text-purple-600 hover:text-purple-800">
                Jobs Console →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {activeJobs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <div className="text-xl mb-1">🛠️</div>
                  No active jobs right now. Accept an available lead to get started.
                </div>
              ) : (
                activeJobs.map((job: any) => (
                  <div key={job.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-900 text-xs">{job.job_code}</span>
                          <StatusBadge status={job.status} />
                        </div>
                        <h3 className="font-semibold text-slate-800 text-xs mt-1">{job.service_title}</h3>
                        <p className="text-2xs text-slate-600 font-medium mt-0.5">
                          👤 {job.customer_name} • <span className="font-mono font-semibold text-purple-700">{job.customer_phone}</span>
                        </p>
                        <p className="text-2xs text-slate-400 line-clamp-1 mt-0.5">📍 {job.customer_address}</p>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end">
                        {job.completion_otp && (
                          <div className="text-2xs text-slate-500 mb-1.5">
                            OTP: <span className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">{job.completion_otp}</span>
                          </div>
                        )}
                        <Link 
                          href="/partner/jobs" 
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-2xs shadow-2xs transition-colors"
                        >
                          Open Job →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50/60 border-t border-slate-100 text-center">
            <Link href="/partner/jobs" className="text-2xs font-semibold text-purple-700 hover:text-purple-900">
              Manage Ongoing Jobs & OTPs →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
