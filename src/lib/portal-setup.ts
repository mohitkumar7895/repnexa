import bcrypt from "bcrypt";
import { db } from "@/lib/db";

let extrasReady = false;

export async function ensurePortalTables() {
  if (extrasReady) return;

  await db.query(`
    CREATE TABLE IF NOT EXISTS partner_verification_checks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      partner_id INT NOT NULL,
      check_key VARCHAR(40) NOT NULL,
      status ENUM('pending', 'passed', 'failed') DEFAULT 'pending',
      evidence_note VARCHAR(255) NULL,
      checked_at TIMESTAMP NULL,
      UNIQUE KEY uniq_partner_check (partner_id, check_key)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      discount_type VARCHAR(20) NOT NULL,
      discount_value DECIMAL(10,2) NOT NULL,
      min_order_amount DECIMAL(10,2) DEFAULT 0,
      max_discount_amount DECIMAL(10,2) DEFAULT 500,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS job_bill_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      job_id INT NOT NULL,
      partner_id INT NOT NULL,
      item_name VARCHAR(160) NOT NULL,
      qty INT NOT NULL DEFAULT 1,
      unit_price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_bill_job (job_id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS partner_pincodes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      partner_id INT NOT NULL,
      pincode VARCHAR(10) NOT NULL,
      UNIQUE KEY uniq_partner_pin (partner_id, pincode)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS damage_reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      report_code VARCHAR(40) UNIQUE,
      lead_id INT NOT NULL,
      job_id INT NULL,
      partner_id INT NULL,
      customer_name VARCHAR(150),
      customer_phone VARCHAR(30),
      description TEXT NOT NULL,
      photo_url VARCHAR(500) NULL,
      status VARCHAR(30) DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_damage_lead (lead_id)
    )
  `);

  const alters = [
    "ALTER TABLE leads ADD COLUMN coupon_code VARCHAR(50) NULL",
    "ALTER TABLE leads ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0",
    "ALTER TABLE partners ADD COLUMN referral_code VARCHAR(50) NULL",
    "ALTER TABLE partners ADD COLUMN referred_by VARCHAR(50) NULL",
    "ALTER TABLE partners ADD COLUMN tier_level VARCHAR(20) DEFAULT 'BRONZE'",
    "ALTER TABLE partners ADD COLUMN accepting_leads TINYINT(1) NOT NULL DEFAULT 1",
    "ALTER TABLE jobs ADD COLUMN bill_requested TINYINT(1) NOT NULL DEFAULT 0",
  ];

  for (const sql of alters) {
    try {
      await db.query(sql);
    } catch {
      // Column already exists on databases that were migrated earlier.
    }
  }

  extrasReady = true;
}

export async function ensurePortalDemoAccounts() {
  if (process.env.NODE_ENV === "production") return;
  try {
    await ensurePortalTables();

    const adminEmail = "superadmin@repnexa.com";
    const [admins]: any = await db.query("SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1", [adminEmail]);
    if (!admins?.length) {
      const hashed = await bcrypt.hash("admin123", 10);
      await db.query(
        "INSERT INTO users (email, password, first_name, last_name, phone, role, status) VALUES (?, ?, 'Super', 'Admin', '7895094129', 'SUPER_ADMIN', 'active')",
        [adminEmail, hashed]
      );
    }

    const partnerEmail = "sharma.ac@repnexa.com";
    const [users]: any = await db.query("SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1", [partnerEmail]);
    let userId = users?.[0]?.id as number | undefined;
    if (!userId) {
      const hashed = await bcrypt.hash("partner123", 10);
      const [inserted]: any = await db.query(
        "INSERT INTO users (email, password, first_name, last_name, phone, role, status) VALUES (?, ?, 'Ramesh', 'Sharma', '7895094129', 'PARTNER', 'active')",
        [partnerEmail, hashed]
      );
      userId = inserted.insertId;
    }

    const [partners]: any = await db.query(
      "SELECT id FROM partners WHERE user_id = ? OR partner_code = 'PTR-DEL-1001' LIMIT 1",
      [userId]
    );
    if (!partners?.length && userId) {
      const [cityRows]: any = await db.query("SELECT id FROM cities ORDER BY id ASC LIMIT 1");
      const cityId = cityRows?.[0]?.id || null;
      await db.query(
        `INSERT INTO partners (user_id, partner_code, referral_code, business_name, business_type, experience_years, business_address, city_id, kyc_status, wallet_balance, status, tier_level, service_radius_km)
         VALUES (?, 'PTR-DEL-1001', 'REF-DEL-1001', 'Sharma Cooling Solutions', 'Proprietorship', 8, 'Shop 14, Main Market, New Delhi', ?, 'pending', 0, 'active', 'BRONZE', 20)`,
        [userId, cityId]
      );
    }
  } catch (error) {
    console.error("Demo account setup skipped:", error);
  }
}
