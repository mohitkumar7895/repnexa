# REPNEXA ENTERPRISE SERVICE PLATFORM
## Master System Documentation, Route Directory & Operational Guide

---

## 1. Executive Summary & Core Business Model

**Repnexa** is an enterprise-grade, multi-role **Doorstep Home Appliance Repair Marketplace and Partner Management ERP System** modeled after platforms like Urban Company and Onsitego.

### Operational Lifecycle:
```
CUSTOMER (Books Doorstep Service on /book)
       ↓
LEAD ENGINE (Generates LEAD-XXXXXX & Matches Nearest Verified Partner Hub)
       ↓
SERVICE PARTNER (Accepts Lead on /partner/leads ➔ Schedules JOB-XXXX)
       ↓
EXECUTION & QUALITY CONTROL (Technician uploads Before & After Photo Proofs)
       ↓
SECURITY VERIFICATION (Customer provides 4-digit Arrival OTP to complete repair)
       ↓
INVOICING & SETTLEMENT (85% Partner Earnings, 15% Platform Commission)
       ↓
REVIEWS & AUDIT (Customer submits Star Rating ➔ Moderated by Super Admin)
```

---

## 2. Master System Directory & All 30 Live Routes

Repnexa consists of **4 distinct portals** comprising **30 production-ready routes**. All routes are active, fully responsive, and operational on `http://localhost:3000`.

