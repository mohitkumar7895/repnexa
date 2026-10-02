import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { DigitalIdCard } from "@/components/partner/DigitalIdCard";
import Link from "next/link";

export default async function PartnerIdCardPage() {
  const [partnerRows]: any = await db.query(`
    SELECT p.*, c.name as city_name, s.name as state_name, u.phone as contact_phone, u.first_name, u.last_name, u.email
    FROM partners p
    LEFT JOIN cities c ON p.city_id = c.id
    LEFT JOIN states s ON p.state_id = s.id
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.partner_code = 'PTR-DEL-1001'
    LIMIT 1
  `);

  const partner = partnerRows[0] || {
    id: 1,
    partner_code: "PTR-DEL-1001",
    business_name: "Sharma Cooling Solutions",
    first_name: "Ramesh",
    last_name: "Sharma",
    contact_phone: "7895094129",
    city_name: "New Delhi",
    state_name: "Delhi NCR",
    kyc_status: "approved",
    tier_level: "GOLD",
    experience_years: 8,
  };

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

      <DigitalIdCard partner={partner} />
    </div>
  );
}
