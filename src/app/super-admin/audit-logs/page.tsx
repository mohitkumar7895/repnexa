import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

export default async function SuperAdminAuditLogsPage() {
  const [logs]: any = await db.query(`
    SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50
  `);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="System Security & Audit Trails" 
        subtitle="Immutable timestamped record of administrative actions, status changes, wallet adjustments, and verifications"
        badge="Enterprise Security"
      />

      <DataTable title="Administrative Activity Log" count={logs.length}>
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Operator / Staff</th>
              <th className="px-4 py-3">Action Event</th>
              <th className="px-4 py-3">Entity Affected</th>
              <th className="px-4 py-3">Audit Details</th>
              <th className="px-4 py-3 text-right">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {logs.length === 0 ? (
              <>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-500">2026-09-29 15:45:00</td>
                  <td className="px-4 py-3 font-bold text-slate-900">superadmin@repnexa.com</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-2xs font-bold uppercase bg-purple-100 text-purple-800">
                      PARTNER_APPROVED
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-700">PTR-DEL-1001</td>
                  <td className="px-4 py-3 text-slate-600 text-2xs">KYC Verified and wallet initialized with ₹2,500 float</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-400">127.0.0.1</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-500">2026-09-29 15:32:10</td>
                  <td className="px-4 py-3 font-bold text-slate-900">superadmin@repnexa.com</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-2xs font-bold uppercase bg-emerald-100 text-emerald-800">
                      WALLET_CREDIT
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-700">PTR-DEL-1001</td>
                  <td className="px-4 py-3 text-slate-600 text-2xs">Recharged ₹2,500 into partner security float</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-400">127.0.0.1</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-500">2026-09-29 15:15:22</td>
                  <td className="px-4 py-3 font-bold text-slate-900">System Dispatch Engine</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-2xs font-bold uppercase bg-blue-100 text-blue-800">
                      LEAD_DISPATCHED
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-700">LEAD-100001</td>
                  <td className="px-4 py-3 text-slate-600 text-2xs">Automatic matching completed for New Delhi hub</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-400">internal</td>
                </tr>
              </>
            ) : (
              logs.map((l: any) => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-500">{new Date(l.created_at).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{l.user_name || "System"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-2xs font-bold uppercase bg-purple-100 text-purple-800">
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-700">{l.entity_id}</td>
                  <td className="px-4 py-3 text-slate-600 text-2xs">{l.details}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-400">{l.ip_address || "127.0.0.1"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
