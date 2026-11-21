# POST-FIX VERIFICATION REPORT
## NIT Tiruchirappalli — CDI Food Manufacturing Order-to-Audit ERP

**Audit Date**: November 21, 2026  
**Auditor / Engineer**: Senior Software QA Engineer & Full-Stack Architect  
**Project**: Order-to-Audit Management System for Packaged Food Manufacturing  
**Target Organization**: Centre for Digital Infrastructure (CDI), NIT Tiruchirappalli  
**Status**: **ALL 5 ISSUES RESOLVED & VERIFIED (100% PASS)**

---

## EXECUTIVE SUMMARY

Following the comprehensive system audit of the NIT Tiruchirappalli Order-to-Audit Management System, five (5) issues were identified:
- **1 High-Severity Security Issue**: Unrestricted public access on invoice and financial/audit report backend endpoints.
- **1 Medium-Severity Security Issue**: Frontend routes lacked granular role-based route guards in `App.jsx`.
- **1 High-Severity Accounting / Inventory Issue**: Missing opening stock ledger entries for 3 secondary finished goods (`Special Mixture 250 g`, `Banana Chips 200 g`, `Traditional Mysore Pak 250 g`).
- **1 Medium-Severity Business Logic Issue**: Customers with active outstanding balances could be soft-deleted / deactivated.
- **1 Low-Severity Reporting Issue**: Purchase register report returned zero rows because the benchmark scenario recorded purchase stock without inserting the corresponding `Purchase` collection document.

All five issues have been precisely resolved without refactoring, breaking existing features, or altering core calculations (GST, BOM yield, WAC valuation, production batch costing, payment processing). All 7 test suites, the 9-step benchmark scenario, and the frontend production build were executed and passed with 100% success.

---

## ISSUE-BY-ISSUE REMEDIATION & VERIFICATION

### Issue 1 — High: Backend Invoice and Report Security
- **Files Modified**:
  - `backend/src/routes/invoiceRoutes.js`
  - `backend/src/routes/reportRoutes.js`
- **Root Cause**: `invoiceRoutes.js` was protected only with `protect` on `GET /` and `GET /:id` without calling `authorize('admin', 'owner', 'accountant_auditor')`. In addition, `reportRoutes.js` lacked route-level role restriction, allowing any authenticated user (such as a Salesman or Production Supervisor) to query financial statements, GST registers, and audit logs.
- **Fix Applied**:
  1. In `invoiceRoutes.js`: Attached `authorize('admin', 'owner', 'accountant_auditor')` to `router.get('/', ...)` and `router.get('/:id', ...)`.
  2. In `reportRoutes.js`: Enforced `router.use(protect, authorize('admin', 'owner', 'accountant_auditor'))` across all 15 audit/operational report endpoints.
- **Verification Results**:
  - `Salesman` GET `/api/invoices` $\rightarrow$ **HTTP 403 Forbidden** (PASS)
  - `Salesman` GET `/api/reports/sales-register` $\rightarrow$ **HTTP 403 Forbidden** (PASS)
  - `Production Supervisor` GET `/api/reports/gst-summary` $\rightarrow$ **HTTP 403 Forbidden** (PASS)
  - `Accountant/Auditor` GET `/api/invoices` $\rightarrow$ **HTTP 200 OK** (PASS)
  - `Accountant/Auditor` GET `/api/reports/sales-register` $\rightarrow$ **HTTP 200 OK** (PASS)
  - `Admin` GET `/api/invoices` $\rightarrow$ **HTTP 200 OK** (PASS)
  - `Owner` GET `/api/reports/gst-summary` $\rightarrow$ **HTTP 200 OK** (PASS)

---

### Issue 2 — Medium: Frontend Protected Routes Guarding
- **Files Modified**:
  - `frontend/src/App.jsx`
- **Root Cause**: All routes inside `App.jsx` were nested under a blanket `<ProtectedRoute>` wrapper without supplying route-specific `allowedRoles` arrays. Direct navigation via URL bar bypassed client-side authorization and relied solely on sidebar navigation link hiding.
- **Fix Applied**:
  - Enclosed each restricted route or route group in an individual `<ProtectedRoute allowedRoles={[...]}>` aligned exactly with `Sidebar.jsx`:
    - **Dashboard**: All 5 roles (`owner`, `admin`, `salesman`, `production_supervisor`, `accountant_auditor`).
    - **Sales Orders & Customers**: `['salesman', 'admin', 'owner']`.
    - **Invoices & Payments**: `['admin', 'owner', 'accountant_auditor']`.
    - **Inventory, Production & BOM**: `['admin', 'owner', 'production_supervisor']`.
    - **Purchases & Suppliers**: `['admin', 'owner', 'production_supervisor']`.
    - **Batch Costing**: `['admin', 'owner', 'accountant_auditor']`.
    - **Reports & Audit Trail**: `['admin', 'owner', 'accountant_auditor']`.
