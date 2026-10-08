"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendJobOtpEmail } from "@/lib/email";
import bcrypt from "bcrypt";
import { ensurePortalTables } from "@/lib/portal-setup";
import { getPartnerTier } from "@/lib/partner";
import { getSession } from "@/lib/auth";
import { DOORSTEP_CHECKS, getPartnerProof, isDoorstepCleared, passedCheckCount } from "@/lib/verification";

// ==========================================
// HELPER: RESOLVE OR CREATE CITY (MANUAL ENTRY)
// ==========================================
export async function getOrCreateCityId(cityNameOrId?: string | number | null): Promise<number> {
  if (!cityNameOrId) return 1;

  // If numeric ID already
  if (typeof cityNameOrId === "number" || (/^\d+$/.test(String(cityNameOrId).trim()) && !isNaN(Number(cityNameOrId)))) {
    const numericId = Number(cityNameOrId);
    const [existingIdRows]: any = await db.query("SELECT id FROM cities WHERE id = ?", [numericId]);
    if (existingIdRows.length > 0) return numericId;
  }

  const cleanName = String(cityNameOrId).trim();
  if (!cleanName) return 1;

  // Case-insensitive lookup in cities table
  const [existingNameRows]: any = await db.query(
    "SELECT id FROM cities WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1",
    [cleanName]
  );
  if (existingNameRows.length > 0) {
    return existingNameRows[0].id;
  }

  // Find a default state
  const [stateRows]: any = await db.query("SELECT id FROM states LIMIT 1");
  const defaultStateId = stateRows.length > 0 ? stateRows[0].id : 1;

  // Auto-insert newly typed city into cities table
  const [insertRes]: any = await db.query(
    "INSERT INTO cities (state_id, name, status) VALUES (?, ?, 'active')",
    [defaultStateId, cleanName]
  );
  return insertRes.insertId;
}

async function findCityId(cityName: string) {
  const cleanName = cityName.trim();
  if (!cleanName) return null;
  const [rows]: any = await db.query(
    "SELECT id FROM cities WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1",
    [cleanName]
  );
  return rows?.[0]?.id ? Number(rows[0].id) : null;
}

function parsePincodes(raw: string) {
  const pins = [...new Set(raw.split(/[\s,]+/).map((pin) => pin.replace(/\D/g, "")).filter(Boolean))];
  if (!pins.length || pins.some((pin) => !/^[1-9]\d{5}$/.test(pin))) {
    return { error: "Add the 6-digit pincodes you cover.", pins: [] as string[] };
  }
  return { error: null, pins };
}

