"use client";

import { useState } from "react";
import { rescheduleLead } from "@/app/actions/field-actions";

const SLOTS = [
  "Morning (9 AM - 12 PM)",
  "Afternoon (12 PM - 3 PM)",
  "Evening (3 PM - 7 PM)",
];

export function RescheduleVisit({
  leadId,
  phone,
}: {
  leadId: number;
  phone: string;
}) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    const result = await rescheduleLead(formData);
    setPending(false);
    if (!result?.success) {
      setError(result?.error || "Could not change the slot.");
      return;
    }
    setDone(true);
    setOpen(false);
  }

  if (done) return <p className="text-2xs font-bold text-emerald-700">Slot updated.</p>;

  return (
    <div>
      <button type="button" onClick={() => setOpen((value) => !value)} className="text-2xs font-bold text-purple-700">
        Change slot
      </button>
      {open && (
        <form action={onSubmit} className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input type="hidden" name="leadId" value={leadId} />
          <input type="hidden" name="phone" value={phone} />
          <input type="date" name="date" required min={today} className="text-xs rounded-lg border border-slate-300 px-2 py-1.5" />
          <select name="time" required className="text-xs rounded-lg border border-slate-300 px-2 py-1.5 bg-white">
            {SLOTS.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
          <button type="submit" disabled={pending} className="rounded-lg bg-slate-900 text-white text-xs font-bold px-3 py-1.5 disabled:opacity-60">
            {pending ? "Saving…" : "Save"}
          </button>
          {error && <p className="sm:col-span-3 text-2xs text-rose-700">{error}</p>}
        </form>
      )}
    </div>
  );
}
