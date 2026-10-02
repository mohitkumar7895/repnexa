import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { revalidatePath } from "next/cache";

export default async function SuperAdminLeadsPage() {
  const [leads]: any = await db.query(`
    SELECT l.*, s.title as service_title, c.name as city_name,
           p.business_name as partner_name, p.partner_code
    FROM leads l
    LEFT JOIN services s ON l.service_id = s.id
    LEFT JOIN cities c ON l.city_id = c.id
    LEFT JOIN partners p ON l.assigned_partner_id = p.id
    ORDER BY l.id DESC
  `);

  const [approvedPartners]: any = await db.query(
    "SELECT id, partner_code, business_name FROM partners WHERE kyc_status = 'approved' ORDER BY business_name ASC"
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Lead Operations & Dispatch" 
        subtitle="Control customer service inquiries, partner allocation, and dispatch pipeline"
        badge={`${leads.length} Leads`}
      />

      <DataTable title="All Customer Leads" count={leads.length}>
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Lead Code</th>
              <th className="px-4 py-3">Service & Brand</th>
              <th className="px-4 py-3">Customer Information</th>
              <th className="px-4 py-3">Preferred Slot</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assigned Partner</th>
              <th className="px-4 py-3">Lead Fee</th>
              <th className="px-4 py-3 text-right">Dispatch Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {leads.map((l: any) => (
              <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-slate-900">{l.lead_code}</td>
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-900">{l.service_title || "Home Repair"}</div>
                  <div className="text-slate-500">{l.brand_name || "Any Brand"}</div>
                  <div className="text-2xs text-slate-400 truncate max-w-xs">{l.problem_description}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{l.customer_name}</div>
                  <div className="text-slate-500 font-mono">{l.customer_phone}</div>
                  <div className="text-2xs text-slate-400 truncate max-w-xs">{l.customer_address}, {l.city_name}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  <div>{l.preferred_date ? new Date(l.preferred_date).toLocaleDateString('en-IN') : 'Today'}</div>
                  <div className="text-2xs text-slate-500 font-medium">{l.preferred_time || "Flexible"}</div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={l.status} />
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {l.partner_name ? (
                    <div>
                      <div className="font-semibold text-purple-700">{l.partner_name}</div>
                      <div className="text-2xs font-mono text-slate-400">{l.partner_code}</div>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">None</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono font-bold text-slate-900">
                  ₹{Number(l.lead_fee).toFixed(0)}
                </td>
                <td className="px-4 py-3 text-right">
                  {l.status !== "COMPLETED" && (
                    <form action={async (formData: FormData) => {
                      "use server";
                      const partnerId = formData.get("partnerId");
                      if (partnerId) {
                        await db.query("UPDATE leads SET assigned_partner_id = ?, status = 'ASSIGNED' WHERE id = ?", [partnerId, l.id]);
                        revalidatePath("/super-admin/leads");
                      }
                    }} className="flex items-center justify-end space-x-1">
                      <select name="partnerId" defaultValue={l.assigned_partner_id || ""} className="border border-slate-300 rounded px-2 py-1 text-2xs bg-white">
                        <option value="">-- Assign Partner --</option>
                        {approvedPartners.map((ap: any) => (
                          <option key={ap.id} value={ap.id}>{ap.business_name}</option>
                        ))}
                      </select>
                      <button type="submit" className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-2xs">
                        Assign
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
