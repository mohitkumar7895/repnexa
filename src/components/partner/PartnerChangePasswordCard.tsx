"use client";

import { useState } from "react";
import { changeOwnPassword } from "@/app/actions/auth-actions";

export function PartnerChangePasswordCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await changeOwnPassword(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        form.reset();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="security" className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
      <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
          🔐
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Change Partner Login Password
          </h2>
          <p className="text-2xs text-slate-500">
            Set a new secure password for logging into your Partner Portal
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center space-x-2">
            <span>✅</span>
            <span>Your password has been changed successfully! Use your new password for your next login.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-2xs font-semibold uppercase text-slate-700">
                Current Password *
              </label>
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="text-3xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showCurrent ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showCurrent ? "text" : "password"}
              name="currentPassword"
              required
              placeholder="Your existing password"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-orange-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-2xs font-semibold uppercase text-slate-700">
                New Password *
              </label>
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="text-3xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showNew ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showNew ? "text" : "password"}
              name="newPassword"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-orange-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-2xs font-semibold uppercase text-slate-700">
                Confirm New Password *
              </label>
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-3xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              required
              minLength={6}
              placeholder="Re-enter new password"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-orange-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs flex items-center space-x-1.5"
          >
            {loading ? (
              <>
                <span className="animate-spin text-xs">⏳</span>
                <span>Saving Password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
