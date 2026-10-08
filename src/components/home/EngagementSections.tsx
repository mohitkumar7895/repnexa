import Link from "next/link";

export interface ReviewItem {
  id: number;
  rating: number;
  comment: string;
  customer_name: string;
  partner_name?: string;
}

export function CustomerReviews({ reviews }: { reviews: ReviewItem[] }) {
  return (
    <section id="reviews" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block">
              Customer Testimonials
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Verified Customer Feedback
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Reviews after a finished visit.
            </p>
          </div>
          <Link href="/customer/dashboard" className="text-xs font-bold text-purple-700 hover:text-purple-900">
            Submit Your Review →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-amber-500 font-bold text-sm">
                    {"★".repeat(Math.round(r.rating || 5))}{" "}
                    <span className="text-slate-400 font-mono text-xs">({Number(r.rating).toFixed(1)})</span>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    &quot;{r.comment}&quot;
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-2xs">
                  <span className="font-bold text-slate-900">{r.customer_name}</span>
                  <span className="text-purple-700 font-semibold">{r.partner_name || "Certified Partner"}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-6 text-slate-400 text-xs">
              No reviews published yet. Completed services will display live feedback here.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function PartnerCta() {
  return (
    <section className="py-16 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-2xs font-bold uppercase tracking-wider border border-orange-500/30">
              Technician Onboarding Program
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Are You an Appliance Technician or Workshop Owner?
            </h2>
            <p className="text-slate-300 text-sm max-w-xl">
              ID first. Leads after 4 checks. Commission from 15%.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/become-partner"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-lg hover:opacity-95 transition-all"
              >
                Apply as a partner
              </Link>
              <Link
                href="/partner/dashboard"
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all"
              >
                Partner Login
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3">
            <div className="text-xs uppercase font-bold text-orange-400 tracking-wider">Partner Benefits</div>
            <ul className="space-y-2 text-xs text-slate-200">
              <li className="flex items-center space-x-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Zero upfront franchise or monthly listing fees</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Leads open after the four proof checks pass</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Bank withdrawal after the wallet minimum is reached</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Digital job card management and customer OTP security</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
