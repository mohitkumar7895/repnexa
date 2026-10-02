"use client";

import { useTransition } from "react";
import { cancelCustomerServiceRequest } from "@/app/actions/portal-actions";

export default function CancelBookingButton({ leadId }: { leadId: number }) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking request? If a technician was assigned, they will be notified and any deducted lead fee will be automatically refunded."
    );
    if (!confirmed) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("leadId", String(leadId));
      await cancelCustomerServiceRequest(formData);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={isPending}
      className={`text-2xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
        isPending
          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
          : "text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border-red-200"
      }`}
    >
      {isPending ? "Cancelling..." : "✕ Cancel Booking"}
    </button>
  );
}
