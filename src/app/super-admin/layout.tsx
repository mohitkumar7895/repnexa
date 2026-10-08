import { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { logoutUser } from "@/app/actions/auth-actions";
import { getSession } from "@/lib/auth";
import { PortalShell, NavSection } from "@/components/portal/PortalShell";

const SUPER_ADMIN_NAV: NavSection[] = [
  {
    items: [
      { href: "/super-admin/dashboard", label: "📊 Overview & KPIs" },
    ],
  },
  {
    title: "Operations Engine",
    items: [
      { href: "/super-admin/leads", label: "🎯 Leads & Dispatch" },
      { href: "/super-admin/jobs", label: "🛠️ Service Jobs" },
      { href: "/super-admin/support", label: "💬 Support & Complaints" },
    ],
  },
  {
    title: "Access & Staff",
    items: [
      { href: "/super-admin/staff", label: "👥 Internal Staff & Admins" },
    ],
  },
  {
    title: "Partner Management",
    items: [
      { href: "/super-admin/partners", label: "👨‍🔧 Partners & KYC" },
      { href: "/super-admin/wallet", label: "💳 Finance & Wallets" },
      { href: "/super-admin/withdrawals", label: "🏦 Payout Withdrawals" },
    ],
  },
  {
    title: "Configuration & Rules",
    items: [
      { href: "/super-admin/services", label: "📦 Services & Pricing CMS" },
      { href: "/super-admin/coupons", label: "🎟️ Coupons & Offers" },
      { href: "/super-admin/reviews", label: "⭐ Customer Reviews" },
      { href: "/super-admin/reports", label: "📈 Reports & Analytics" },
      { href: "/super-admin/locations", label: "🗺️ Territory & Hubs" },
      { href: "/super-admin/settings", label: "⚙️ Business Rules" },
      { href: "/super-admin/audit-logs", label: "🛡️ Audit Logs" },
    ],
  },
];

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  if (pathname === "/super-admin/login" || pathname === "/super-admin/register") {
    return <>{children}</>;
  }

  async function handleLogout() {
    "use server";
    await logoutUser("/super-admin/login");
  }

  const session: any = await getSession();
  const adminName = session?.name || "Super Admin";
  const adminEmail = session?.email || "";

  return (
    <PortalShell
      portalBadge={{ text: "Admin", colorClass: "bg-purple-600" }}
      logoHref="/super-admin/dashboard"
      navSections={SUPER_ADMIN_NAV}
      userProfile={{
        name: adminName,
        subtitle: "All India Control",
        avatarText: adminName.slice(0, 2).toUpperCase() || "SA",
        avatarColorClass: "bg-purple-600",
      }}
      logoutAction={handleLogout}
      headerTitle="Super Admin Control Center"
      headerSubtitle="| Repnexa Services India"
      headerRightContent={
        <>
          {adminEmail && (
            <span className="hidden md:inline text-slate-500 truncate max-w-[180px]">{adminEmail}</span>
          )}
          <Link
            href="/"
            className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            View Website
          </Link>
        </>
      }
    >
      {children}
    </PortalShell>
  );
}
