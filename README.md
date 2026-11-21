# Order-to-Audit Management System for Packaged Food Manufacturing

> **Internship Project Submission**  
> **Institution**: Centre for Digital Infrastructure, National Institute of Technology (NIT), Tiruchirappalli  
> **Domain**: Full-Stack Enterprise ERP & Digital Infrastructure  
> **Application**: Order-to-Audit ERP for South Indian Packaged Food Manufacturing (Murukku, Mixture, Chips, Sweets)  
> **Verification**: 74 / 74 Test Assertions Passed (100% OK, Zero Regressions)

---

## Executive Summary & Architectural Decisions

This project delivers a complete, functional, database-driven **Order-to-Audit Management System** tailored for small South Indian packaged food manufacturers. It handles the complete closed-loop operational workflow spanning **raw material procurement**, **Bill of Materials (BOM)** configuration, **batch production runs** with real-time yield and consumption variance tracking, **triple-inventory reconciliation** (Raw Materials, Packaging, Finished Goods), **state-aware GST compliance** (Intra-state CGST+SGST vs. Inter-state IGST), **credit and accounts receivable ageing**, and **immutable audit logging**.

### Key Architectural Decisions
1. **Decimal-Safe Financial Arithmetic**: All monetary calculations utilize exact integer paise or decimal-safe standard rounding (`Math.round((val + Number.EPSILON) * 100) / 100`) to completely eliminate floating-point precision drift.
2. **Immutable Double-Entry Stock Ledger**: In accordance with statutory audit standards, stock balances are never directly overwritten. Every inventory change is recorded as an immutable debit/credit movement in `StockLedger` with source document references, movement direction, unit valuation, and user audit trail.
3. **Automated Weighted Average Costing (WAC)**: Material valuation dynamically updates on receipt using standard WAC formulas, accurately flowing into finished-goods batch costing.
4. **Backend-Enforced Role-Based Access Control (RBAC)**: All 5 roles (Salesman, Admin, Production Supervisor, Accountant/Auditor, Owner) are strictly isolated via Express middleware, validating JWT claims on every endpoint regardless of frontend visibility.
5. **Zero-Fake Button Architecture**: Every UI button, modal, date filter, status transition, PDF generation, and Excel/CSV download executes real backend REST endpoints and database queries.
6. **Pre-Dispatch Stock Availability Enforcement**: The system strictly prevents physical dispatch when finished-goods stock is insufficient, returning HTTP 400 with the exact packet shortage quantity.

---

## 1. Technology Stack & Architectural Justifications

| Layer | Technologies | Architectural Justification |
|---|---|---|
| **Frontend UI** | React 18, Vite | High-performance Single Page Application (SPA) with instant HMR and optimized production bundling. |
| **Styling & UI** | Tailwind CSS, Lucide Icons | Responsive modern enterprise interface adaptable to desktop, tablet, and mobile viewport widths. |
| **Routing & Auth** | React Router v6, Axios | Protected role-based route guards (`<ProtectedRoute>`) with Bearer token interceptor and 401 redirection. |
| **Analytics & Charts** | Recharts | Visual SVG charts for yield variance, scrap analysis, revenue trends, and stock health. |
| **Document Export** | jsPDF, jsPDF-AutoTable, SheetJS (`xlsx`) | Client-side generation of printable GST Tax Invoices and export of all 15 audit registers to Excel, CSV, and PDF without server strain. |
| **Backend API** | Node.js (v20), Express.js | Asynchronous, non-blocking RESTful micro-monolith architecture with modular routers and controllers. |
| **Database & ODM** | MongoDB 8.x, Mongoose 9.x | Document database supporting embedded subdocuments for historic immutability and schema-level validation & indexing. |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs | Stateless token authentication with salted password hashing (salt rounds: 10, `select: false`). |

---

## 2. User Roles & Access Control Matrix

