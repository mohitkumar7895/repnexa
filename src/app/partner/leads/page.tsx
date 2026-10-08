import { db } from "@/lib/db";
import { AcceptLeadButton } from "@/components/partner/AcceptLeadButton";
import { getCurrentPartner } from "@/lib/partner";
import { getPartnerProof, isDoorstepCleared, passedCheckCount } from "@/lib/verification";
import { AvailabilityToggle } from "@/components/partner/AvailabilityToggle";
import { ensurePortalTables } from "@/lib/portal-setup";

export default async function PartnerLeadsPage() {
  const partner = await getCurrentPartner();
  await ensurePortalTables();
  const acceptingLeads = Number(partner.accepting_leads ?? 1) === 1;
  const proof = partner.id ? await getPartnerProof(partner.id) : [];
  const doorstepCleared = isDoorstepCleared(partner, passedCheckCount(proof));

  const [availableLeads]: any = await db.query(
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
  `,
    [partner.id, acceptingLeads ? 1 : 0, partner.id]
  );

  const [pinRows]: any = partner.id
    ? await db.query("SELECT COUNT(*) AS total FROM partner_pincodes WHERE partner_id = ?", [partner.id])
    : [[{ total: 0 }]];
  const pinCount = Number(pinRows?.[0]?.total || 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Available Lead Marketplace</h1>
          <p className="text-xs text-slate-500 mt-0.5">Accepting deducts the fee and shows the address.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="text-slate-500">Wallet:</span>
          <span className="font-bold text-emerald-700">₹{Number(partner.wallet_balance).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-end">
        <AvailabilityToggle partnerId={Number(partner.id) || 0} accepting={acceptingLeads} />
      </div>
      {pinCount === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
          Add your pincodes in the workshop profile. Until then, leads stay hidden.
        </div>
      )}
      {!acceptingLeads && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
          You are off. City leads stay hidden.
        </div>
      )}

      {!doorstepCleared && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-900">
          Leads locked until 4 checks pass.
        </div>
      )}

      {/* Leads List */}
      <div className="space-y-4">
        {availableLeads.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <div className="text-3xl mb-2">🎯</div>
            <h2 className="text-base font-bold text-slate-700">No New Leads In Your Radius</h2>
            <p className="text-xs text-slate-400 mt-1">You will receive an instant notification when a customer submits a repair request nearby.</p>
          </div>
        ) : (
          availableLeads.map((lead: any) => (
            <div key={lead.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-purple-200 transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                      {lead.lead_code}
                    </span>
                    <span className="text-xs text-slate-400">• Brand: <span className="font-semibold text-slate-700">{lead.brand_name || "Any"}</span></span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{lead.service_title}</h3>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 max-w-2xl">
                    <span className="font-semibold text-slate-800">Problem Reported:</span> {lead.problem_description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                    <span>📍 {lead.city_name} (PIN: {lead.pincode})</span>
                    <span>🗓️ Slot: {lead.preferred_date ? new Date(lead.preferred_date).toLocaleDateString('en-IN') : 'Today'} ({lead.preferred_time || "Flexible"})</span>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right mb-2">
                    <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold block">Lead Cost</span>
                    <span className="text-lg font-black font-mono text-slate-900">₹{Number(lead.lead_fee || 0).toLocaleString("en-IN")}</span>
                  </div>

                  {doorstepCleared ? (
                    <AcceptLeadButton
                      leadId={lead.id}
                      partnerId={Number(partner.id) || 0}
                      fee={Number(lead.lead_fee || 0)}
                      balance={Number(partner.wallet_balance || 0)}
                    />
                  ) : (
                    <span className="text-2xs font-bold text-rose-700">Clearance locked</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
