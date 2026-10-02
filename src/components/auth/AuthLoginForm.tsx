"use client";

import React, { useState, useTransition, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/app/actions/auth-actions";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export type PortalType = "partner" | "super-admin" | "admin" | "unified";
export type AccentColor = "orange" | "purple" | "blue" | "emerald";

export interface DemoCredentials {
  email: string;
  password: string;
}

export interface RegisterLinkConfig {
  href: string;
  text: string;
}

export interface AuthLoginFormProps {
  portal: PortalType;
  title?: string;
  subtitle?: string;
  defaultRedirect?: string;
  demoCredentials?: DemoCredentials | null;
  accentColor?: AccentColor;
  registerLink?: RegisterLinkConfig;
  emailLabel?: string;
  emailPlaceholder?: string;
  backHomeText?: string;
}

interface PortalPreset {
  title: string;
  subtitle: string;
  defaultRedirect: string;
  demoCredentials?: DemoCredentials | null;
  accentColor: AccentColor;
  registerLink?: RegisterLinkConfig;
  emailLabel: string;
  emailPlaceholder: string;
}

const PORTAL_PRESETS: Record<PortalType, PortalPreset> = {
  unified: {
    title: "Repnexa Portal Login",
    subtitle: "Sign in to access your Partner or Administrator dashboard",
    defaultRedirect: "/partner/dashboard",
    demoCredentials: null,
    accentColor: "purple",
    registerLink: {
      href: "/become-partner",
      text: "New Partner? Apply Here →",
    },
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email address",
  },
  partner: {
    title: "Repnexa Portal Login",
    subtitle: "Sign in to access your Partner or Administrator dashboard",
    defaultRedirect: "/partner/dashboard",
    demoCredentials: null,
    accentColor: "purple",
    registerLink: {
      href: "/become-partner",
      text: "New Partner? Apply Here →",
    },
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email address",
  },
  "super-admin": {
    title: "Repnexa Portal Login",
    subtitle: "Sign in to access your Partner or Administrator dashboard",
    defaultRedirect: "/super-admin/dashboard",
    demoCredentials: null,
    accentColor: "purple",
    registerLink: {
      href: "/become-partner",
      text: "New Partner? Apply Here →",
    },
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email address",
  },
  admin: {
    title: "Repnexa Portal Login",
    subtitle: "Sign in to access your Partner or Administrator dashboard",
    defaultRedirect: "/super-admin/dashboard",
    demoCredentials: null,
    accentColor: "purple",
    registerLink: {
      href: "/become-partner",
      text: "New Partner? Apply Here →",
    },
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email address",
  },
};

const COLOR_CLASSES: Record<AccentColor, {
  selection: string;
  button: string;
  demoBtn: string;
  focusBorder: string;
  toggleText: string;
  registerLink: string;
}> = {
  orange: {
    selection: "selection:bg-orange-500",
    button: "bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500 text-white",
    demoBtn: "bg-orange-600 hover:bg-orange-700 text-white",
    focusBorder: "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
    toggleText: "text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300",
    registerLink: "text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300",
  },
  purple: {
    selection: "selection:bg-purple-600",
    button: "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white",
    demoBtn: "bg-purple-600 hover:bg-purple-700 text-white",
    focusBorder: "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
    toggleText: "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300",
    registerLink: "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300",
  },
  blue: {
    selection: "selection:bg-blue-600",
    button: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white",
    demoBtn: "bg-blue-600 hover:bg-blue-700 text-white",
    focusBorder: "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
    toggleText: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
    registerLink: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
  },
  emerald: {
    selection: "selection:bg-emerald-600",
    button: "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white",
    demoBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    focusBorder: "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
    toggleText: "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300",
    registerLink: "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300",
  },
};

function LoginFormInternal({
  portal,
  title,
  subtitle,
  defaultRedirect,
  demoCredentials,
  accentColor,
  registerLink,
  emailLabel,
  emailPlaceholder,
  backHomeText = "← Home",
}: AuthLoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const preset = PORTAL_PRESETS[portal] || PORTAL_PRESETS["super-admin"];

  const resolvedTitle = title ?? preset.title;
  const resolvedSubtitle = subtitle ?? preset.subtitle;
  const resolvedDefaultRedirect = defaultRedirect ?? preset.defaultRedirect;
  const resolvedDemo = demoCredentials ?? preset.demoCredentials;
  const resolvedAccent = accentColor ?? preset.accentColor;
  const resolvedRegister = registerLink ?? preset.registerLink;
  const resolvedEmailLabel = emailLabel ?? preset.emailLabel;
  const resolvedEmailPlaceholder = emailPlaceholder ?? preset.emailPlaceholder;

  const colors = COLOR_CLASSES[resolvedAccent] || COLOR_CLASSES.purple;
  const redirectTarget = searchParams.get("from") || resolvedDefaultRedirect;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleFillDemo = () => {
    if (resolvedDemo) {
      setEmail(resolvedDemo.email);
      setPassword(resolvedDemo.password);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("portal", portal);

    startTransition(async () => {
      const res = await loginUser(formData);
      if (res.error) {
        setError(res.error);
      } else {
        let destination = res.redirectTo || resolvedDefaultRedirect;
        const fromParam = searchParams.get("from");
        if (fromParam) {
          if (res.role === "PARTNER" && fromParam.startsWith("/partner")) {
            destination = fromParam;
          } else if ((res.role === "SUPER_ADMIN" || res.role === "ADMIN") && fromParam.startsWith("/super-admin")) {
            destination = fromParam;
          }
        }
        router.push(destination);
        router.refresh();
      }
    });
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-4 relative transition-colors duration-200 ${colors.selection} selection:text-white`}>
      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center space-x-2">
        <ThemeToggle showLabel={true} />
      </div>

      <div className="w-full max-w-sm">
        {/* Brand Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:opacity-90 transition-all mb-4">
            <div className="relative w-36 h-9">
              <Image 
                src="/logo.png" 
                alt="Repnexa" 
                fill 
                className="object-contain" 
                priority
              />
            </div>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{resolvedTitle}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{resolvedSubtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-lg transition-colors">
          {/* Quick Demo Fill Button */}
          {resolvedDemo && (
            <div className="mb-4 flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-mono text-2xs truncate">{resolvedDemo.email}</span>
              <button
                type="button"
                onClick={handleFillDemo}
                className={`text-2xs font-semibold px-2 py-1 rounded ${colors.demoBtn} text-white cursor-pointer transition-colors shrink-0`}
              >
                Demo Fill
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{resolvedEmailLabel}</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={resolvedEmailPlaceholder}
                className={`w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none ${colors.focusBorder} transition-colors`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`text-2xs ${colors.toggleText} cursor-pointer transition-colors font-medium`}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none ${colors.focusBorder} font-mono transition-colors`}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-white ${colors.button} active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer mt-2 shadow-xs`}
            >
              {isPending ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className={`mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center ${resolvedRegister ? "justify-between" : "justify-center"} text-xs`}>
            <Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium">
              {backHomeText}
            </Link>
            {resolvedRegister && (
              <Link href={resolvedRegister.href} className={`${colors.registerLink} font-semibold transition-colors`}>
                {resolvedRegister.text}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthLoginForm(props: AuthLoginFormProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-700 border-t-purple-600 rounded-full animate-spin" />
      </div>
    }>
      <LoginFormInternal {...props} />
    </Suspense>
  );
}