| Role | Default Email | Dashboard & Operational Scope | Enforced Restrictions |
|---|---|---|---|
| **Salesman** | `salesman@nitfood.com` | View catalog & pricing, place customer orders, track order statuses, view customer sales history. | Blocked from invoices, costing, production runs, financial reports, and user management (HTTP 403). |
| **Admin** | `admin@nitfood.com` | Review & approve orders, edit order quantities/prices, generate GST invoices, record dispatch, record customer payments. | Subject to pre-dispatch stock checks; cannot modify completed production batch runs. |
| **Production Supervisor** | `supervisor@nitfood.com` | Manage raw material receipts, BOM management, execute batch production runs, log damaged packaging & wastage, monitor consumption variance. | Blocked from sales billing, customer credit limits, payment receipts, and financial profit reports. |
| **Accountant / Auditor** | `auditor@nitfood.com` | **Read-only access**. View all 15 financial, sales, GST, inventory, costing, and collection registers; export to Excel, CSV, and PDF. | Strictly read-only; cannot create, edit, or delete any operational or master records. |
| **Owner** | `owner@nitfood.com` | Complete executive overview: top-level revenue, production metrics, inventory value, aging receivables, and audit logs. | Full executive oversight; administrative actions tracked in immutable `AuditLog`. |

*Default password for all demo accounts*: `Password@123`

---

## 3. Implemented Feature Breakdown (MoSCoW Matrix)

### Must-Have Features (100% Implemented & Verified)
- [x] JWT Authentication & stateless authorization across 5 distinct system roles.
- [x] Product master management (SKU, pack size, selling price, HSN `21069099`, 5% GST).
- [x] Customer master management (Retailer/Distributor, state code `33` vs `29`, credit limit, outstanding balance).
- [x] Supplier master management with supplied material classification.
- [x] Raw Material and Packaging Material inventory tracking with reorder levels.
- [x] Multi-item Bill of Materials (BOM) creation scaling per batch multiplier.
- [x] Batch production execution recording planned vs. actual consumption and process scrap.
- [x] Automatic calculation of Yield Variance % and Consumption Variance % with $\pm 3.0\%$ alert flagging.
- [x] Sales Order lifecycle: `Submitted` $\rightarrow$ `Approved` $\rightarrow$ `Invoiced` $\rightarrow$ `Dispatched`.
- [x] Mandatory pre-dispatch stock availability validation blocking dispatches on shortage.
- [x] State-aware Indian GST Tax Invoicing (Intra-state CGST 2.5% + SGST 2.5% vs. Inter-state IGST 5.0%).
- [x] Customer payment receipt recording with automated invoice balance reduction.
- [x] Immutable double-entry `StockLedger` capturing all inflows, outflows, and source documents.

### Should-Have Features (100% Implemented & Verified)
- [x] Automated Weighted Average Costing (WAC) updating valuation rate dynamically on new purchases.
- [x] Batch costing engine computing raw material, packaging, direct labour, power/gas overheads, and cost per packet.
- [x] Accounts Receivable (AR) Ageing categorization: **0–30 Days**, **31–60 Days**, **61–90 Days**, and **90+ Days**.
- [x] 15 comprehensive date-filterable audit and operational reports.
- [x] Export to Excel (`.xlsx`), CSV (`.csv`), and PDF (`.pdf`) across all 15 registers.
- [x] Client-side printable GST Tax Invoice generation using `jsPDF` and `jspdf-autotable`.
- [x] Active customer deactivation guard blocking deactivation when `outstandingBalance > 0` (HTTP 400).
- [x] Idempotent master and benchmark database seeding scripts.

### Stretch Features (Implemented)
- [x] Interactive data visualization using `Recharts` (yield variance bars, scrap ratios, stock health).
- [x] Full-stack automated test runner (`npm test`) executing 74 assertions across 6 development phases.
- [x] Automated post-fix verification script (`verifyFixes.js`) validating RBAC, ledger balance, and balance protection.
- [x] Fully responsive layout styled for desktop, tablet, and mobile viewports.

---

## 4. Key Business Logic & Mathematical Formulas

### A. Triple-Inventory Ledger Formula
$$\text{Closing Stock} = \text{Opening Stock} + \text{Receipts} - \text{Issues} - \text{Dispatches} \pm \text{Adjustments}$$
- **Raw Materials**: Incremented upon purchase receipt (+1); decremented atomically during production runs (-1).
- **Packaging Materials**: Incremented upon purchase (+1); decremented for good units produced + damaged units (-1).
- **Finished Goods**: Incremented upon production run completion (+1); decremented upon order dispatch (-1).

