# DESIGN NOTE: ORDER-TO-AUDIT MANAGEMENT SYSTEM
## Packaged Food Manufacturing Operations — NIT Tiruchirappalli Internship Submission

**Author / Intern**: Senior Software QA Engineer & Full-Stack Architect (NIT Tiruchirappalli CDI Internship)  
**Host Institution**: Centre for Digital Infrastructure (CDI), National Institute of Technology, Tiruchirappalli  
**Target Industry**: Packaged Food Manufacturing (Murukku, Mixture, Chips, Sweets)  
**System Architecture**: Multi-Tier Decoupled Client-Server (React 18 + Node.js/Express + MongoDB 8.x)  
**Verification Level**: 74/74 Unit/Integration Test Assertions Passed (100% Benchmark Reconciled)

---

## 1. PROJECT OVERVIEW & BUSINESS PROBLEM SOLVED
Small and medium packaged food manufacturers in South India encounter acute operational bottlenecks: ingredient price volatility, process scrap during frying/sealing, lack of batch-level yield visibility, stock leakage, state-specific GST calculation errors (Tamil Nadu intra-state vs. interstate), and untracked customer credit risks. 

This **Order-to-Audit Management System** delivers a comprehensive, database-driven enterprise solution replacing ad-hoc manual logs with a closed-loop system connecting procurement, production, inventory, sales, billing, collection, and statutory audits. It enforces complete operational integrity: orders cannot be dispatched if physical inventory is insufficient, batch yields exceeding $\pm 3\%$ tolerance are automatically flagged for supervisory review, inventory balances are derived from an immutable double-entry stock ledger, and customer accounts with active balances cannot be deactivated.

---

## 2. TECHNOLOGY STACK & ARCHITECTURAL JUSTIFICATIONS
The architecture was selected to achieve high development agility, decimal-safe financial precision, and stateless horizontal scalability:
- **Frontend (React 18 + Vite + Tailwind CSS)**: Vite provides instant Hot Module Replacement (HMR) and optimized build bundles. React's component hierarchy cleanly isolates role-based views. Tailwind CSS delivers an accessible enterprise UI. `Recharts` visualizes production yields, scrap, and stock health. `jsPDF` and SheetJS (`xlsx`) generate client-side GST Tax Invoices and Excel registers without server rendering overhead.
- **Backend (Node.js + Express.js)**: Node's asynchronous event loop efficiently handles concurrent I/O operations across order bookings and stock updates. Express middleware decouples cross-cutting concerns: CORS, JWT decryption (`protect`), role-based authorization (`authorize`), and centralized error handling.
- **Database (MongoDB 8.x + Mongoose 9.x ODM)**: Document-oriented JSON storage aligns natively with nested order line items, bill of materials subdocuments, and audit trails. Mongoose schema validation, indexes, and pre-save hooks enforce strong consistency while avoiding the rigidity and migration overhead of relational schemas.

---

