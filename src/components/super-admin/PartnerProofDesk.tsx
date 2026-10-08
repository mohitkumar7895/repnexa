"use client";

import { useState } from "react";
import { setPartnerVerificationCheck, updatePartnerStatus } from "@/app/actions/portal-actions";

type DeskPartner = {
  id: number;
  partnerCode: string;
  businessName: string;
  kycStatus: string;
  identityOnFile: boolean;
  checks: { key: string; label: string; status: string }[];
};

export function PartnerProofDesk({ partners }: { partners: DeskPartner[] }) {
  const [error, setError] = useState("");
  const [pendingKey, setPendingKey] = useState("");

  async function mark(partnerId: number, key: string, status: "passed" | "failed") {
    setPendingKey(`${partnerId}-${key}`);
    setError("");
    const result = await setPartnerVerificationCheck(partnerId, key, status);
    setPendingKey("");
    if (!result?.success) setError(result?.error || "Could not save this check.");
  }

  async function approve(partnerId: number) {
    setPendingKey(`${partnerId}-approve`);
    setError("");
    const result = await updatePartnerStatus(partnerId, "approved", "Doorstep clearance approved after proof checks");
    setPendingKey("");
    if (!result?.success) setError(result?.error || "Approval needs every proof check.");
  }

  if (partners.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
        Every active partner has passed the doorstep proof checks.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-800">{error}</div>
      )}
      {partners.map((partner) => {
        const passed = partner.checks.filter((check) => check.status === "passed").length;
        return (
          <article key={partner.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{partner.businessName}</h3>
                <p className="text-2xs text-slate-500 font-mono">{partner.partnerCode} · {passed}/4 checks passed · KYC {partner.kycStatus}</p>
              </div>
              <button
                type="button"
                onClick={() => approve(partner.id)}
                disabled={pendingKey === `${partner.id}-approve` || passed < 4}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-2xs font-bold disabled:opacity-50"
              >
                {passed < 4 ? "Pass all 4 checks first" : "Approve doorstep entry"}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              {partner.checks.map((check) => (
                <div key={check.key} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">{check.label}</div>
                    <div className="text-3xs uppercase font-bold text-slate-400">{check.status}</div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={pendingKey === `${partner.id}-${check.key}` || (check.key === "identity" && !partner.identityOnFile)}
                      onClick={() => mark(partner.id, check.key, "passed")}
                      className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-3xs font-bold"
                    >
                      Pass
                    </button>
                    <button
                      type="button"
                      disabled={pendingKey === `${partner.id}-${check.key}`}
                      onClick={() => mark(partner.id, check.key, "failed")}
                      className="px-2 py-1 rounded-lg bg-rose-50 text-rose-800 text-3xs font-bold"
                    >
                      Fail
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {!partner.identityOnFile && (
              <p className="mt-2 text-2xs text-amber-800">ID check stays locked until Aadhaar or PAN is saved on the partner profile.</p>
            )}
          </article>
        );
      })}
    </div>
  );
}