### B. Bill of Materials (BOM) & Variance Analysis
$$\text{Yield Variance \%} = \left( \frac{\text{Actual Output} - \text{Expected Output}}{\text{Expected Output}} \right) \times 100$$
$$\text{Consumption Variance \%} = \left( \frac{\text{Actual Consumption} - \text{Planned Consumption}}{\text{Planned Consumption}} \right) \times 100$$
- **Alert Threshold**: Any variance exceeding $\pm 3.0\%$ is highlighted with a warning badge and logged for supervisory audit.

### C. Valuation & Weighted Average Costing (WAC)
$$\text{New WAC} = \frac{(\text{Current Stock} \times \text{Current WAC}) + (\text{New Purchase Qty} \times \text{Purchase Rate})}{\text{Current Stock} + \text{New Purchase Qty}}$$

### D. Production Batch Costing & Margins
$$\text{Total Production Cost} = \text{Direct RM Cost} + \text{Packaging Cost} + \text{Labour Cost} + \text{Gas \& Power Cost}$$
$$\text{Cost Per Packet} = \frac{\text{Total Production Cost}}{\text{Actual Good Packets Produced}}$$
$$\text{Profit Per Packet} = \text{Selling Price (excl. tax)} - \text{Cost Per Packet}$$
$$\text{Profit Margin \%} = \left( \frac{\text{Profit Per Packet}}{\text{Selling Price}} \right) \times 100$$

### E. Indian GST Tax Calculation
The factory is located in **Tamil Nadu (State Code: 33)**.
- **Intra-State Sales** (Customer in Tamil Nadu, Code 33):
  $$\text{CGST} = \text{Taxable Amount} \times 2.5\%, \quad \text{SGST} = \text{Taxable Amount} \times 2.5\%$$
- **Inter-State Sales** (Customer outside Tamil Nadu, e.g., Karnataka, Code 29):
  $$\text{IGST} = \text{Taxable Amount} \times 5.0\%$$

---

## 5. Mandatory Benchmark Scenario: Verification Results

The official benchmark scenario was executed end-to-end via automated simulation and verified against the exact assignment specifications:

| Step # | Action / Metric Tested | System Actual | Benchmark Specification | Verification Status |
|:---:|---|:---:|:---:|:---:|
| **Step 1** | Purchase 60 kg Flour @ ₹45/kg (Opening: 100 kg @ ₹42) | Stock: **160 kg**, WAC: **₹43.125/kg** | Stock: 160 kg, WAC: ₹43.125/kg | **100% MATCH** |
| **Step 2** | Production Run (Murukku 200 g, Expected: 200, Actual: 188) | Good pkts: **188**, Damaged pouches: **6** | Output: 188, Damaged: 6 | **100% MATCH** |
| **Step 2** | Yield Variance: $(188 - 200) / 200 \times 100$ | **-6.0%** (Flagged: YES) | **-6.0%** (Flagged: YES) | **100% MATCH** |
| **Step 2** | Oil Consumption Variance: $(10.5 - 10) / 10 \times 100$ | **+5.0%** (Flagged: YES) | **+5.0%** (Flagged: YES) | **100% MATCH** |
| **Step 2** | Flour Closing Stock: $100 + 60 - 40$ | **120 kg** | **120 kg** | **100% MATCH** |
| **Step 2** | Oil Closing Stock: $30 - 10.5$ | **19.5 litres** | **19.5 litres** | **100% MATCH** |
| **Step 2** | Pouch Closing Stock: $500 - 188 - 6$ | **306 pieces** | **306 pieces** | **100% MATCH** |
| **Step 2** | Carton Closing Stock: $30 - 9$ | **21 pieces** | **21 pieces** | **100% MATCH** |
| **Step 2** | Finished Goods Stock after Production: $50 + 188$ | **238 packets** | **238 packets** | **100% MATCH** |
| **Step 3** | Retailer A (TN) Order for 150 packets @ ₹50 | Taxable: **₹7,500.00** | Taxable: ₹7,500.00 | **100% MATCH** |
| **Step 4** | Retailer A GST Invoice: CGST 2.5% + SGST 2.5% | CGST: **₹187.50**, SGST: **₹187.50**, Total: **₹7,875.00** | CGST: ₹187.50, SGST: ₹187.50, Total: ₹7,875.00 | **100% MATCH** |
| **Step 4** | Finished Goods Stock after Retailer A Dispatch: $238 - 150$ | **88 packets** | **88 packets** | **100% MATCH** |
| **Step 5** | Distributor B (Karnataka) Order for 120 packets | Stock: **88**, Requested: **120**, Shortage: **32** | Shortage: 32 packets | **100% MATCH** |
| **Step 5** | Stock Shortage Enforcement | **Dispatch BLOCKED** | Dispatch Blocked | **100% MATCH** |
| **Step 6** | Retailer A Payment: Record ₹4,000 against ₹7,875 | Outstanding: **₹3,875.00** | Outstanding: ₹3,875.00 | **100% MATCH** |
| **Step 7 & 8** | Costing: RM (₹1,725 + ₹1,365 + ₹60) + Pkg (₹291 + ₹162) + Overheads (₹1,500 + ₹752) | Total: **₹5,855.00**, Cost/Pkt: **₹31.14** | Cost: ₹31.14, Selling: ₹50, Margin: 37.72% | **100% MATCH** |