## 3. DATA MODEL & CORE ENTITY RELATIONSHIPS
The persistence layer comprises **15 Mongoose collections** (documented in [ER_DIAGRAM.md](file:///E:/nit%20tiruchi%20task/docs/ER_DIAGRAM.md)):
1. **Master Records**: `User` (5 roles), `Customer` (Retailer/Distributor, state code 33/29, balances), `Supplier`, `Product` (Murukku, Mixture, Chips, Sweets), `RawMaterial`, and `PackagingMaterial`.
2. **Manufacturing**: `BOM` (formulation per standard batch) and `ProductionRun` (batch actuals, scrap, variances, costs).
3. **Transactions**: `Purchase` (supplier receipts), `SalesOrder` (booking & approval), `Invoice` (GST billing), `Payment` (customer collections), and `Expense` (direct labour, gas, electricity).
4. **Governance**: `StockLedger` (immutable double-entry inventory log) and `AuditLog` (non-repudiation security trail).
- **Core Relationships**: `Customer` $1 : N$ `SalesOrder` $1 : 1$ `Invoice` $1 : N$ `Payment`. `Product` $1 : 1$ `BOM` $1 : N$ `ProductionRun`. `Supplier` $1 : N$ `Purchase`.
- **Dispatch Implementation**: Dispatch is an atomic event on `SalesOrder` (`status: 'Dispatched'`, `dispatchedAt: Date`) coupled with a negative movement in `StockLedger`, eliminating the need for a redundant standalone table.

---

## 4. INVENTORY RECONCILIATION & STOCK LEDGER ENGINE
In strict adherence to statutory accounting and inventory auditing standards, balances are never directly overwritten. Every inventory change is recorded as an immutable debit/credit movement in `StockLedger`:

$$\text{Closing Stock} = \text{Opening Stock} + \text{Receipts} - \text{Issues} - \text{Dispatches} \pm \text{Adjustments}$$

- **Inward Movements (+1)**: `PURCHASE_RECEIPT` (materials received) and `PRODUCTION_YIELD` (finished goods produced).
- **Outward Movements (-1)**: `PRODUCTION_ISSUE` (ingredients & packaging consumed), `DAMAGE_SCRAP` (packaging waste), and `SALES_DISPATCH` (finished goods delivered to customers).
- **Source Linkage**: Every movement records `sourceDocumentType` (`Purchase`, `ProductionRun`, `SalesOrder`), `sourceDocumentId`, `balanceBefore`, `balanceAfter`, unit valuation, and `userId`.
- **Negative Stock Guard**: If an issue or dispatch would drive stock below zero, the transaction is rejected atomically with HTTP 400.

---

## 5. BOM & PRODUCTION VARIANCE CALCULATION
For each production run, planned consumption is scaled by the batch multiplier and compared against actual factory usage (`bomService.js`):

$$\text{Yield Variance \%} = \left( \frac{\text{Actual Output} - \text{Expected Output}}{\text{Expected Output}} \right) \times 100$$

$$\text{Consumption Variance \%} = \left( \frac{\text{Actual Consumption} - \text{Planned Consumption}}{\text{Planned Consumption}} \right) \times 100$$

- **Mandatory Murukku 200 g Benchmark Example**:
  - Expected Batch Output: **200 packets**. Actual Output: **188 good packets**.
  - **Yield Variance**: $\frac{188 - 200}{200} \times 100 = \mathbf{-6.0\%}$ $\rightarrow$ Exceeds $\pm 3.0\%$ tolerance $\rightarrow$ **FLAGGED** (`isYieldFlagged: true`).
  - Cooking Oil: Planned 10.0 L, Actual Consumed 10.5 L. **Consumption Variance**: $\frac{10.5 - 10.0}{10.0} \times 100 = \mathbf{+5.0\%}$ $\rightarrow$ **FLAGGED** (`isVarianceFlagged: true`).
  - Packaging Scrap: 188 good packets consumed 188 pouches + 6 damaged pouches during heat-sealing = **194 pouches total** ($500 - 194 = 306$ pcs closing). 9 shipping cartons used ($30 - 9 = 21$ pcs closing).

---

## 6. COSTING, VALUATION & PROFITABILITY ENGINE
- **Dynamic Raw Material Valuation**: Purchases update inventory via **Weighted Average Cost (WAC)**:
  $$\text{New WAC} = \frac{(\text{Existing Stock} \times \text{Existing Rate}) + (\text{Purchase Qty} \times \text{Purchase Rate})}{\text{Existing Stock} + \text{Purchase Qty}}$$
  *Flour Benchmark*: Existing 100 kg @ ₹42.00 (₹4,200) + New 60 kg @ ₹45.00 (₹2,700) $\rightarrow$ 160 kg @ **₹43.125 / kg**.
- **Batch Cost Breakdown (Murukku 200 g Benchmark)**:
  1. Direct Raw Materials: Rice Flour (40 kg × ₹43.125 = ₹1,725.00) + Cooking Oil (10.5 L × ₹140.00 = ₹1,470.00) + Salt & Spices (1.2 kg × ₹200.00 = ₹240.00) = **₹3,435.00**
  2. Packaging Materials: 194 Pouches (188 good + 6 damaged) × ₹2.50 (₹485.00) + 9 Cartons × ₹15.00 (₹135.00) = **₹620.00**
  3. Direct Overheads: Labour (₹1,200.00) + Gas & Power (₹600.00) = **₹1,800.00**
  - **Total Production Cost**: $₹3,435.00 + ₹620.00 + ₹1,800.00 = \mathbf{₹5,855.00}$
  - **Cost Per Good Packet**: $\frac{₹5,855.00}{188\text{ good packets}} = \mathbf{₹31.14}$
  - **Gross Profit**: Selling Price ₹50.00 − Cost ₹31.14 = **₹18.86 per packet** (**37.72% Gross Margin**).

---

## 7. SECURITY, ROLE-BASED ACCESS & AUDIT COMPLIANCE
1. **Authentication & Session Security**: Passwords hashed with `bcryptjs` (salt factor 10); passwords excluded by default (`select: false`). Authentication utilizes signed JSON Web Tokens (`JWT`, 7-day expiration).
2. **Backend-Enforced RBAC**: Middleware (`protect`, `authorize`) strictly enforces permissions at the API route level:
   - **Salesman**: Catalog pricing, customer list, order placement, order status tracking.
   - **Admin**: Order approval/editing, GST tax invoice generation, physical dispatch, payment collection.
   - **Production Supervisor**: Material receipts, BOM maintenance, batch execution, scrap logging, variance review.
   - **Accountant / Auditor**: Strictly read-only access across all 15 statutory registers with Excel/CSV/PDF export.
   - **Owner**: Executive KPI metrics, gross revenue, inventory valuation, cashflow, and full audit logs.
3. **Traceability & Non-Repudiation**: `AuditLog` captures user ID, action name, target collection, IP address, timestamp, and metadata for every state mutation, ensuring tamper-proof audit trails.
