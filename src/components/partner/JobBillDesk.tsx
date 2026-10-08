"use client";

import { useState } from "react";
import { addJobBillItem, requestCustomerBill } from "@/app/actions/field-actions";

export type BillLine = { id: number; item_name: string; qty: number; unit_price: number };

export function JobBillDesk({
  jobId,
  lines,
  billRequested,
}: {
  jobId: number;
  lines: BillLine[];
  billRequested: boolean;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const total = lines.reduce((sum, line) => sum + Number(line.qty) * Number(line.unit_price), 0);

  async function add(formData: FormData) {
    setPending(true);
    setError("");
    const result = await addJobBillItem(formData);
    setPending(false);
    if (!result?.success) setError(result?.error || "Could not add this item.");
  }

  async function shareBill() {
    setPending(true);
    setError("");
    const result = await requestCustomerBill(jobId);
    setPending(false);
    if (!result?.success) setError(result?.error || "Could not open the bill.");
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-slate-900">Extra parts</p>
        <p className="text-xs font-mono font-bold">₹{total.toLocaleString("en-IN")}</p>
      </div>
      {lines.length === 0 ? (
        <p className="text-2xs text-slate-500">Saved here even if the customer does not ask for a bill.</p>
      ) : (
        <ul className="space-y-1">
          {lines.map((line) => (
            <li key={line.id} className="flex justify-between text-2xs text-slate-700">
              <span>{line.item_name} × {line.qty}</span>
              <span className="font-mono">₹{(Number(line.qty) * Number(line.unit_price)).toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>
      )}
      <form action={add} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input type="hidden" name="jobId" value={jobId} />
        <input name="itemName" required placeholder="Part" className="sm:col-span-2 text-xs rounded-lg border border-slate-300 px-2 py-1.5" />
        <input name="qty" type="number" min={1} defaultValue={1} className="text-xs rounded-lg border border-slate-300 px-2 py-1.5" />
        <input name="price" type="number" min={1} required placeholder="₹" className="text-xs rounded-lg border border-slate-300 px-2 py-1.5" />
        <button type="submit" disabled={pending} className="sm:col-span-4 rounded-lg bg-slate-900 text-white text-xs font-bold py-1.5 disabled:opacity-60">
          Add to bill
        </button>
      </form>
      {billRequested ? (
        <p className="text-2xs font-bold text-emerald-700">Bill shared with the customer.</p>
      ) : (
        <button type="button" onClick={shareBill} disabled={pending || lines.length === 0} className="text-2xs font-bold text-purple-700 disabled:opacity-50">
          Customer asked for the bill
        </button>
      )}
      {error && <p className="text-2xs text-rose-700">{error}</p>}
    </div>
  );
}
