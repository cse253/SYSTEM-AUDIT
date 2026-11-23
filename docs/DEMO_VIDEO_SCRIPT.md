# Order-to-Audit Management System — 8-Minute Evaluation Demo Video Script

**Candidate / Intern:** NIT Tiruchirappalli Internship Applicant  
**Project:** Order-to-Audit Management System for Packaged Food Manufacturing  
**Target Duration:** Exactly 8 Minutes (480 seconds)  
**Target Audience:** Technical Evaluation Committee, Centre for Digital Infrastructure (CDI), NIT Tiruchirappalli  
**Live Application URL:** `http://localhost:5173` (Frontend) | `http://localhost:5000` (Backend API)  
**Database:** MongoDB Community Server (`nit_food_erp`)

---

## Video Production & Presentation Setup Checklist
- [ ] Browser window sized to 1920×1080 (1080p Full HD) at 100% zoom.
- [ ] Terminal window split or accessible showing backend logs if desired.
- [ ] Audio crisp with noise cancellation.
- [ ] Application database seeded with clean benchmark state via `npm run seed:master` (or clean benchmark runner).

---

## Minute-by-Minute Timeline Overview

| Time Mark | Section / Scene | Role Used | Key Benchmark Metric Shown |
|---|---|---|---|
| **0:00 – 0:45** | System Architecture & Executive Dashboard | `owner@nitfood.com` | High-level metrics, real-time KPI aggregations, 5-role RBAC |
| **0:45 – 1:40** | Step 1: Raw Material Procurement & WAC Inventory | `admin@nitfood.com` | 60 kg Flour @ ₹45/kg &rarr; Stock: 160 kg, WAC: ₹43.125/kg |
| **1:40 – 3:00** | Step 2: Production Batch Execution & Variances | `supervisor@nitfood.com` | Yield: 188 pkts (-6%), Oil: +5%, Total Cost: ₹5,855.00, Cost/Pkt: ₹31.14 |
| **3:00 – 4:00** | Step 3 & 4: Sales Order & Intra-State GST Invoice | `salesman` &rarr; `admin` | Retailer A (TN, 33): 150 pkts, CGST 2.5% + SGST 2.5% = ₹7,875.00 |
| **4:00 – 4:50** | Step 5: Finished Goods Dispatch & Stock Deduction | `admin@nitfood.com` | Finished Goods stock reduced: 238 &rarr; 88 pkts atomically |
| **4:50 – 5:45** | Step 6: Inter-State Order & Stock Shortage Blocking | `salesman` &rarr; `admin` | Distributor B (KA, 29): 120 pkts, Shortage: 32 pkts, Dispatch BLOCKED |
| **5:45 – 6:40** | Step 7: Payment Collection & Receivables Ageing | `admin@nitfood.com` | ₹4,000 NEFT collected, Outstanding: ₹3,875 in 0–30 days ageing |
| **6:40 – 7:30** | Step 8: Statutory Audit Registers & Stock Ledger | `auditor@nitfood.com` | 15 Audit Registers, Immutable double-entry StockLedger |
| **7:30 – 8:00** | Conclusion, Security Hardening & Evaluation Wrap-Up | All Roles | RBAC enforcement, 8 automated test suites passing 100% |

---

## Verbatim Narration & On-Screen Demonstration Script

---

### SCENE 1: ARCHITECTURE OVERVIEW & EXECUTIVE DASHBOARD (0:00 – 0:45)
**Role:** Factory Owner (`owner@nitfood.com` / `Password@123`)  
**URL:** `/dashboard`