// ==========================================
// 1. CUSTOMER SERVICE BOOKING & LEAD CREATION
// ==========================================
export async function createServiceRequest(formData: FormData) {
  try {
    const customerName = String(formData.get("customerName") || "").trim();
    const customerPhone = String(formData.get("customerPhone") || "").replace(/\D/g, "").slice(-10);
    const customerEmail = String(formData.get("customerEmail") || "").trim().toLowerCase();
    let serviceId = Number(formData.get("serviceId"));
    const serviceName = ((formData.get("serviceName") as string) || (formData.get("serviceType") as string) || "").trim();
    const brandName = String(formData.get("brandName") || "").trim();
    const rawCity = String((formData.get("cityName") as string) || (formData.get("cityId") as string) || "").trim();
    const pincode = String(formData.get("pincode") || "").replace(/\D/g, "");
    const address = String(formData.get("address") || "").trim();
    const problem = String(formData.get("problem") || "").trim();
    const preferredDate = String(formData.get("preferredDate") || "").trim();
    const preferredTime = String(formData.get("preferredTime") || "").trim();
    const todayIndia = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

    if (customerName.length < 2) {
      return { success: false, error: "Enter the full name of the person at the address." };
    }
    if (!/^[6-9]\d{9}$/.test(customerPhone)) {
      return { success: false, error: "Enter a 10-digit Indian mobile number starting with 6, 7, 8, or 9." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return { success: false, error: "Enter a working email. The completion OTP can be sent there." };
    }
    if (problem.length < 12) {
      return { success: false, error: "Describe the appliance problem in a sentence so the technician arrives prepared." };
    }
    if (address.length < 10) {
      return { success: false, error: "Enter the full doorstep address, including house number and area." };
    }
    if (!/^[1-9]\d{5}$/.test(pincode)) {
      return { success: false, error: "Enter a 6-digit pincode." };
    }
    if (!preferredDate || preferredDate < todayIndia) {
      return { success: false, error: "Choose today or a later visit date." };
    }
    if (!preferredTime) {
      return { success: false, error: "Choose a visit time slot." };
    }
    if (!brandName) {
      return { success: false, error: "Enter the appliance brand." };
    }

    const [cityRows]: any = await db.query(
      "SELECT id, name FROM cities WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1",
      [rawCity]
    );
    if (!cityRows?.length) {
      return { success: false, error: "Choose a city from the suggestions. A typed city that is not on the list cannot be assigned a technician." };
    }
    const cityId = cityRows[0].id;

    if (!serviceId && serviceName) {
      const [existingSvc]: any = await db.query(
        "SELECT id FROM services WHERE LOWER(title) = LOWER(?) LIMIT 1",
        [serviceName]
      );
      if (existingSvc?.length) serviceId = existingSvc[0].id;
    }

    if (!serviceId) {
      return { success: false, error: "Choose a service from the suggestions so the visit has the right price and warranty." };
    }

    // 1. Find or create user
    const [existingUsers]: any = await db.query(
      "SELECT id, email, phone FROM users WHERE phone IN (?, ?, ?) OR email = ? LIMIT 5",
      [customerPhone, `+91${customerPhone}`, `91${customerPhone}`, customerEmail]
    );
    const phoneOwner = (existingUsers || []).find((user: any) => {
      const digits = String(user.phone || "").replace(/\D/g, "").slice(-10);
      return digits === customerPhone;
    });
    const emailOwner = (existingUsers || []).find((user: any) => String(user.email || "").toLowerCase() === customerEmail);
    if (phoneOwner && emailOwner && phoneOwner.id !== emailOwner.id) {
      return { success: false, error: "This mobile number and email are on different accounts. Use the same pair from your earlier booking." };
    }
    if (!phoneOwner && emailOwner) {
      return { success: false, error: "This email is already used with another mobile number. Use that number, or a different email." };
    }
    let userId: number;

    if (phoneOwner) {
      userId = phoneOwner.id;
    } else {
      const uid = `usr_cust_${Date.now()}`;
      const [uRes]: any = await db.query(
        "INSERT INTO users (uid, email, first_name, phone, role, status) VALUES (?, ?, ?, ?, 'CUSTOMER', 'active')",
        [uid, customerEmail, customerName, customerPhone]
      );
      userId = uRes.insertId;
    }

    // 2. Find or create customer
    const [existingCust]: any = await db.query("SELECT id FROM customers WHERE user_id = ?", [userId]);
    let customerId: number;

    if (existingCust.length > 0) {
      customerId = existingCust[0].id;
    } else {
      const custCode = `CUST-${Date.now().toString().slice(-6)}`;
      const [cRes]: any = await db.query("INSERT INTO customers (user_id, customer_code) VALUES (?, ?)", [userId, custCode]);
      customerId = cRes.insertId;
    }

    await ensurePortalTables();

    const couponCode = ((formData.get("couponCode") as string) || "").trim().toUpperCase();
    let discountAmount = 0;
    let svcRow: any[] = [];
    try {
      const [rows]: any = await db.query("SELECT selling_price, lead_fee FROM services WHERE id = ?", [serviceId]);
      svcRow = rows || [];
    } catch {
      const [rows]: any = await db.query("SELECT selling_price FROM services WHERE id = ?", [serviceId]);
      svcRow = rows || [];
    }
    if (!svcRow?.length) {
      return { success: false, error: "That service is not on the catalogue. Pick one from the suggestions." };
    }
    const servicePrice = Number(svcRow?.[0]?.selling_price || 0);

    if (couponCode) {
      const [couponRows]: any = await db.query(
        "SELECT * FROM coupons WHERE UPPER(code) = ? AND status = 'active' LIMIT 1",
        [couponCode]
      );
      if (!couponRows?.length) {
        return { success: false, error: `Coupon ${couponCode} is not active.` };
      }
      const coupon = couponRows[0];
      const minOrder = Number(coupon.min_order_amount || 0);
      if (servicePrice > 0 && servicePrice < minOrder) {
        return { success: false, error: `Coupon ${couponCode} needs a service of at least ₹${minOrder}.` };
      }
      const basis = servicePrice || minOrder || Number(coupon.discount_value);
      discountAmount = coupon.discount_type === "PERCENTAGE"
        ? (basis * Number(coupon.discount_value)) / 100
        : Number(coupon.discount_value);
      const cap = Number(coupon.max_discount_amount || 0);
      if (cap > 0) discountAmount = Math.min(discountAmount, cap);
      discountAmount = Math.max(0, Math.round(discountAmount));
    }

    let leadFee = Number(svcRow?.[0]?.lead_fee || 0);
    if (!leadFee) {
      const [feeRows]: any = await db.query(
        "SELECT setting_value FROM system_settings WHERE setting_key = 'default_lead_fee' LIMIT 1"
      );
      leadFee = Number(feeRows?.[0]?.setting_value || 50);
    }

    // 4. Generate Lead
    const leadCode = `LEAD-${Date.now().toString().slice(-6)}`;
    const [leadRes]: any = await db.query(
      `INSERT INTO leads (lead_code, customer_id, service_id, brand_name, city_id, pincode, customer_name, customer_phone, customer_address, problem_description, preferred_date, preferred_time, lead_fee, coupon_code, discount_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW')`,
      [leadCode, customerId, serviceId, brandName, cityId, pincode, customerName, customerPhone, address, problem, preferredDate, preferredTime, leadFee, couponCode || null, discountAmount]
    );

    const leadId = leadRes.insertId;

    // 5. Automatic Partner Matching: Find nearby verified partners
    const clearedPartnerSql = `
      p.kyc_status = 'approved'
      AND p.status = 'active'
      AND p.wallet_balance >= ?
      AND IFNULL(p.accepting_leads, 1) = 1
      AND (
        SELECT COUNT(*) FROM partner_verification_checks pvc
        WHERE pvc.partner_id = p.id AND pvc.status = 'passed'
      ) >= ?
      AND EXISTS (
        SELECT 1 FROM partner_pincodes pp
        WHERE pp.partner_id = p.id AND pp.pincode = ?
      )
    `;
    let [matchingPartners]: any = await db.query(
      `SELECT p.id, p.wallet_balance FROM partners p
       WHERE ${clearedPartnerSql} AND p.city_id = ?`,
      [leadFee, DOORSTEP_CHECKS.length, pincode, cityId]
    );

    if (matchingPartners.length > 0) {
      for (const p of matchingPartners) {
        await db.query(
          "INSERT IGNORE INTO lead_assignments (lead_id, partner_id, status) VALUES (?, ?, 'assigned')",
          [leadId, p.id]
        );
      }
      await db.query("UPDATE leads SET status = 'MATCHING' WHERE id = ?", [leadId]);
    }

    revalidatePath("/super-admin/leads");
    revalidatePath("/partner/leads");
    revalidatePath("/customer/dashboard");

    const couponNote = discountAmount > 0 ? ` Coupon saved ₹${discountAmount}.` : "";
    const notified = matchingPartners.length > 0;
    return { 
      success: true, 
      leadCode, 
      message: notified
        ? `Request ${leadCode} is saved.${couponNote} A cleared technician for this pincode has been notified. Open their public ID and confirm it is green before anyone enters.`
        : `Request ${leadCode} is saved.${couponNote} No cleared technician covers this pincode yet, so nobody has been sent. Keep this code and track it on your dashboard.`
    };
  } catch (error: any) {
    console.error("Booking Error:", error);
    return { success: false, error: error.message || "Failed to create service booking." };
  }
}

// ==========================================
// 2. PARTNER REGISTRATION APPLICATION
// ==========================================
export async function submitPartnerApplication(formData: FormData) {
  try {
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const businessName = formData.get("businessName") as string;
    const businessType = formData.get("businessType") as string || "Individual / Freelancer";
    const experience = Number(formData.get("experience")) || 1;
    const address = formData.get("address") as string;
    const rawCity = String(formData.get("cityName") || formData.get("cityId") || "").trim();
    const cityId = await findCityId(rawCity);
    if (!cityId) {
      return { success: false, error: "Choose a city that is already on the list." };
    }
    const gst = formData.get("gst") as string || "";
    const pan = formData.get("pan") as string || "";
    const aadhaar = formData.get("aadhaar") as string || "";

    if (!fullName || !phone || !email || !businessName) {
      return { success: false, error: "Please fill all mandatory partner registration fields." };
    }

    const password = (formData.get("password") as string)?.trim();
    if (!password || password.length < 6) {
      return { success: false, error: "Set a password of at least 6 characters." };
    }

    const chosenPassword = password;
    const hashedPassword = await bcrypt.hash(chosenPassword, 10);

    // Check email uniqueness
    const [existing]: any = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    let userId: number;

    if (existing.length > 0) {
      userId = existing[0].id;
      if (password) {
        await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);
      }
    } else {
      const uid = `usr_partner_${Date.now()}`;
      const [uRes]: any = await db.query(
        "INSERT INTO users (uid, email, password, first_name, phone, role, status) VALUES (?, ?, ?, ?, ?, 'PARTNER', 'active')",
        [uid, email, hashedPassword, fullName, phone]
      );
      userId = uRes.insertId;

      const [roleRow]: any = await db.query("SELECT id FROM roles WHERE name = 'PARTNER'");
      if (roleRow.length > 0) {
        await db.query("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)", [userId, roleRow[0].id]);
      }
    }

    const referralCodeInput = (formData.get("referralCode") as string || "").trim().toUpperCase();

    // Create partner record in PENDING verification status
    const partnerCode = `PTR-${cityId}-${Date.now().toString().slice(-4)}`;
    const newPartnerRefCode = `REF-${partnerCode.replace("PTR-", "")}`;
    const [pRes]: any = await db.query(
      `INSERT INTO partners (user_id, partner_code, referral_code, referred_by, business_name, business_type, experience_years, gst_number, pan_number, aadhaar_number, business_address, city_id, kyc_status, wallet_balance, status, tier_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 100.00, 'active', 'BRONZE')`,
      [userId, partnerCode, newPartnerRefCode, referralCodeInput || null, businessName, businessType, experience, gst, pan, aadhaar, address, cityId]
    );

    // Track referral if invite code was provided
    if (referralCodeInput) {
      const [refRow]: any = await db.query(
        "SELECT partner_code FROM partners WHERE referral_code = ? OR partner_code = ? LIMIT 1",
        [referralCodeInput, referralCodeInput]
      );
      if (refRow.length > 0) {
        await db.query(
          `INSERT INTO partner_referrals (referrer_partner_code, referred_partner_code, referred_name, referred_phone, status, reward_amount)
           VALUES (?, ?, ?, ?, 'pending', 100.00)`,
          [refRow[0].partner_code, partnerCode, fullName, phone]
        );
      }
    }

    revalidatePath("/super-admin/partners");

    return { 
      success: true, 
      partnerCode, 
      message: `Partner application submitted successfully! Application ID: ${partnerCode}. Your account is under verification by our team.` 
    };
  } catch (error: any) {
    console.error("Partner Application Error:", error);
    return { success: false, error: error.message || "Failed to submit partner application." };
  }
}

