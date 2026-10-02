import { db } from "@/lib/db";
import { processAdminWithdrawal } from "@/app/actions/portal-actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function SuperAdminWithdrawalsPage() {
  const [withdrawals]: any = await db.query(`
    SELECT w.*, p.business_name, p.partner_code, p.wallet_balance, u.phone, c.name as city_name
    FROM withdrawals w
    JOIN partners p ON w.partner_id = p.id
    JOIN users u ON p.user_id = u.id
    LEFT JOIN cities c ON p.city_id = c.id
    ORDER BY w.id DESC
  `);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Finance: Partner Withdrawal Processing" 
        subtitle="Review technician payout requests, verify bank IFSC / UPI details, and settle bank transfers"
        badge={`${withdrawals.length} Payout Requests`}
      />

      <DataTable title="All Partner Payout Requests" count={withdrawals.length}>
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Payout ID</th>
              <th className="px-4 py-3">Partner Agency</th>
              <th className="px-4 py-3">Amount Requested</th>
              <th className="px-4 py-3">Bank / UPI Destination</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Requested On</th>
              <th className="px-4 py-3 text-right">Settlement Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No payout requests submitted yet.
                </td>
              </tr>
            ) : (
              withdrawals.map((w: any) => (
                <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{w.withdrawal_code}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{w.business_name}</div>
                    <div className="text-2xs font-mono text-slate-400">{w.partner_code} • {w.city_name}</div>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-700 text-sm">
                    ₹{Number(w.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-2xs">
                    {w.upi_id ? (
                      <div>UPI: <span className="font-mono font-bold text-purple-700">{w.upi_id}</span></div>
                    ) : (
                      <div>
                        <div className="font-semibold text-slate-900">{w.bank_name}</div>
                        <div>A/C: <span className="font-mono">{w.account_number}</span></div>
                        <div className="font-mono uppercase text-slate-400">IFSC: {w.ifsc_code}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={w.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-2xs font-mono">
                    {new Date(w.requested_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {w.status === "PENDING" ? (
                      <div className="flex items-center justify-end space-x-1.5">
                        <form action={async () => {
                          "use server";
                          await processAdminWithdrawal(w.id, "PAID", "Disbursed via IMPS/NEFT");
                        }}>
                          <button type="submit" className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xs uppercase">
                            ✓ Mark Paid
                          </button>
                        </form>
                        <form action={async () => {
                          "use server";
                          await processAdminWithdrawal(w.id, "REJECTED", "Bank account verification failed");
                        }}>
                          <button type="submit" className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-2xs uppercase">
                            Reject & Refund
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-2xs font-semibold text-slate-400 uppercase">
                        {w.admin_notes || "Processed"}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
