import { db } from "@/lib/db";
import { acceptLeadByPartner } from "@/app/actions/portal-actions";
import Link from "next/link";

export default async function PartnerLeadsPage() {
  const [partnerRows]: any = await db.query("SELECT id, wallet_balance, partner_code FROM partners WHERE partner_code = 'PTR-DEL-1001' LIMIT 1");
  const partner = partnerRows[0] || { id: 1, wallet_balance: 2500 };

  const [availableLeads]: any = await db.query(`
    SELECT l.*, s.title as service_title, c.name as city_name
    FROM leads l
    LEFT JOIN services s ON l.service_id = s.id
    LEFT JOIN cities c ON l.city_id = c.id
    WHERE l.status IN ('NEW', 'MATCHING', 'ASSIGNED')
    ORDER BY l.id DESC
  `);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Available Lead Marketplace</h1>
          <p className="text-xs text-slate-500 mt-0.5">Leads in your hub. Accepting a lead automatically deducts the fee from your wallet and creates an active job.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="text-slate-500">Wallet:</span>
          <span className="font-bold text-emerald-700">₹{Number(partner.wallet_balance).toFixed(2)}</span>
        </div>
      </div>

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
                    <span className="text-lg font-black font-mono text-slate-900">₹{Number(lead.lead_fee).toFixed(0)}</span>
                  </div>

                  <form action={async () => {
                    "use server";
                    await acceptLeadByPartner(lead.id, partner.id);
                  }}>
                    <button 
                      type="submit" 
                      className="px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                    >
                      Accept Lead (₹{Number(lead.lead_fee).toFixed(0)}) →
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