// ==========================================
// 3. ADMIN: PARTNER VERIFICATION & MODERATION
// ==========================================
export async function setPartnerVerificationCheck(
  partnerId: number,
  checkKey: string,
  status: "passed" | "failed"
) {
  try {
    await ensurePortalTables();
    const allowed = DOORSTEP_CHECKS.some((check) => check.key === checkKey);
    if (!allowed || (status !== "passed" && status !== "failed")) {
      return { success: false, error: "Unknown verification check." };
    }

    if (status === "passed" && checkKey === "identity") {
      const [rows]: any = await db.query(
        "SELECT aadhaar_number, pan_number FROM partners WHERE id = ? LIMIT 1",
        [partnerId]
      );
      const idOnFile = String(rows?.[0]?.aadhaar_number || "").trim() || String(rows?.[0]?.pan_number || "").trim();
      if (!idOnFile) {
        return { success: false, error: "Add an Aadhaar or PAN on the partner profile before passing the ID check." };
      }
    }

    await db.query(
      `INSERT INTO partner_verification_checks (partner_id, check_key, status, evidence_note, checked_at)
       VALUES (?, ?, ?, 'Reviewed by compliance desk', NOW())
       ON DUPLICATE KEY UPDATE status = VALUES(status), evidence_note = VALUES(evidence_note), checked_at = NOW()`,
      [partnerId, checkKey, status]
    );
    const [codeRows]: any = await db.query("SELECT partner_code FROM partners WHERE id = ? LIMIT 1", [partnerId]);
    revalidatePath("/super-admin/partners");
    revalidatePath("/partner/dashboard");
    if (codeRows?.[0]?.partner_code) {
      revalidatePath(`/verify/${codeRows[0].partner_code}`);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Could not save this check." };
  }
}

export async function updatePartnerStatus(partnerId: number, kycStatus: string, adminNotes: string) {
  try {
    await ensurePortalTables();
    if (kycStatus === "approved") {
      const checks = await getPartnerProof(partnerId);
      if (passedCheckCount(checks) < DOORSTEP_CHECKS.length) {
        return {
          success: false,
          error: "Pass identity, mobile, workshop, and background checks before approving doorstep entry.",
        };
      }
    }

    await db.query(
      "UPDATE partners SET kyc_status = ?, admin_notes = ? WHERE id = ?",
      [kycStatus, adminNotes, partnerId]
    );

    // Automated referral reward crediting when partner gets approved
    if (kycStatus === "approved") {
      const [partnerData]: any = await db.query(
        "SELECT partner_code, referred_by, business_name FROM partners WHERE id = ?",
        [partnerId]
      );
      if (partnerData.length > 0 && partnerData[0].referred_by) {
        const refCode = partnerData[0].referred_by;
        const [referrer]: any = await db.query(
          "SELECT id, partner_code, wallet_balance FROM partners WHERE referral_code = ? OR partner_code = ? LIMIT 1",
          [refCode, refCode]
        );
        if (referrer.length > 0) {
          const refPartner = referrer[0];
          const [existingReward]: any = await db.query(
            "SELECT id FROM partner_referrals WHERE referrer_partner_code = ? AND referred_partner_code = ? AND status = 'rewarded'",
            [refPartner.partner_code, partnerData[0].partner_code]
          );
          if (existingReward.length === 0) {
            const reward = 100.00;
            const oldBal = Number(refPartner.wallet_balance || 0);
            const newBal = oldBal + reward;
            await db.query("UPDATE partners SET wallet_balance = ? WHERE id = ?", [newBal, refPartner.id]);
            await db.query(
              "UPDATE partner_referrals SET status = 'rewarded' WHERE referrer_partner_code = ? AND referred_partner_code = ?",
              [refPartner.partner_code, partnerData[0].partner_code]
            );
            const txnCode = `WTX-REF-${Date.now().toString().slice(-6)}`;
            await db.query(
              `INSERT INTO wallet_transactions (transaction_code, partner_id, type, amount, balance_before, balance_after, description, reference_id, status)
               VALUES (?, ?, 'CREDIT', ?, ?, ?, ?, ?, 'success')`,
              [txnCode, refPartner.id, reward, oldBal, newBal, `Referral Bonus for onboarding ${partnerData[0].business_name} (${partnerData[0].partner_code})`, partnerData[0].partner_code]
            );
          }
        }
      }
    }

    revalidatePath("/super-admin/partners");
    revalidatePath("/super-admin/dashboard");
    return { success: true, message: `Partner status updated to ${kycStatus.toUpperCase()}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// 3B. ADMIN: BULK PARTNER CSV IMPORT
// ==========================================
export async function bulkImportPartners(partnersList: Array<{
  fullName: string;
  phone: string;
  email: string;
  businessName: string;
  cityName: string;
  experience?: number | string;
  businessType?: string;
  autoApprove?: boolean;
}>) {
  try {
    if (!Array.isArray(partnersList) || partnersList.length === 0) {
      return { success: false, error: "No partner records provided for import." };
    }

    const bcrypt = require("bcrypt");
    const defaultHash = await bcrypt.hash("partner123", 10);
    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < partnersList.length; i++) {
      const item = partnersList[i];
      const fullName = (item.fullName || "").trim();
      const phone = (item.phone || "").trim();
      const email = (item.email || "").trim().toLowerCase();
      const businessName = (item.businessName || fullName || "Service Hub").trim();
      const cityName = (item.cityName || "New Delhi").trim();
      const experience = Number(item.experience) || 2;
      const businessType = item.businessType || "Individual / Freelancer";
      const autoApprove = !!item.autoApprove;

      if (!fullName || !phone || !email) {
        errors.push(`Row ${i + 1}: Name, Phone, and Email are required.`);
        continue;
      }

      try {
        const cityId = await getOrCreateCityId(cityName);

        // Check if user already exists
        const [existingUser]: any = await db.query("SELECT id FROM users WHERE email = ? OR phone = ?", [email, phone]);
        let userId: number;
        if (existingUser.length > 0) {
          userId = existingUser[0].id;
        } else {
          const uid = `usr_ptr_${Date.now()}_${i}`;
          const [uRes]: any = await db.query(
            "INSERT INTO users (uid, email, password, first_name, phone, role, status) VALUES (?, ?, ?, ?, ?, 'PARTNER', 'active')",
            [uid, email, defaultHash, fullName, phone]
          );
          userId = uRes.insertId;

          const [roleRow]: any = await db.query("SELECT id FROM roles WHERE name = 'PARTNER'");
          if (roleRow.length > 0) {
            await db.query("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)", [userId, roleRow[0].id]);
          }
        }

        // Check if partner profile exists
        const [existingPartner]: any = await db.query("SELECT id FROM partners WHERE user_id = ?", [userId]);
        if (existingPartner.length > 0) {
          errors.push(`Row ${i + 1} (${fullName}): Partner profile already registered.`);
          continue;
        }

        const partnerCode = `PTR-${cityId}-${Date.now().toString().slice(-3)}${i}`;
        const refCode = `REF-${partnerCode.replace("PTR-", "")}`;
        const kycStatus = autoApprove ? "approved" : "pending";
        const initialFloat = autoApprove ? 1000.00 : 500.00;

        await db.query(
          `INSERT INTO partners (user_id, partner_code, referral_code, business_name, business_type, experience_years, business_address, city_id, kyc_status, wallet_balance, status, tier_level)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'BRONZE')`,
          [
            userId,
            partnerCode,
            refCode,
            businessName,
            businessType,
            experience,
            `${cityName} Operating Hub`,
            cityId,
            kycStatus,
            initialFloat
          ]
        );

        successCount++;
      } catch (err: any) {
        errors.push(`Row ${i + 1} (${fullName}): ${err.message}`);
      }
    }

    revalidatePath("/super-admin/partners");
    revalidatePath("/super-admin/dashboard");

    return {
      success: successCount > 0,
      count: successCount,
      total: partnersList.length,
      errors,
      message: `Successfully imported ${successCount} of ${partnersList.length} partners.`
    };
  } catch (error: any) {
    console.error("Bulk Import Error:", error);
    return { success: false, error: error.message || "Failed to process bulk import." };
  }
}

// ==========================================
// 4. PARTNER: ACCEPT LEAD & DEDUCT WALLET FEE
// ==========================================
export async function acceptLeadByPartner(leadId: number, partnerId: number) {
  try {
    // 1. Check partner wallet balance
    const [partnerRows]: any = await db.query(
      "SELECT wallet_balance, business_name, kyc_status, status, accepting_leads FROM partners WHERE id = ?",
      [partnerId]
    );
    if (partnerRows.length === 0) return { success: false, error: "Partner not found" };

    const partner = partnerRows[0];
    const proof = await getPartnerProof(partnerId);
    if (Number(partner.accepting_leads ?? 1) !== 1) {
      return { success: false, error: "You are off today. Turn availability on before accepting a lead." };
    }
    if (!isDoorstepCleared(partner, passedCheckCount(proof))) {
      return {
        success: false,
        error: "Your doorstep clearance is still pending. Customers can only be visited after the proof desk passes every check.",
      };
    }
    const [leadRows]: any = await db.query("SELECT * FROM leads WHERE id = ?", [leadId]);
    if (leadRows.length === 0) return { success: false, error: "Lead not found" };

    const lead = leadRows[0];
    if (lead.status === "ACCEPTED" || lead.status === "IN_PROGRESS" || lead.status === "COMPLETED") {
      return { success: false, error: "This lead has already been accepted by another technician." };
    }

    const leadFee = Number(lead.lead_fee) || 50.00;
    const currentBalance = Number(partner.wallet_balance || 0);

    if (currentBalance < leadFee) {
      return {
        success: false,
        error: `Wallet has ₹${currentBalance.toLocaleString("en-IN")}. Add at least ₹${leadFee.toLocaleString("en-IN")} before accepting this lead.`,
      };
    }

    const newBalance = currentBalance - leadFee;
    const [deducted]: any = await db.query(
      "UPDATE partners SET wallet_balance = wallet_balance - ? WHERE id = ? AND wallet_balance >= ?",
      [leadFee, partnerId, leadFee]
    );
    if (!deducted?.affectedRows) {
      return { success: false, error: "Wallet balance changed. Refresh and try again." };
    }

    const txnCode = `TXN-LEAD-${Date.now().toString().slice(-6)}`;
    await db.query(
      `INSERT INTO wallet_transactions (transaction_code, partner_id, type, amount, balance_before, balance_after, description, reference_id, status)
       VALUES (?, ?, 'LEAD_FEE', ?, ?, ?, ?, ?, 'success')`,
      [txnCode, partnerId, leadFee, currentBalance, newBalance, `Lead fee for ${lead.lead_code}`, String(leadId)]
    );

    await db.query(
      "UPDATE leads SET status = 'ACCEPTED', assigned_partner_id = ? WHERE id = ?",
      [partnerId, leadId]
    );

    // 4. Create an active Job for the partner
    const jobCode = `JOB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const completionOtp = Math.floor(1000 + Math.random() * 9000).toString();

    await db.query(
      `INSERT INTO jobs (job_code, lead_id, partner_id, customer_id, status, estimate_amount, completion_otp)
       VALUES (?, ?, ?, ?, 'SCHEDULED', 499.00, ?)`,
      [jobCode, leadId, partnerId, lead.customer_id, completionOtp]
    );

    // 5. Send Service Verification OTP to Customer's registered Email
    let emailSent = false;
    try {
      const [custUsers]: any = await db.query(
        `SELECT u.email, u.first_name, s.title as service_title
         FROM customers c
         JOIN users u ON c.user_id = u.id
         JOIN leads l ON l.id = ?
         JOIN services s ON l.service_id = s.id
         WHERE c.id = ?`,
        [leadId, lead.customer_id]
      );

      if (custUsers.length > 0 && custUsers[0].email) {
        const mailed = await sendJobOtpEmail({
          to: custUsers[0].email,
          customerName: custUsers[0].first_name || lead.customer_name,
          otp: completionOtp,
          jobCode,
          serviceTitle: custUsers[0].service_title,
          technicianName: partner.business_name || "Authorized Technician",
        });
        emailSent = mailed.success === true;
      }
    } catch (emailErr) {
      console.error("OTP email dispatch error:", emailErr);
    }

    revalidatePath("/partner/dashboard");
    revalidatePath("/partner/leads");
    revalidatePath("/partner/jobs");
    revalidatePath("/partner/wallet");
    revalidatePath("/super-admin/leads");
    revalidatePath("/super-admin/jobs");
    revalidatePath("/customer/dashboard");

    return { 
      success: true, 
      jobCode, 
      message: emailSent
        ? `Lead accepted. Job ${jobCode} is scheduled. The code was emailed. Ask the customer for it at the door.`
        : `Lead accepted. Job ${jobCode} is scheduled. Email is not set up, so the customer sees the code on their booking.` 
    };
  } catch (error: any) {
    console.error("Accept Lead Error:", error);
    return { success: false, error: error.message || "Failed to accept lead." };
  }
}

// ==========================================
// 4B. RESEND SERVICE OTP TO CUSTOMER EMAIL
// ==========================================
export async function sendJobOtpToEmail(jobId: number) {
  try {
    const [jobRows]: any = await db.query(`
      SELECT j.id, j.job_code, j.completion_otp, u.email, u.first_name, l.customer_name, s.title as service_title, p.business_name as partner_name
      FROM jobs j
      JOIN customers c ON j.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN leads l ON j.lead_id = l.id
      JOIN services s ON l.service_id = s.id
      LEFT JOIN partners p ON j.partner_id = p.id
      WHERE j.id = ?
    `, [jobId]);

    if (jobRows.length === 0) return { success: false, error: "Job record not found." };

    const job = jobRows[0];
    const email = job.email;
    if (!email) return { success: false, error: "Customer does not have a valid registered email address." };

    const mailed = await sendJobOtpEmail({
      to: email,
      customerName: job.first_name || job.customer_name || "Valued Customer",
      otp: job.completion_otp,
      jobCode: job.job_code,
      serviceTitle: job.service_title,
      technicianName: job.partner_name || "Authorized Technician",
    });
    if (!mailed.success) {
      return { success: false, error: mailed.error || "Email could not be sent. The customer still has the code on their booking." };
    }

    return { 
      success: true, 
      message: `Code sent to ${email}.` 
    };
  } catch (error: any) {
    console.error("Resend Email OTP Error:", error);
    return { success: false, error: error.message || "Failed to send OTP to email." };
  }
}

// ==========================================
// 5. PARTNER / ADMIN: UPDATE JOB STATUS
// ==========================================
export async function updateJobStatus(jobId: number, nextStatus: string, otpProvided?: string, finalAmount?: number) {
  try {
    await ensurePortalTables();
    const [jobRows]: any = await db.query("SELECT * FROM jobs WHERE id = ?", [jobId]);
    if (jobRows.length === 0) return { success: false, error: "Job not found" };

    const job = jobRows[0];

    // If completing the job, check mandatory OTP if set
    if (nextStatus === "COMPLETED") {
      const [otpRows]: any = await db.query(
        "SELECT setting_value FROM system_settings WHERE setting_key = 'mandatory_job_otp' LIMIT 1"
      );
      const otpRequired = otpRows?.[0]?.setting_value !== "false";
      if (otpRequired && job.completion_otp && String(otpProvided || "").trim() !== String(job.completion_otp)) {
        return { success: false, error: "Enter the customer's completion OTP before closing this job." };
      }

      const [partnerRows]: any = await db.query(
        "SELECT wallet_balance, total_completed_jobs FROM partners WHERE id = ?",
        [job.partner_id]
      );
      const partnerRow = partnerRows?.[0] || { wallet_balance: 0, total_completed_jobs: 0 };
      const tier = getPartnerTier(Number(partnerRow.total_completed_jobs) || 0);
      const commissionPct = Number(String(tier.rate).replace("%", "")) || 15;

      let discount = 0;
      try {
        const [leadRows]: any = await db.query(
          "SELECT discount_amount FROM leads WHERE id = ? LIMIT 1",
          [job.lead_id]
        );
        discount = Number(leadRows?.[0]?.discount_amount || 0);
      } catch {
        discount = 0;
      }

      const [billRows]: any = await db.query(
        "SELECT qty, unit_price FROM job_bill_items WHERE job_id = ?",
        [jobId]
      );
      const linesTotal = (billRows || []).reduce(
        (sum: number, row: any) => sum + Number(row.qty || 0) * Number(row.unit_price || 0),
        0
      );
      const gross = linesTotal > 0 ? linesTotal : Number(finalAmount || job.estimate_amount || 0);
      if (!gross) return { success: false, error: "Enter the final bill amount." };
      const total = Math.max(0, gross - discount);
      const commission = (total * commissionPct) / 100;
      const earnings = total - commission;
      const before = Number(partnerRow.wallet_balance || 0);
      const after = before + earnings;

      await db.query(
        `UPDATE jobs SET status = 'COMPLETED', final_amount = ?, platform_commission = ?, partner_earnings = ?, payment_status = 'paid' WHERE id = ?`,
        [total, commission, earnings, jobId]
      );

      await db.query(
        "UPDATE partners SET total_completed_jobs = total_completed_jobs + 1, wallet_balance = ? WHERE id = ?",
        [after, job.partner_id]
      );

      const earnCode = `TXN-JOB-${Date.now().toString().slice(-6)}`;
      await db.query(
        `INSERT INTO wallet_transactions (transaction_code, partner_id, type, amount, balance_before, balance_after, description, reference_id, status)
         VALUES (?, ?, 'JOB_EARNING', ?, ?, ?, ?, ?, 'success')`,
        [earnCode, job.partner_id, earnings, before, after, `Earnings for job ${job.job_code}`, String(jobId)]
      );

      await db.query("UPDATE leads SET status = 'COMPLETED' WHERE id = ?", [job.lead_id]);
    } else {
      await db.query("UPDATE jobs SET status = ? WHERE id = ?", [nextStatus, jobId]);
      if (nextStatus === "PARTNER_ON_THE_WAY" || nextStatus === "ARRIVED" || nextStatus === "WORK_IN_PROGRESS") {
        await db.query("UPDATE leads SET status = 'IN_PROGRESS' WHERE id = ?", [job.lead_id]);
      }
    }

    revalidatePath("/partner/jobs");
    revalidatePath("/partner/wallet");
    revalidatePath("/partner/dashboard");
    revalidatePath("/super-admin/jobs");
    revalidatePath("/customer/dashboard");

    return { success: true, message: `Job status updated to ${nextStatus}` };
  } catch (error: any) {
    console.error("Job Status Update Error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 5B. PARTNER: UPLOAD BEFORE / AFTER PHOTO PROOFS
// ==========================================
export async function uploadJobPhotoProof(formData: FormData) {
  try {
    const jobId = Number(formData.get("jobId"));
    const photoType = formData.get("photoType") as string; // 'before' or 'after'
    const photoUrl = formData.get("photoUrl") as string;
    const notes = formData.get("notes") as string || "";

    if (!jobId || !photoType || !photoUrl) {
      return { success: false, error: "Please provide a valid photo URL or image proof." };
    }

    const column = photoType === "before" ? "before_photo_url" : "after_photo_url";
    await db.query(`UPDATE jobs SET ${column} = ?, partner_notes = ? WHERE id = ?`, [photoUrl, notes, jobId]);

    revalidatePath("/partner/jobs");
    revalidatePath("/super-admin/jobs");
    revalidatePath("/customer/dashboard");

    return { 
      success: true, 
      message: `${photoType === 'before' ? 'Before-Repair' : 'After-Repair'} inspection photo saved successfully!` 
    };
  } catch (error: any) {
    console.error("Upload Photo Proof Error:", error);
    return { success: false, error: error.message || "Failed to upload photo proof." };
  }
}

// ==========================================
// 6. WALLET RECHARGE
// ==========================================
export async function rechargePartnerWallet(partnerId: number, amount: number) {
  try {
    const session: any = await getSession();
    if (session?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only an admin can add float." };
    }
    if (amount <= 0) return { success: false, error: "Invalid recharge amount." };

    const [partnerRows]: any = await db.query("SELECT wallet_balance FROM partners WHERE id = ?", [partnerId]);
    if (partnerRows.length === 0) return { success: false, error: "Partner not found." };

    const before = Number(partnerRows[0].wallet_balance);
    const after = before + amount;

    await db.query("UPDATE partners SET wallet_balance = ? WHERE id = ?", [after, partnerId]);

    const txnCode = `TXN-RC-${Date.now().toString().slice(-6)}`;
    await db.query(
      `INSERT INTO wallet_transactions (transaction_code, partner_id, type, amount, balance_before, balance_after, description, status)
       VALUES (?, ?, 'CREDIT', ?, ?, ?, 'Wallet Quick Top-up', 'success')`,
      [txnCode, partnerId, amount, before, after]
    );

    revalidatePath("/partner/wallet");
    revalidatePath("/partner/dashboard");
    revalidatePath("/super-admin/wallet");

    return { success: true, message: `Wallet credited with ₹${amount}. New balance: ₹${after.toFixed(2)}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// 7. PARTNER: REQUEST WITHDRAWAL / PAYOUT
// ==========================================
export async function requestPartnerWithdrawal(formData: FormData) {
  try {
    const partnerId = Number(formData.get("partnerId"));
    const amount = Number(formData.get("amount"));
    const bankName = formData.get("bankName") as string || "";
    const accountNumber = formData.get("accountNumber") as string || "";
    const ifscCode = formData.get("ifscCode") as string || "";
    const upiId = formData.get("upiId") as string || "";

    if (!partnerId || amount <= 0) {
      return { success: false, error: "Invalid withdrawal request." };
    }

    if (amount < 500) {
      return { success: false, error: "Minimum payout threshold is ₹500." };
    }

    const [partnerRows]: any = await db.query("SELECT wallet_balance FROM partners WHERE id = ?", [partnerId]);
    if (partnerRows.length === 0) return { success: false, error: "Partner not found." };

    const currentBalance = Number(partnerRows[0].wallet_balance);
    if (currentBalance < amount) {
      return { success: false, error: `Insufficient funds. Available balance: ₹${currentBalance.toFixed(2)}` };
    }

    // Deduct from wallet balance
    const newBalance = currentBalance - amount;
    await db.query("UPDATE partners SET wallet_balance = ? WHERE id = ?", [newBalance, partnerId]);

    const wCode = `WTH-${Date.now().toString().slice(-6)}`;
    await db.query(
      `INSERT INTO withdrawals (withdrawal_code, partner_id, amount, bank_name, account_number, ifsc_code, upi_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [wCode, partnerId, amount, bankName, accountNumber, ifscCode, upiId]
    );

    const txnCode = `TXN-WTH-${Date.now().toString().slice(-6)}`;
    await db.query(
      `INSERT INTO wallet_transactions (transaction_code, partner_id, type, amount, balance_before, balance_after, description, reference_id, status)
       VALUES (?, ?, 'WITHDRAWAL', ?, ?, ?, 'Payout Request Submitted', ?, 'pending')`,
      [txnCode, partnerId, amount, currentBalance, newBalance, wCode]
    );

    revalidatePath("/partner/wallet");
    revalidatePath("/partner/withdrawals");
    revalidatePath("/super-admin/withdrawals");
    revalidatePath("/super-admin/wallet");

    return { success: true, message: `Payout request of ₹${amount} submitted! Request ID: ${wCode}` };
  } catch (error: any) {
    console.error("Withdrawal Request Error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 8. ADMIN: PROCESS & SETTLE WITHDRAWAL
// ==========================================
export async function processAdminWithdrawal(withdrawalId: number, status: string, notes?: string) {
  try {
    const [wRows]: any = await db.query("SELECT * FROM withdrawals WHERE id = ?", [withdrawalId]);
    if (wRows.length === 0) return { success: false, error: "Withdrawal record not found." };

    const record = wRows[0];

    if (status === "PAID" || status === "APPROVED") {
      await db.query(
        "UPDATE withdrawals SET status = ?, admin_notes = ?, processed_at = NOW() WHERE id = ?",
        [status, notes || "Settled by Finance", withdrawalId]
      );
    } else if (status === "REJECTED") {
      // Refund money back to partner wallet
      const [partnerRows]: any = await db.query("SELECT wallet_balance FROM partners WHERE id = ?", [record.partner_id]);
      const currentBalance = Number(partnerRows[0]?.wallet_balance || 0);
      const refundedBalance = currentBalance + Number(record.amount);

      await db.query("UPDATE partners SET wallet_balance = ? WHERE id = ?", [refundedBalance, record.partner_id]);

      await db.query(
        "UPDATE withdrawals SET status = 'REJECTED', admin_notes = ?, processed_at = NOW() WHERE id = ?",
        [notes || "Rejected by Finance - Funds refunded to wallet", withdrawalId]
      );

      const txnCode = `TXN-REF-${Date.now().toString().slice(-6)}`;
      await db.query(
        `INSERT INTO wallet_transactions (transaction_code, partner_id, type, amount, balance_before, balance_after, description, reference_id, status)
         VALUES (?, ?, 'REFUND', ?, ?, ?, 'Payout Rejected - Refunded to Float', ?, 'success')`,
        [txnCode, record.partner_id, record.amount, currentBalance, refundedBalance, record.withdrawal_code]
      );
    }

    revalidatePath("/super-admin/withdrawals");
    revalidatePath("/super-admin/wallet");
    revalidatePath("/partner/wallet");
    revalidatePath("/partner/withdrawals");

    return { success: true, message: `Withdrawal #${record.withdrawal_code} updated to ${status}` };
  } catch (error: any) {
    console.error("Process Withdrawal Error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 9. CUSTOMER: SUBMIT REVIEW FOR COMPLETED JOB
// ==========================================
export async function submitCustomerReview(formData: FormData) {
  try {
    const partnerId = Number(formData.get("partnerId"));
    const customerName = formData.get("customerName") as string || "Verified Customer";
    const rating = Number(formData.get("rating")) || 5;
    const comment = formData.get("comment") as string;

    if (!partnerId || !comment) {
      return { success: false, error: "Please provide a rating and review feedback." };
    }

    // Ensure reviews table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        partner_id INT NOT NULL,
        customer_name VARCHAR(100),
        rating DECIMAL(2,1) DEFAULT 5.0,
        comment TEXT,
        status ENUM('pending', 'approved', 'flagged') DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(
      `INSERT INTO reviews (partner_id, customer_name, rating, comment, status)
       VALUES (?, ?, ?, ?, 'approved')`,
      [partnerId, customerName, rating, comment]
    );

    // Recalculate partner rating average
    const [avgRows]: any = await db.query(
      "SELECT AVG(rating) as avg_rating FROM reviews WHERE partner_id = ? AND status = 'approved'",
      [partnerId]
    );
    if (avgRows.length > 0 && avgRows[0].avg_rating) {
      await db.query("UPDATE partners SET rating = ? WHERE id = ?", [Number(avgRows[0].avg_rating).toFixed(1), partnerId]);
    }

    revalidatePath("/customer/dashboard");
    revalidatePath("/super-admin/reviews");
    revalidatePath("/partner/dashboard");

    return { success: true, message: "Thank you! Your feedback has been verified and published." };
  } catch (error: any) {
    console.error("Submit Review Error:", error);
    return { success: false, error: error.message || "Failed to submit review." };
  }
}

// ==========================================
// 10. PARTNER: UPDATE PROFILE & BANK DETAILS
// ==========================================
export async function updatePartnerProfile(formData: FormData) {
  try {
    await ensurePortalTables();
    const partnerId = Number(formData.get("partnerId"));
    const session: any = await getSession();
    if (!session?.id) return { success: false, error: "Login required." };
    if (session.role !== "SUPER_ADMIN") {
      const [own]: any = await db.query(
        "SELECT id FROM partners WHERE user_id = ? AND id = ? LIMIT 1",
        [session.id, partnerId]
      );
      if (!own?.length) return { success: false, error: "You can edit only your workshop." };
    }
    const pins = parsePincodes(String(formData.get("pincodes") || ""));
    if (pins.error) return { success: false, error: pins.error };
    const businessName = formData.get("businessName") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const experience = Number(formData.get("experience")) || 1;
    const gstNumber = formData.get("gstNumber") as string || "";
    const panNumber = formData.get("panNumber") as string || "";
    const aadhaarNumber = formData.get("aadhaarNumber") as string || "";
    const serviceRadius = Number(formData.get("serviceRadius")) || 20;

    const cityName = String(formData.get("cityName") || "");
    const cityId = await findCityId(cityName);
    if (!cityId) {
      return { success: false, error: "Choose a city that is already on the list." };
    }

    await db.query(
      `UPDATE partners 
       SET business_name = ?, business_address = ?, experience_years = ?, gst_number = ?, pan_number = ?, aadhaar_number = ?, service_radius_km = ?, city_id = ?
       WHERE id = ?`,
      [businessName, address, experience, gstNumber, panNumber, aadhaarNumber, serviceRadius, cityId, partnerId]
    );
    await db.query("DELETE FROM partner_pincodes WHERE partner_id = ?", [partnerId]);
    for (const pin of pins.pins) {
      await db.query(
        "INSERT INTO partner_pincodes (partner_id, pincode) VALUES (?, ?)",
        [partnerId, pin]
      );
    }

    // If phone is provided, update linked user
    if (phone) {
      const [pRows]: any = await db.query("SELECT user_id FROM partners WHERE id = ?", [partnerId]);
      if (pRows.length > 0) {
        await db.query("UPDATE users SET phone = ? WHERE id = ?", [phone, pRows[0].user_id]);
      }
    }

    revalidatePath("/partner/profile");
    revalidatePath("/partner/dashboard");
    revalidatePath("/super-admin/partners");

    return { success: true, message: "Partner profile updated successfully!" };
  } catch (error: any) {
    console.error("Update Partner Profile Error:", error);
    return { success: false, error: error.message || "Failed to update profile." };
  }
}

// ==========================================
// 11. CUSTOMER: CANCEL SERVICE REQUEST
// ==========================================
export async function cancelCustomerServiceRequest(formData: FormData) {
  try {
    const leadId = Number(formData.get("leadId"));

    if (!leadId) {
      return { success: false, error: "Invalid lead ID" };
    }

    const [leadRows]: any = await db.query("SELECT * FROM leads WHERE id = ?", [leadId]);
    if (leadRows.length === 0) {
      return { success: false, error: "Service request not found." };
    }

    const lead = leadRows[0];

    if (lead.status === "COMPLETED") {
      return { success: false, error: "Cannot cancel a completed service request." };
    }

    if (lead.status === "CANCELLED") {
      return { success: false, error: "This request is already cancelled." };
    }

    // Mark lead cancelled
    await db.query("UPDATE leads SET status = 'CANCELLED' WHERE id = ?", [leadId]);

    // Mark linked jobs cancelled if any
    await db.query("UPDATE jobs SET status = 'CANCELLED' WHERE lead_id = ?", [leadId]);

    // Refund partner float if lead fee was collected
    if (lead.assigned_partner_id && Number(lead.lead_fee) > 0) {
      const [partnerRows]: any = await db.query(
        "SELECT id, wallet_balance FROM partners WHERE id = ?",
        [lead.assigned_partner_id]
      );
      if (partnerRows.length > 0) {
        const fee = Number(lead.lead_fee);
        const before = Number(partnerRows[0].wallet_balance);
        const after = before + fee;
        await db.query("UPDATE partners SET wallet_balance = ? WHERE id = ?", [after, lead.assigned_partner_id]);

        const txnCode = `TXN-RF-${Date.now().toString().slice(-6)}`;
        await db.query(
          `INSERT INTO wallet_transactions (transaction_code, partner_id, type, amount, balance_before, balance_after, description, reference_id, status)
           VALUES (?, ?, 'CREDIT', ?, ?, ?, ?, ?, 'success')`,
          [
            txnCode,
            lead.assigned_partner_id,
            fee,
            before,
            after,
            `Refund: Lead #${lead.lead_code} cancelled by customer`,
            lead.lead_code,
          ]
        );
      }
    }

    revalidatePath("/customer/dashboard");
    revalidatePath("/partner/leads");
    revalidatePath("/partner/jobs");
    revalidatePath("/super-admin/leads");
    revalidatePath("/super-admin/dashboard");

    return { 
      success: true, 
      message: `Service request #${lead.lead_code} has been cancelled successfully.` 
    };
  } catch (error: any) {
    console.error("Cancel Service Error:", error);
    return { success: false, error: error.message || "Failed to cancel service request." };
  }
}

