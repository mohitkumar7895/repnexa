import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { revalidatePath } from "next/cache";

export default async function SuperAdminSupportPage() {
  // Fetch tickets or complaints
  const [tickets]: any = await db.query(`
    SELECT t.*, u.email, u.first_name, u.phone
    FROM support_tickets t
    LEFT JOIN users u ON t.user_id = u.id
    ORDER BY t.id DESC
  `);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Support, Disputes & Complaints Desk" 
        subtitle="Manage customer grievances, technician disputes, and resolution workflows"
        badge={`${tickets.length} Total Tickets`}
      />

      {/* Quick Add Complaint / Ticket */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 mb-3">
          + Log Internal Support Case / Customer Dispute
        </h2>
        <form action={async (formData: FormData) => {
          "use server";
          const subject = formData.get("subject") as string;
          const description = formData.get("description") as string;
          const priority = formData.get("priority") as string || "MEDIUM";

          if (subject && description) {
            const ticketCode = `TKT-${Date.now().toString().slice(-6)}`;
            await db.query(
              `INSERT INTO support_tickets (ticket_code, user_id, subject, description, priority, status)
               VALUES (?, 1, ?, ?, ?, 'OPEN')`,
              [ticketCode, subject, description, priority]
            );
            revalidatePath("/super-admin/support");
          }
        }} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Issue Subject *</label>
            <input type="text" name="subject" required placeholder="e.g. Overcharging complaint on Split AC gas refill" className="w-full text-xs p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Priority</label>
            <select name="priority" className="w-full text-xs p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none bg-white">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent Escalation</option>
            </select>
          </div>
          <div>
            <button type="submit" className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded transition-all cursor-pointer">
              Log Support Ticket
            </button>
          </div>
          <div className="md:col-span-4">
            <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Dispute Description *</label>
            <textarea name="description" rows={2} required placeholder="Detailed notes about the issue and technician action" className="w-full text-xs p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none"></textarea>
          </div>
        </form>
      </div>

      {/* Tickets List */}
      <DataTable title="All Support & Dispute Tickets" count={tickets.length}>
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Ticket ID</th>
              <th className="px-4 py-3">Subject & Grievance</th>
              <th className="px-4 py-3">Reported By</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Resolution Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No open dispute cases. All operations normal.</td>
              </tr>
            ) : (
              tickets.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{t.ticket_code || `TKT-${t.id}`}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{t.subject}</div>
                    <div className="text-2xs text-slate-400 truncate max-w-sm">{t.description}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="font-semibold text-slate-900">{t.customer_name || t.first_name || "Customer / Public"}</div>
                    <div className="text-2xs font-mono text-purple-700 font-bold">{t.customer_phone || t.phone || t.email || "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-2xs font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status || "OPEN"} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {t.status !== "RESOLVED" && (
                        <form action={async () => {
                          "use server";
                          await db.query("UPDATE support_tickets SET status = 'RESOLVED' WHERE id = ?", [t.id]);
                          revalidatePath("/super-admin/support");
                        }}>
                          <button type="submit" className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xs uppercase">
                            Resolve
                          </button>
                        </form>
                      )}
                      <form action={async () => {
                        "use server";
                        await db.query("DELETE FROM support_tickets WHERE id = ?", [t.id]);
                        revalidatePath("/super-admin/support");
                      }}>
                        <button type="submit" className="px-2 py-1 text-rose-600 hover:text-rose-800 font-bold text-2xs uppercase">
                          Close
                        </button>
                      </form>
                    </div>
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
