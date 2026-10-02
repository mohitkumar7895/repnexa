import { db } from "@/lib/db";
import { rechargePartnerWallet } from "@/app/actions/portal-actions";

export default async function SuperAdminWalletPage() {
  const [partners]: any = await db.query(`
    SELECT p.id, p.partner_code, p.business_name, p.wallet_balance, u.phone, c.name as city_name
    FROM partners p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN cities c ON p.city_id = c.id
    ORDER BY p.wallet_balance DESC
  `);

  const [transactions]: any = await db.query(`
    SELECT t.*, p.business_name, p.partner_code
    FROM wallet_transactions t
    JOIN partners p ON t.partner_id = p.id
    ORDER BY t.id DESC
    LIMIT 25
  `);

  const totalFloat = partners.reduce((acc: number, p: any) => acc + Number(p.wallet_balance), 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Finance & Partner Wallets</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage partner security deposits, wallet float, lead fee deductions, and top-ups</p>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase block">Total System Float</span>
          <span className="text-xl font-black text-emerald-700 font-mono">₹{totalFloat.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Partner Balances & Quick Top-up */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-sm font-bold text-slate-900 uppercase">Partner Wallet Balances</h2>
          </div>
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {partners.map((p: any) => (
              <div key={p.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{p.business_name}</div>
                    <div className="text-2xs font-mono text-slate-400">{p.partner_code} • {p.city_name}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      ₹{Number(p.wallet_balance).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Quick Credit Form */}
                <form action={async (formData: FormData) => {
                  "use server";
                  const amt = Number(formData.get("amount"));
                  if (amt > 0) {
                    await rechargePartnerWallet(p.id, amt);
                  }
                }} className="mt-2 flex items-center space-x-1.5">
                  <input 
                    type="number" 
                    name="amount" 
                    placeholder="₹ Top-up" 
                    min="100" 
                    step="100" 
                    className="w-24 text-2xs p-1 border border-slate-300 rounded font-mono"
                    required
                  />
                  <button type="submit" className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xs rounded">
                    + Add Funds
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

        {/* Live Transaction Ledger */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-sm font-bold text-slate-900 uppercase">Live Transaction Ledger (Audit Trail)</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Txn Code</th>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {transactions.map((t: any) => {
                  const isCredit = t.type === 'CREDIT' || t.type === 'REFUND' || t.type === 'JOB_EARNING' || t.type === 'BONUS';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{t.transaction_code}</td>
                      <td className="px-4 py-3 font-medium text-purple-700">{t.business_name}</td>
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
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
