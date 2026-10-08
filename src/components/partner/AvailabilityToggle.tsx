"use client";

import { useState } from "react";
import { setPartnerAvailability } from "@/app/actions/field-actions";

export function AvailabilityToggle({ partnerId, accepting }: { partnerId: number; accepting: boolean }) {
  const [on, setOn] = useState(accepting);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setPending(true);
    setError("");
    const next = !on;
    const result = await setPartnerAvailability(partnerId, next);
    setPending(false);
    if (!result?.success) {
      setError(result?.error || "Could not update.");
      return;
    }
    setOn(next);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending || !partnerId}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold disabled:opacity-60 ${on ? "bg-emerald-600 text-white" : "bg-slate-800 text-white"}`}
      >
        {pending ? "Saving…" : on ? "Available" : "Off today"}
      </button>
      {error && <p className="text-2xs text-rose-600">{error}</p>}
    </div>
  );
}
