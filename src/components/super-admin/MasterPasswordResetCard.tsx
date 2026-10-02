"use client";

import { useState } from "react";
import { resetPasswordByEmailAdmin } from "@/app/actions/auth-actions";

export function MasterPasswordResetCard() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ userName: string; pwd: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function generateRandomPassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pwd = "Rep@";
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
    setError(null);
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !newPassword || newPassword.length < 6) {
      setError("Please provide a valid email and a password of at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessInfo(null);

    try {
      const res = await resetPasswordByEmailAdmin(email, newPassword);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccessInfo({ userName: res.userName || email, pwd: newPassword });
        setEmail("");
        setNewPassword("");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  function copyPassword(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
      <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
        <span className="text-xl">⚡</span>
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Master Password Override (Any User / Partner / Staff)
          </h2>
          <p className="text-2xs text-slate-500">
            Instantly set a new password for any partner, technician, customer, or staff account by email
          </p>
        </div>
      </div>

      <form onSubmit={handleReset} className="mt-4 space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        {successInfo && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold">
              <span>✅</span>
              <span>Password successfully reset for {successInfo.userName}!</span>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-emerald-200 flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-slate-900 select-all">{successInfo.pwd}</span>
              <button
                type="button"
                onClick={() => copyPassword(successInfo.pwd)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-2xs font-bold rounded cursor-pointer"
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-3xs text-emerald-700">
              The user can now sign in immediately with this updated password.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-2xs font-semibold uppercase text-slate-700 mb-1">
              Account Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter user email address"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-2xs font-semibold uppercase text-slate-700">
                New Password *
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-3xs text-purple-700 hover:text-purple-900 font-bold hover:underline cursor-pointer"
              >
                ⚡ Generate Strong
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter minimum 6 characters..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs flex items-center space-x-1.5"
          >
            {loading ? (
              <>
                <span className="animate-spin text-xs">⏳</span>
                <span>Resetting...</span>
              </>
            ) : (
              <span>Reset User Password</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