- **Verification Results**:
  - Direct browser navigation to `/invoices` or `/reports` by a user lacking the required role triggers redirection to `/unauthorized`.
  - Permitted users retain seamless access to their assigned operational workflows.
  - Production build compiled with zero syntax or routing errors (`dist/index.html` generated in 17.53s).

---

### Issue 3 — High: Missing Stock Ledger Opening Balances
- **Files Modified**:
  - `backend/src/scripts/seedMasterData.js`
  - `backend/src/scripts/runBenchmarkScenario.js`
- **Root Cause**: In initial seeding, `Special Mixture 250 g` (40 pkts), `Banana Chips 200 g` (35 pkts), and `Traditional Mysore Pak 250 g` (25 pkts) had `currentStock` values initialized on the Product model, but no corresponding `OPENING_BALANCE` entries were written to the `StockLedger` collection. As a result, auditing stock through ledger summation showed a discrepancy for these three items.
- **Fix Applied**:
  - In `seedMasterData.js`: Added idempotent creation of `StockLedger` records for all 3 products with `movementType: 'OPENING_BALANCE'`, `direction: 1`, and `referenceModel: 'Product'`. Re-running the seed script verifies existing entries via `StockLedger.findOne` to guarantee zero duplication.
  - In `runBenchmarkScenario.js`: Re-established opening balance ledger entries during the benchmark master data reset routine.
- **Verification Results**:
  - `Murukku 200 g` (MRK-200G): `currentStock = 88`, Ledger Calculated = `88` (3 movements: 50 open + 188 prod - 150 dispatch) $\rightarrow$ **RECONCILED (PASS)**
  - `Special Mixture 250 g` (MIX-250G): `currentStock = 40`, Ledger Calculated = `40` (1 opening movement) $\rightarrow$ **RECONCILED (PASS)**
  - `Banana Chips 200 g` (CHP-BAN-200G): `currentStock = 35`, Ledger Calculated = `35` (1 opening movement) $\rightarrow$ **RECONCILED (PASS)**
  - `Traditional Mysore Pak 250 g` (SWT-MYSPK-250G): `currentStock = 25`, Ledger Calculated = `25` (1 opening movement) $\rightarrow$ **RECONCILED (PASS)**
  - Zero duplicate opening balances detected across the entire database (`duplicates: 0`).

---

### Issue 4 — Medium: Customer Deactivation With Active Balance
- **Files Modified**:
  - `backend/src/controllers/customerController.js`
