const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'repnexa'
  });

  console.log('Connected to MySQL. Updating schema...');

  // Safe column additions
  try {
    await conn.query("ALTER TABLE partners ADD COLUMN referral_code VARCHAR(50) UNIQUE AFTER partner_code");
    console.log('Added referral_code');
  } catch(e) { console.log('referral_code check:', e.message); }

  try {
    await conn.query("ALTER TABLE partners ADD COLUMN referred_by VARCHAR(50) AFTER referral_code");
    console.log('Added referred_by');
  } catch(e) { console.log('referred_by check:', e.message); }

  try {
    await conn.query("ALTER TABLE partners ADD COLUMN tier_level VARCHAR(20) DEFAULT 'BRONZE' AFTER rating");
    console.log('Added tier_level');
  } catch(e) { console.log('tier_level check:', e.message); }

  // Create partner_referrals table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS partner_referrals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      referrer_partner_code VARCHAR(50) NOT NULL,
      referred_partner_code VARCHAR(50) NOT NULL,
      referred_name VARCHAR(100),
      referred_phone VARCHAR(20),
      status ENUM('pending', 'verified', 'rewarded') DEFAULT 'pending',
      reward_amount DECIMAL(10,2) DEFAULT 500.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Created partner_referrals table if not exists');

  // Ensure demo partner PTR-DEL-1001 has referral code and Tier
  await conn.query(`
    UPDATE partners 
    SET referral_code = 'REF-DEL-1001', tier_level = 'GOLD'
    WHERE partner_code = 'PTR-DEL-1001' AND (referral_code IS NULL OR referral_code = '')
  `);

  // Give default referral_code to any partners missing one
  const [allPartners] = await conn.query("SELECT id, partner_code, referral_code FROM partners");
  for (const p of allPartners) {
    if (!p.referral_code && p.partner_code) {
      const code = 'REF-' + p.partner_code.replace('PTR-', '');
      try {
        await conn.query("UPDATE partners SET referral_code = ? WHERE id = ?", [code, p.id]);
      } catch (err) {}
    }
  }

  // Seed sample referral records for PTR-DEL-1001 to show live gamification
  const [refCount] = await conn.query("SELECT COUNT(*) as c FROM partner_referrals WHERE referrer_partner_code = 'PTR-DEL-1001'");
  if (refCount[0].c === 0) {
    await conn.query(`
      INSERT INTO partner_referrals (referrer_partner_code, referred_partner_code, referred_name, referred_phone, status, reward_amount)
      VALUES 
      ('PTR-DEL-1001', 'PTR-DEL-1008', 'Manoj Kumar (Aircon Hub)', '9811002233', 'rewarded', 500.00),
      ('PTR-DEL-1001', 'PTR-NOI-1022', 'Amit Singh (CoolCare)', '9877665544', 'verified', 500.00),
      ('PTR-DEL-1001', 'PTR-GUR-1045', 'Vikram Verma', '9812345678', 'pending', 500.00)
    `);
    console.log('Seeded sample referral records for PTR-DEL-1001');
  }

  console.log('Migration & sample referral seed complete!');
  await conn.end();
}

migrate().catch(console.error);
