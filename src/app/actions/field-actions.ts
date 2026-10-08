"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { ensurePortalTables } from "@/lib/portal-setup";

function last10(value: unknown) {
  return String(value || "").replace(/\D/g, "").slice(-10);
}

function todayIndia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

async function sessionPartnerId() {
  const session: any = await getSession();
  if (!session?.id) return { error: "Login required." as const, partnerId: 0, admin: false };
  if (session.role === "SUPER_ADMIN") return { error: null, partnerId: 0, admin: true };
  const [rows]: any = await db.query("SELECT id FROM partners WHERE user_id = ? LIMIT 1", [session.id]);
  if (!rows?.length) return { error: "No workshop is linked to this login." as const, partnerId: 0, admin: false };
  return { error: null, partnerId: Number(rows[0].id), admin: false };
}

function refreshField() {
  revalidatePath("/customer/dashboard");
  revalidatePath("/partner/dashboard");
  revalidatePath("/partner/leads");
  revalidatePath("/partner/jobs");
  revalidatePath("/super-admin/jobs");
  revalidatePath("/super-admin/support");
  revalidatePath("/super-admin/partners");
}

export async function rescheduleLead(formData: FormData) {
  try {
    await ensurePortalTables();
    const leadId = Number(formData.get("leadId"));
    const phone = last10(formData.get("phone"));
    const date = String(formData.get("date") || "").trim();
    const time = String(formData.get("time") || "").trim();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return { success: false, error: "Mobile number does not match this booking." };
    }
    if (!date || date < todayIndia() || !time) {
      return { success: false, error: "Pick today or a later slot." };
    }

    const [rows]: any = await db.query(
      `SELECT id, customer_phone, status,
        (SELECT COUNT(*) FROM jobs j WHERE j.lead_id = leads.id AND j.status <> 'CANCELLED') AS open_jobs
       FROM leads WHERE id = ? LIMIT 1`,
      [leadId]
    );
    const lead = rows?.[0];
    if (!lead || last10(lead.customer_phone) !== phone) {
      return { success: false, error: "This booking is not on this mobile." };
    }
    if (Number(lead.open_jobs) > 0 || !["NEW", "MATCHING", "ASSIGNED"].includes(lead.status)) {
      return { success: false, error: "A technician already accepted. The date is locked." };
    }

    await db.query(
      "UPDATE leads SET preferred_date = ?, preferred_time = ? WHERE id = ?",
      [date, time, leadId]
    );
    refreshField();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Could not change the slot." };
  }
}

export async function setPartnerAvailability(partnerId: number, accepting: boolean) {
  try {
    await ensurePortalTables();
    const access = await sessionPartnerId();
    if (access.error) return { success: false, error: access.error };
    if (!access.admin && access.partnerId !== Number(partnerId)) {
      return { success: false, error: "You can change only your own availability." };
    }
    await db.query("UPDATE partners SET accepting_leads = ? WHERE id = ?", [accepting ? 1 : 0, partnerId]);
    refreshField();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Could not update availability." };
  }
}

export async function addJobBillItem(formData: FormData) {
  try {
    await ensurePortalTables();
    const jobId = Number(formData.get("jobId"));
    const name = String(formData.get("itemName") || "").trim();
    const qty = Math.max(1, Number(formData.get("qty") || 1));
    const price = Number(formData.get("price"));
    if (name.length < 2 || !Number.isFinite(price) || price <= 0) {
      return { success: false, error: "Enter the part name and a price." };
    }

    const [jobs]: any = await db.query(
      "SELECT id, partner_id, status FROM jobs WHERE id = ? LIMIT 1",
      [jobId]
    );
    const job = jobs?.[0];
    if (!job) return { success: false, error: "Job not found." };
    if (job.status === "COMPLETED" || job.status === "CANCELLED") {
      return { success: false, error: "This visit is already closed." };
    }
    const access = await sessionPartnerId();
    if (access.error) return { success: false, error: access.error };
    if (!access.admin && access.partnerId !== Number(job.partner_id)) {
      return { success: false, error: "This job is not yours." };
    }

    await db.query(
      "INSERT INTO job_bill_items (job_id, partner_id, item_name, qty, unit_price) VALUES (?, ?, ?, ?, ?)",
      [jobId, job.partner_id, name.slice(0, 160), qty, price]
    );
    const [sumRows]: any = await db.query(
      "SELECT COALESCE(SUM(qty * unit_price), 0) AS total FROM job_bill_items WHERE job_id = ?",
      [jobId]
    );
    await db.query("UPDATE jobs SET estimate_amount = ? WHERE id = ?", [Number(sumRows?.[0]?.total || 0), jobId]);
    refreshField();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Could not add this item." };
  }
}

