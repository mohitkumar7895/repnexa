import { db } from "@/lib/db";
import { requestPartnerWithdrawal } from "@/app/actions/portal-actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";

export default async function PartnerWithdrawalsPage() {
  const [partnerRows]: any = await db.query("SELECT id, wallet_balance, partner_code, business_name FROM partners WHERE partner_code = 'PTR-DEL-1001' LIMIT 1");
  const partner = partnerRows[0] || { id: 1, wallet_balance: 2500, partner_code: 'PTR-DEL-1001' };

  const [withdrawals]: any = await db.query(
    "SELECT * FROM withdrawals WHERE partner_id = ? ORDER BY id DESC",
    [partner.id]
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Wallet Payout & Bank Withdrawal" 
        subtitle="Transfer your service job earnings directly to your bank account or UPI ID"
        badge={`Available: ₹${Number(partner.wallet_balance).toFixed(2)}`}
      >
        <Link href="/partner/wallet" className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100">
          ← Back to Wallet Float
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Payout Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
            Request Payout / Withdrawal
          </h2>

          <form action={async (formData: FormData) => {
            "use server";
            await requestPartnerWithdrawal(formData);
          }} className="space-y-3">
            <input type="hidden" name="partnerId" value={partner.id} />

            <div>
              <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Payout Amount (₹) *</label>
              <input 
                type="number" 
                name="amount" 
                min="500" 
                max={partner.wallet_balance}
                placeholder="Minimum ₹500" 
                required 
                className="w-full text-xs font-mono font-bold p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none" 
              />
              <span className="text-2xs text-slate-400 mt-1 block">Maximum withdrawable: ₹{Number(partner.wallet_balance).toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-2xs font-bold text-purple-700 uppercase block">Option A: Direct Bank Account</span>
              <div>
                <input type="text" name="bankName" placeholder="Enter Bank Name" className="w-full text-xs p-2 border border-slate-300 rounded" />
              </div>
              <div>
                <input type="text" name="accountNumber" placeholder="Enter Account Number" className="w-full text-xs p-2 border border-slate-300 rounded font-mono" />
              </div>
              <div>
                <input type="text" name="ifscCode" placeholder="Enter IFSC Code" className="w-full text-xs p-2 border border-slate-300 rounded font-mono uppercase" />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-2xs font-bold text-purple-700 uppercase block">Option B: Instant UPI ID</span>
              <div>
                <input type="text" name="upiId" placeholder="Enter UPI ID / VPA" className="w-full text-xs p-2 border border-slate-300 rounded font-mono" />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Submit Withdrawal Request →
            </button>
          </form>
        </div>

        {/* Payout Requests History */}
        <div className="lg:col-span-2">
          <DataTable title="Withdrawal History & Settlement Status" count={withdrawals.length}>
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Payout Code</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Requested On</th>
                  <th className="px-4 py-3 text-right">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No withdrawal requests yet. Your earnings accumulate in your wallet float.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w: any) => (
                    <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{w.withdrawal_code}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700 text-sm">
                        ₹{Number(w.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-2xs">
                        {w.upi_id ? (
                          <div>UPI: <span className="font-mono font-bold text-purple-700">{w.upi_id}</span></div>
                        ) : (
                          <div>{w.bank_name} • A/C: <span className="font-mono">{w.account_number}</span></div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-2xs font-mono">
                        {new Date(w.requested_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <StatusBadge status={w.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </DataTable>
        </div>
      </div>
    </div>
  );
}
