import { db } from "@/lib/db";
import { updateJobStatus, uploadJobPhotoProof, sendJobOtpToEmail } from "@/app/actions/portal-actions";
import Image from "next/image";
import { FileUpload } from "@/components/ui/FileUpload";
import { getCurrentPartner } from "@/lib/partner";
import { CompleteJobForm } from "@/components/partner/CompleteJobForm";
import { JobBillDesk } from "@/components/partner/JobBillDesk";
import { ensurePortalTables } from "@/lib/portal-setup";

export default async function PartnerJobsPage() {
  const partner = await getCurrentPartner();
  const partnerId = Number(partner.id) || 0;
  await ensurePortalTables();

  const [jobs]: any = await db.query(`
    SELECT j.*, l.lead_code, l.customer_name, l.customer_phone, l.customer_address, l.problem_description, l.coupon_code, l.discount_amount, s.title as service_title
    FROM jobs j
    LEFT JOIN leads l ON j.lead_id = l.id
    LEFT JOIN services s ON l.service_id = s.id
    WHERE j.partner_id = ?
    ORDER BY j.id DESC
  `, [partnerId]);

  const [billRows]: any = await db.query(
    "SELECT * FROM job_bill_items WHERE partner_id = ? ORDER BY id ASC",
    [partnerId]
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Jobs Execution Console</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your service visits in real-time. Upload mandatory Before & After quality photo proofs and complete jobs with customer OTP verification.</p>
      </div>

      {/* Jobs List */}
      <div className="space-y-6">
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <div className="text-3xl mb-2">🛠️</div>
            <h2 className="text-base font-bold text-slate-700">No Jobs Assigned Yet</h2>
            <p className="text-xs text-slate-400 mt-1">Accept available leads from the Leads Marketplace to receive service jobs.</p>
          </div>
        ) : (
          jobs.map((job: any) => {
            const isCompleted = job.status === "COMPLETED";
            const lines = (billRows || []).filter((line: any) => line.job_id === job.id);
            const linesTotal = lines.reduce((sum: number, line: any) => sum + Number(line.qty) * Number(line.unit_price), 0);

            return (
              <div key={job.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded">
                      {job.job_code}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-2xs font-bold uppercase ${isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {job.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 font-mono">
                    Created: {new Date(job.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Service & Problem */}
                  <div className="space-y-2">
                    <span className="text-2xs uppercase tracking-wider text-slate-400 font-bold block">Service Requirement</span>
                    <h3 className="font-bold text-slate-900 text-sm">{job.service_title}</h3>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {job.problem_description}
                    </p>
                    {!isCompleted && (
                      <div className="text-xs bg-purple-50 text-purple-900 border border-purple-200 p-2.5 rounded-lg font-medium space-y-1.5">
                        <p className="text-2xs text-slate-600">
                          Ask the customer for the code on their booking. Do not close the job without it.
                        </p>
                        <form action={async () => {
                          "use server";
                          await sendJobOtpToEmail(job.id);
                        }}>
                          <button type="submit" className="text-2xs font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer">
                            Resend OTP to Customer's Email ↗
                          </button>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Customer Contact */}
                  <div className="space-y-2">
                    <span className="text-2xs uppercase tracking-wider text-slate-400 font-bold block">Customer & Location</span>
                    <div className="font-bold text-slate-900 text-sm">{job.customer_name}</div>
                    <div className="text-xs font-mono text-purple-700 font-bold">📞 {job.customer_phone}</div>
                    <div className="text-xs text-slate-600">📍 {job.customer_address}</div>
                  </div>
                </div>

                {/* 📸 Quality Control: Before & After Photo Proofs Section */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">📸</span>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Technician Quality Proofs (Before & After Photos)
                      </h4>
                    </div>
                    <span className="text-2xs text-slate-400">Guarantees zero customer disputes</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Before Photo Card */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-2xs font-bold uppercase text-slate-600">1. Damaged / Faulty Part (Before)</span>
                        {job.before_photo_url ? (
                          <span className="text-2xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ✓ Uploaded
                          </span>
                        ) : (
                          <span className="text-2xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Required
                          </span>
                        )}
                      </div>

                      {job.before_photo_url ? (
                        <div className="relative w-full h-36 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                          <Image
                            src={job.before_photo_url}
                            alt="Before repair proof"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-full h-36 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-3 text-center">
                          <span className="text-2xl mb-1">📷</span>
                          <span className="text-2xs">Capture faulty part before starting repair</span>
                        </div>
                      )}

                      <form action={async (formData: FormData) => {
                        "use server";
                        await uploadJobPhotoProof(formData);
                      }} className="space-y-2 pt-1">
                        <input type="hidden" name="jobId" value={job.id} />
                        <input type="hidden" name="photoType" value="before" />
                        <FileUpload
                          name="photoUrl"
                          defaultValue={job.before_photo_url || ""}
                          placeholder="Upload / Capture Before Photo"
                          required
                        />
                        <button
                          type="submit"
                          className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-2xs rounded cursor-pointer transition-all"
                        >
                          Save Before Proof
                        </button>
                      </form>
                    </div>

                    {/* After Photo Card */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-2xs font-bold uppercase text-slate-600">2. Fixed & Tested Machine (After)</span>
                        {job.after_photo_url ? (
                          <span className="text-2xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Photo saved
                          </span>
                        ) : (
                          <span className="text-2xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Required
                          </span>
                        )}
                      </div>

                      {job.after_photo_url ? (
                        <div className="relative w-full h-36 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                          <Image
                            src={job.after_photo_url}
                            alt="After repair proof"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-full h-36 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-3 text-center">
                          <span className="text-2xl mb-1">✨</span>
                          <span className="text-2xs">Capture fully working appliance post-repair</span>
                        </div>
                      )}

                      <form action={async (formData: FormData) => {
                        "use server";
                        await uploadJobPhotoProof(formData);
                      }} className="space-y-2 pt-1">
                        <input type="hidden" name="jobId" value={job.id} />
                        <input type="hidden" name="photoType" value="after" />
                        <FileUpload
                          name="photoUrl"
                          defaultValue={job.after_photo_url || ""}
                          placeholder="Upload / Capture After Photo"
                          required
                        />
                        <button
                          type="submit"
                          className="w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-2xs rounded cursor-pointer transition-all"
                        >
                          Save After Proof
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Actions / Workflow Transitions */}
                {!isCompleted ? (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Update Progress:</span>

                      {job.status === "SCHEDULED" && (
                        <form action={async () => {
                          "use server";
                          await updateJobStatus(job.id, "PARTNER_ON_THE_WAY");
                        }}>
                          <button type="submit" className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">
                            🚗 On The Way
                          </button>
                        </form>
                      )}

                      {job.status === "PARTNER_ON_THE_WAY" && (
                        <form action={async () => {
                          "use server";
                          await updateJobStatus(job.id, "ARRIVED");
                        }}>
                          <button type="submit" className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer">
                            📍 Arrived at Customer Location
                          </button>
                        </form>
                      )}

                      {job.status === "ARRIVED" && (
                        <form action={async () => {
                          "use server";
                          await updateJobStatus(job.id, "WORK_IN_PROGRESS");
                        }}>
                          <button type="submit" className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer">
                            🔧 Start Diagnosis & Work
                          </button>
                        </form>
                      )}
                    </div>

                    <JobBillDesk jobId={job.id} lines={lines} billRequested={Number(job.bill_requested) === 1} />

                    <CompleteJobForm
                      jobId={job.id}
                      suggestedAmount={Number(job.estimate_amount || job.final_amount || 0)}
                      couponCode={job.coupon_code}
                      discountAmount={Number(job.discount_amount || 0)}
                      lockedAmount={linesTotal}
                    />
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-700">✓ Job Successfully Delivered & Quality Verified</span>
                    <div className="font-mono text-slate-800">
                      Billed: <span className="font-bold">₹{Number(job.final_amount).toFixed(0)}</span> | 
                      Your Earning: <span className="font-bold text-emerald-700">₹{Number(job.partner_earnings).toFixed(0)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
