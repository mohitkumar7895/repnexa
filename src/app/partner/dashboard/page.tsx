import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AcceptLeadButton } from "@/components/partner/AcceptLeadButton";
import { getCurrentPartner, getPartnerTier } from "@/lib/partner";
import { getPartnerProof, isDoorstepCleared, passedCheckCount } from "@/lib/verification";
import Link from "next/link";
import { AvailabilityToggle } from "@/components/partner/AvailabilityToggle";
import { ensurePortalTables } from "@/lib/portal-setup";

export default async function PartnerDashboardPage() {
  const partner = await getCurrentPartner();
  await ensurePortalTables();
  const acceptingLeads = Number(partner.accepting_leads ?? 1) === 1;
  const jobsDone = Number(partner.total_completed_jobs) || 0;
  const rating = Number(partner.rating) || 0;
  const tier = getPartnerTier(jobsDone);

  let availableLeads: any[] = [];
  let activeJobs: any[] = [];

  try {
    const [leadRows]: any = await db.query(
      `
      SELECT l.*, s.title as service_title, c.name as city_name
      FROM leads l
      LEFT JOIN services s ON l.service_id = s.id
      LEFT JOIN cities c ON l.city_id = c.id
      WHERE l.status IN ('NEW', 'MATCHING', 'ASSIGNED')
        AND (l.assigned_partner_id IS NULL OR l.assigned_partner_id = ?)
        AND NOT EXISTS (
          SELECT 1 FROM jobs jx
          WHERE jx.lead_id = l.id AND jx.status <> 'CANCELLED'
        )
        AND ? = 1
        AND EXISTS (
          SELECT 1 FROM partner_pincodes pp
          WHERE pp.partner_id = ? AND pp.pincode = l.pincode
        )
      ORDER BY l.id DESC
      LIMIT 5
    `,
      [partner.id, acceptingLeads ? 1 : 0, partner.id]
    );
    availableLeads = leadRows || [];

    const [jobRows]: any = await db.query(
      `
      SELECT j.*, l.lead_code, l.customer_name, l.customer_phone, l.customer_address, s.title as service_title
      FROM jobs j
      LEFT JOIN leads l ON j.lead_id = l.id
      LEFT JOIN services s ON l.service_id = s.id
      WHERE j.partner_id = ? AND j.status != 'COMPLETED' AND j.status != 'CANCELLED'
      ORDER BY j.id DESC
    `,
      [partner.id]
    );
    activeJobs = jobRows || [];
  } catch {
    availableLeads = [];
    activeJobs = [];
  }

  const floatBalance = Number(partner.wallet_balance || 0);
  const potentialLeads = Math.floor(floatBalance / 50);
  const lowFloat = floatBalance < 50;
  const proof = partner.id ? await getPartnerProof(partner.id) : [];
  const doorstepCleared = isDoorstepCleared(partner, passedCheckCount(proof));
  const kycApproved = doorstepCleared;

  return (
    <div className="space-y-6">
      <PageHeader
        title={partner.business_name}
        subtitle={`${partner.city_name || "Delhi NCR"} • ${partner.service_radius_km || 20} km service area`}
        badge={tier.name}
      >
        <Link
          href="/partner/id-card"
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-2xs"
        >
          ID Card
        </Link>
        <Link
          href="/partner/wallet"
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-2xs"
        >
          Wallet
        </Link>
        <AvailabilityToggle partnerId={Number(partner.id) || 0} accepting={acceptingLeads} />
        <Link
          href="/partner/leads"
          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs"
        >
          Leads ({availableLeads.length})
        </Link>
      </PageHeader>

      {!kycApproved && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p>
            <span className="font-bold">Proof {passedCheckCount(proof)}/4.</span> Leads stay locked.
          </p>
          <Link href="/partner/profile" className="px-3 py-1.5 rounded-lg bg-amber-700 text-white font-semibold text-2xs shrink-0">
            Finish profile
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="rounded-2xl bg-slate-900 text-white p-5 border border-slate-800 shadow-xs">
          <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Active float</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div>
              <div className="text-3xl font-black tracking-tight font-mono">
                ₹{floatBalance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </div>
              <p className="text-2xs text-slate-400 mt-1">
                {potentialLeads === 1
                  ? "About 1 lead at ₹50"
                  : `About ${potentialLeads} leads at ₹50 each`}
              </p>
            </div>
            <span className={`text-3xs font-bold px-2 py-1 rounded-full border ${lowFloat ? "border-amber-400/40 text-amber-300 bg-amber-400/10" : "border-emerald-400/40 text-emerald-300 bg-emerald-400/10"}`}>
              {lowFloat ? "Low balance" : "Healthy"}
            </span>
          </div>
          <div className="mt-4 flex gap-2">
            <Link href="/partner/wallet" className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs">
              Add funds
            </Link>
            <Link href="/partner/withdrawals" className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700">
              Withdraw
            </Link>
          </div>
        </section>

        <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">Partner tier</p>
            <span className="text-3xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200">
              {tier.rate} commission
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{tier.name}</div>
          <p className="text-2xs text-slate-500 mt-1">
            {tier.next ? `${jobsDone} of ${tier.target} jobs to reach ${tier.next}` : `${jobsDone} verified jobs · top tier`}
          </p>
          <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-purple-600" style={{ width: `${tier.progress}%` }} />
          </div>
        </section>

        <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">Referral desk</p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Earn ₹100 for every technician who joins</p>
            <p className="mt-1 text-xs text-slate-500">
              Invite code <span className="font-mono font-bold text-purple-700 dark:text-purple-300">{partner.referral_code || partner.partner_code}</span>
            </p>
          </div>
          <Link href="/partner/referrals" className="mt-4 inline-flex w-fit px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold">
            Share invite
          </Link>
        </section>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Wallet Balance"
          value={`₹${floatBalance.toLocaleString("en-IN")}`}
          subtext={`~${potentialLeads} leads capacity`}
          badge={lowFloat ? "Low" : "Live"}
          badgeColor={lowFloat ? "orange" : "emerald"}
          valueColor="text-emerald-700 dark:text-emerald-400"
        />
        <StatCard
          label="Active Jobs"
          value={activeJobs.length}
          subtext={activeJobs.length > 0 ? "Needs a doorstep visit" : "Nothing in the field"}
          badge={activeJobs.length > 0 ? "In field" : "Clear"}
          badgeColor={activeJobs.length > 0 ? "purple" : "slate"}
          valueColor="text-purple-700 dark:text-purple-300"
        />
        <StatCard
          label="Completed"
          value={jobsDone}
          subtext="Verified completions"
          badge="Done"
          badgeColor="slate"
        />
        <StatCard
          label="Rating"
          value={rating > 0 ? `★ ${rating.toFixed(1)}` : "—"}
          subtext={rating > 0 ? "From customer reviews" : "No reviews yet"}
          badge={rating >= 4.5 ? "Top tech" : "Live"}
          badgeColor="orange"
          valueColor="text-amber-600 dark:text-amber-300"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex justify-between items-center gap-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Available leads ({availableLeads.length})
              </h2>
              <p className="text-2xs text-slate-400">Accept to see the address</p>
            </div>
            <Link href="/partner/leads" className="text-2xs font-semibold text-purple-600 dark:text-purple-300 shrink-0">
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {availableLeads.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">No open leads right now</p>
                <p className="text-xs text-slate-500 mt-1">New bookings in your pincodes will land here.</p>
              </div>
            ) : (
              availableLeads.map((lead: any) => {
                const fee = Number(lead.lead_fee || 0);
                return (
                  <div key={lead.id} className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-3xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60 font-mono dark:bg-purple-950/50 dark:text-purple-200 dark:border-purple-800">
                            {lead.lead_code}
                          </span>
                          <span className="text-2xs text-slate-400">
                            Slot <strong className="text-slate-700 dark:text-slate-200">{lead.preferred_time || "Flexible"}</strong>
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-xs mt-1">{lead.service_title || "Service request"}</h3>
                        <p className="text-2xs text-slate-500 mt-0.5 line-clamp-1">{lead.problem_description}</p>
                        <div className="text-2xs text-slate-400 mt-1">
                          {lead.city_name || "City pending"} · {lead.pincode || "PIN pending"}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-2xs font-medium text-slate-500">₹{fee.toLocaleString("en-IN")} fee</span>
                        <div className="mt-1.5">
                          {doorstepCleared ? (
                            <AcceptLeadButton
                              leadId={lead.id}
                              partnerId={Number(partner.id) || 0}
                              fee={fee}
                              balance={floatBalance}
                            />
                          ) : (
                            <span className="text-3xs font-bold text-rose-700">Clearance locked</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex justify-between items-center gap-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Active jobs ({activeJobs.length})
              </h2>
              <p className="text-2xs text-slate-400">Doorstep visits currently assigned to you</p>
            </div>
            <Link href="/partner/jobs" className="text-2xs font-semibold text-purple-600 dark:text-purple-300 shrink-0">
              Jobs console
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeJobs.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">No active jobs</p>
                <p className="text-xs text-slate-500 mt-1">Accepted visits show up here.</p>
              </div>
            ) : (
              activeJobs.map((job: any) => (
                <div key={job.id} className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">{job.job_code}</span>
                        <StatusBadge status={job.status} />
                      </div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-xs mt-1">{job.service_title || "Service job"}</h3>
                      <p className="text-2xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                        {job.customer_name || "Customer"} · <span className="font-mono font-semibold text-purple-700 dark:text-purple-300">{job.customer_phone || "—"}</span>
                      </p>
                      <p className="text-2xs text-slate-400 line-clamp-1 mt-0.5">{job.customer_address || "Address shared after acceptance"}</p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                      <Link
                        href="/partner/jobs"
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-2xs shadow-2xs"
                      >
                        Open job
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
