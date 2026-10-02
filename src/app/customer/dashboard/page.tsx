import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import CustomerDashboardClient, { BookingRecord } from "@/components/customer/CustomerDashboardClient";

export default async function CustomerDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; leadCode?: string; phone?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const queryTerm = (resolvedParams.q || resolvedParams.leadCode || resolvedParams.phone || "").trim();

  let requests: BookingRecord[] = [];

  const baseSelect = `
    SELECT l.*, 
           s.title as service_title, 
           s.selling_price, 
           s.warranty_days,
           c.name as city_name,
           p.business_name as partner_name, 
           u.phone as partner_phone,
           p.rating as partner_rating,
           p.total_completed_jobs as partner_total_jobs,
           j.id as job_id, 
           j.status as job_status, 
           j.completion_otp, 
           j.before_photo_url, 
           j.after_photo_url,
           j.final_amount,
           custUser.email as customer_email
    FROM leads l
    LEFT JOIN services s ON l.service_id = s.id
    LEFT JOIN cities c ON l.city_id = c.id
    LEFT JOIN partners p ON l.assigned_partner_id = p.id
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN jobs j ON j.lead_id = l.id
    LEFT JOIN customers cust ON l.customer_id = cust.id
    LEFT JOIN users custUser ON cust.user_id = custUser.id
  `;

  if (queryTerm) {
    const cleanDigits = queryTerm.replace(/\D/g, "");
    if (cleanDigits.length >= 7) {
      // Search by mobile number
      const [rows]: any = await db.query(
        `
        ${baseSelect}
        WHERE l.customer_phone LIKE ? OR l.lead_code = ?
        ORDER BY l.id DESC
      `,
        [`%${cleanDigits}%`, queryTerm]
      );
      requests = rows;
    } else {
      // Search by Lead Code
      const [rows]: any = await db.query(
        `
        ${baseSelect}
        WHERE l.lead_code = ? OR l.customer_phone LIKE ?
        ORDER BY l.id DESC
      `,
        [queryTerm, `%${queryTerm}%`]
      );
      requests = rows;
    }
  } else {
    // Default: Show latest customer bookings
    const [rows]: any = await db.query(`
      ${baseSelect}
      ORDER BY l.id DESC
      LIMIT 15
    `);
    requests = rows;
  }

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Top Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-36 sm:w-44 h-10 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Repnexa Doorstep Care"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors hidden sm:block"
            >
              Home
            </Link>
            <Link
              href="/become-partner"
              className="text-xs font-semibold text-purple-700 hover:text-purple-800 px-3 py-2 rounded-xl hover:bg-purple-50 transition-colors hidden sm:block"
            >
              Join as Partner
            </Link>
            <Link
              href="/book"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-500 hover:to-purple-500 text-white font-bold text-xs shadow-sm hover:shadow transition-all"
            >
              + Book Repair
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Modern Hero & Search Banner */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
          {/* Subtle Ambient Backlight Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-3xs font-bold uppercase tracking-wider text-purple-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Service Tracking</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Customer Service & Booking Hub
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Track technician arrival in real-time, view verified doorstep OTP, and manage your completed appliance service records.
            </p>

            {/* Instant Search Bar */}
            <div className="pt-1">
              <form method="GET" action="/customer/dashboard" className="relative flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 text-sm">
                    🔍
                  </span>
                  <input
                    type="text"
                    name="q"
                    defaultValue={queryTerm}
                    placeholder="Enter Mobile Number or Booking Code..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:bg-white focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer whitespace-nowrap"
                  >
                    Track
                  </button>

                  {queryTerm && (
                    <Link
                      href="/customer/dashboard"
                      className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      Clear
                    </Link>
                  )}
                </div>
              </form>

              {/* Sample Quick Searches */}
              <div className="flex flex-wrap items-center gap-2 mt-2.5 text-3xs text-slate-400">
                <span className="font-semibold text-slate-300">Quick:</span>
                <Link
                  href="/customer/dashboard"
                  className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 transition-colors"
                >
                  All Recent Bookings
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Client Interface: Tabs, KPIs, Stepper, Invoices, Proofs */}
        <CustomerDashboardClient
          requests={requests}
          initialQuery={queryTerm}
          leadCodeParam={resolvedParams.leadCode}
        />
      </main>
    </div>
  );
}
