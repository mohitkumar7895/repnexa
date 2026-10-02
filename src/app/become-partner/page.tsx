import { db } from "@/lib/db";
import { submitPartnerApplication } from "@/app/actions/portal-actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileUpload } from "@/components/ui/FileUpload";

export default async function BecomePartnerPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; code?: string; ref?: string; error?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isSuccess = resolvedParams.success === "1";
  const partnerCode = resolvedParams.code;
  const referralRef = resolvedParams.ref || "";
  const errorMessage = resolvedParams.error;

  const [cities]: any = await db.query("SELECT c.id, c.name, s.name as state_name FROM cities c JOIN states s ON c.state_id = s.id ORDER BY c.name ASC");
  const [categories]: any = await db.query("SELECT * FROM categories WHERE status = 'Active' ORDER BY id ASC");

  async function handlePartnerApplication(formData: FormData) {
    "use server";
    const password = (formData.get("password") as string)?.trim();
    const confirmPassword = (formData.get("confirmPassword") as string)?.trim();

    if (!password || password.length < 6) {
      redirect(`/become-partner?error=${encodeURIComponent("Password must be at least 6 characters long.")}`);
    }

    if (confirmPassword && password !== confirmPassword) {
      redirect(`/become-partner?error=${encodeURIComponent("Passwords do not match. Please verify and re-enter.")}`);
    }

    const res = await submitPartnerApplication(formData);
    if (res.success && res.partnerCode) {
      redirect(`/become-partner?success=1&code=${res.partnerCode}`);
    } else if (res.error) {
      redirect(`/become-partner?error=${encodeURIComponent(res.error)}`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-700 px-6 py-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/20">
                Partner Network
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">Join Repnexa as Service Partner</h1>
              <p className="mt-1 text-sm text-orange-100">
                Get high-paying verified customer leads daily in your city with low commissions & transparent wallet system.
              </p>
            </div>
            <Link href="/" className="hidden sm:inline-block text-xs bg-white text-slate-800 font-bold px-4 py-2 rounded-lg hover:bg-slate-100">
              Back to Home
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center space-x-3 text-rose-800 text-xs font-semibold">
            <span className="text-xl">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Referral Welcome Banner */}
        {referralRef && !isSuccess && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center space-x-3 text-amber-900">
            <span className="text-2xl">🎁</span>
            <div className="text-xs">
              <span className="font-bold">Technician Referral Invite Applied: </span>
              <code className="bg-amber-200/80 px-2 py-0.5 rounded font-mono font-bold">{referralRef}</code>
              <p className="text-amber-700 mt-0.5">
                Complete registration to claim your ₹100 welcome wallet bonus upon operational verification.
              </p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {isSuccess && (
          <div className="p-6 bg-emerald-50 border-b border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <span className="text-3xl">🎉</span>
              <div>
                <h3 className="text-base font-bold text-emerald-900">Partner Account Registered Successfully!</h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Your application ID is <strong className="font-mono font-bold text-slate-900">{partnerCode}</strong>. You can now immediately sign in with your email and the password you just created.
                </p>
              </div>
            </div>
            <Link
              href="/partner/login"
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap"
            >
              Sign In to Partner Portal →
            </Link>
          </div>
        )}
        
        {/* Application Form */}
        <form action={handlePartnerApplication} className="p-6 sm:p-8 space-y-8">
          {/* STEP 1: Basic & Contact */}
          <section>
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold">1</span>
              <h2 className="text-base font-bold text-slate-900 uppercase">Step 1 — Basic & Account Login Credentials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Legal Name *</label>
                <input type="text" name="fullName" required placeholder="Enter full name" className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-purple-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mobile Number (WhatsApp) *</label>
                <input type="tel" name="phone" required placeholder="Enter 10-digit mobile number" className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-purple-600 focus:outline-none font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address (Login ID) *</label>
                <input type="email" name="email" required placeholder="Enter email address" className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-purple-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Primary Operating City *</label>
                <input
                  type="text"
                  name="cityName"
                  list="partner-city-options"
                  required
                  placeholder="Enter operating city (e.g. New Delhi, Jaipur, Patna)"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-purple-600 focus:outline-none bg-white"
                />
                <datalist id="partner-city-options">
                  {cities.map((c: any) => (
                    <option key={c.id} value={c.name}>{c.name} ({c.state_name})</option>
                  ))}
                </datalist>
              </div>

              {/* Password Fields */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Create Login Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="Min 6 characters (for partner login)"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-purple-600 focus:outline-none font-mono"
                />
                <span className="text-3xs text-slate-400 mt-1 block">
                  You will use this password to sign into your Partner Portal
                </span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Confirm Login Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={6}
                  placeholder="Re-enter login password"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-purple-600 focus:outline-none font-mono"
                />
                <span className="text-3xs text-slate-400 mt-1 block">
                  Re-type the same password to verify
                </span>
              </div>

              <div className="md:col-span-2 bg-amber-50/60 p-3 rounded-lg border border-amber-200/70">
                <label className="block text-xs font-semibold text-amber-900 uppercase mb-1 flex items-center justify-between">
                  <span>🎁 Partner Referral / Invite Code (Optional)</span>
                  <span className="text-2xs text-amber-700 font-normal">Earn ₹100 welcome credit</span>
                </label>
                <input
                  type="text"
                  name="referralCode"
                  defaultValue={referralRef}
                  placeholder="e.g. REF-DEL-1001"
                  className="w-full rounded-lg border border-amber-300 p-2 text-sm focus:border-purple-600 focus:outline-none uppercase font-mono bg-white"
                />
              </div>
            </div>
          </section>

          {/* STEP 2: Business Profile */}
          <section>
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold">2</span>
              <h2 className="text-base font-bold text-slate-900 uppercase">Step 2 — Business Profile & Experience</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Agency / Business Name *</label>
                <input type="text" name="businessName" required placeholder="Enter workshop or business name" className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-purple-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Business Entity Type</label>
                <select name="businessType" className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-purple-600 focus:outline-none bg-white">
                  <option value="Proprietorship">Proprietorship / Shop Owner</option>
                  <option value="Individual / Freelancer">Individual Freelance Technician</option>
                  <option value="Partnership / LLP">Partnership / Service Firm</option>
                  <option value="Private Limited">Pvt Ltd Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Years in Service Industry *</label>
                <input type="number" name="experience" min="1" max="40" defaultValue="3" required className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-purple-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Service Skill Category</label>
                <select className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-purple-600 focus:outline-none bg-white">
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Workshop / Office Address *</label>
                <textarea name="address" required placeholder="Shop/Office number, street, area, landmark" className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-purple-600 focus:outline-none" rows={2}></textarea>
              </div>
            </div>
          </section>

          {/* STEP 3: KYC Details */}
          <section>
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold">3</span>
              <h2 className="text-base font-bold text-slate-900 uppercase">Step 3 — KYC Documents & Verification</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Aadhaar Card No. *</label>
                <input type="text" name="aadhaar" required placeholder="12-digit Aadhaar" className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-purple-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">PAN Card No.</label>
                <input type="text" name="pan" placeholder="10-digit PAN" className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-purple-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">GSTIN (Optional)</label>
                <input type="text" name="gst" placeholder="15-digit GST" className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-purple-600 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-100">
              <FileUpload
                name="aadhaarDocUrl"
                label="Upload Aadhaar / Govt ID Proof"
                placeholder="Upload Aadhaar Card Photo / PDF"
              />
              <FileUpload
                name="workshopDocUrl"
                label="Upload Workshop / Tool Photo"
                placeholder="Upload Workshop or Service Van Photo"
              />
            </div>
          </section>

          {/* Submission and info */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-slate-500">
              ℹ️ After submission, our Operations Manager will review your credentials within 24 hours.
            </div>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Submit Partner Application →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
