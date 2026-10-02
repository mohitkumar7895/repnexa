import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

interface PortalGuard {
  prefix: string;
  loginPath: string;
  dashboardPath: string;
  allowedRoles: string[];
}

const PORTAL_GUARDS: PortalGuard[] = [
  {
    prefix: "/super-admin",
    loginPath: "/super-admin/login",
    dashboardPath: "/super-admin/dashboard",
    allowedRoles: [
      "SUPER_ADMIN",
      "ADMIN",
      "OPERATIONS_MANAGER",
      "VERIFICATION_OFFICER",
      "DISPATCHER",
      "SUPPORT_AGENT",
      "FINANCE_MANAGER"
    ],
  },
  {
    prefix: "/partner",
    loginPath: "/partner/login",
    dashboardPath: "/partner/dashboard",
    allowedRoles: ["PARTNER", "SUPER_ADMIN"],
  },
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass current pathname to Server Components via request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const token = request.cookies.get("session")?.value;
  const session: any = token ? await verifyToken(token) : null;
  const userRole = session?.role?.toUpperCase();

  // Evaluate route protection for configured portals
  for (const guard of PORTAL_GUARDS) {
    if (pathname.startsWith(guard.prefix)) {
      const isPublicAuthPage = pathname === guard.loginPath;
      const isAuthorized = userRole && guard.allowedRoles.includes(userRole);

      // Redirect authenticated user away from login/register page to dashboard
      if (isPublicAuthPage && isAuthorized) {
        return NextResponse.redirect(new URL(guard.dashboardPath, request.url));
      }

      // Redirect unauthenticated or unauthorized user to portal login
      if (!isPublicAuthPage && !isAuthorized) {
        const loginUrl = new URL(guard.loginPath, request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }

      break;
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/super-admin/:path*",
    "/partner/:path*",
  ],
};