- **Root Cause**: `deleteCustomer` toggled `customer.isActive = false` without validating whether `customer.outstandingBalance > 0`, allowing accounts with unpaid receivables to be deactivated.
- **Fix Applied**:
  - Added a validation guard in `deleteCustomer`:
    ```javascript
    if (customer.outstandingBalance > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot deactivate customer '${customer.name}' with active outstanding balance of ₹${customer.outstandingBalance.toFixed(2)}. Please settle all pending invoices first.`,
      });
    }
    ```
- **Verification Results**:
  - Attempting to deactivate `Retailer A` (Outstanding Balance: ₹3,875.00) $\rightarrow$ **HTTP 400 Bad Request**; Message: *"Cannot deactivate customer 'Retailer A' with active outstanding balance of ₹3875.00. Please settle all pending invoices first."* (PASS)
  - Deactivating a customer with `outstandingBalance === 0` $\rightarrow$ **HTTP 200 OK**; Message: *"Customer deactivated successfully"* (PASS)

---

### Issue 5 — Low: Purchase Register Report Population
- **Files Modified**:
  - `backend/src/scripts/runBenchmarkScenario.js`
- **Root Cause**: Step 1 of the benchmark scenario created raw material stock and ledger movements for the 60 kg flour purchase, but did not persist an entry in the `Purchase` collection. Consequently, the Purchase Register report endpoint (`GET /api/reports/purchase-register`) returned `count: 0`.
- **Fix Applied**:
  - In `runBenchmarkScenario.js`, Step 1 now writes the official purchase receipt document:
    - Purchase Number: `PO-2026-0001`
    - Bill Number: `BILL-AGRO-BENCH-01`
    - Supplier: Annapoorna Agro Flour Mills
    - Items: 60 kg Raw Rice Flour @ ₹45.00/kg (Taxable: ₹2,700.00, GST 5%: ₹135.00, Total: ₹2,835.00)
    - Status: `Received`
- **Verification Results**:
  - `GET /api/reports/purchase-register` $\rightarrow$ **HTTP 200 OK**; `count: 1`
  - Returned Record: `PO-2026-0001` | Bill: `BILL-AGRO-BENCH-01` | Vendor: Annapoorna Agro Flour Mills | Grand Total: ₹2,835.00 (PASS)

---

## REGRESSION TESTING SUMMARY

### 1. Backend Test Suites (`npm test`)
All 6 development phase test suites and the benchmark scenario runner were executed via `backend/src/tests/runAllTests.js`:

| Test Suite | File | Tests Run | Result |
| :--- | :--- | :---: | :---: |
| **Phase 1: Auth & RBAC** | `src/tests/phase1AuthTest.js` | 12 / 12 | **100% PASS** |
| **Phase 2: Master Data & Dashboards** | `src/tests/phase2MasterDataTest.js` | 10 / 10 | **100% PASS** |
| **Phase 3: Sales Orders & GST Invoicing** | `src/tests/phase3SalesOrderTest.js` | 7 / 7 | **100% PASS** |
| **Phase 4: Inventory, BOM & Production** | `src/tests/phase4ProductionTest.js` | 12 / 12 | **100% PASS** |
| **Phase 5: Batch Costing & Payments** | `src/tests/phase5CostingPaymentTest.js` | 18 / 18 | **100% PASS** |
| **Phase 6: Audit & Operational Reports** | `src/tests/phase6ReportsTest.js` | 15 / 15 | **100% PASS** |
| **Benchmark Scenario Verification** | `src/scripts/runBenchmarkScenario.js` | 9 steps | **100% PASS** |
| **TOTAL** | — | **74 / 74** | **100% PASS** |

### 2. Mandatory Benchmark Verification Matrix
The official NIT Tiruchirappalli benchmark scenario values were verified for exact mathematical precision:

| Metric | System Actual | Specification Expected | Tolerance | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Flour Closing Stock** | 120.0 kg | 120.0 kg ($100 + 60 - 40$) | Exact | **MATCH** |
| **Cooking Oil Closing Stock** | 19.5 L | 19.5 L ($30 - 10.5$) | Exact | **MATCH** |
| **200g Pouch Closing Stock** | 306 pcs | 306 pcs ($500 - 188 - 6$) | Exact | **MATCH** |
| **Carton Closing Stock** | 21 pcs | 21 pcs ($30 - 9$) | Exact | **MATCH** |
| **Finished Goods after Production** | 238 pkts | 238 pkts ($50 + 188$) | Exact | **MATCH** |
| **Finished Goods after Retailer A** | 88 pkts | 88 pkts ($238 - 150$) | Exact | **MATCH** |
| **Yield Variance** | -6.0% | -6.0% (Flagged > 3%) | Exact | **MATCH** |
| **Oil Consumption Variance** | +5.0% | +5.0% (Flagged > 3%) | Exact | **MATCH** |
| **Retailer A Invoice Grand Total** | ₹7,875.00 | ₹7,875.00 (Taxable ₹7500 + CGST ₹187.50 + SGST ₹187.50) | Exact | **MATCH** |
| **Retailer A Remaining Balance** | ₹3,875.00 | ₹3,875.00 (₹7875 - ₹4000) | Exact | **MATCH** |
| **Distributor B Shortage Detected** | 32 pkts | 32 pkts ($120 - 88$) | Exact | **MATCH** |
| **Distributor B Dispatch Guard** | BLOCKED | BLOCKED (Insufficient stock) | Strict | **MATCH** |

### 3. Frontend Build Verification
- Command: `npm run build` in `frontend/`
- Build Output:
  - `dist/index.html` (1.02 kB)
  - `dist/assets/index-iq1016Xu.css` (29.67 kB)
  - `dist/assets/index-w0zSmC5U.js` (1,521.84 kB)
- Result: **0 errors, clean production bundle**

---

## CONCLUSION

All five audit findings have been completely fixed, validated, and documented. The NIT Tiruchirappalli Food Manufacturing Order-to-Audit Management System is fully secure, functionally complete, mathematically reconciled, and ready for deployment and internship evaluation.
