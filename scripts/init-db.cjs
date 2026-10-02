const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function ensureColumn(conn, table, column, definition) {
  const [cols] = await conn.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
  if (cols.length === 0) {
    console.log(`Adding missing column ${column} to ${table}...`);
    await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  }
}

async function seed() {
  console.log("Starting full database schema and seed setup...");
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
  });

  const dbName = process.env.MYSQL_DATABASE || "repnexa";
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.query(`USE \`${dbName}\``);

  console.log("Database selected:", dbName);

  // Ensure users table has all required columns
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await ensureColumn(connection, 'users', 'password', 'VARCHAR(255) NULL');
  await ensureColumn(connection, 'users', 'first_name', 'VARCHAR(100) NULL');
  await ensureColumn(connection, 'users', 'last_name', 'VARCHAR(100) NULL');
  await ensureColumn(connection, 'users', 'phone', 'VARCHAR(20) NULL');
  await ensureColumn(connection, 'users', 'role', "VARCHAR(50) DEFAULT 'CUSTOMER'");
  await ensureColumn(connection, 'users', 'status', "ENUM('active', 'inactive', 'suspended') DEFAULT 'active'");

  // 1. Roles & Permissions (RBAC)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id INT NOT NULL,
      role_id INT NOT NULL,
      PRIMARY KEY (user_id, role_id)
    )
  `);

  // 2. Locations
  await connection.query(`
    CREATE TABLE IF NOT EXISTS states (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      code VARCHAR(10),
      status ENUM('active', 'inactive') DEFAULT 'active'
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS cities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      state_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      status ENUM('active', 'inactive') DEFAULT 'active'
    )
  `);

  // SEED ROLES
  const roles = [
    'SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'PARTNER_MANAGER',
    'VERIFICATION_MANAGER', 'FINANCE_MANAGER', 'SUPPORT_MANAGER', 
    'CONTENT_MANAGER', 'CUSTOMER', 'PARTNER'
  ];
  for (const role of roles) {
    await connection.query('INSERT IGNORE INTO roles (name, description) VALUES (?, ?)', [role, `${role} Role`]);
  }

  // SEED SYSTEM SETTINGS
  await connection.query(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) UNIQUE NOT NULL,
      setting_value TEXT NOT NULL,
      setting_group VARCHAR(50) DEFAULT 'general',
      description TEXT
    )
  `);

  const defaultSettings = [
    ['company_name', 'Repnexa Services India Pvt Ltd', 'general', 'Platform Registered Name'],
    ['support_phone', '+91 98765 43210', 'general', 'Customer Helpline'],
    ['support_email', 'support@repnexa.com', 'general', 'Official Support Email'],
    ['lead_distribution_model', 'LEAD_FEE', 'lead', 'Lead model: LEAD_FEE, COMMISSION, or HYBRID'],
    ['default_lead_fee', '50.00', 'lead', 'Default fee charged per lead in INR'],
    ['default_commission_pct', '15.00', 'finance', 'Default commission percentage on completed jobs'],
    ['minimum_wallet_balance', '500.00', 'partner', 'Minimum balance required to receive leads'],
    ['service_radius_km', '25', 'lead', 'Default matching radius for partners in KM'],
    ['auto_assign_leads', 'true', 'lead', 'Automatically distribute leads to nearby verified partners'],
    ['mandatory_job_otp', 'true', 'jobs', 'Require customer OTP for job completion verification'],
    ['lead_expiry_hours', '24', 'lead', 'Hours before unaccepted lead expires'],
    ['min_withdrawal_amount', '1000.00', 'finance', 'Minimum partner wallet withdrawal limit']
  ];
  for (const [k, v, g, d] of defaultSettings) {
    await connection.query('INSERT IGNORE INTO system_settings (setting_key, setting_value, setting_group, description) VALUES (?, ?, ?, ?)', [k, v, g, d]);
  }

  // SEED LOCATIONS
  const locationSeeds = [
    { state: 'Delhi NCR', code: 'DL', cities: ['New Delhi', 'Noida', 'Greater Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad'] },
    { state: 'Maharashtra', code: 'MH', cities: ['Mumbai', 'Pune', 'Thane', 'Navi Mumbai', 'Nagpur'] },
    { state: 'Karnataka', code: 'KA', cities: ['Bangalore', 'Mysore', 'Hubli'] },
    { state: 'Telangana', code: 'TS', cities: ['Hyderabad', 'Secunderabad', 'Warangal'] },
    { state: 'Tamil Nadu', code: 'TN', cities: ['Chennai', 'Coimbatore', 'Madurai'] },
    { state: 'Rajasthan', code: 'RJ', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'] },
    { state: 'Uttar Pradesh', code: 'UP', cities: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj'] }
  ];

  for (const s of locationSeeds) {
    await connection.query('INSERT IGNORE INTO states (name, code) VALUES (?, ?)', [s.state, s.code]);
    const [existingState] = await connection.query('SELECT id FROM states WHERE name = ?', [s.state]);
    const stateId = existingState[0]?.id;
    if (stateId) {
      for (const city of s.cities) {
        await connection.query('INSERT IGNORE INTO cities (state_id, name) VALUES (?, ?)', [stateId, city]);
      }
    }
  }

  // SEED CATEGORIES, SUBCATEGORIES, SERVICES & BRANDS
  const masterData = [
    {
      category: 'Air Conditioners (AC)',
      labour: 299,
      subcategories: [
        {
          title: 'Split AC',
          services: [
            { title: 'Split AC Deep Clean Service', original: 699, selling: 499, warranty: 30, desc: 'Complete jet pump water cleaning of indoor and outdoor units.' },
            { title: 'Split AC Repair & Diagnosis', original: 499, selling: 299, warranty: 90, desc: 'Inspection of cooling, electrical, gas leakage and PCB components.' },
            { title: 'Split AC Gas Charging (Full Refill)', original: 2499, selling: 1899, warranty: 180, desc: 'High grade R32/R410A refrigerant gas filling with nitrogen leak test.' },
            { title: 'Split AC Installation', original: 1499, selling: 999, warranty: 60, desc: 'Professional bracket mounting, copper pipe insulation and vacuuming.' }
          ]
        },
        {
          title: 'Window AC',
          services: [
            { title: 'Window AC Jet Service', original: 599, selling: 399, warranty: 30, desc: 'Intense water wash, coil cleanup, filter wash and blower cleaning.' },
            { title: 'Window AC Repair & Troubleshooting', original: 449, selling: 249, warranty: 90, desc: 'Capacitor, thermostat, fan motor or cooling coil diagnosis.' }
          ]
        }
      ],
      brands: ['Voltas', 'Daikin', 'LG', 'Hitachi', 'Blue Star', 'Carrier', 'Panasonic', 'Lloyd', 'Godrej', 'Haier']
    },
    {
      category: 'Refrigerator',
      labour: 249,
      subcategories: [
        {
          title: 'Single Door Fridge',
          services: [
            { title: 'Single Door Fridge Repair & Diagnosis', original: 399, selling: 249, warranty: 90, desc: 'Thermostat, relay, capacitor, door seal, or cooling trouble.' },
            { title: 'Single Door Gas Charging', original: 1899, selling: 1399, warranty: 180, desc: 'Compressor check, leak repair and fresh R600a/R134a refrigerant.' }
          ]
        },
        {
          title: 'Double Door & Frost-Free',
          services: [
            { title: 'Double Door Frost-Free Repair', original: 499, selling: 349, warranty: 90, desc: 'Bimetal sensor, defrost timer, fan motor, heater diagnosis.' },
            { title: 'Side-by-Side Inverter Refrigerator Repair', original: 799, selling: 549, warranty: 90, desc: 'Digital inverter PCB, multi-airflow sensor and damper motor diagnosis.' }
          ]
        }
      ],
      brands: ['Samsung', 'LG', 'Whirlpool', 'Godrej', 'Haier', 'Bosch', 'Panasonic', 'Kelvinator']
    },
    {
      category: 'Washing Machine',
      labour: 249,
      subcategories: [
        {
          title: 'Fully Automatic Front Load',
          services: [
            { title: 'Front Load Washing Machine Repair', original: 599, selling: 399, warranty: 90, desc: 'Drum rotation issue, door lock error, drain pump, inlet valve, PCB.' },
            { title: 'Front Load Descaling & Maintenance', original: 549, selling: 349, warranty: 30, desc: 'Deep chemical descaling to remove lint, lime and detergent residues.' }
          ]
        },
        {
          title: 'Fully Automatic Top Load',
          services: [
            { title: 'Top Load Machine Repair', original: 499, selling: 349, warranty: 90, desc: 'Spin error, water not filling or draining, heavy vibration fix.' }
          ]
        },
        {
          title: 'Semi Automatic Machine',
          services: [
            { title: 'Semi Automatic Machine Repair', original: 399, selling: 249, warranty: 90, desc: 'Wash motor, spin motor, capacitor, timer switch and belt replacement.' }
          ]
        }
      ],
      brands: ['LG', 'Samsung', 'IFB', 'Whirlpool', 'Bosch', 'Godrej', 'Panasonic', 'Haier']
    },
    {
      category: 'Television & LED TV',
      labour: 299,
      subcategories: [
        {
          title: 'Smart LED TV',
          services: [
            { title: 'LED / Smart TV Display Issue Diagnosis', original: 599, selling: 399, warranty: 90, desc: 'Sound present but no picture, flickering screen, lines on screen.' },
            { title: 'LED TV Backlight Replacement', original: 1899, selling: 1299, warranty: 180, desc: 'Original LED strip replacement with 6 months warranty.' },
            { title: 'Smart TV Wall Mounting & Setup', original: 499, selling: 299, warranty: 30, desc: 'Precision spirit-level wall mounting on brick or wooden panel.' }
          ]
        }
      ],
      brands: ['Sony', 'Samsung', 'LG', 'Mi (Xiaomi)', 'OnePlus', 'TCL', 'Vu', 'Panasonic', 'Realme']
    },
    {
      category: 'Water Purifier & RO',
      labour: 199,
      subcategories: [
        {
          title: 'Home RO Systems',
          services: [
            { title: 'RO Complete Service & Filter Check', original: 499, selling: 299, warranty: 30, desc: 'Sediment, carbon, pre-filter wash, TDS test and pressure diagnosis.' },
            { title: 'RO Membrane & Filter Replacement Kit', original: 2499, selling: 1699, warranty: 180, desc: 'Genuine 75/80 GPD RO membrane with active carbon and post carbon.' }
          ]
        }
      ],
      brands: ['Kent', 'Aquaguard (Eureka Forbes)', 'Livpure', 'Pureit (HUL)', 'Blue Star', 'AO Smith', 'Havells']
    },
    {
      category: 'Computers & Laptops',
      labour: 349,
      subcategories: [
        {
          title: 'Laptop Repair',
          services: [
            { title: 'Laptop General Hardware Diagnostic', original: 499, selling: 299, warranty: 30, desc: 'No power, heating, slow performance, battery and charging jack issues.' },
            { title: 'Laptop Screen / Keyboard Replacement', original: 699, selling: 449, warranty: 90, desc: 'Cracked screen or keys not working repair.' }
          ]
        }
      ],
      brands: ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Apple', 'Canon', 'Epson']
    },
    {
      category: 'Security & CCTV',
      labour: 399,
      subcategories: [
        {
          title: 'CCTV Setup & Support',
          services: [
            { title: 'CCTV Camera Installation & Wiring', original: 699, selling: 449, warranty: 90, desc: 'HD/IP camera mounting, BNC connector and cabling.' }
          ]
        }
      ],
      brands: ['CP Plus', 'Hikvision', 'Dahua', 'Ezviz', 'Imou', 'Godrej']
    }
  ];

  for (const item of masterData) {
    await connection.query(
      `INSERT INTO categories (title, labour_charges, status) 
       VALUES (?, ?, 'Active') 
       ON DUPLICATE KEY UPDATE labour_charges=VALUES(labour_charges)`,
      [item.category, item.labour]
    );

    const [catRows] = await connection.query('SELECT id FROM categories WHERE title = ?', [item.category]);
    const catId = catRows[0]?.id;

    if (catId) {
      for (const brand of item.brands) {
        await connection.query(
          `INSERT INTO brands (name, category, status) VALUES (?, ?, 'Active')`,
          [brand, item.category]
        );
      }

      for (const sub of item.subcategories) {
        await connection.query(
          `INSERT INTO subcategories (category_id, title) VALUES (?, ?)`,
          [catId, sub.title]
        );

        const [subRows] = await connection.query(
          'SELECT id FROM subcategories WHERE category_id = ? AND title = ? ORDER BY id DESC LIMIT 1',
          [catId, sub.title]
        );
        const subId = subRows[0]?.id;

        for (const svc of sub.services) {
          await connection.query(
            `INSERT INTO services (category_id, subcategory_id, title, original_price, selling_price, rating, warranty_days, short_description)
             VALUES (?, ?, ?, ?, ?, '4.8', ?, ?)`,
            [catId, subId, svc.title, svc.original, svc.selling, svc.warranty, svc.desc]
          );
        }
      }
    }
  }

  // SUPER ADMIN USER
  console.log("Setting up Super Admin...");
  const [adminCheck] = await connection.query('SELECT id FROM users WHERE email = ?', ['superadmin@repnexa.com']);
  let superAdminId;
  const hashed = await bcrypt.hash('admin123', 10);

  if (adminCheck.length === 0) {
    const [result] = await connection.query(
      'INSERT INTO users (uid, email, password, first_name, last_name, phone, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['usr_superadmin', 'superadmin@repnexa.com', hashed, 'Super', 'Admin', '9876543210', 'SUPER_ADMIN', 'active']
    );
    superAdminId = result.insertId;
  } else {
    superAdminId = adminCheck[0].id;
    await connection.query('UPDATE users SET password = ?, role = ? WHERE id = ?', [hashed, 'SUPER_ADMIN', superAdminId]);
  }

  // Also seed into admins table
  const [saCheck] = await connection.query('SELECT id FROM admins WHERE email = ?', ['superadmin@repnexa.com']);
  if (saCheck.length === 0) {
    await connection.query('INSERT INTO admins (name, email, password) VALUES (?, ?, ?)', ['Super Admin', 'superadmin@repnexa.com', hashed]);
  } else {
    await connection.query('UPDATE admins SET password = ? WHERE email = ?', [hashed, 'superadmin@repnexa.com']);
  }

  const [saRole] = await connection.query("SELECT id FROM roles WHERE name = 'SUPER_ADMIN'");
  if (saRole.length > 0) {
    await connection.query('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)', [superAdminId, saRole[0].id]);
  }

  // PARTNER DEMO USER
  console.log("Setting up Demo Partner...");
  const [partnerCheck] = await connection.query('SELECT id FROM users WHERE email = ?', ['sharma.ac@repnexa.com']);
  let partnerUserId;
  const pHash = await bcrypt.hash('partner123', 10);

  if (partnerCheck.length === 0) {
    const [uRes] = await connection.query(
      'INSERT INTO users (uid, email, password, first_name, last_name, phone, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['usr_partner_1001', 'sharma.ac@repnexa.com', pHash, 'Ramesh', 'Sharma', '9811223344', 'PARTNER', 'active']
    );
    partnerUserId = uRes.insertId;
  } else {
    partnerUserId = partnerCheck[0].id;
    await connection.query('UPDATE users SET password = ?, role = ? WHERE id = ?', [pHash, 'PARTNER', partnerUserId]);
  }

  const [delhiCity] = await connection.query("SELECT id, state_id FROM cities WHERE name = 'New Delhi' LIMIT 1");
  const cityId = delhiCity[0]?.id || 1;
  const stateId = delhiCity[0]?.state_id || 1;

  await connection.query(`
    CREATE TABLE IF NOT EXISTS partners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      partner_code VARCHAR(50) UNIQUE,
      business_name VARCHAR(255),
      business_type VARCHAR(100) DEFAULT 'Individual / Freelancer',
      experience_years INT DEFAULT 1,
      gst_number VARCHAR(50),
      pan_number VARCHAR(50),
      aadhaar_number VARCHAR(50),
      business_address TEXT,
      city_id INT,
      state_id INT,
      service_radius_km INT DEFAULT 20,
      kyc_status ENUM('pending', 'approved', 'rejected', 'changes_requested') DEFAULT 'pending',
      wallet_balance DECIMAL(12,2) DEFAULT 1000.00,
      rating DECIMAL(3,2) DEFAULT 4.80,
      total_completed_jobs INT DEFAULT 0,
      status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
      admin_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(
    `INSERT INTO partners (user_id, partner_code, business_name, business_type, experience_years, business_address, city_id, state_id, kyc_status, wallet_balance, rating, total_completed_jobs)
     VALUES (?, 'PTR-DEL-1001', 'Sharma Cooling Solutions', 'Proprietorship', 8, 'Shop 14, Main Market, Sector 18, Noida / New Delhi', ?, ?, 'approved', 2500.00, 4.9, 128)
     ON DUPLICATE KEY UPDATE wallet_balance=2500.00, kyc_status='approved'`,
    [partnerUserId, cityId, stateId]
  );

  const [pRow] = await connection.query('SELECT id FROM partners WHERE user_id = ?', [partnerUserId]);
  const partnerId = pRow[0]?.id;

  if (partnerId) {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_code VARCHAR(50) UNIQUE,
        partner_id INT NOT NULL,
        type ENUM('CREDIT', 'DEBIT', 'REFUND', 'COMMISSION', 'LEAD_FEE', 'JOB_EARNING', 'WITHDRAWAL', 'BONUS', 'PENALTY', 'ADJUSTMENT') NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        balance_before DECIMAL(12,2) NOT NULL,
        balance_after DECIMAL(12,2) NOT NULL,
        description TEXT,
        reference_id VARCHAR(100),
        status ENUM('success', 'pending', 'failed') DEFAULT 'success',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(
      `INSERT INTO wallet_transactions (transaction_code, partner_id, type, amount, balance_before, balance_after, description, status)
       VALUES (?, ?, 'CREDIT', 2500.00, 0.00, 2500.00, 'Initial Onboarding Wallet Recharge', 'success')
       ON DUPLICATE KEY UPDATE status='success'`,
      ['TXN-INIT-1001', partnerId]
    );
  }

  // CUSTOMER & LEADS
  console.log("Setting up Demo Customer & Sample Leads...");
  const [custCheck] = await connection.query('SELECT id FROM users WHERE email = ?', ['customer.demo@repnexa.com']);
  let custUserId;
  const cHash = await bcrypt.hash('customer123', 10);

  if (custCheck.length === 0) {
    const [cRes] = await connection.query(
      'INSERT INTO users (uid, email, password, first_name, last_name, phone, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['usr_cust_2001', 'customer.demo@repnexa.com', cHash, 'Pooja', 'Agarwal', '9988776655', 'CUSTOMER', 'active']
    );
    custUserId = cRes.insertId;
  } else {
    custUserId = custCheck[0].id;
    await connection.query('UPDATE users SET password = ? WHERE id = ?', [cHash, custUserId]);
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      customer_code VARCHAR(50) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.query('INSERT IGNORE INTO customers (user_id, customer_code) VALUES (?, ?)', [custUserId, 'CUST-DL-2001']);

  const [custRow] = await connection.query('SELECT id FROM customers WHERE user_id = ?', [custUserId]);
  const customerId = custRow[0]?.id;

  const [firstSvc] = await connection.query('SELECT id FROM services LIMIT 3');
  const s1 = firstSvc[0]?.id || 1;
  const s2 = firstSvc[1]?.id || s1;

  const [leadsCheck] = await connection.query('SELECT COUNT(*) as cnt FROM leads');
  if (leadsCheck[0].cnt === 0 && customerId) {
    await connection.query(
      `INSERT INTO leads (lead_code, customer_id, service_id, brand_name, city_id, pincode, customer_name, customer_phone, customer_address, problem_description, preferred_date, preferred_time, status, lead_fee)
       VALUES 
       ('LEAD-100001', ?, ?, 'Voltas', ?, '110001', 'Pooja Agarwal', '9988776655', 'B-402, Green Park Residency, South Delhi', 'AC is not cooling properly and making vibrating buzzing noise when switched on.', CURDATE(), 'Afternoon (2 PM - 5 PM)', 'NEW', 60.00),
       ('LEAD-100002', ?, ?, 'LG', ?, '201301', 'Anand Kulkarni', '9877112233', 'Flat 801, Tower B, Sector 62, Noida', 'Single door fridge compressor is not starting, light inside is glowing.', CURDATE(), 'Morning (10 AM - 1 PM)', 'ASSIGNED', 50.00),
       ('LEAD-100003', ?, ?, 'Samsung', ?, '122002', 'Neeraj Mehta', '9911224455', 'Villa 44, Golf Course Road, Gurgaon', 'Washing machine displays error code E4 and water is not draining.', CURDATE(), 'Evening (5 PM - 8 PM)', 'ACCEPTED', 60.00)`,
      [customerId, s1, cityId, customerId, s2, cityId, customerId, s1, cityId]
    );

    // Create active job for accepted lead
    const [acceptedLead] = await connection.query("SELECT id, customer_id FROM leads WHERE status = 'ACCEPTED' LIMIT 1");
    if (acceptedLead.length > 0 && partnerId) {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS jobs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          job_code VARCHAR(50) UNIQUE,
          lead_id INT NOT NULL,
          partner_id INT NOT NULL,
          customer_id INT NOT NULL,
          status ENUM('SCHEDULED', 'PARTNER_ON_THE_WAY', 'ARRIVED', 'DIAGNOSIS', 'ESTIMATE', 'WORK_IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
          estimate_amount DECIMAL(10,2) DEFAULT 0.00,
          final_amount DECIMAL(10,2) DEFAULT 0.00,
          platform_commission DECIMAL(10,2) DEFAULT 0.00,
          partner_earnings DECIMAL(10,2) DEFAULT 0.00,
          payment_method ENUM('cash', 'online', 'upi') DEFAULT 'cash',
          payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
          completion_otp VARCHAR(10),
          customer_notes TEXT,
          partner_notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      await connection.query(
        `INSERT INTO jobs (job_code, lead_id, partner_id, customer_id, status, estimate_amount, final_amount, platform_commission, partner_earnings, payment_method, payment_status, completion_otp)
         VALUES ('JOB-2026-101', ?, ?, ?, 'PARTNER_ON_THE_WAY', 699.00, 0.00, 105.00, 594.00, 'cash', 'pending', '4821')`,
        [acceptedLead[0].id, partnerId, acceptedLead[0].customer_id]
      );
    }
  }

  await connection.end();
  console.log("✅ Complete database initialization & seed successfully finished!");
}

seed().catch(err => {
  console.error("❌ Seed Error:", err);
  process.exit(1);
});
