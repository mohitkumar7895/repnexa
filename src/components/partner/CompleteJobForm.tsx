"use client";

import { useState } from "react";
import { updateJobStatus } from "@/app/actions/portal-actions";

export function CompleteJobForm({
  jobId,
  suggestedAmount,
  couponCode,
  discountAmount,
  lockedAmount = 0,
}: {
  jobId: number;
  suggestedAmount: number;
  couponCode?: string | null;
  discountAmount?: number;
  lockedAmount?: number;
}) {
  const [otp, setOtp] = useState("");
  const [amount, setAmount] = useState(String(suggestedAmount || ""));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const discount = Number(discountAmount || 0);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await updateJobStatus(
        jobId,
        "COMPLETED",
        otp.trim(),
        lockedAmount > 0 ? lockedAmount : Number(amount)
      );
      if (!result?.success) {
        setError(result?.error || "Could not complete this job.");
      }
    } catch {
      setError("Could not complete this job. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col items-end gap-1.5">
      {couponCode && discount > 0 && (
        <p className="text-2xs text-emerald-700 font-semibold">
          Coupon {couponCode} takes ₹{discount.toLocaleString("en-IN")} off the bill
        </p>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
          placeholder="Customer OTP"
          required
          className="w-28 text-xs p-1.5 border border-slate-300 rounded font-mono"
        />
        {lockedAmount > 0 ? (
          <span className="text-xs font-mono font-bold text-slate-800">₹{lockedAmount.toLocaleString("en-IN")}</span>
        ) : (
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Final bill ₹"
            required
            className="w-24 text-xs p-1.5 border border-slate-300 rounded font-mono"
          />
        )}
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs disabled:opacity-60"
        >
          {pending ? "Saving…" : "Complete job"}
        </button>
      </div>
      {error && <p className="max-w-xs text-right text-2xs font-medium text-rose-600">{error}</p>}
    </form>
  );
}
