"use client";

import { useState } from "react";
import Link from "next/link";
import { acceptLeadByPartner } from "@/app/actions/portal-actions";

export function AcceptLeadButton({
  leadId,
  partnerId,
  fee = 0,
  balance = 0,
}: {
  leadId: number;
  partnerId: number;
  fee?: number;
  balance?: number;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onAccept() {
    if (!partnerId) {
      setError("Sign in as a partner to accept leads.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const result = await acceptLeadByPartner(leadId, partnerId);
      if (!result?.success) {
        setError(result?.error || "Could not accept this lead.");
      }
    } catch {
      setError("Could not accept this lead. Try again.");
    } finally {
      setPending(false);
    }
  }

  const shortBy = fee > 0 && balance < fee;

  if (shortBy) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Link href="/partner/wallet" className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-2xs">
          Add funds
        </Link>
        <span className="max-w-40 text-right text-3xs font-medium text-amber-700">
          Needs ₹{fee.toLocaleString("en-IN")} float
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onAccept}
        disabled={pending}
        className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-2xs transition-all shadow-2xs disabled:opacity-60"
      >
        {pending ? "Accepting…" : "Accept Lead"}
      </button>
      {error && (
        <span className="max-w-40 text-right text-3xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </span>
      )}
    </div>
  );
}
