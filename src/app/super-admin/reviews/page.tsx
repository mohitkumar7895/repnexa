import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { revalidatePath } from "next/cache";

export default async function SuperAdminReviewsPage() {
  const [reviews]: any = await db.query(`
    SELECT r.*, p.business_name as partner_name, p.partner_code
    FROM reviews r
    LEFT JOIN partners p ON r.partner_id = p.id
    ORDER BY r.id DESC
  `);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Customer Reviews & Reputation Moderation" 
        subtitle="Monitor consumer feedback, technician ratings, and approve or flag reviews"
        badge={`${reviews.length} Verified Reviews`}
      />

      <DataTable title="Customer Service Reviews" count={reviews.length}>
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Customer Feedback</th>
              <th className="px-4 py-3">Partner Serviced</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {reviews.map((r: any) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-bold text-amber-500 text-sm whitespace-nowrap">
                  ★ {Number(r.rating).toFixed(1)} / 5.0
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{r.customer_name}</div>
                  <p className="text-2xs text-slate-600 mt-0.5 line-clamp-2">{r.comment}</p>
                  <span className="text-2xs text-slate-400 font-mono mt-1 block">
                    {new Date(r.created_at).toLocaleDateString('en-IN')}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  <div className="font-semibold text-purple-700">{r.partner_name || "Certified Partner"}</div>
                  <div className="text-2xs font-mono text-slate-400">{r.partner_code}</div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status || "approved"} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    {r.status !== "approved" && (
                      <form action={async () => {
                        "use server";
                        await db.query("UPDATE reviews SET status = 'approved' WHERE id = ?", [r.id]);
                        revalidatePath("/super-admin/reviews");
                      }}>
                        <button type="submit" className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xs uppercase">
                          Approve
                        </button>
                      </form>
                    )}
                    {r.status === "approved" && (
                      <form action={async () => {
                        "use server";
                        await db.query("UPDATE reviews SET status = 'flagged' WHERE id = ?", [r.id]);
                        revalidatePath("/super-admin/reviews");
                      }}>
                        <button type="submit" className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold text-2xs uppercase">
                          Flag
                        </button>
                      </form>
                    )}
                    <form action={async () => {
                      "use server";
                      await db.query("DELETE FROM reviews WHERE id = ?", [r.id]);
                      revalidatePath("/super-admin/reviews");
                    }}>
                      <button type="submit" className="px-2 py-1 text-rose-600 hover:text-rose-800 font-bold text-2xs uppercase">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
