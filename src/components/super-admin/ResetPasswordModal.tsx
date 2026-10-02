"use client";

import { useState } from "react";
import { changeUserPasswordByAdmin } from "@/app/actions/auth-actions";

interface ResetPasswordModalProps {
  userId: number;
  userName: string;
  userEmail: string;
  roleType?: string;
  buttonLabel?: string;
  buttonClassName?: string;
}

export function ResetPasswordModal({
  userId,
  userName,
  userEmail,
  roleType = "Account",
  buttonLabel = "🔑 Password",
  buttonClassName = "px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white font-bold text-2xs uppercase tracking-wider transition-all inline-flex items-center space-x-1 cursor-pointer shadow-xs",
}: ResetPasswordModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successPassword, setSuccessPassword] = useState<string | null>(null);
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

  function handleOpen() {
    setIsOpen(true);
    setNewPassword("");
    setError(null);
    setSuccessPassword(null);
    setCopied(false);
  }

  function handleClose() {
    setIsOpen(false);
    setNewPassword("");
    setError(null);
    setSuccessPassword(null);
    setCopied(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await changeUserPasswordByAdmin(userId, newPassword);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccessPassword(newPassword);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={buttonClassName}
        title={`Change password for ${userName}`}
      >
        <span>{buttonLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-purple-950 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base">🔑</span>
                  <h3 className="text-sm font-bold tracking-tight">Super Admin Password Reset</h3>
                </div>
                <p className="text-3xs text-purple-200 mt-0.5">
                  Direct master override for {roleType}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Target Account Info */}
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-3xs font-bold uppercase text-slate-400 block tracking-wider">Account</span>
                <span className="font-bold text-slate-800">{userName}</span>
                <span className="text-2xs text-slate-500 block font-mono">{userEmail}</span>
              </div>
              <span className="px-2 py-0.5 text-3xs font-extrabold uppercase rounded bg-purple-100 text-purple-700">
                {roleType}
              </span>
            </div>

            {/* Content */}
            <div className="p-6">
              {successPassword ? (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Password Changed Successfully!</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      The user can now immediately log in with this new password.
                    </p>
                  </div>

                  <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 flex items-center justify-between font-mono text-sm">
                    <span className="font-bold text-slate-900 select-all">{successPassword}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(successPassword)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {copied ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                      ⚠️ {error}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-2xs font-bold uppercase tracking-wider text-slate-700">
                        New Password *
                      </label>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-3xs text-purple-700 hover:text-purple-900 font-bold hover:underline cursor-pointer"
                      >
                        ⚡ Generate Random
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter minimum 6 characters..."
                        required
                        minLength={6}
                        className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <span className="text-3xs text-slate-400 mt-1 block">
                      Min 6 characters. Overwrites user password in MySQL database.
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center space-x-2 justify-end">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
                    >
                      {loading ? (
                        <>
                          <span className="animate-spin text-xs">⏳</span>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <span>Set New Password</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
