import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { revalidatePath } from "next/cache";

export default async function ServicesCMSPage() {
  const [categories]: any = await db.query("SELECT * FROM categories ORDER BY id ASC");
  const [services]: any = await db.query(`
    SELECT s.*, c.title as category_title 
    FROM services s
    LEFT JOIN categories c ON s.category_id = c.id
    ORDER BY s.id DESC
  `);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services & Appliance Catalogue (Dynamic CMS)"
        subtitle="Super Admin has complete control over categories, labour fees, service prices, and active status"
        badge={`${categories.length} Categories • ${services.length} Services`}
      />

      {/* 1. Category Management & Editing Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase">Manage Service Categories ({categories.length})</h2>
            <p className="text-xs text-slate-500">Edit titles, update minimum inspection charges, and toggle customer visibility</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat: any) => (
            <div key={cat.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:border-purple-300 transition-all space-y-3">
              <div className="flex justify-between items-start">
                <span className="font-mono text-2xs text-slate-400 font-bold">CAT #{cat.id}</span>
                <StatusBadge status={cat.status || "Active"} />
              </div>

              {/* Edit Category Form */}
              <form action={async (formData: FormData) => {
                "use server";
                const title = formData.get("title") as string;
                const labour = Number(formData.get("labour"));
                const status = formData.get("status") as string;

                if (title) {
                  await db.query(
                    "UPDATE categories SET title = ?, labour_charges = ?, status = ? WHERE id = ?",
                    [title, labour, status, cat.id]
                  );
                  revalidatePath("/super-admin/services");
                  revalidatePath("/");
                  revalidatePath("/book");
                }
              }} className="space-y-2">
                <div>
                  <label className="block text-2xs font-semibold text-slate-500 uppercase">Category Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={cat.title}
                    required
                    className="w-full text-xs font-bold p-1.5 border border-slate-300 rounded bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-2xs font-semibold text-slate-500 uppercase">Inspection Fee (₹)</label>
                    <input
                      type="number"
                      name="labour"
                      defaultValue={cat.labour_charges || 299}
                      className="w-full text-xs font-mono p-1.5 border border-slate-300 rounded bg-white focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-semibold text-slate-500 uppercase">Status</label>
                    <select
                      name="status"
                      defaultValue={cat.status || "Active"}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white focus:border-purple-600 focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-2xs transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>

                  <button
                    formAction={async () => {
                      "use server";
                      await db.query("DELETE FROM categories WHERE id = ?", [cat.id]);
                      revalidatePath("/super-admin/services");
                    }}
                    type="submit"
                    className="text-2xs text-rose-600 hover:text-rose-800 font-bold uppercase"
                  >
                    Delete
                  </button>
                </div>
              </form>
            </div>
          ))}

          {/* Quick Add New Category Card */}
          <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-white flex flex-col justify-center space-y-3">
            <span className="text-xs font-bold uppercase text-purple-700">+ Add New Category</span>
            <form action={async (formData: FormData) => {
              "use server";
              const title = formData.get("title") as string;
              const labour = Number(formData.get("labour")) || 299;
              if (title) {
                await db.query("INSERT INTO categories (title, labour_charges, status) VALUES (?, ?, 'Active')", [title, labour]);
                revalidatePath("/super-admin/services");
              }
            }} className="space-y-2">
              <input
                type="text"
                name="title"
                required
                placeholder="Category Name"
                className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
              />
              <input
                type="number"
                name="labour"
                defaultValue="299"
                placeholder="Base Inspection ₹"
                className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white font-mono"
              />
              <button
                type="submit"
                className="w-full py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 2. Quick Add Service Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 mb-3">
          + Add New Service to Catalog
        </h2>
        <form action={async (formData: FormData) => {
          "use server";
          const categoryId = Number(formData.get("categoryId"));
          const title = formData.get("title") as string;
          const sellingPrice = Number(formData.get("sellingPrice")) || 499;
          const desc = formData.get("desc") as string;

          if (categoryId && title) {
            await db.query(
              `INSERT INTO services (category_id, title, original_price, selling_price, warranty_days, short_description)
               VALUES (?, ?, ?, ?, 0, ?)`,
              [categoryId, title, sellingPrice + 200, sellingPrice, desc]
            );
            revalidatePath("/super-admin/services");
            revalidatePath("/book");
            revalidatePath("/");
          }
        }} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Parent Category *</label>
            <select name="categoryId" required className="w-full text-xs p-2 border border-slate-300 rounded bg-white focus:border-purple-600 focus:outline-none">
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Service Title *</label>
            <input type="text" name="title" required placeholder="e.g. Inverter PCB Diagnosis" className="w-full text-xs p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Selling Price (₹) *</label>
            <input type="number" name="sellingPrice" defaultValue="499" className="w-full text-xs p-2 border border-slate-300 rounded font-mono focus:border-purple-600 focus:outline-none" />
          </div>
          <div>
            <button type="submit" className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded transition-all cursor-pointer">
              Add Service to Catalog
            </button>
          </div>
        </form>
      </div>

      {/* 3. Services Table with Live Editing */}
      <DataTable title="All Configured Services" count={services.length}>
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Service Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price (₹)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {services.map((s: any) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-slate-400">#{s.id}</td>
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-900">{s.title}</div>
                  <div className="text-2xs text-slate-400 truncate max-w-sm">{s.short_description}</div>
                </td>
                <td className="px-4 py-3 text-slate-700 font-medium">
                  {s.category_title || "General"}
                </td>
                <td className="px-4 py-3 font-mono font-bold text-slate-900">
                  ₹{Number(s.selling_price).toFixed(0)}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-3xs font-bold uppercase bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={async () => {
                    "use server";
                    await db.query("DELETE FROM services WHERE id = ?", [s.id]);
                    revalidatePath("/super-admin/services");
                  }}>
                    <button type="submit" className="text-rose-600 hover:text-rose-800 font-bold text-2xs uppercase">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