### ⚡ Interactive Directory Launcher
> Open **[`http://localhost:3000/portals`](http://localhost:3000/portals)** to view and launch every single page with 1-click.

### Portal A: Super Admin Control Center (`/super-admin/*`)
*Access Level: Super Admin & Department Staff*
*Credentials: `superadmin@repnexa.com` | `admin123`*

| # | Page / Module | URL | Description & Capabilities |
|---|---|---|---|
| 1 | **Operations Overview** | [`/super-admin/dashboard`](http://localhost:3000/super-admin/dashboard) | Live KPI metrics, operational pipeline funnel, action-required alert banners, recent service leads stream. |
| 2 | **Leads & Dispatch** | [`/super-admin/leads`](http://localhost:3000/super-admin/leads) | Real-time demand monitoring, city hub filtering, unassigned lead dispatch, customer problem details. |
| 3 | **Service Jobs & Quality Proofs** | [`/super-admin/jobs`](http://localhost:3000/super-admin/jobs) | Field execution tracking, customer completion OTPs, and physical **Before & After repair photos inspection**. |
| 4 | **Partners & KYC Moderation** | [`/super-admin/partners`](http://localhost:3000/super-admin/partners) | Review technician onboarding applications. Approve, reject, or request changes on Aadhaar, PAN, and GST. |
| 5 | **Services & Pricing CMS** | [`/super-admin/services`](http://localhost:3000/super-admin/services) | **Non-hardcoded CMS**: Add/edit appliance categories, change base inspection fees, update service prices and warranty days. |
| 6 | **Staff & Access Control** | [`/super-admin/staff`](http://localhost:3000/super-admin/staff) | **Provision internal staff**: Create Operations, Finance, Verification, or Support managers with role-based permissions (public signup disabled). |
| 7 | **Finance & Partner Wallets** | [`/super-admin/wallet`](http://localhost:3000/super-admin/wallet) | Monitor total partner prepaid float across India, inspect transaction ledgers and audit deductions. |
| 8 | **Payout Withdrawals** | [`/super-admin/withdrawals`](http://localhost:3000/super-admin/withdrawals) | Process technician bank payout requests. Mark as PAID or REJECT (with auto-refund of funds back to partner wallet). |
| 9 | **Locations & City Hubs** | [`/super-admin/locations`](http://localhost:3000/super-admin/locations) | Manage serviceable Indian states, cities, hubs, and postal pincode coverages. |
| 10 | **Coupons & Campaigns** | [`/super-admin/coupons`](http://localhost:3000/super-admin/coupons) | Create customer discount codes, minimum order criteria, expiry dates, and percentage discounts. |
| 11 | **Customer Reviews Moderation** | [`/super-admin/reviews`](http://localhost:3000/super-admin/reviews) | Audit consumer ratings (1–5 stars), approve verified reviews, and calculate partner rating averages. |
| 12 | **Analytics & Reports** | [`/super-admin/reports`](http://localhost:3000/super-admin/reports) | Revenue generation charts, top demand categories, city hub rankings, and business performance exports. |
| 13 | **Support & Complaints** | [`/super-admin/support`](http://localhost:3000/super-admin/support) | Customer dispute tickets, unresolved technician issues, and helpdesk management. |
| 14 | **Platform Rules & Settings** | [`/super-admin/settings`](http://localhost:3000/super-admin/settings) | Dynamic business rules: Platform commission % (default 15%), default lead fee, customer support numbers, company name. |
| 15 | **System Audit Logs** | [`/super-admin/audit-logs`](http://localhost:3000/super-admin/audit-logs) | Immutable security audit trail recording sensitive admin actions, role assignments, and status updates. |

---

### Portal B: Technician Partner Operations Portal (`/partner/*`)
*Access Level: Verified Service Technicians & Workshops*
*Credentials: `sharma.ac@repnexa.com` | `partner123` (Partner Code: `PTR-DEL-1001`)*

| # | Page / Module | URL | Description & Capabilities |
|---|---|---|---|
| 16 | **Partner Dashboard** | [`/partner/dashboard`](http://localhost:3000/partner/dashboard) | Operational float balance, readiness banner, 1-click lead acceptance, active jobs card with customer arrival OTP. |
| 17 | **Available Leads Marketplace** | [`/partner/leads`](http://localhost:3000/partner/leads) | Real-time customer bookings in technician's city/hub. View problem description, preferred slot, and accept leads. |
| 18 | **Active Jobs Execution** | [`/partner/jobs`](http://localhost:3000/partner/jobs) | Step-by-step job execution (`SCHEDULED` ➔ `ON_THE_WAY` ➔ `ARRIVED` ➔ `WORK_IN_PROGRESS` ➔ `COMPLETED`). **Upload Before & After Photo Proofs** and verify Customer OTP. |
| 19 | **Workshop Profile & KYC** | [`/partner/profile`](http://localhost:3000/partner/profile) | View verification status, update workshop address, contact phone, GSTIN, PAN, Aadhaar, and service radius (KM). |
| 20 | **Float Wallet & Top-up** | [`/partner/wallet`](http://localhost:3000/partner/wallet) | View available float, transaction history, and quick balance top-up presets. |
| 21 | **Bank & UPI Payouts** | [`/partner/withdrawals`](http://localhost:3000/partner/withdrawals) | Request payout of completed job earnings directly to Bank A/C (IFSC) or UPI ID. Track settlement status. |

---

### Portal C: Customer Portal & Public Web
*Access Level: Public Homeowners & Consumers*
*Credentials: No login required (Customer Code: `CUST-DL-2001` for tracking)*

| # | Page / Module | URL | Description & Capabilities |
|---|---|---|---|
| 22 | **Homepage & Brand Showcase** | [`/`](http://localhost:3000/) | High-resolution advertising hero banner, 8 appliance category cards with dedicated icons, 4 pillars of trust, how it works, customer reviews, and simple footer. |
| 23 | **Doorstep Service Booking** | [`/book`](http://localhost:3000/book) | Interactive 3-step booking wizard: Select Appliance & Brand ➔ Describe Problem ➔ Choose Date, Slot & Address. Zero advance payment. |
| 24 | **Complete Services Catalogue** | [`/services`](http://localhost:3000/services) | Full dynamic directory of all 8 appliance categories and 30+ service items backed by 90-day warranties. |
| 25 | **Customer Service Tracking** | [`/customer/dashboard`](http://localhost:3000/customer/dashboard) | Track technician assignment, mobile number, arrival OTP, **inspect Before & After repair photos**, and submit star ratings with feedback. |
| 26 | **Partner Onboarding Application** | [`/become-partner`](http://localhost:3000/become-partner) | Multi-step technician registration: Business details, experience, city hub, GST/PAN/Aadhaar documents. Sets account in `pending` KYC. |
| 27 | **Customer Support Helpdesk** | [`/support`](http://localhost:3000/support) | Direct customer helpline, FAQs, emergency repair contact, and support ticket creation. |
| 28 | **Master Portals Directory** | [`/portals`](http://localhost:3000/portals) | Unified interactive launcher linking to all 30 pages and modules across the platform. |

---

### Portal D: Security & Authentication
*Access Level: Internal Staff & Administrative Personnel*

| # | Page / Module | URL | Description & Capabilities |
|---|---|---|---|
| 29 | **Staff & Admin Login** | [`/admin/login`](http://localhost:3000/admin/login) | Secure administrative portal login powered by Bcrypt password hashing. |
| 30 | **Registration Policy Notice** | [`/admin/register`](http://localhost:3000/admin/register) | Enforces security policy: Admin accounts cannot be created publicly; they are provisioned exclusively by Super Admin via `/super-admin/staff`. |

---

## 3. Step-by-Step Operations Guide: "Kaise Kya Use Hoga"

### Workflow 1: Customer Books an Appliance Repair
1. Customer visits [`http://localhost:3000/book`](http://localhost:3000/book).
2. Selects appliance (e.g. *Air Conditioners (AC) - Split AC Deep Clean Service*).
3. Selects brand (e.g. *Voltas, Daikin, LG, Samsung*) and enters problem description.
4. Enters doorstep address, city (e.g. *New Delhi*), preferred date, and convenient slot (e.g. *Morning 9 AM - 12 PM*).
5. Clicks **Confirm & Request Technician →**.
6. The system automatically:
   - Creates or finds the Customer in MariaDB.
   - Generates unique Lead Code (e.g. `LEAD-100004`).
   - Scans the city hub for active, verified partners.
   - Dispatches the lead to eligible technicians.

---

### Workflow 2: Partner Accepts Lead & Starts the Job
1. Technician logs into [`http://localhost:3000/partner/dashboard`](http://localhost:3000/partner/dashboard) or [`/partner/leads`](http://localhost:3000/partner/leads).
2. The technician sees the incoming lead with the customer's locality, problem details, and preferred timing.
3. Technician clicks **"Accept Lead"**.
4. The system automatically:
   - Updates lead status to `ACCEPTED`.
   - Generates an active service Job (e.g. `JOB-2026-102`).
   - Generates a secret 4-digit **Customer Completion OTP** (e.g. `5829`).
   - Displays the customer's full address and phone number to the technician.

---

### Workflow 3: Field Execution & Quality Control (Before & After Photos)
1. Technician opens [`http://localhost:3000/partner/jobs`](http://localhost:3000/partner/jobs).
2. Technician updates progress milestones:
   - Clicks **"🚗 On The Way"** when travelling.
   - Clicks **"📍 Arrived at Customer Location"** upon reaching customer doorstep.
   - Clicks **"🔧 Start Diagnosis & Work"**.
3. **Mandatory Quality Proofs**:
   - In the **📸 Technician Quality Proofs** card:
   - Technician pastes/uploads the **Before-Repair Photo** showing the damaged or faulty part (e.g. burnt capacitor, leaking coil) and clicks **"Save Photo"**.
   - After completing repair, technician pastes/uploads the **After-Repair Photo** showing the fixed, clean, running machine and clicks **"Save Photo"**.
4. **OTP Verification & Completion**:
   - Customer tests the repaired appliance.
   - Customer provides their 4-digit OTP (visible in [`/customer/dashboard`](http://localhost:3000/customer/dashboard)).
   - Technician enters the OTP and final bill amount (e.g. `₹699`), then clicks **"✓ Complete Job"**.
   - System verifies OTP, closes the job, credits 85% earnings to the partner, and records 15% platform commission.

---

### Workflow 4: Super Admin Audits Quality & Manages the Platform
1. Super Admin opens [`http://localhost:3000/super-admin/jobs`](http://localhost:3000/super-admin/jobs).
2. In the **Quality Proofs (Before / After)** column, the admin clicks on the thumbnails to inspect the technician's physical work.
3. **Adding / Modifying Categories & Services**:
   - Super Admin goes to [`/super-admin/services`](http://localhost:3000/super-admin/services).
   - Can change category title, update base inspection fee, or add new services with custom warranty periods. All changes reflect instantly on the public website without touching code.
4. **Provisioning Staff**:
   - Super Admin goes to [`/super-admin/staff`](http://localhost:3000/super-admin/staff).
   - Fills in staff member's name, email, password, and selects department role (*OPERATIONS_MANAGER*, *FINANCE_MANAGER*, *SUPPORT_MANAGER*, etc.).
   - The staff member can now log in securely via `/admin/login`.

---

### Workflow 5: Partner Payouts & Finance Settlement
1. Technician visits [`http://localhost:3000/partner/withdrawals`](http://localhost:3000/partner/withdrawals).
2. Submits payout request (minimum ₹500 threshold) with Bank A/C + IFSC or UPI ID.
3. Finance Manager / Super Admin opens [`http://localhost:3000/super-admin/withdrawals`](http://localhost:3000/super-admin/withdrawals):
   - Clicks **"✓ Mark as Paid"** once the bank transfer is done.
   - Or clicks **"✕ Reject"** (which automatically refunds the money back to the partner's wallet float with an audit entry).

---

## 4. Database Schema & Architecture Overview

The system runs on **MariaDB 10.4.32 / MySQL** under database `repnexa`.

```
                  ┌──────────────┐
                  │    users     │
                  └──────┬───────┘
          ┌──────────────┴──────────────┐
          ▼                             ▼
   ┌─────────────┐               ┌─────────────┐
   │  customers  │               │  partners   │
   └──────┬──────┘               └──────┬──────┘
          │                             │
          ▼                             ▼
   ┌─────────────┐  assigns to   ┌─────────────┐
   │    leads    │──────────────▶│    jobs     │ (before_photo_url, after_photo_url, completion_otp)
   └──────┬──────┘               └──────┬──────┘
          │                             │
          ▼                             ▼
   ┌─────────────┐               ┌─────────────┐
   │  services   │               │ wallet_txns │
   └──────┬──────┘               └─────────────┘
          ▼                             ▼
   ┌─────────────┐               ┌─────────────┐
   │ categories  │               │ withdrawals │
   └─────────────┘               └─────────────┘
```

### Key Relational Tables:
1. `users`: Master credentials, passwords (Bcrypt), phones, roles (`SUPER_ADMIN`, `PARTNER`, `CUSTOMER`, staff roles).
2. `roles` & `user_roles`: RBAC matrix mapping permissions to departmental staff.
3. `categories`: Dynamic appliance groups (`title`, `labour_charges`, `status`).
4. `services`: Specific repair tasks (`title`, `category_id`, `selling_price`, `warranty_days`).
5. `partners`: Verified workshops (`partner_code`, `kyc_status`, `wallet_balance`, `rating`, `total_completed_jobs`).
6. `leads`: Service requests (`lead_code`, `customer_id`, `service_id`, `city_id`, `lead_fee`, `status`).
7. `jobs`: Execution lifecycle (`job_code`, `status`, `completion_otp`, `before_photo_url`, `after_photo_url`, `final_amount`, `platform_commission`, `partner_earnings`).
8. `wallet_transactions`: Double-entry prepaid float ledger (`amount`, `balance_before`, `balance_after`, `type`).
9. `withdrawals`: Payout requests to Bank/UPI (`bank_name`, `account_number`, `ifsc_code`, `upi_id`, `status`).
10. `reviews`: Customer feedback & star ratings (`partner_id`, `rating`, `comment`, `status`).
11. `system_settings`: Platform business rules (`setting_key`, `setting_value`).
12. `audit_logs`: Administrative actions log (`user_id`, `action`, `details`).

---

## 5. Pre-Seeded Demo Login Credentials

| Role | Portal URL | Email / Identifier | Password | Key Capabilities |
|---|---|---|---|---|
| **Super Admin** | [`/admin/login`](http://localhost:3000/admin/login) | `superadmin@repnexa.com` | `admin123` | Full access to all 15 control modules, CMS, staff, and finance |
| **Service Partner** | [`/partner/dashboard`](http://localhost:3000/partner/dashboard) | `sharma.ac@repnexa.com` | `partner123` | Leads marketplace, OTP completion, Before/After photos, payouts |
| **Demo Customer** | [`/customer/dashboard`](http://localhost:3000/customer/dashboard) | Code: `CUST-DL-2001` | *Passwordless* | Real-time booking tracking, arrival OTP, quality inspection photos |

---

## 6. Production Maintenance & Deployment

### Environment Configuration (`.env`)
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=repnexa
JWT_SECRET=repnexa_production_enterprise_secret_key_2026
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Running Locally / Development:
```bash
npm run dev
# Server runs on http://localhost:3000
```

### Initializing / Resetting Database & Seed:
```bash
node scripts/init-db.cjs
node scripts/add-job-photos.cjs
```

### Production Build:
```bash
npm run build
npm start
```

---
*Documentation prepared for Repnexa Services India Pvt Ltd — All rights reserved.*
