import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { revalidatePath } from "next/cache";

export default async function SuperAdminCouponsPage() {
  const [coupons]: any = await db.query("SELECT * FROM coupons ORDER BY id DESC");

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Promotions & Coupon Engine" 
        subtitle="Create discount voucher codes for consumer bookings (percentage or flat discounts)"
        badge={`${coupons.length} Active Codes`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Coupon Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
            + Create Discount Coupon
          </h2>

          <form action={async (formData: FormData) => {
            "use server";
            const code = (formData.get("code") as string)?.toUpperCase();
            const discountType = formData.get("discountType") as string;
            const discountValue = Number(formData.get("discountValue"));
            const minOrder = Number(formData.get("minOrder")) || 0;
            const maxDiscount = Number(formData.get("maxDiscount")) || 500;

            if (code && discountValue > 0) {
              await db.query(
                `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, status)
                 VALUES (?, ?, ?, ?, ?, 'active')`,
                [code, discountType, discountValue, minOrder, maxDiscount]
              );
              revalidatePath("/super-admin/coupons");
            }
          }} className="space-y-3">
            <div>
              <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Coupon Code *</label>
              <input type="text" name="code" required placeholder="e.g. FESTIVE20" className="w-full text-xs font-mono font-bold uppercase p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Type *</label>
                <select name="discountType" className="w-full text-xs p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none bg-white">
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Discount Value *</label>
                <input type="number" name="discountValue" required placeholder="e.g. 15 or 100" min="1" className="w-full text-xs font-mono p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Min Order (₹)</label>
                <input type="number" name="minOrder" defaultValue="499" className="w-full text-xs font-mono p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-2xs font-semibold text-slate-700 uppercase mb-1">Max Cap (₹)</label>
                <input type="number" name="maxDiscount" defaultValue="300" className="w-full text-xs font-mono p-2 border border-slate-300 rounded focus:border-purple-600 focus:outline-none" />
              </div>
            </div>

            <button type="submit" className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer">
              Publish Coupon Code
            </button>
          </form>
        </div>

        {/* Coupons Table */}
        <div className="lg:col-span-2">
          <DataTable title="All Promotional Vouchers" count={coupons.length}>
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Conditions</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {coupons.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-purple-700 text-sm">{c.code}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {c.discount_type === 'PERCENTAGE' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-2xs">
                      Min: ₹{Number(c.min_order_amount).toFixed(0)} • Max Cap: ₹{Number(c.max_discount_amount).toFixed(0)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={async () => {
                        "use server";
                        await db.query("DELETE FROM coupons WHERE id = ?", [c.id]);
                        revalidatePath("/super-admin/coupons");
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
      </div>
    </div>
  );
}
