import { db } from "@/lib/db";
import { RazorpayTopupButton } from "@/components/wallet/RazorpayTopupButton";
import { getCurrentPartner } from "@/lib/partner";

export default async function PartnerWalletPage() {
  const partner = await getCurrentPartner();

  const [transactions]: any = await db.query(`
    SELECT * FROM wallet_transactions WHERE partner_id = ? ORDER BY id DESC LIMIT 20
  `, [partner.id]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Partner Wallet & Recharge</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your prepaid security balance for receiving high-priority customer repair leads</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance & Razorpay Gateway Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Float Balance</span>
            <div className="text-4xl font-black text-emerald-700 font-mono mt-1">
              ₹{Number(partner.wallet_balance).toFixed(2)}
            </div>
            <span className="text-2xs text-slate-400 block mt-1">Active status • Minimum balance ₹500 required</span>
          </div>

          {/* Razorpay Online Payment Integration */}
          <div className="pt-4 border-t border-slate-100">
            <RazorpayTopupButton
              partnerId={partner.id}
              partnerName={partner.business_name}
            />
          </div>
        </div>

        {/* Transactions Ledger */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Wallet Deduction & Credit History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Txn Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No transactions recorded yet.</td>
                  </tr>
                ) : (
                  transactions.map((t: any) => {
                    const isCredit = t.type === 'CREDIT' || t.type === 'REFUND' || t.type === 'JOB_EARNING' || t.type === 'BONUS';

                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{t.transaction_code}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-2xs font-bold uppercase ${isCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-2xs max-w-xs truncate">{t.description}</td>
                        <td className={`px-4 py-3 font-mono font-bold ${isCredit ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {isCredit ? '+' : '-'}₹{Number(t.amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          ₹{Number(t.balance_after).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
