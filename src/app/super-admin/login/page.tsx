import { AuthLoginForm } from "@/components/auth/AuthLoginForm";
import { ensurePortalDemoAccounts } from "@/lib/portal-setup";

export default async function SuperAdminLoginPage() {
  await ensurePortalDemoAccounts();

  return (
    <AuthLoginForm
      portal="super-admin"
      title="Super Admin"
      subtitle="Dispatch, partner KYC, wallets, and platform rules"
      demoCredentials={process.env.NODE_ENV === "production" ? null : { email: "superadmin@repnexa.com", password: "admin123" }}
      accentColor="purple"
      registerLink={{ href: "/super-admin/register", text: "Register an admin" }}
    />
  );
}
