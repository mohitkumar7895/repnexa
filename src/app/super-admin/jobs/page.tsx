import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Image from "next/image";
import { ensurePortalTables } from "@/lib/portal-setup";

export default async function SuperAdminJobsPage() {
  await ensurePortalTables();
  const [jobs]: any = await db.query(`
    SELECT j.*, l.lead_code, l.problem_description, s.title as service_title,
           p.business_name as partner_name, p.partner_code,
           u.first_name as customer_name, u.phone as customer_phone
    FROM jobs j
    LEFT JOIN leads l ON j.lead_id = l.id
    LEFT JOIN services s ON l.service_id = s.id
    LEFT JOIN partners p ON j.partner_id = p.id
    LEFT JOIN customers c ON j.customer_id = c.id
    LEFT JOIN users u ON c.user_id = u.id
    ORDER BY j.id DESC
  `);

  const [billLines]: any = await db.query(`
    SELECT bi.*, j.job_code, j.bill_requested, p.business_name, p.partner_code
    FROM job_bill_items bi
    JOIN jobs j ON j.id = bi.job_id
    JOIN partners p ON p.id = bi.partner_id
    ORDER BY bi.id DESC
    LIMIT 40
  `);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Service Jobs & Quality Control Operations" 
        subtitle="Audit technician execution, customer OTP verifications, and Before/After physical repair proofs"
        badge={`${jobs.length} Active & Fulfilled Jobs`}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
        <h2 className="text-sm font-black text-slate-900">Partner bill lines</h2>
        {(billLines || []).length === 0 ? (
          <p className="text-xs text-slate-500">No extra parts saved yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {(billLines || []).map((line: any) => (
              <li key={line.id} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
                <span className="font-semibold text-slate-900">{line.business_name} · {line.partner_code}</span>
                <span>{line.job_code}: {line.item_name} × {line.qty}</span>
                <span className="font-mono">₹{(Number(line.qty) * Number(line.unit_price)).toLocaleString("en-IN")} · {Number(line.bill_requested) === 1 ? "Bill shared" : "Saved only"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DataTable title="All Service Jobs & Inspection Proofs" count={jobs.length}>
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Job Code</th>
              <th className="px-4 py-3">Service & Customer</th>
              <th className="px-4 py-3">Assigned Partner</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">OTP</th>
              <th className="px-4 py-3">Quality Proofs (Before / After)</th>
              <th className="px-4 py-3">Billing & Comm.</th>
              <th className="px-4 py-3 text-right">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {jobs.map((j: any) => (
              <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-slate-900">
                  {j.job_code || `JOB-${j.id}`}
                  <span className="text-2xs text-slate-400 block font-sans font-normal">
                    {new Date(j.created_at).toLocaleDateString('en-IN')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-900">{j.service_title || "Appliance Service"}</div>
                  <div className="text-slate-600 text-2xs">{j.customer_name} • <span className="font-mono">{j.customer_phone}</span></div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-purple-700">{j.partner_name}</div>
                  <div className="text-2xs font-mono text-slate-400">{j.partner_code}</div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={j.status} />
                </td>
                <td className="px-4 py-3 font-mono font-bold text-slate-700">
                  {j.completion_otp ? (
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                      {j.completion_otp}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>

                {/* 📸 Before & After Photos Column */}
                <td className="px-4 py-3">
                  {j.before_photo_url || j.after_photo_url ? (
                    <div className="flex items-center space-x-2">
                      {j.before_photo_url ? (
                        <a 
                          href={j.before_photo_url} 
                          target="_blank" 
                          rel="noreferrer"
                          title="View Before Repair Photo"
                          className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-300 hover:scale-105 transition-all block shrink-0"
                        >
                          <Image src={j.before_photo_url} alt="Before" fill className="object-cover" unoptimized />
                          <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-3xs text-center font-bold">
                            Before
                          </span>
                        </a>
                      ) : (
                        <span className="text-3xs text-slate-400 italic">No Before</span>
                      )}

                      {j.after_photo_url ? (
                        <a 
                          href={j.after_photo_url} 
                          target="_blank" 
                          rel="noreferrer"
                          title="View After Repair Photo"
                          className="relative w-10 h-10 rounded-lg overflow-hidden border border-emerald-400 hover:scale-105 transition-all block shrink-0"
                        >
                          <Image src={j.after_photo_url} alt="After" fill className="object-cover" unoptimized />
                          <span className="absolute bottom-0 inset-x-0 bg-emerald-800/90 text-white text-3xs text-center font-bold">
                            After
                          </span>
                        </a>
                      ) : (
                        <span className="text-3xs text-slate-400 italic">No After</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-2xs text-slate-400 italic bg-slate-100 px-2 py-0.5 rounded">
                      Pending Upload
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 font-mono">
                  <div className="font-bold text-slate-900">₹{Number(j.final_amount || j.estimate_amount || 0).toFixed(0)}</div>
                  <div className="text-2xs text-emerald-700 font-semibold font-sans">Comm: ₹{Number(j.platform_commission || 0).toFixed(0)}</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <StatusBadge status={j.payment_status || "pending"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
