import Link from "next/link";
import Image from "next/image";

export default function MasterPortalsDirectoryPage() {
  const portalSections = [
    {
      title: "👑 Super Admin Control Center",
      description: "Complete platform control, dynamic CMS, operations monitoring, staff provisioning, and financial governance.",
      badge: "15 Enterprise Modules",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      credentials: "Staff sign in",
      links: [
        { name: "🔐 Super Admin Secure Login", url: "/super-admin/login", desc: "Sign in with password or 1-click demo credentials" },
        { name: "Overview & Real-Time KPIs", url: "/super-admin/dashboard", desc: "Live network metrics, pipeline funnel, action alerts" },
        { name: "Leads & Dispatch Engine", url: "/super-admin/leads", desc: "Customer service requests, city hub matching" },
        { name: "Service Jobs & Quality Proofs", url: "/super-admin/jobs", desc: "OTP verifications & Before/After physical photos" },
        { name: "Partners & KYC Verification", url: "/super-admin/partners", desc: "Approve, reject, or request changes on technician documents" },
        { name: "Services & Pricing CMS", url: "/super-admin/services", desc: "Add/edit appliance categories, rates, and service listings" },
        { name: "Internal Staff & Access Control", url: "/super-admin/staff", desc: "Provision department managers without public registration" },
        { name: "Finance & Partner Wallets", url: "/super-admin/wallet", desc: "Prepaid float monitoring and ledger balance" },
        { name: "Payout Withdrawals", url: "/super-admin/withdrawals", desc: "Approve bank transfers & auto-refund rejected payouts" },
        { name: "Locations & Hubs", url: "/super-admin/locations", desc: "Manage states, operational cities, and pincodes" },
        { name: "Coupons & Discounts", url: "/super-admin/coupons", desc: "Promotional codes and customer discount campaigns" },
        { name: "Customer Reviews Moderation", url: "/super-admin/reviews", desc: "Star ratings, verified testimonials, review flags" },
        { name: "Business Reports & Analytics", url: "/super-admin/reports", desc: "Revenue charts, demand trends, category breakdown" },
        { name: "Support & Dispute Tickets", url: "/super-admin/support", desc: "Customer complaints and resolution tickets" },
        { name: "Platform Settings & Rules", url: "/super-admin/settings", desc: "Non-hardcoded commission %, lead fees, company info" },
        { name: "System Audit Logs", url: "/super-admin/audit-logs", desc: "Full security event trail and administrative actions" }
      ]
    },
    {
      title: "👨‍🔧 Technician Partner Operations Portal",
      description: "Dedicated dashboard for service partners to accept leads, execute jobs, upload quality photo proofs, and withdraw earnings.",
      badge: "8 Operations Modules",
      badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
      credentials: "Workshop sign in",
      links: [
        { name: "🔐 Partner Secure Sign In", url: "/partner/login", desc: "Technician & workshop login with 1-click demo credentials" },
        { name: "Partner Operations Dashboard", url: "/partner/dashboard", desc: "Prepaid float counter, readiness status, quick actions" },
        { name: "Available Leads Marketplace", url: "/partner/leads", desc: "Browse unassigned customer leads in your hub" },
        { name: "Active Jobs & Photo Uploads", url: "/partner/jobs", desc: "Execute job milestones, upload Before/After photos & verify OTP" },
        { name: "🎁 Referrals & Tier Gamification", url: "/partner/referrals", desc: "Invite technicians and track referral bonuses" },
        { name: "🪪 Official Digital ID Card", url: "/partner/id-card", desc: "Official verified Repnexa credential badge with QR code & print capability" },
        { name: "Workshop Profile & KYC Info", url: "/partner/profile", desc: "Update workshop address, phone, GST, PAN, Aadhaar & radius" },
        { name: "Float Wallet & Top-up", url: "/partner/wallet", desc: "Prepaid float balance and transaction ledger" },
        { name: "Bank & UPI Payouts", url: "/partner/withdrawals", desc: "Submit payout requests directly to your bank account" }
      ]
    },
    {
      title: "🛒 Customer Portal & Public Web",
      description: "Consumer-facing touchpoints for doorstep appliance repair booking, live service tracking, and verified reviews.",
      badge: "Public Access",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      credentials: "Track with mobile or booking code",
      links: [
        { name: "Homepage & Brand Showcase", url: "/", desc: "Hero banner, 8 appliance categories, trust pillars & how it works" },
        { name: "Book Doorstep Repair", url: "/book", desc: "3-step interactive booking form (Appliance -> Problem -> Address)" },
        { name: "Appliance Services Directory", url: "/services", desc: "Complete catalogue of all active appliance categories" },
        { name: "Customer Service Tracking", url: "/customer/dashboard", desc: "Track technician arrival, OTP, photos & submit star review" },
        { name: "🔍 Technician ID", url: "/verify/PTR-DEL-1001", desc: "Green = cleared. Red = stop." },
        { name: "Become a Service Partner", url: "/become-partner", desc: "Public multi-step technician registration & KYC application" },
        { name: "Customer Support & Helpdesk", url: "/support", desc: "Submit queries, call helpline, or file complaint" }
      ]
    },
    {
      title: "🔐 Authentication & Access Portals",
      description: "Administrative login screens and partner onboarding entry points.",
      badge: "Security & RBAC",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
      credentials: "Role-based authentication powered by Bcrypt & MariaDB",
      links: [
        { name: "Unified Portal Sign In", url: "/login", desc: "Single sign-in for Partners, Staff, and Administrators" },
        { name: "Super Admin Gateway", url: "/super-admin/login", desc: "Direct platform administration control login" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
          <Link href="/" className="min-w-0">
            <div className="relative w-28 sm:w-40 h-9 sm:h-11">
              <Image src="/logo.png" alt="Repnexa" fill className="object-contain object-left" priority sizes="160px" />
            </div>
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Link href="/" className="hidden sm:inline px-3 py-2 rounded-lg border border-slate-300 text-slate-700">Home</Link>
            <Link href="/super-admin/dashboard" className="px-2.5 py-2 rounded-lg bg-slate-900 text-white">Admin</Link>
            <Link href="/partner/dashboard" className="px-2.5 py-2 rounded-lg bg-orange-600 text-white">Partner</Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
            Unified System Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Repnexa Master Access & Portals Directory
          </h1>
          <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
            Every portal in one list.
          </p>
        </div>

        {/* Portals Grid */}
        <div className="space-y-8">
          {portalSections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-black text-slate-900">{section.title}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase border ${section.badgeColor}`}>
                      {section.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{section.description}</p>
                </div>

                <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-2xs font-mono text-slate-600">
                  🔑 <strong className="text-slate-800">Login:</strong> {section.credentials}
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.links.map((link, lIdx) => (
                  <Link
                    key={lIdx}
                    href={link.url}
                    className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all flex flex-col justify-between group space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-purple-700 transition-colors">
                          {link.name}
                        </span>
                        <span className="text-xs text-slate-400 group-hover:text-purple-600 font-bold group-hover:translate-x-1 transition-all">
                          →
                        </span>
                      </div>
                      <p className="text-2xs text-slate-500 mt-1 line-clamp-2">
                        {link.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-3xs font-mono text-slate-400">
                      <span>{link.url}</span>
                      <span className="text-emerald-700 font-bold font-sans">Active (200 OK)</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Repnexa Services India Pvt Ltd • Unified Enterprise Platform Directory
      </footer>
    </div>
  );
}
