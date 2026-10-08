import { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { logoutUser } from "@/app/actions/auth-actions";
import { getCurrentPartner } from "@/lib/partner";
import { getPartnerProof, isDoorstepCleared, passedCheckCount } from "@/lib/verification";
import { PortalShell, NavSection } from "@/components/portal/PortalShell";

const PARTNER_NAV: NavSection[] = [
  {
    items: [
      { href: "/partner/dashboard", label: "📊 Operations Dashboard" },
    ],
  },
  {
    title: "Dispatch & Jobs",
    items: [
      {
        href: "/partner/leads",
        label: "🎯 Available Leads",
        badge: { text: "New", colorClass: "bg-purple-600 text-white" },
      },
      { href: "/partner/jobs", label: "🛠️ Active Jobs" },
    ],
  },
  {
    title: "Finance & Credits",
    items: [
      {
        href: "/partner/wallet",
        label: "💳 Wallet & Top-up",
        badge: { text: "Active", colorClass: "bg-emerald-100 text-emerald-800" },
      },
      { href: "/partner/withdrawals", label: "🏦 Payout & Bank Withdrawal" },
    ],
  },
  {
    title: "Profile & KYC",
    items: [
      { href: "/partner/profile", label: "👨‍🔧 Workshop & Documents" },
      { href: "/partner/profile#security", label: "🔐 Security & Password" },
    ],
  },
  {
    title: "Network & Trust",
    items: [
      {
        href: "/partner/referrals",
        label: "🎁 Refer & Earn ₹100",
        badge: { text: "Hot", colorClass: "bg-amber-500 text-white" },
      },
      {
        href: "/partner/id-card",
        label: "🪪 Digital Partner ID Card",
        badge: { text: "Proof", colorClass: "bg-slate-800 text-white" },
      },
    ],
  },
];

export default async function PartnerLayout({ children }: { children: ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  if (pathname === "/partner/login") {
    return <>{children}</>;
  }

  const partner = await getCurrentPartner();
  const proof = partner.id ? await getPartnerProof(partner.id) : [];
  const doorstepCleared = isDoorstepCleared(partner, passedCheckCount(proof));

  async function handleLogout() {
    "use server";
    await logoutUser("/partner/login");
  }

  return (
    <PortalShell
      portalBadge={{ text: "Partner", colorClass: "bg-orange-600" }}
      logoHref="/partner/dashboard"
      navSections={PARTNER_NAV}
      userProfile={{
        name: partner.business_name,
        subtitle: doorstepCleared ? "Cleared for doorstep entry" : `Proof ${passedCheckCount(proof)}/4`,
        avatarText: partner.business_name?.charAt(0) || "P",
        avatarColorClass: "bg-orange-600",
      }}
      logoutAction={handleLogout}
      headerTitle="Live Partner Portal"
      headerSubtitle={`| Hub: ${partner.city_name || "Delhi NCR"}`}
      headerRightContent={
        <Link
          href="/partner/wallet"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold"
        >
          <span>Float:</span>
          <span className="font-mono">
            ₹{Number(partner.wallet_balance || 0).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </Link>
      }
    >
      {children}
    </PortalShell>
  );
}
