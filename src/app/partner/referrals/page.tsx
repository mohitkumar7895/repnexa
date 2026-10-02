import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ReferralShareButtons } from "@/components/partner/ReferralShareButtons";
import Link from "next/link";

export default async function PartnerReferralsPage() {
  // Fetch demo partner
  const [partnerRows]: any = await db.query(`
    SELECT p.*, c.name as city_name, s.name as state_name, u.phone as contact_phone, u.first_name, u.last_name
    FROM partners p
    LEFT JOIN cities c ON p.city_id = c.id
    LEFT JOIN states s ON p.state_id = s.id
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.partner_code = 'PTR-DEL-1001'
    LIMIT 1
  `);

  const partner = partnerRows[0] || {
    id: 1,
    partner_code: "PTR-DEL-1001",
    referral_code: "REF-DEL-1001",
    business_name: "Sharma Cooling Solutions",
    total_completed_jobs: 128,
    rating: 4.9,
    wallet_balance: 2500,
    tier_level: "GOLD",
  };

  const referralCode = partner.referral_code || `REF-${partner.partner_code.replace("PTR-", "")}`;

  // Fetch referrals for this partner
  const [referrals]: any = await db.query(`
    SELECT * FROM partner_referrals 
    WHERE referrer_partner_code = ? 
    ORDER BY id DESC
  `, [partner.partner_code]);

  const totalInvited = referrals.length;
  const rewardedList = referrals.filter((r: any) => r.status === "rewarded");
  const pendingList = referrals.filter((r: any) => r.status === "pending" || r.status === "verified");
  const totalEarned = rewardedList.reduce((acc: number, cur: any) => acc + Number(cur.reward_amount || 100), 0);
  const potentialPending = pendingList.reduce((acc: number, cur: any) => acc + Number(cur.reward_amount || 100), 0);

  // Dynamic Tier Calculation
  const jobsDone = partner.total_completed_jobs || 128;
  let currentTier = "BRONZE";
  let nextTier = "SILVER";
  let nextTierTarget = 20;
  let commissionRate = "15%";
  let badgeColor = "from-amber-700 to-amber-900";
  let tierIcon = "🥉";

  if (jobsDone >= 100) {
    currentTier = "DIAMOND";
    nextTier = "MAX_LEVEL";
    nextTierTarget = 100;
    commissionRate = "10%";
    badgeColor = "from-cyan-500 via-blue-600 to-indigo-700";
    tierIcon = "💎";
  } else if (jobsDone >= 50) {
    currentTier = "GOLD";
    nextTier = "DIAMOND";
    nextTierTarget = 100;
    commissionRate = "12%";
    badgeColor = "from-amber-400 via-yellow-500 to-amber-600";
    tierIcon = "🥇";
  } else if (jobsDone >= 20) {
    currentTier = "SILVER";
    nextTier = "GOLD";
    nextTierTarget = 50;
    commissionRate = "13%";
    badgeColor = "from-slate-400 via-slate-500 to-slate-600";
    tierIcon = "🥈";
  }

  const progressPct = nextTier === "MAX_LEVEL" ? 100 : Math.min(100, Math.round((jobsDone / nextTierTarget) * 100));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partner Growth, Gamification & Referral Rewards"
        subtitle="Invite fellow technicians, unlock lower commission tiers & earn ₹100 instant wallet cash per partner"
        badge={`Tier: ${currentTier}`}
      >
        <Link
          href="/partner/id-card"
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
        >
          🪪 View Digital ID Card
        </Link>
        <Link
          href="/partner/dashboard"
          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          Operations Dashboard →
        </Link>
      </PageHeader>

      {/* Hero: Refer & Earn Big Card */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-600 via-purple-700 to-indigo-800 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
          <span className="text-9xl">🎁</span>
        </div>

        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <span>⚡ Technician Referral Engine</span>
            <span>•</span>
            <span className="text-orange-200">Earn ₹100 Per Active Onboard</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Invite Local Technicians & Build Your Service Fleet
          </h2>

          <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
            Share your unique invite code with fellow AC, refrigerator, washing machine, or appliance technicians. 
            When they register and get verified by our compliance desk, <strong className="text-white">₹100 is directly credited to your wallet float</strong>, and they receive <strong className="text-white">₹100 joining credit</strong>!
          </p>

          <ReferralShareButtons
            referralCode={referralCode}
            partnerName={partner.business_name}
          />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Invited"
          value={totalInvited}
          subtext="Technicians reached"
          badge="Network"
          badgeColor="purple"
          valueColor="text-purple-700"
          icon="👥"
        />

        <StatCard
          label="Cash Bonus Earned"
          value={`₹${totalEarned.toLocaleString("en-IN")}`}
          subtext="Credited to wallet"
          badge="Paid"
          badgeColor="emerald"
          valueColor="text-emerald-700"
          icon="💰"
        />

        <StatCard
          label="Pending Approvals"
          value={`₹${potentialPending.toLocaleString("en-IN")}`}
          subtext={`${pendingList.length} in KYC review`}
          badge="In Progress"
          badgeColor="orange"
          valueColor="text-amber-600"
          icon="⏳"
        />

        <StatCard
          label="Commission Rate"
          value={commissionRate}
          subtext={`${currentTier} Tier Benefit`}
          badge="Discounted"
          badgeColor="slate"
          valueColor="text-slate-900"
          icon="🏷️"
        />
      </div>

      {/* Gamification: Partner Tier & Badges Roadmap */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{tierIcon}</span>
              <h3 className="text-base font-bold text-slate-900">
                Current Level: <span className="uppercase text-purple-700">{currentTier} Partner</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Your tier is upgraded automatically as you complete customer repair jobs with high ratings.
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xs uppercase font-bold text-slate-400 block">Performance</span>
            <span className="text-sm font-bold text-slate-900">
              {jobsDone} Jobs Done • ★ {Number(partner.rating || 4.9).toFixed(1)}
            </span>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div>
          <div className="flex justify-between items-center text-xs font-bold mb-2">
            <span className="text-slate-700">
              Tier Progress: <span className="text-purple-600">{jobsDone} completed</span>
            </span>
            <span className="text-slate-500">
              {nextTier === "MAX_LEVEL" ? "Maximum Elite Level Achieved! 🏆" : `Goal: ${nextTierTarget} Jobs for ${nextTier} Tier`}
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${badgeColor} transition-all duration-700`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 4 Tiers Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Bronze */}
          <div className={`p-4 rounded-xl border ${currentTier === "BRONZE" ? "border-amber-700 bg-amber-50/50 shadow-xs ring-2 ring-amber-700/20" : "border-slate-200 bg-slate-50/60"}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xl">🥉</span>
              <span className="text-3xs font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                0 - 19 Jobs
              </span>
            </div>
            <h4 className="font-bold text-xs text-slate-900">Bronze Technician</h4>
            <ul className="mt-2 space-y-1 text-2xs text-slate-600">
              <li>• Standard 15% commission</li>
              <li>• City-level doorstep leads</li>
              <li>• Standard wallet payouts</li>
            </ul>
          </div>

          {/* Silver */}
          <div className={`p-4 rounded-xl border ${currentTier === "SILVER" ? "border-slate-500 bg-slate-100 shadow-xs ring-2 ring-slate-500/20" : "border-slate-200 bg-slate-50/60"}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xl">🥈</span>
              <span className="text-3xs font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                20 - 49 Jobs
              </span>
            </div>
            <h4 className="font-bold text-xs text-slate-900">Silver Specialist</h4>
            <ul className="mt-2 space-y-1 text-2xs text-slate-600">
              <li>• <strong className="text-purple-700">13% Commission</strong> (2% off)</li>
              <li>• Early access to nearby leads</li>
              <li>• Silver Verified Badge on ID Card</li>
            </ul>
          </div>

          {/* Gold */}
          <div className={`p-4 rounded-xl border ${currentTier === "GOLD" ? "border-amber-500 bg-amber-50 shadow-xs ring-2 ring-amber-500/30" : "border-slate-200 bg-slate-50/60"}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xl">🥇</span>
              <span className="text-3xs font-extrabold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                50 - 99 Jobs (Current)
              </span>
            </div>
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1">
              <span>Gold Master Pro</span>
              <span className="text-3xs bg-amber-500 text-white px-1.5 py-0.2 rounded font-bold">YOU</span>
            </h4>
            <ul className="mt-2 space-y-1 text-2xs text-slate-700">
              <li>• <strong className="text-emerald-700">12% Commission</strong> (3% off)</li>
              <li>• Priority High-Value Lead Dispatch</li>
              <li>• Gold Repnexa Hologram ID Card</li>
            </ul>
          </div>

          {/* Diamond */}
          <div className={`p-4 rounded-xl border ${currentTier === "DIAMOND" ? "border-cyan-500 bg-cyan-50 shadow-xs ring-2 ring-cyan-500/30" : "border-slate-200 bg-slate-50/60"}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xl">💎</span>
              <span className="text-3xs font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-100 text-cyan-900">
                100+ Jobs
              </span>
            </div>
            <h4 className="font-bold text-xs text-slate-900">Diamond Elite Partner</h4>
            <ul className="mt-2 space-y-1 text-2xs text-slate-600">
              <li>• <strong className="text-cyan-700">Flat 10% Commission</strong> (Lowest)</li>
              <li>• Instant VIP Lead Push via WhatsApp</li>
              <li>• Dedicated Fleet Account Manager</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Referral History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Your Referred Technicians ({referrals.length})
            </h3>
            <p className="text-2xs text-slate-400 mt-0.5">
              Live tracking of partners who registered using your referral code
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            +₹{totalEarned} Earned
          </span>
        </div>

        {referrals.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            <span className="text-2xl block mb-2">🤝</span>
            No technician referrals yet. Share your invite code to start earning ₹100 per partner!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-3xs">
                <tr>
                  <th className="px-4 py-3">Partner Code</th>
                  <th className="px-4 py-3">Technician / Agency</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Referred Date</th>
                  <th className="px-4 py-3">Verification Status</th>
                  <th className="px-4 py-3 text-right">Cash Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {referrals.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {r.referred_partner_code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {r.referred_name || "New Partner"}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {r.referred_phone ? `+91 ${r.referred_phone}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-2xs">
                      {new Date(r.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "rewarded" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-3xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ✓ Rewarded (₹100 Paid)
                        </span>
                      )}
                      {r.status === "verified" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-3xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          ✓ KYC Verified (Crediting)
                        </span>
                      )}
                      {r.status === "pending" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-3xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          ⏳ Pending Compliance
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                      +₹{Number(r.reward_amount || 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Explainer: How it works */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          How Repnexa Partner Referral Program Works
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-xl">1️⃣</span>
            <h5 className="font-bold text-slate-900">Share Your Invite Link</h5>
            <p className="text-2xs text-slate-500">
              Send your link to appliance technicians, workshops, and mechanics across your city via WhatsApp or SMS.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-xl">2️⃣</span>
            <h5 className="font-bold text-slate-900">Partner Submits KYC</h5>
            <p className="text-2xs text-slate-500">
              Your friend submits Aadhaar & trade experience. Repnexa Operations verifies their credentials within 24 hours.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-xl">3️⃣</span>
            <h5 className="font-bold text-slate-900">Get ₹100 in Wallet</h5>
            <p className="text-2xs text-slate-500">
              Upon approval, ₹100 is credited instantly to your wallet float, and your friend gets ₹100 joining bonus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