---

## 6. Comprehensive 15 Date-Filterable Audit Reports

All 15 reports support real-time date filtering and export to **Excel (`.xlsx`)**, **CSV (`.csv`)**, and **PDF (`.pdf`)**:
1. **Sales Register**: Date, invoice number, customer, state, taxable amount, tax components, total value.
2. **Customer-Wise Sales**: Aggregate volume, taxable value, and GST contributed by each customer.
3. **Product-Wise Sales**: Units sold, revenue, and average realized price by SKU.
4. **GST Summary Report**: Taxable turnover, intra-state CGST & SGST collections, and inter-state IGST collections.
5. **Purchase Register**: Vendor invoice references, supplier names, material receipts, and input GST credits.
6. **Raw Material Stock Report**: Current stock, unit of measure, minimum threshold, and WAC valuation.
7. **Packaging Material Stock Report**: Pouch, carton, and label balances with reorder warnings.
8. **Finished Goods Stock Report**: Packaged snacks ready for dispatch with inventory valuation at selling price.
9. **Stock Movement Ledger**: Complete audit trail of every receipt, issue, and opening balance.
10. **Production Report**: Completed batch runs, planned vs actual output, and batch supervisor notes.
11. **Planned vs. Actual Consumption Report**: Material-by-material variance analysis with $\pm 3\%$ flagging.
12. **Wastage & Damage Report**: Damaged packaging counts, process scrap percentages, and financial impact.
13. **Cost Per Packet & Margin Report**: Direct materials, direct overheads, cost per packet, and gross margin %.
14. **Payment & Collection Report**: Payment receipts, reference numbers (NEFT/RTGS/UPI), and payment modes.
15. **Outstanding Receivables with Ageing**: Customer outstanding balances categorized into **0–30 Days**, **31–60 Days**, **61–90 Days**, and **90+ Days**.

---

## 7. Installation, Setup & Execution Guide

### Prerequisites
- **Node.js**: `v18.x` or `v20.x` or higher
- **MongoDB**: Local MongoDB community server running on port `27017` (or MongoDB Atlas URI)

### Environment Configuration
Copy the template environment file into `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
Default environment parameters configured in `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/nit_food_erp
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
FACTORY_NAME=Sri Murugan Traditional Foods
FACTORY_GSTIN=33AAAAA0000A1Z5
FACTORY_ADDRESS=Industrial Estate, Thuvakudi, Tiruchirappalli, Tamil Nadu - 620015
FACTORY_STATE=Tamil Nadu
FACTORY_STATE_CODE=33
NODE_ENV=development
```

---

### Step-by-Step Execution

#### Step 1: Backend Setup & Database Seeding
```bash
cd backend
npm install

# Seed the 5 demo role users (Salesman, Admin, Supervisor, Auditor, Owner)
npm run seed:users

# Seed benchmark master data (Products, RM, Packaging, BOM, Customers, Opening Stock)
npm run seed:master

# Execute the official NIT benchmark scenario simulation
npm run seed:benchmark

# Start the backend server (runs on http://localhost:5000)
npm run dev
```

#### Step 2: Frontend Setup
```bash
cd ../frontend
npm install