#### Visual Action:
1. Open browser to `http://localhost:5173/login`.
2. Enter email `owner@nitfood.com`, password `Password@123`, click **"Sign In"**.
3. Display the **Executive Dashboard**: highlight the top statistics cards (Total Raw Materials Value, Packaging Stock, Finished Goods, Today's Sales, Pending Orders, Outstanding Receivables).
4. Briefly hover over the Sidebar navigation showing complete separation of modules: Inventory, BOM & Production, Sales Orders, Tax Invoices, Payments & Ageing, Audit Reports.

#### Speaker Narration:
> *"Hello respected evaluators. Welcome to the complete demonstration of the Order-to-Audit Management System for packaged food manufacturers, developed for the Centre for Digital Infrastructure at NIT Tiruchirappalli.*
>
> *Our system manages the end-to-end lifecycle—from raw material purchase and recipe-driven production with variance analysis, through dual-regime GST billing, dispatch stock enforcement, and payment collection with receivables ageing.*
>
> *I am currently logged in as the Factory Owner. The real-time dashboard aggregates live figures from MongoDB: total inventory value, finished goods availability, and pending customer receivables. Let's walk through the mandatory 9-step benchmark scenario."*

---

### SCENE 2: RAW MATERIAL PURCHASE & WAC VALUATION (0:45 – 1:40)
**Role:** Admin (`admin@nitfood.com`)  
**URL:** `/raw-materials`

#### Visual Action:
1. Click on **"Raw Materials"** in the sidebar.
2. Locate the row for **"Flour (Maida / Rice Mix)"**: current opening stock is **100 kg** valued at **₹42.00/kg** (Total ₹4,200).
3. Click the **"Record Inward Purchase"** button.
4. Select Material: **"Flour"**, Supplier: **"Cauvery Agro Mills"**, Quantity: **`60`**, Unit: **`kg`**, Purchase Rate: **`45.00`**, Invoice Ref: **`INV-CAM-8821`**.
5. Click **"Save Purchase Receipt"**.
6. Show the updated table row:
   - Current Stock: **160 kg** (100 + 60).
   - Valuation Rate (WAC): **₹43.125 / kg** [Calculation: `(100 × 42 + 60 × 45) / 160 = 6,900 / 160 = 43.125`].
   - Total Stock Value: **₹6,900.00**.

#### Speaker Narration:
> *"In Step 1 of our benchmark, the factory procures raw materials. Let us navigate to Raw Materials inventory.*
>
> *Notice our flour currently has an opening balance of 100 kg at ₹42/kg. We now record an inward purchase of 60 kg of flour at ₹45/kg from Cauvery Agro Mills.*
>
> *The system immediately applies the Weighted Average Cost (WAC) formula in the backend inventory service. As you can see, our flour inventory is updated to exactly 160 kg, and the new valuation rate is calculated to ₹43.125 per kg, with a total inventory valuation of ₹6,900.00. An immutable stock ledger entry has also been created."*

---

### SCENE 3: BOM, PRODUCTION BATCH & VARIANCE ANALYSIS (1:40 – 3:00)
**Role:** Production Supervisor (`supervisor@nitfood.com`)  
**URL:** `/production/new`

#### Visual Action:
1. Switch to user `supervisor@nitfood.com` or navigate to `/production`.
2. Click **"New Production Run"**.
3. Select Product: **"Murukku 200 g"**. The Bill of Materials (BOM) automatically pre-fills standard planned requirements:
   - Planned Output: **200 packets**.
   - Planned Flour: **40 kg** | Planned Oil: **10 litres** | Planned Spices: **1.2 kg**.
   - Planned Pouches: **200 pieces** | Planned Cartons: **10 pieces**.
4. Enter Actual Production Run details:
   - Actual Output Yield: **`188`** packets.
   - Actual Flour: **`40`** kg.
   - Actual Cooking Oil: **`10.5`** litres (Simulating oil absorption variance).
   - Actual Salt & Spices: **`1.2`** kg.
   - Pouches Used: **`188`** good + **`6`** damaged = **`194`** total.
   - Cartons Used: **`9`** cartons.
   - Direct Labour Cost: **`₹1,200`**.
   - Gas & Electricity Cost: **`₹600`**.
5. Click **"Execute Production Run & Deduct Inventory"**.
6. Show the resulting Batch Details & Variance Report:
   - **Yield Variance:** `-6.0%` (188 vs 200 expected &rarr; Yield loss flagged in Amber).
   - **Oil Consumption Variance:** `+5.0%` (10.5 L vs 10 L standard &rarr; Flagged).
   - **Total Production Cost:** `₹5,855.00`
     - Flour: `40 kg × ₹43.125 = ₹1,725.00`
     - Cooking Oil: `10.5 L × ₹140 = ₹1,470.00`
     - Spices: `1.2 kg × ₹200 = ₹240.00`
     - Packaging: `194 pouches × ₹2.50 + 9 cartons × ₹15 = ₹620.00`
     - Labour: `₹1,200.00`
     - Gas/Power: `₹600.00`
   - **Cost Per Packet:** `₹31.14` (`₹5,855 / 188`).
   - **Selling Price:** `₹50.00` &rarr; **Profit Margin:** `₹18.86 / packet (37.7%)`.

#### Speaker Narration:
> *"Now in Step 2, the production team runs a batch of Murukku 200g. The system automatically pulls the Bill of Materials.*
>
> *The standard run expects 200 packets, but due to factory operational conditions, 188 good packets were yielded, 10.5 litres of oil were consumed (a 5% excess), and 6 pouches were damaged during sealing.*
>
> *Upon submitting, our backend executes atomic stock deduction and automated costing:*
> *First, it computes the -6% yield variance and +5% oil variance.*
> *Second, it prices materials using the live WAC rates: Flour at ₹1,725, Oil at ₹1,470, Spices at ₹240, Packaging at ₹620, plus ₹1,800 in direct expenses, arriving at a total production cost of exactly ₹5,855.00.*
> *Dividing by 188 good packets, our cost per packet is ₹31.14. Against our selling price of ₹50, the company earns a healthy 37.7% profit margin.*
> *Finished goods stock immediately increases from 50 to 238 packets."*

---

### SCENE 4: SALES ORDER & INTRA-STATE GST INVOICE (3:00 – 4:00)
**Role:** Salesman (`salesman@nitfood.com`) &rarr; Admin (`admin@nitfood.com`)  
**URL:** `/orders/new` &rarr; `/orders` &rarr; `/invoices`

#### Visual Action:
1. Navigate to `/orders/new` as Salesman.
2. Select Customer: **"Retailer A"** (Tamil Nadu, State Code: `33`).
3. Select Product: **"Murukku 200 g"**, Quantity: **`150`** packets, Price: **`₹50.00`**.
4. Show live tax preview:
   - Taxable Subtotal: **₹7,500.00**
   - Intra-state GST (5%): **CGST 2.5% = ₹187.50** | **SGST 2.5% = ₹187.50**
   - Grand Total: **₹7,875.00**
5. Click **"Submit Sales Order"** (Order status: `Submitted`).
6. Switch/view as Admin: In `/orders`, click **"Approve"**.
7. Click **"Generate Invoice"**.
8. Display the generated GST Tax Invoice (`INV-2026-0001`):
   - GSTIN, HSN Code `21069099`, CGST ₹187.50, SGST ₹187.50, Total: **₹7,875.00**.
   - Balance Due: **₹7,875.00**.

#### Speaker Narration:
> *"In Step 3 and 4, our salesman submits an order for Retailer A in Tiruchirappalli, Tamil Nadu for 150 packets.*
>
> *Because both the manufacturing unit and the customer reside in Tamil Nadu (State Code 33), the GST engine automatically determines this is an Intra-state supply. It computes 2.5% CGST (₹187.50) and 2.5% SGST (₹187.50) on the ₹7,500 taxable amount, giving a grand total of ₹7,875.00.*
>
> *The administrator approves the order and clicks 'Generate Invoice'. A compliant GST Tax Invoice is produced with sequential numbering, and Retailer A's outstanding balance increases by ₹7,875.00."*

---

### SCENE 5: ORDER DISPATCH & FINISHED GOODS DEDUCTION (4:00 – 4:50)
**Role:** Admin (`admin@nitfood.com`)  
**URL:** `/orders` &rarr; `/finished-goods`

#### Visual Action:
1. In `/orders`, point to the approved/invoiced order for Retailer A.
2. Note the **Stock Ready** badge (`150 requested, 238 available`).
3. Click the **"Dispatch"** button.
4. An alert confirms successful dispatch and inventory deduction.
5. Click **"Finished Goods"** in the sidebar:
   - Stock before dispatch: **238 packets**
   - Dispatched to Retailer A: **150 packets**
   - Closing stock: **88 packets** (`238 - 150 = 88`).
6. Show the Stock Ledger row logging `SALES_DISPATCH` of `-150` packets.

#### Speaker Narration:
> *"In Step 5, the warehouse proceeds to dispatch the order. The system checks finished goods inventory: 238 packets are in stock, which is sufficient for the 150 packets requested.*
>
> *Clicking 'Dispatch' atomically deducts 150 packets from the warehouse and records the dispatch in our double-entry stock ledger. Notice our finished goods stock is now exactly 88 packets."*

---

### SCENE 6: INTER-STATE ORDER & SHORTAGE ENFORCEMENT (4:50 – 5:45)
**Role:** Salesman &rarr; Admin  
**URL:** `/orders`

#### Visual Action:
1. Navigate to `/orders/new`.
2. Select Customer: **"Distributor B"** (Bengaluru, Karnataka, State Code: `29`).
3. Select Product: **"Murukku 200 g"**, Quantity: **`120`** packets.
4. Show live tax preview:
   - Taxable Amount: **₹6,000.00**
   - Inter-state GST (5%): **IGST 5.0% = ₹300.00**
   - Grand Total: **₹6,300.00**
5. Submit order.
6. Open `/orders` table:
   - Point out the **Red "Shortage"** indicator: *Required: 120, Available: 88 (Shortage: 32 pkts)*.
7. Click the **"Dispatch"** button to attempt unauthorized shipment:
   - An explicit system error modal/toast appears: **"Cannot dispatch order: Insufficient finished-goods stock. Shortage: 32 pkts"**.
   - Dispatch is completely blocked!

#### Speaker Narration:
> *"Now observe our critical security and inventory integrity mechanism in Step 6.*
>
> *Distributor B in Karnataka (State Code 29) places an order for 120 packets. Notice that the GST engine dynamically applies 5% IGST (₹300.00) because this is an Inter-state transaction.*
>
> *However, we only have 88 packets remaining in the factory. The system instantly detects a shortage of 32 packets and flags the order in red.*
>
> *If an operator attempts to click 'Dispatch', our backend strictly intercepts and blocks the request with a 400 Bad Request error. No negative inventory can ever be created."*

---

### SCENE 7: PAYMENT COLLECTION & RECEIVABLES AGEING (5:45 – 6:40)
**Role:** Accountant / Admin (`admin@nitfood.com`)  
**URL:** `/payments`

#### Visual Action:
1. Navigate to **"Payments & Ageing"** in the sidebar.
2. Point to the **Receivables Ageing Schedule**: Retailer A owes **₹7,875.00** in the `0 - 30 Days` current bucket.
3. Click **"Record Customer Payment"**.
4. Select Customer: **"Retailer A"**, Select Invoice: **`INV-2026-0001`**.
5. Enter Amount: **`₹4,000.00`**, Payment Mode: **`NEFT`**, UTR Ref: **`UTR-HDFC-991122`**.
6. Click **"Save Payment"**.
7. Observe immediate reconciliation:
   - Retailer A's invoice status transitions from `Unpaid` to **"Partially Paid"**.
   - Amount Paid: **₹4,000.00** | Balance Due: **₹3,875.00** (`7,875 - 4,000`).
   - Receivables Ageing Schedule updates Retailer A's current outstanding to exactly **₹3,875.00**.
8. Show the Payment History tab displaying the payment receipt.

#### Speaker Narration:
> *"In Step 7, Retailer A remits a partial collection of ₹4,000 via NEFT against their invoice.*
>
> *We open Payments & Ageing and record the ₹4,000 transaction with UTR reference UTR-HDFC-991122.*
>
> *The system updates the invoice to 'Partially Paid', records the payment in the immutable audit log, and reconciles the customer's outstanding balance to exactly ₹3,875.00, mapped into the 0–30 day ageing bucket."*

---

### SCENE 8: STATUTORY AUDIT REGISTERS & STOCK LEDGER (6:40 – 7:30)
**Role:** Auditor (`auditor@nitfood.com`)  
**URL:** `/reports` & `/stock-ledger`

#### Visual Action:
1. Sign in as Auditor (`auditor@nitfood.com`).
2. Navigate to **"Reports & Audits"**.
3. Display the 15 Statutory Audit Registers:
   - GSTR-1 Sales Register (showing Intra-state vs Inter-state taxable supplies).
   - Cost Per Packet & Margin Register (Murukku 200g @ ₹31.14 cost vs ₹50 selling).
   - Production Variance Report (Yield variance -6%, Oil +5%).
   - Customer Outstanding & Ageing Register.
4. Click **"Stock Ledger"** in the sidebar:
   - Show the sequential timeline of double-entry movements:
     1. Opening Balances
     2. Purchase Receipt (+60 kg Flour)
     3. Production Issue (-40 kg Flour, -10.5 L Oil, -194 Pouches)
     4. Production Yield (+188 pkts Finished Goods)
     5. Sales Dispatch (-150 pkts to Retailer A)
   - Every transaction displays user ID, timestamp, and running balance before/after.

#### Speaker Narration:
> *"Now we log in as the Auditor to examine our compliance features.*
>
> *The system provides 15 real-time audit registers, including GSTR-1 outward supplies, cost-per-packet margin analysis, and production variance registers.*
>
> *Crucially, our Stock Movement Ledger follows strict double-entry principles: every inbound receipt, production issue, finished yield, and customer dispatch is permanently timestamped with the acting user's ID, document reference, and running balance before and after. No manual tampering is possible."*

---

### SCENE 9: SECURITY, TEST SUITE & CONCLUSION (7:30 – 8:00)
**Role:** Presenter / Full-Stack Engineer  
**URL:** Terminal / IDE test run

#### Visual Action:
1. Show terminal with command `npm test --prefix backend`.
2. Display the live test summary:
   - `ALL 8 TEST SUITES & BENCHMARKS PASSED (100% OK)`
   - 12/12 Auth & RBAC tests passed
   - 10/10 Master Data tests passed
   - 7/7 Sales & GST tests passed
   - 8/8 Production & BOM tests passed
   - 6/6 Costing & Ageing tests passed
   - 15/15 Statutory Reports tests passed
   - 10/10 Security Hardening & Integrity tests passed
   - Mandatory Benchmark Scenario: **12 / 12 metrics MATCHED**.
3. Show clean frontend production build (`npm run build`).

#### Speaker Narration:
> *"To ensure rigorous software quality, our entire platform is backed by 8 automated test suites spanning 78 assertions and the full benchmark scenario—all passing 100%.*
>
> *We have also hardened role-based security: Salesmen are blocked from costing and payment endpoints, overpayments and unauthorized deactivations are prevented at the database level, and production deductions are guaranteed atomic.*
>
> *The application is fully container-ready, responsive, and adheres strictly to NIT Tiruchirappalli's specifications. Thank you for your time and consideration."*

---

## Benchmark Metrics Quick Reference Card (For Presenter)

| Step | Metric | Value to State | System Check |
|---|---|---|---|
| Step 1 | Flour Purchase Stock | **160 kg** | Verified in Raw Materials table |
| Step 1 | Flour WAC Rate | **₹43.125 / kg** | Verified in Stock Ledger & BOM |
| Step 2 | Actual Output Yield | **188 packets** | Verified in Batch Card |
| Step 2 | Yield Variance | **-6.0%** | Flagged in Amber |
| Step 2 | Oil Consumption Variance | **+5.0%** | Flagged in Amber |
| Step 2 | Total Production Cost | **₹5,855.00** | Verified in Cost Breakdown |
| Step 2 | Cost Per Packet | **₹31.14** | Selling ₹50 &rarr; Margin ₹18.86 |
| Step 3 | Retailer A GST Invoice | **₹7,875.00** | CGST ₹187.50 + SGST ₹187.50 |
| Step 4 | Retailer A Dispatch Stock | **88 pkts remaining** | 238 - 150 = 88 |
| Step 5 | Distributor B Shortage | **32 packets** | 120 requested vs 88 stock |
| Step 5 | Distributor B Dispatch | **BLOCKED (400)** | Verified on screen |
| Step 6 | Retailer A Payment | **₹4,000.00** | NEFT received |
| Step 6 | Remaining Balance | **₹3,875.00** | Allocated to 0–30 Days ageing |
