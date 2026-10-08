import { AuthLoginForm } from "@/components/auth/AuthLoginForm";
import { ensurePortalDemoAccounts } from "@/lib/portal-setup";

export default async function PartnerLoginPage() {
  await ensurePortalDemoAccounts();

  return (
    <AuthLoginForm
      portal="partner"
      title="Partner Portal"
      subtitle="Accept leads, run doorstep jobs, and withdraw earnings"
      demoCredentials={process.env.NODE_ENV === "production" ? null : { email: "sharma.ac@repnexa.com", password: "partner123" }}
      accentColor="orange"
    />
  );
}