# Start the Vite development server (runs on http://localhost:3001 or http://localhost:5173)
npm run dev
```

#### Step 3: Run Full Automated Verification Suite
```bash
cd ../backend
npm test
```

---

## 8. Automated Testing & Verification Suite

The repository contains an automated test runner (`npm test`) covering **74 total assertions** across all system layers:

```
======================================================
   RUNNING COMPLETE FULL-STACK TEST & BENCHMARK SUITE  
======================================================
>> Executing: src/tests/phase1AuthTest.js          -> [PASS] (12 / 12)
>> Executing: src/tests/phase2MasterDataTest.js    -> [PASS] (10 / 10)
>> Executing: src/tests/phase3SalesOrderTest.js    -> [PASS] (7 / 7)
>> Executing: src/tests/phase4ProductionTest.js    -> [PASS] (12 / 12)
>> Executing: src/tests/phase5CostingPaymentTest.js -> [PASS] (6 / 6)
>> Executing: src/tests/phase6ReportsTest.js       -> [PASS] (15 / 15)
>> Executing: src/scripts/runBenchmarkScenario.js  -> [PASS] (12 / 12 exact matches)

======================================================
   ALL 7 TEST SUITES & BENCHMARKS PASSED (100% OK)    
======================================================
```

---

## 9. Known Limitations

While the system is functionally complete and production-grade for small-scale food manufacturing, the following known architectural boundaries exist:
1. **Single Factory State**: Factory location is currently configured as a single state (Tamil Nadu, Code `33`). Multi-factory enterprises operating across multiple state jurisdictions require extended factory branch schemas.
2. **Single-Stage Production**: Batch runs model single-stage transformation (Raw Materials $\rightarrow$ Finished Goods). Complex multi-stage work-in-progress (WIP) drying or curing steps are captured as direct batch overheads.
3. **Currency & Tax Localization**: Currency calculations are strictly Indian Rupee (INR / ₹) with GST compliance. International export documentation (IGST LUT bond filings) is not enabled by default.
4. **Email Delivery**: Invoice PDF generation is implemented on the client. Direct email dispatch requires an external SMTP or SendGrid provider configuration.

---

## 10. Design & Architectural Documentation

Comprehensive engineering diagrams and specifications are available in the [`docs/`](file:///E:/nit%20tiruchi%20task/docs) directory:
- [ER_DIAGRAM.md](file:///E:/nit%20tiruchi%20task/docs/ER_DIAGRAM.md) — Complete 15-model ER specification, attributes, and Mongoose references.
- [ER_DIAGRAM.svg](file:///E:/nit%20tiruchi%20task/docs/ER_DIAGRAM.svg) — Crisp vector Entity-Relationship diagram.
- [SYSTEM_ARCHITECTURE.md](file:///E:/nit%20tiruchi%20task/docs/SYSTEM_ARCHITECTURE.md) — 4-tier system decomposition, middleware gateway, and services.
- [SYSTEM_ARCHITECTURE.svg](file:///E:/nit%20tiruchi%20task/docs/SYSTEM_ARCHITECTURE.svg) — Multi-tier architecture diagram.
- [BUSINESS_WORKFLOW.md](file:///E:/nit%20tiruchi%20task/docs/BUSINESS_WORKFLOW.md) — Closed-loop procurement, manufacturing, and order-to-cash workflow.
- [BUSINESS_WORKFLOW.svg](file:///E:/nit%20tiruchi%20task/docs/BUSINESS_WORKFLOW.svg) — Dual-loop business workflow diagram.
- [DESIGN_NOTE.md](file:///E:/nit%20tiruchi%20task/docs/DESIGN_NOTE.md) — 2-page engineering design note for internship evaluation.
- [DESIGN_NOTE.pdf](file:///E:/nit%20tiruchi%20task/docs/DESIGN_NOTE.pdf) — Printable two-page PDF design note.
- [FINAL_SYSTEM_AUDIT_REPORT.md](file:///E:/nit%20tiruchi%20task/FINAL_SYSTEM_AUDIT_REPORT.md) — Initial comprehensive system audit report.
- [POST_FIX_VERIFICATION_REPORT.md](file:///E:/nit%20tiruchi%20task/POST_FIX_VERIFICATION_REPORT.md) — 5-issue post-fix verification report with 100% passing results.
