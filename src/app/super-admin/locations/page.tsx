import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { revalidatePath } from "next/cache";

export default async function SuperAdminLocationsPage() {
  const [states]: any = await db.query("SELECT * FROM states ORDER BY name ASC");
  const [cities]: any = await db.query(`
    SELECT c.*, s.name as state_name, s.code as state_code
    FROM cities c
    JOIN states s ON c.state_id = s.id
    ORDER BY s.name ASC, c.name ASC
  `);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Territory & Location Management" 
        subtitle="Manage hierarchical operational regions across India (States, City Hubs, Service Zones)"
        badge={`${cities.length} Active Hubs`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add City Hub Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
            + Add Operational City Hub
          </h2>
          <form action={async (formData: FormData) => {
            "use server";
            const stateId = Number(formData.get("stateId"));
            const cityName = formData.get("cityName") as string;
            if (stateId && cityName) {
              await db.query("INSERT INTO cities (state_id, name, status) VALUES (?, ?, 'active')", [stateId, cityName]);
              revalidatePath("/super-admin/locations");
            }
          }} className="space-y-3">
            <div>
              <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Select State *</label>
              <select name="stateId" required className="w-full text-xs p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none bg-white">
                {states.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code || s.name})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">City Hub Name *</label>
              <input type="text" name="cityName" required placeholder="e.g. Chandigarh" className="w-full text-xs p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none" />
            </div>
            <button type="submit" className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded transition-all cursor-pointer">
              Add Operational City Hub
            </button>
          </form>
        </div>

        {/* Cities Table */}
        <div className="md:col-span-2">
          <DataTable 
            title="Operational Service Cities" 
            subtitle="Cities enabled for consumer booking and partner lead matching"
            count={cities.length}
          >
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">City Hub</th>
                  <th className="px-4 py-3">State / Region</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {cities.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-400">#{c.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 text-slate-600">{c.state_name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status || "active"} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={async () => {
                        "use server";
                        await db.query("DELETE FROM cities WHERE id = ?", [c.id]);
                        revalidatePath("/super-admin/locations");
                      }}>
                        <button type="submit" className="text-rose-600 hover:text-rose-800 font-bold text-2xs uppercase">
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        </div>
      </div>
    </div>
  );
}
