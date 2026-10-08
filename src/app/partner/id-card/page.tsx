import { PageHeader } from "@/components/ui/PageHeader";
import { DigitalIdCard } from "@/components/partner/DigitalIdCard";
import { getCurrentPartner } from "@/lib/partner";
import { getPartnerProof, isDoorstepCleared, passedCheckCount } from "@/lib/verification";
import Link from "next/link";

export default async function PartnerIdCardPage() {
  const partner = await getCurrentPartner();
  const proof = partner.id ? await getPartnerProof(partner.id) : [];
  const cleared = isDoorstepCleared(partner, passedCheckCount(proof));

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader
          title="Technician Digital Credential & Verification ID"
          subtitle="Your official Repnexa doorstep credential badge for residential and commercial entry"
          badge={`Badge: ${partner.partner_code}`}
        >
          <Link
            href="/partner/profile"
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
          >
            ← Back to Profile
          </Link>
          <Link
            href="/partner/referrals"
            className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            🎁 Refer Technicians (+₹100)
          </Link>
        </PageHeader>
      </div>

      <DigitalIdCard partner={{ ...partner, cleared }} />
    </div>
  );
}
