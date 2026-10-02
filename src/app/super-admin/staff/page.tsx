import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ResetPasswordModal } from "@/components/super-admin/ResetPasswordModal";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

export default async function SuperAdminStaffPage() {
  // Fetch staff users (users who have administrative or operational roles)
  const [staffUsers]: any = await db.query(`
    SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.status, u.created_at,
           r.name as role_name
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.role NOT IN ('CUSTOMER', 'PARTNER') OR r.name NOT IN ('CUSTOMER', 'PARTNER')
    ORDER BY u.id ASC
  `);

  const [availableRoles]: any = await db.query(
    "SELECT * FROM roles WHERE name NOT IN ('CUSTOMER', 'PARTNER') ORDER BY id ASC"
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Staff & Administrative Access Control" 
        subtitle="Super Admin provisions and manages department managers, verification officers, and support staff"
        badge={`${staffUsers.length} Internal Staff`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Staff Member Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
            + Provision New Admin / Staff Member
          </h2>

          <form action={async (formData: FormData) => {
            "use server";
            const name = formData.get("name") as string;
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;
            const roleName = formData.get("roleName") as string;
            const phone = formData.get("phone") as string || "7895094129";

            if (name && email && password && roleName) {
              const uid = `usr_staff_${Date.now()}`;
              const hashed = await bcrypt.hash(password, 10);
              
              const [uRes]: any = await db.query(
                "INSERT INTO users (uid, email, password, first_name, phone, role, status) VALUES (?, ?, ?, ?, ?, ?, 'active')",
                [uid, email, hashed, name, phone, roleName]
              );
              const newUserId = uRes.insertId;

              // Map user role in user_roles
              const [roleRows]: any = await db.query("SELECT id FROM roles WHERE name = ?", [roleName]);
              if (roleRows.length > 0) {
                await db.query("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)", [newUserId, roleRows[0].id]);
              }

              // Also add to admins table for compatibility
              await db.query(
                "INSERT INTO admins (name, email, password) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password=VALUES(password)",
                [name, email, hashed]
              );

              revalidatePath("/super-admin/staff");
            }
          }} className="space-y-3">
            <div>
              <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Staff Full Name *</label>
              <input type="text" name="name" required placeholder="Enter staff full name" className="w-full text-xs p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none" />
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Email Address *</label>
              <input type="email" name="email" required placeholder="Enter staff email address" className="w-full text-xs p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none" />
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Temporary Password *</label>
              <input type="password" name="password" required placeholder="••••••••" className="w-full text-xs p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none" />
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Assigned Department Role *</label>
              <select name="roleName" required className="w-full text-xs p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none bg-white">
                {availableRoles.map((r: any) => (
                  <option key={r.id} value={r.name}>{r.name.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Contact Phone</label>
              <input type="tel" name="phone" placeholder="Enter 10-digit mobile number" className="w-full text-xs p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none" />
            </div>

            <button type="submit" className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer">
              Create Staff Account
            </button>
          </form>
        </div>

        {/* Staff Table */}
        <div className="lg:col-span-2">
          <DataTable title="Authorized Administrative Personnel" count={staffUsers.length}>
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Staff Member</th>
                  <th className="px-4 py-3">Department Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {staffUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-400">#{u.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{u.first_name} {u.last_name}</div>
                      <div className="text-2xs text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                        {u.role_name || u.role || "ADMIN"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.status || "active"} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <ResetPasswordModal
                          userId={u.id}
                          userName={`${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email}
                          userEmail={u.email}
                          roleType={u.role_name || u.role || "Staff"}
                          buttonLabel="🔑 Reset Pwd"
                          buttonClassName="px-2 py-1 rounded bg-purple-700 hover:bg-purple-800 text-white font-bold text-2xs uppercase tracking-wider transition-all inline-flex items-center space-x-0.5 cursor-pointer shadow-xs"
                        />
                        {u.email !== "superadmin@repnexa.com" ? (
                          <form action={async () => {
                            "use server";
                            await db.query("DELETE FROM users WHERE id = ?", [u.id]);
                            revalidatePath("/super-admin/staff");
                          }}>
                            <button type="submit" className="text-rose-600 hover:text-rose-800 font-bold text-2xs uppercase cursor-pointer">
                              Revoke
                            </button>
                          </form>
                        ) : (
                          <span className="text-2xs text-slate-400 font-bold uppercase">Root</span>
                        )}
                      </div>
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
