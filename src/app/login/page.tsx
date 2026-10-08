import { AuthLoginForm } from "@/components/auth/AuthLoginForm";
import { ensurePortalDemoAccounts } from "@/lib/portal-setup";

export default async function UnifiedLoginPage() {
  await ensurePortalDemoAccounts();

  return (
    <AuthLoginForm
      portal="unified"
      title="Repnexa Portal Login"
      subtitle="Sign in as a partner or an administrator"
      demoCredentials={process.env.NODE_ENV === "production" ? null : { email: "sharma.ac@repnexa.com", password: "partner123" }}
      altDemo={process.env.NODE_ENV === "production" ? undefined : { email: "superadmin@repnexa.com", password: "admin123" }}
    />
  );
}
