import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

export const db = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "repnexa",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Comprehensive Database Schema & Seed Initializer
export async function initDb() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE || "repnexa"}`);
  await connection.query(`USE ${process.env.MYSQL_DATABASE || "repnexa"}`);

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
    CREATE TABLE IF NOT EXISTS permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INT NOT NULL,
      permission_id INT NOT NULL,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      phone VARCHAR(20),
      role VARCHAR(50) DEFAULT 'CUSTOMER',
      status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id INT NOT NULL,
      role_id INT NOT NULL,
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    )
  `);

  // 2. Locations (India Hierarchy)
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
      status ENUM('active', 'inactive') DEFAULT 'active',
      FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS areas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      city_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      pincode VARCHAR(10) NOT NULL,
      FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
    )
  `);

  // 3. Service Hierarchy (Dynamic CMS)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS service_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      icon VARCHAR(255),
      image VARCHAR(255),
      status ENUM('active', 'inactive') DEFAULT 'active',
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      starting_price DECIMAL(10,2) DEFAULT 299.00,
      min_price DECIMAL(10,2) DEFAULT 199.00,
      max_price DECIMAL(10,2) DEFAULT 4999.00,
      lead_fee DECIMAL(10,2) DEFAULT 50.00,
      commission_pct DECIMAL(5,2) DEFAULT 15.00,
      status ENUM('active', 'inactive') DEFAULT 'active',
      display_order INT DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS sub_services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) DEFAULT 0.00,
      status ENUM('active', 'inactive') DEFAULT 'active',
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS service_brands (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      status ENUM('active', 'inactive') DEFAULT 'active',
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    )
  `);

  // 4. Partner Architecture
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS partner_services (
      partner_id INT NOT NULL,
      service_id INT NOT NULL,
      PRIMARY KEY (partner_id, service_id),
      FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS partner_documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      partner_id INT NOT NULL,
      doc_type VARCHAR(50),
      doc_url VARCHAR(255),
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
    )
  `);

  // 5. Customers & Addresses
  await connection.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      customer_code VARCHAR(50) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS customer_addresses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      title VARCHAR(50) DEFAULT 'Home',
      address_line TEXT NOT NULL,
      landmark VARCHAR(255),
      city_id INT,
      pincode VARCHAR(10),
      contact_person VARCHAR(100),
      contact_phone VARCHAR(20),
      is_default BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )
  `);

  // 6. Lead Engine
  await connection.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lead_code VARCHAR(50) UNIQUE,
      customer_id INT NOT NULL,
      service_id INT NOT NULL,
      sub_service_id INT,
      brand_name VARCHAR(100),
      city_id INT NOT NULL,
      pincode VARCHAR(10),
      customer_name VARCHAR(100),
      customer_phone VARCHAR(20),
      customer_address TEXT,
      problem_description TEXT,
      preferred_date DATE,
      preferred_time VARCHAR(50),
      lead_fee DECIMAL(10,2) DEFAULT 50.00,
      status ENUM('NEW', 'MATCHING', 'ASSIGNED', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED') DEFAULT 'NEW',
      assigned_partner_id INT,
      admin_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS lead_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lead_id INT NOT NULL,
      partner_id INT NOT NULL,
      status ENUM('assigned', 'viewed', 'accepted', 'rejected', 'expired') DEFAULT 'assigned',
      fee_deducted DECIMAL(10,2) DEFAULT 0.00,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      responded_at TIMESTAMP NULL,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
      FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
    )
  `);

  // 7. Jobs & Execution Workflow
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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id),
      FOREIGN KEY (partner_id) REFERENCES partners(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS job_status_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      job_id INT NOT NULL,
      status VARCHAR(50) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    )
  `);

  // 8. Wallet, Transactions & Withdrawals
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS withdrawals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      withdrawal_code VARCHAR(50) UNIQUE,
      partner_id INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      bank_name VARCHAR(100),
      account_number VARCHAR(50),
      ifsc_code VARCHAR(20),
      upi_id VARCHAR(50),
      status ENUM('PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED') DEFAULT 'PENDING',
      admin_notes TEXT,
      requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      processed_at TIMESTAMP NULL,
      FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
    )
  `);

  // 9. Support & Complaints
  await connection.query(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ticket_code VARCHAR(50) UNIQUE,
      user_id INT,
      customer_name VARCHAR(150),
      customer_phone VARCHAR(30),
      lead_id INT,
      subject VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
      status ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
      assigned_staff_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // 10. System Settings & Business Rules
  await connection.query(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) UNIQUE NOT NULL,
      setting_value TEXT NOT NULL,
      setting_group VARCHAR(50) DEFAULT 'general',
      description TEXT
    )
  `);

  // 11. Audit Logs
  await connection.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      user_name VARCHAR(100),
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50),
      entity_id VARCHAR(50),
      details TEXT,
      ip_address VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ==========================================
  // SEED COMPREHENSIVE ENTERPRISE DATA
  // ==========================================

  // Roles
  const roles = [
    'SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'PARTNER_MANAGER',
    'VERIFICATION_MANAGER', 'FINANCE_MANAGER', 'SUPPORT_MANAGER', 
    'CONTENT_MANAGER', 'CUSTOMER', 'PARTNER'
  ];
  for (const role of roles) {
    await connection.query('INSERT IGNORE INTO roles (name, description) VALUES (?, ?)', [role, `${role} Role`]);
  }

  // System Settings Defaults
  const defaultSettings = [
    ['company_name', 'Repnexa Services India Pvt Ltd', 'general', 'Platform Registered Name'],
    ['support_phone', '+91 78950 94129', 'general', 'Customer Helpline'],
    ['support_email', 'support@repnexa.com', 'general', 'Official Support Email'],
    ['lead_distribution_model', 'LEAD_FEE', 'lead', 'Lead model: LEAD_FEE, COMMISSION, or HYBRID'],
    ['default_lead_fee', '50.00', 'lead', 'Default fee charged per lead'],
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

  // Locations: States & Cities
  const locationSeeds = [
    { state: 'Delhi NCR', code: 'DL', cities: ['New Delhi', 'Noida', 'Greater Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad'] },
    { state: 'Maharashtra', code: 'MH', cities: ['Mumbai', 'Pune', 'Thane', 'Navi Mumbai', 'Nagpur'] },
    { state: 'Karnataka', code: 'KA', cities: ['Bangalore', 'Mysore', 'Hubli'] },
    { state: 'Telangana', code: 'TS', cities: ['Hyderabad', 'Secunderabad', 'Warangal'] },
    { state: 'Tamil Nadu', code: 'TN', cities: ['Chennai', 'Coimbatore', 'Madurai'] },
    { state: 'Rajasthan', code: 'RJ', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'] },
    { state: 'Uttar Pradesh', code: 'UP', cities: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj'] },
    { state: 'West Bengal', code: 'WB', cities: ['Kolkata', 'Howrah', 'Siliguri'] }
  ];

  for (const s of locationSeeds) {
    const [stRes]: any = await connection.query('INSERT IGNORE INTO states (name, code) VALUES (?, ?)', [s.state, s.code]);
    const [existingState]: any = await connection.query('SELECT id FROM states WHERE name = ?', [s.state]);
    const stateId = existingState[0]?.id;
    if (stateId) {
      for (const city of s.cities) {
        await connection.query('INSERT IGNORE INTO cities (state_id, name) VALUES (?, ?)', [stateId, city]);
      }
    }
  }

  // Realistic Categories & 30+ Configurable Services
  const categorySeeds = [
    {
      name: 'Cooling & Air Conditioning',
      slug: 'cooling-ac',
      description: 'Expert repair, installation, gas charging & deep cleaning for all AC types',
      icon: '❄️',
      services: [
        { name: 'Split AC Repair & Service', slug: 'split-ac-repair', price: 499, leadFee: 60, comm: 15 },
        { name: 'Window AC Repair & Maintenance', slug: 'window-ac-repair', price: 399, leadFee: 50, comm: 15 },
        { name: 'AC Gas Refill & Leak Fixing', slug: 'ac-gas-refill', price: 1799, leadFee: 80, comm: 15 },
        { name: 'AC Installation & Uninstallation', slug: 'ac-installation', price: 799, leadFee: 70, comm: 15 },
        { name: 'Inverter AC PCB Diagnostic', slug: 'inverter-ac-pcb', price: 699, leadFee: 60, comm: 15 }
      ]
    },
    {
      name: 'Refrigerator & Freezers',
      slug: 'refrigerators',
      description: 'Single door, double door, side-by-side fridge cooling repairs & gas charge',
      icon: '🧊',
      services: [
        { name: 'Single Door Fridge Repair', slug: 'single-door-fridge', price: 299, leadFee: 40, comm: 15 },
        { name: 'Double Door Frost-Free Repair', slug: 'double-door-fridge', price: 399, leadFee: 50, comm: 15 },
        { name: 'Side-by-Side Inverter Refrigerator', slug: 'side-by-side-fridge', price: 599, leadFee: 70, comm: 15 },
        { name: 'Commercial Deep Freezer Service', slug: 'deep-freezer-service', price: 699, leadFee: 80, comm: 15 }
      ]
    },
    {
      name: 'Washing Machines & Dryers',
      slug: 'washing-machines',
      description: 'Top load, front load, semi-automatic motor, drum, and draining solutions',
      icon: '🧺',
      services: [
        { name: 'Fully Automatic Front Load Repair', slug: 'front-load-repair', price: 499, leadFee: 60, comm: 15 },
        { name: 'Fully Automatic Top Load Repair', slug: 'top-load-repair', price: 399, leadFee: 50, comm: 15 },
        { name: 'Semi Automatic Machine Service', slug: 'semi-automatic-service', price: 299, leadFee: 40, comm: 15 },
        { name: 'Washing Machine Drum Descaling & Cleanup', slug: 'machine-descaling', price: 449, leadFee: 40, comm: 15 }
      ]
    },
    {
      name: 'Televisions & Entertainment',
      slug: 'televisions',
      description: 'LED, OLED, Smart TV display, backlight, motherboard, and sound fixes',
      icon: '📺',
      services: [
        { name: 'LED / Smart TV Display Issue', slug: 'led-tv-display', price: 499, leadFee: 50, comm: 15 },
        { name: 'TV Backlight Replacement', slug: 'tv-backlight-repair', price: 899, leadFee: 60, comm: 15 },
        { name: 'TV Motherboard & Power Board Repair', slug: 'tv-motherboard-repair', price: 799, leadFee: 60, comm: 15 },
        { name: 'TV Wall Mounting & Setup', slug: 'tv-wall-mounting', price: 349, leadFee: 30, comm: 15 }
      ]
    },
    {
      name: 'Water Purifier & RO Systems',
      slug: 'water-purifiers',
      description: 'RO membrane replacement, filter change, TDS balancing and leakage repair',
      icon: '💧',
      services: [
        { name: 'Complete RO Periodic Service & Filter Change', slug: 'ro-service-filter', price: 399, leadFee: 40, comm: 15 },
        { name: 'RO Membrane & Carbon Filter Replacement', slug: 'ro-membrane-replacement', price: 1299, leadFee: 60, comm: 15 },
        { name: 'RO Water Leakage & Motor Repair', slug: 'ro-leakage-motor', price: 349, leadFee: 40, comm: 15 },
        { name: 'Commercial RO Plant Maintenance', slug: 'commercial-ro-plant', price: 1499, leadFee: 100, comm: 15 }
      ]
    },
    {
      name: 'Kitchen & Small Appliances',
      slug: 'kitchen-appliances',
      description: 'Microwave oven, Chimney, Geyser, Cooler, Induction and mixer grinder repairs',
      icon: '🍳',
      services: [
        { name: 'Microwave Oven Heating & Magnetron Repair', slug: 'microwave-repair', price: 349, leadFee: 40, comm: 15 },
        { name: 'Electric Geyser Water Heater Repair', slug: 'geyser-repair', price: 349, leadFee: 40, comm: 15 },
        { name: 'Kitchen Chimney Deep Cleaning & Motor Fix', slug: 'chimney-cleaning', price: 699, leadFee: 50, comm: 15 },
        { name: 'Desert & Room Air Cooler Service', slug: 'cooler-service', price: 299, leadFee: 30, comm: 15 }
      ]
    },
    {
      name: 'Computers, Laptops & IT Support',
      slug: 'computers-laptops',
      description: 'Hardware upgrade, screen replacement, OS formatting, printer troubleshooting',
      icon: '💻',
      services: [
        { name: 'Laptop Hardware & Screen Repair', slug: 'laptop-screen-repair', price: 499, leadFee: 50, comm: 15 },
        { name: 'Desktop Computer Assembling & Repair', slug: 'desktop-repair', price: 449, leadFee: 50, comm: 15 },
        { name: 'Laser / Inkjet Printer Maintenance', slug: 'printer-maintenance', price: 399, leadFee: 40, comm: 15 },
        { name: 'Data Recovery & Virus Clean', slug: 'data-recovery', price: 799, leadFee: 60, comm: 15 }
      ]
    },
    {
      name: 'Security, CCTV & Networking',
      slug: 'cctv-networking',
      description: 'HD/IP CCTV camera setup, DVR/NVR configuration, Wi-Fi mesh networking',
      icon: '📹',
      services: [
        { name: 'CCTV Camera Installation & Wiring', slug: 'cctv-installation', price: 499, leadFee: 50, comm: 15 },
        { name: 'DVR / NVR Offline Troubleshooting', slug: 'dvr-troubleshooting', price: 399, leadFee: 40, comm: 15 },
        { name: 'Office Wi-Fi & LAN Cabling Setup', slug: 'wifi-lan-setup', price: 699, leadFee: 60, comm: 15 }
      ]
    },
    {
      name: 'Electrical & Inverter Solutions',
      slug: 'electrical-inverters',
      description: 'Inverter battery repair, short circuit finding, MCB and switchboard wiring',
      icon: '⚡',
      services: [
        { name: 'Home Inverter & UPS Repair', slug: 'inverter-ups-repair', price: 399, leadFee: 40, comm: 15 },
        { name: 'Electrical Short Circuit & Wiring Fix', slug: 'short-circuit-fix', price: 349, leadFee: 35, comm: 15 },
        { name: 'MCB Box & Heavy Load Wiring', slug: 'mcb-box-wiring', price: 449, leadFee: 40, comm: 15 }
      ]
    }
  ];

  for (let cIdx = 0; cIdx < categorySeeds.length; cIdx++) {
    const cat = categorySeeds[cIdx];
    await connection.query(
      `INSERT INTO service_categories (name, slug, description, icon, display_order)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), icon=VALUES(icon)`,
      [cat.name, cat.slug, cat.description, cat.icon, cIdx + 1]
    );

    const [catRow]: any = await connection.query('SELECT id FROM service_categories WHERE slug = ?', [cat.slug]);
    const catId = catRow[0]?.id;

    if (catId) {
      for (let sIdx = 0; sIdx < cat.services.length; sIdx++) {
        const s = cat.services[sIdx];
        await connection.query(
          `INSERT INTO services (category_id, name, slug, description, starting_price, lead_fee, commission_pct, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE starting_price=VALUES(starting_price), lead_fee=VALUES(lead_fee), commission_pct=VALUES(commission_pct)`,
          [catId, s.name, s.slug, `${s.name} at your doorstep with verified technicians`, s.price, s.leadFee, s.comm, sIdx + 1]
        );

        const [svcRow]: any = await connection.query('SELECT id FROM services WHERE slug = ?', [s.slug]);
        const serviceId = svcRow[0]?.id;

        if (serviceId) {
          // Add default sub-services
          const sampleSubs = ['General Inspection & Diagnosis', 'Complete Part Replacement', 'Deep Cleaning & Overhaul', 'Emergency Priority Visit'];
          for (const sub of sampleSubs) {
            await connection.query(
              'INSERT IGNORE INTO sub_services (service_id, name, price) VALUES (?, ?, ?)',
              [serviceId, sub, 199.00]
            );
          }

          // Add default brands
          const sampleBrands = ['LG', 'Samsung', 'Voltas', 'Daikin', 'Blue Star', 'Whirlpool', 'Hitachi', 'Panasonic', 'Godrej', 'Other'];
          for (const brand of sampleBrands) {
            await connection.query(
              'INSERT IGNORE INTO service_brands (service_id, name) VALUES (?, ?)',
              [serviceId, brand]
            );
          }
        }
      }
    }
  }

  // Super Admin Default Account
  const [adminCheck]: any = await connection.query('SELECT id FROM users WHERE email = ?', ['superadmin@repnexa.com']);
  let superAdminId: number;
  if (adminCheck.length === 0) {
    const hashed = await bcrypt.hash('admin123', 10);
    const [result]: any = await connection.query(
      'INSERT INTO users (email, password, first_name, last_name, phone, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['superadmin@repnexa.com', hashed, 'Super', 'Admin', '7895094129', 'SUPER_ADMIN', 'active']
    );
    superAdminId = result.insertId;
    const [roleCheck]: any = await connection.query('SELECT id FROM roles WHERE name = ?', ['SUPER_ADMIN']);
    if (roleCheck.length > 0) {
      await connection.query('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)', [superAdminId, roleCheck[0].id]);
    }
  } else {
    superAdminId = adminCheck[0].id;
  }

  await connection.end();
}
