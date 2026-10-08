import { db } from "@/lib/db";
import { createServiceRequest } from "@/app/actions/portal-actions";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default async function BookingPage({ searchParams }: { searchParams?: Promise<{ category?: string; service?: string; error?: string }> }) {
  const sp = searchParams ? await searchParams : {};
  const todayIndia = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  // Fetch dynamic categories, services, brands, and cities from MySQL
  const [categories]: any = await db.query("SELECT * FROM categories WHERE status = 'Active' ORDER BY id ASC");
  const [services]: any = await db.query("SELECT id, category_id, title, selling_price, warranty_days FROM services ORDER BY title ASC");
  const [brands]: any = await db.query("SELECT DISTINCT name, category FROM brands WHERE status = 'Active' ORDER BY name ASC");
  const [cities]: any = await db.query("SELECT c.id, c.name, s.name as state_name FROM cities c JOIN states s ON c.state_id = s.id ORDER BY c.name ASC");

  async function handleBooking(formData: FormData) {
    "use server";
    const res = await createServiceRequest(formData);

    if (res.success && res.leadCode) {
      redirect(`/customer/dashboard?leadCode=${res.leadCode}`);
    }
    redirect(`/book?error=${encodeURIComponent(res.error || "Booking could not be saved.")}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center min-w-0">
            <div className="relative w-28 sm:w-40 h-9 sm:h-10 shrink-0">
              <Image src="/logo.png" alt="Repnexa" fill className="object-contain object-left" priority sizes="160px" />
            </div>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-semibold">
            <Link href="/" className="hidden sm:inline text-slate-600 dark:text-slate-300">Home</Link>
            <ThemeToggle />
            <Link href="/become-partner" className="hidden md:inline text-purple-600">Partner</Link>
            <Link href="/customer/dashboard" className="px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">Track</Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 sm:p-8">
            <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Verified Appliance & Electronic Repair
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Book a visit</h1>
            <p className="mt-2 text-slate-300 text-sm">Cleared technician. Your city only.</p>
          </div>

          {/* Booking Form */}
          <form action={handleBooking} className="p-6 sm:p-8 space-y-8">
            {sp?.error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
                {sp.error}
              </div>
            )}
            {/* Step 1: Select Service */}
            <div>
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold">1</span>
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">Select Appliance & Service</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Service Type *</label>
                  <input
                    type="text"
                    name="serviceName"
                    list="service-options"
                    required
                    defaultValue={sp?.category || sp?.service || ""}
                    placeholder="Pick a service from the suggestions"
                    autoComplete="off"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-purple-600 focus:outline-none"
                  />
                  <datalist id="service-options">
                    {services.map((s: any) => (
                      <option key={s.id} value={s.title} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Brand Name *</label>
                  <input
                    type="text"
                    name="brandName"
                    list="brand-options"
                    required
                    placeholder="Type brand (e.g. Samsung, LG, Voltas, Daikin, Whirlpool, Other)"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-purple-600 focus:outline-none"
                  />
                  <datalist id="brand-options">
                    {brands.map((b: any, idx: number) => (
                      <option key={idx} value={b.name} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Step 2: Problem Description */}
            <div>
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold">2</span>
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">Problem Description</h2>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">What issue are you facing? *</label>
                  <textarea 
                  name="problem" 
                  rows={3} 
                  required
                  minLength={12}
                  placeholder="e.g. AC is not cooling properly, making buzzing noise and water is dripping from indoor unit..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-600 focus:outline-none"
                ></textarea>
              </div>
            </div>

            {/* Step 3: Location & Contact */}
            <div>
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold">3</span>
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">Service Address & Timing</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name *</label>
                  <input type="text" name="customerName" required placeholder="Enter your full name" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mobile Number *</label>
                  <input type="tel" name="customerPhone" required inputMode="numeric" pattern="[6-9][0-9]{9}" title="10-digit mobile number starting with 6, 7, 8, or 9" placeholder="Enter 10-digit mobile number" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address (For Verification & Service OTP) *</label>
                  <input type="email" name="customerEmail" required placeholder="Enter your email address" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">City *</label>
                  <input
                    type="text"
                    name="cityName"
                    list="city-options"
                    required
                    placeholder="Pick a city from the suggestions"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-purple-600 focus:outline-none"
                  />
                  <datalist id="city-options">
                    {cities.map((c: any) => (
                      <option key={c.id} value={c.name}>{c.name} ({c.state_name})</option>
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pincode *</label>
                  <input type="text" name="pincode" required inputMode="numeric" pattern="[1-9][0-9]{5}" title="6-digit pincode" placeholder="Enter 6-digit pincode" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-600 focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Complete Doorstep Address *</label>
                  <textarea name="address" rows={2} required minLength={10} placeholder="Flat/House No, Building, Street, Landmark" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-600 focus:outline-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Coupon code</label>
                  <input type="text" name="couponCode" placeholder="Optional, for example FESTIVE20" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono uppercase focus:border-purple-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Preferred Date *</label>
                  <input type="date" name="preferredDate" required min={todayIndia} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Preferred Time Slot *</label>
                  <select name="preferredTime" required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-purple-600 focus:outline-none">
                    <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (12 PM - 3 PM)">Afternoon (12 PM - 3 PM)</option>
                    <option value="Evening (3 PM - 7 PM)">Evening (3 PM - 7 PM)</option>
                    <option value="Urgent / Immediate Visit">Urgent / Immediate Visit</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                🛡️ Cleared technicians only • Public ID check • Doorstep support
              </div>
              <button 
                type="submit" 
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Confirm & Request Technician →
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
