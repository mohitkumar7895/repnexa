import { db } from "@/lib/db";
import { ensurePortalTables } from "@/lib/portal-setup";

export const DOORSTEP_CHECKS = [
  {
    key: "identity",
    label: "Government ID",
    detail: "Aadhaar or PAN checked.",
  },
  {
    key: "mobile",
    label: "Mobile number",
    detail: "Number matches this person.",
  },
  {
    key: "workshop",
    label: "Workshop address",
    detail: "Workshop address checked.",
  },
  {
    key: "background",
    label: "Background review",
    detail: "Background review done.",
  },
] as const;

export type CheckKey = (typeof DOORSTEP_CHECKS)[number]["key"];
export type CheckStatus = "pending" | "passed" | "failed";

export type ProofCheck = {
  key: CheckKey;
  label: string;
  detail: string;
  status: CheckStatus;
  note: string;
  checkedAt: string | null;
};

export function isDoorstepCleared(
  partner: { kyc_status?: string | null; status?: string | null },
  passedCount: number
) {
  const accountOpen = partner.status !== "suspended" && partner.status !== "inactive";
  return partner.kyc_status === "approved" && accountOpen && passedCount >= DOORSTEP_CHECKS.length;
}

export async function getPartnerProof(partnerId: number): Promise<ProofCheck[]> {
  await ensurePortalTables();
  const [rows]: any = await db.query(
    "SELECT check_key, status, evidence_note, checked_at FROM partner_verification_checks WHERE partner_id = ?",
    [partnerId]
  );
  const saved = new Map<string, any>((rows || []).map((row: any) => [row.check_key, row]));

  return DOORSTEP_CHECKS.map((check) => {
    const row = saved.get(check.key);
    const status: CheckStatus = row?.status === "passed" || row?.status === "failed" ? row.status : "pending";
    return {
      ...check,
      status,
      note: row?.evidence_note || "",
      checkedAt: row?.checked_at ? new Date(row.checked_at).toISOString() : null,
    };
  });
}

export function passedCheckCount(checks: ProofCheck[]) {
  return checks.filter((check) => check.status === "passed").length;
}
