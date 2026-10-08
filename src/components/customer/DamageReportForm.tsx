"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { fileDamageReport } from "@/app/actions/field-actions";

export function DamageReportForm({ leadId, phone }: { leadId: number; phone: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    const result = await fileDamageReport(formData);
    setPending(false);
    if (!result?.success) {
      setError(result?.error || "Could not save the complaint.");
      return;
    }
    setCode(result.code || "saved");
    setOpen(false);
  }

  if (code) return <p className="text-2xs font-bold text-rose-800">Damage report {code} saved.</p>;

  return (
    <div>
      <button type="button" onClick={() => setOpen((value) => !value)} className="text-2xs font-bold text-rose-700">
        Report damage
      </button>
      {open && (
        <form action={onSubmit} className="mt-2 space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <input type="hidden" name="leadId" value={leadId} />
          <input type="hidden" name="phone" value={phone} />
          <textarea name="description" required minLength={8} rows={2} placeholder="What broke?" className="w-full text-xs rounded-lg border border-rose-200 px-2 py-1.5" />
          <FileUpload name="photoUrl" required placeholder="Photo of the damage" />
          <button type="submit" disabled={pending} className="rounded-lg bg-rose-700 text-white text-xs font-bold px-3 py-1.5 disabled:opacity-60">
            {pending ? "Saving…" : "Send to admin"}
          </button>
          {error && <p className="text-2xs text-rose-800">{error}</p>}
        </form>
      )}
    </div>
  );
}