export async function requestCustomerBill(jobId: number) {
  try {
    await ensurePortalTables();
    const [jobs]: any = await db.query("SELECT id, partner_id FROM jobs WHERE id = ? LIMIT 1", [jobId]);
    const job = jobs?.[0];
    if (!job) return { success: false, error: "Job not found." };
    const [countRows]: any = await db.query(
      "SELECT COUNT(*) AS total FROM job_bill_items WHERE job_id = ?",
      [jobId]
    );
    if (!Number(countRows?.[0]?.total)) {
      return { success: false, error: "Add the parts first." };
    }
    const access = await sessionPartnerId();
    if (access.error) return { success: false, error: access.error };
    if (!access.admin && access.partnerId !== Number(job.partner_id)) {
      return { success: false, error: "This job is not yours." };
    }
    await db.query("UPDATE jobs SET bill_requested = 1 WHERE id = ?", [jobId]);
    refreshField();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Could not open the bill." };
  }
}

export async function fileDamageReport(formData: FormData) {
  try {
    await ensurePortalTables();
    const leadId = Number(formData.get("leadId"));
    const phone = last10(formData.get("phone"));
    const description = String(formData.get("description") || "").trim();
    const photoUrl = String(formData.get("photoUrl") || "").trim();
    if (description.length < 8) return { success: false, error: "Write what was damaged." };
    if (!photoUrl) return { success: false, error: "Add a photo." };

    const [rows]: any = await db.query(
      `SELECT l.id, l.customer_phone, l.customer_name, l.assigned_partner_id, j.id AS job_id
       FROM leads l
       LEFT JOIN jobs j ON j.lead_id = l.id AND j.status <> 'CANCELLED'
       WHERE l.id = ? LIMIT 1`,
      [leadId]
    );
    const lead = rows?.[0];
    if (!lead || last10(lead.customer_phone) !== phone) {
      return { success: false, error: "This booking is not on this mobile." };
    }
    if (!lead.assigned_partner_id && !lead.job_id) {
      return { success: false, error: "No technician is on this visit yet." };
    }

    const code = `DMG-${Date.now().toString().slice(-6)}`;
    await db.query(
      `INSERT INTO damage_reports (report_code, lead_id, job_id, partner_id, customer_name, customer_phone, description, photo_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [code, leadId, lead.job_id || null, lead.assigned_partner_id || null, lead.customer_name, phone, description, photoUrl]
    );
    refreshField();
    return { success: true, code };
  } catch (error: any) {
    return { success: false, error: error.message || "Could not save the complaint." };
  }
}

async function requireAdmin() {
  const session: any = await getSession();
  if (session?.role !== "SUPER_ADMIN") return "Admin login required.";
  return null;
}

export async function stopDamageJob(reportId: number) {
  try {
    await ensurePortalTables();
    const denied = await requireAdmin();
    if (denied) return { success: false, error: denied };
    const [rows]: any = await db.query("SELECT * FROM damage_reports WHERE id = ? LIMIT 1", [reportId]);
    const report = rows?.[0];
    if (!report) return { success: false, error: "Report not found." };
    if (report.job_id) {
      await db.query(
        "UPDATE jobs SET status = 'CANCELLED' WHERE id = ? AND status NOT IN ('COMPLETED', 'CANCELLED')",
        [report.job_id]
      );
    }
    await db.query("UPDATE leads SET status = 'DISPUTED' WHERE id = ?", [report.lead_id]);
    await db.query("UPDATE damage_reports SET status = 'job_stopped' WHERE id = ?", [reportId]);
    refreshField();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Could not stop the job." };
  }
}

export async function suspendPartnerFromDamage(reportId: number) {
  try {
    await ensurePortalTables();
    const denied = await requireAdmin();
    if (denied) return { success: false, error: denied };
    const [rows]: any = await db.query("SELECT * FROM damage_reports WHERE id = ? LIMIT 1", [reportId]);
    const report = rows?.[0];
    if (!report?.partner_id) return { success: false, error: "No partner on this report." };
    await db.query("UPDATE partners SET status = 'suspended' WHERE id = ?", [report.partner_id]);
    if (report.job_id) {
      await db.query(
        "UPDATE jobs SET status = 'CANCELLED' WHERE id = ? AND status NOT IN ('COMPLETED', 'CANCELLED')",
        [report.job_id]
      );
    }
    await db.query("UPDATE leads SET status = 'DISPUTED' WHERE id = ?", [report.lead_id]);
    await db.query("UPDATE damage_reports SET status = 'partner_suspended' WHERE id = ?", [reportId]);
    refreshField();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Could not suspend the partner." };
  }
}
