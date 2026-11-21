# BUSINESS WORKFLOW & DUAL-LOOP PROCESS SPECIFICATION
## NIT Tiruchirappalli — CDI Food Manufacturing Order-to-Audit ERP

**Document Version**: 1.0  
**Target Organization**: Centre for Digital Infrastructure (CDI), NIT Tiruchirappalli  
**Domain**: Packaged Food Manufacturing Operations (Murukku, Mixture, Chips, Sweets)  
**Process Model**: Dual Closed-Loop Integration with Central Inventory Reconciliation

---

## 1. WORKFLOW ARCHITECTURE & DUAL-LOOP OVERVIEW

The manufacturing and distribution operations of Sri Murugan Traditional Foods revolve around two interconnected operational cycles:
1. **The Production Loop (Inbound Procurement to Finished Goods Creation)**: Manages supplier purchase receipts, inventory valuation via Weighted Average Cost (WAC), Bill of Materials (BOM) explosion, batch production execution, variance tracking ($\pm 3\%$ tolerance), scrap capture, and finished-goods stock increment.
2. **The Sales Loop (Order-to-Cash & Dispatch)**: Manages customer selection, order placement, administrative approval, state-aware GST invoicing, dispatch enforcement (blocking on stock shortages), finished-goods stock decrement, payment collection, and accounts receivable ageing.

Both loops converge at the **Finished Goods Stock** repository and feed real-time transactional data into the **15 Statutory & Operational Audit Registers**.

---

## 2. BUSINESS WORKFLOW DIAGRAM (MERMAID)

```mermaid
flowchart TD
    classDef prodStyle fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0369a1;
    classDef salesStyle fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e;
    classDef pivotStyle fill:#dcfce7,stroke:#16a34a,stroke-width:3px,color:#15803d;
    classDef auditStyle fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#6b21a8;

    %% PRODUCTION LOOP
    subgraph PROD_LOOP["LOOP A: PRODUCTION & INVENTORY CYCLE (Supervisor & Admin)"]
        direction TB
        P1["1. Purchase Raw Materials & Packaging<br/>(Record PO & Supplier Invoice)"]:::prodStyle
        P2["2. Inward Stock & WAC Valuation<br/>(Update RM/PM Stock + Ledger Inflow +1)"]:::prodStyle
        P3["3. Select Product BOM<br/>(Murukku 200g: Flour 40kg, Oil 10L, Pouches 200)"]:::prodStyle
        P4["4. Create Production Run<br/>(Calculate Planned Consumption)"]:::prodStyle
        P5["5. Enter Actual Consumption & Damaged Scrap<br/>(Flour 40kg, Oil 10.5L, Damaged: 6 Pouches)"]:::prodStyle
        P6["6. Enter Good Output & Compute Variances<br/>(Actual: 188 pkts; Yield: -6%, Oil: +5%)"]:::prodStyle
        P7["7. Deduct RM/PM Stock Atomically<br/>(StockLedger: PRODUCTION_ISSUE -1)"]:::prodStyle
        P8["8. Batch Costing & Cost Per Packet<br/>(RM + Pkg + Labour + Gas = ₹5,855; ₹31.14/pkt)"]:::prodStyle

        P1 --> P2 --> P3 --> P4 --> P5 --> P6 --> P7 --> P8
    end

    %% CENTRAL PIVOT: FINISHED GOODS STOCK
    subgraph FG_PIVOT["CENTRAL CONVERGENCE POINT: FINISHED GOODS INVENTORY"]
        FG_STOCK["FINISHED GOODS STOCK<br/>(Product.currentStock = 88 pkts)<br/>Double-Entry StockLedger Reconciled"]:::pivotStyle
    end

    %% SALES LOOP
    subgraph SALES_LOOP["LOOP B: ORDER-TO-CASH & DISPATCH CYCLE (Salesman & Admin)"]
        direction TB
        S1["1. Salesman Login & Catalog View<br/>(Murukku 200g @ ₹50/pkt)"]:::salesStyle
        S2["2. Select Customer & Place Order<br/>(Retailer A, TN: 150 pkts)"]:::salesStyle
        S3["3. Admin Order Verification<br/>(Review Quantities, Prices, Credit Limit)"]:::salesStyle
        S4{"4. Admin Decision<br/>Approve or Reject?"}:::salesStyle
        S4_REJ["Reject Order with Remarks<br/>(Audit Log Recorded)"]:::salesStyle
        S5["5. Generate GST Tax Invoice<br/>(Intra-State: CGST 2.5% + SGST 2.5% = ₹7,875)"]:::salesStyle
        S6{"6. Pre-Dispatch Stock Check<br/>Is Current Stock >= Order Qty?"}:::salesStyle
        S6_BLOCK["Strict Dispatch Blocked<br/>(Reports Shortage e.g. 32 pkts)"]:::salesStyle
        S7["7. Record Dispatch & Handover<br/>(StockLedger: SALES_DISPATCH -1)"]:::salesStyle
        S8["8. Record Customer Payment<br/>(Retailer A pays ₹4,000 via NEFT/UPI)"]:::salesStyle
        S9["9. Outstanding Balance & Ageing<br/>(Remaining Due: ₹3,875 in 0-30 Day Bucket)"]:::salesStyle

        S1 --> S2 --> S3 --> S4
        S4 -- Approved --> S5
        S4 -- Rejected --> S4_REJ
        S5 --> S6
        S6 -- Yes (Stock OK) --> S7
        S6 -- No (Shortage) --> S6_BLOCK
        S7 --> S8 --> S9
    end

    %% AUDIT & REPORTING LAYER
    subgraph AUDIT_REPORTS["MONTHLY STATUTORY AUDIT & GOVERNANCE LAYER (Accountant/Auditor & Owner)"]
        direction TB
        R_SALES["Sales & Customer Registers<br/>(Taxable turnover, SKU breakdown)"]:::auditStyle
        R_GST["GST Summary Register<br/>(CGST, SGST, IGST liabilities)"]:::auditStyle
        R_STOCK["Triple Inventory Registers<br/>(RM, PM, FG Balances & Valuations)"]:::auditStyle
        R_PROD["Production & Variance Registers<br/>(Flagged batches > 3%, scrap analysis)"]:::auditStyle
        R_COST["Costing & Margins Register<br/>(Realized margins by product)"]:::auditStyle
        R_AGEING["AR Ageing Register<br/>(0-30, 31-60, 61-90, 90+ days)"]:::auditStyle
        R_AUDIT["Immutable Audit Trail<br/>(Every user mutation & timestamp)"]:::auditStyle
    end

    %% INTERCONNECTIONS
    P8 -->|Increment Finished Goods Stock (+188 pkts)| FG_STOCK
    FG_STOCK -->|Verify Available Stock Before Dispatch| S6
    S7 -->|Decrement Finished Goods Stock (-150 pkts)| FG_STOCK

    %% DATA FEED INTO AUDIT REPORTS
    PROD_LOOP -.->|Batch & Material Feeds| AUDIT_REPORTS
    SALES_LOOP -.->|Billing & Collection Feeds| AUDIT_REPORTS
    FG_STOCK -.->|Movement Ledger Feeds| AUDIT_REPORTS
```

---

## 3. DETAILED STEP-BY-STEP OPERATIONAL PROCEDURES

### Loop A: Production & Inward Material Cycle

#### Step 1: Procurement & Inward Receipt
- **Actor**: Production Supervisor / Admin
- **Action**: Receives physical raw materials (e.g. Flour, Cooking Oil, Spices) or packaging materials (200g pouches, cartons) from certified suppliers.
- **System Execution**:
  - Supervisor records purchase invoice reference (`PO-2026-XXXX`).
  - System updates raw material stock atomically.
  - System invokes `updateWeightedAverageCost()` to recalculate unit valuation rate without manual accounting intervention.
  - System writes an inflow entry to `StockLedger` (`movementType: 'PURCHASE_RECEIPT'`, `direction: +1`).

#### Step 2: BOM Selection & Batch Run Initialization
- **Actor**: Production Supervisor
- **Action**: Selects product to produce (`Murukku 200 g`) and chooses the active BOM (`v1.0`).
- **System Execution**:
  - The BOM engine scales planned ingredient requirements based on batch multiplier:
    - Flour: 40 kg
    - Cooking Oil: 10 litres
    - Salt & Spices: 1.2 kg
    - Packaging Pouches: 200 pieces
    - Shipping Cartons: 10 pieces
    - Expected Good Output: 200 packets

#### Step 3: Production Execution & Actuals Entry
- **Actor**: Production Supervisor
- **Action**: Enters physical actual quantities consumed and actual output produced after frying and packing:
  - Actual good output: 188 packets
  - Actual flour consumed: 40 kg
  - Actual oil consumed: 10.5 litres (0.5 L absorption variance)
  - Damaged pouches during sealing: 6 pouches (total pouches consumed: $188 + 6 = 194$)
  - Cartons used: 9 boxes

#### Step 4: Variance Computation & Threshold Flagging
- **Actor**: Automated Engine (`bomService.js`)
- **System Execution**:
  - Yield Variance: $\frac{188 - 200}{200} \times 100 = -6.0\%$. Absolute value ($6.0\%$) exceeds the configured $3.0\%$ threshold $\rightarrow$ **FLAGGED** (`isYieldFlagged: true`).
  - Oil Consumption Variance: $\frac{10.5 - 10}{10} \times 100 = +5.0\%$. Absolute value ($5.0\%$) exceeds $3.0\%$ $\rightarrow$ **FLAGGED** (`isVarianceFlagged: true`).
  - Supervisor is required to document reasons for process scrap in `wastageRemarks`.

#### Step 5: Inventory Updates & Batch Costing
- **Actor**: Automated Engine (`productionController.js` & `inventoryService.js`)
- **System Execution**:
  - Decrements Raw Materials: Flour $-40$ kg, Oil $-10.5$ L, Spices $-1.2$ kg (`StockLedger: PRODUCTION_ISSUE`).
  - Decrements Packaging Materials: Pouches $-194$ pcs, Cartons $-9$ pcs (`StockLedger: PRODUCTION_ISSUE`).
  - Increments Finished Goods: Murukku $+188$ packets (`StockLedger: PRODUCTION_YIELD`).
  - Accumulates total cost:
    - Raw Materials: Flour 40kg @ ₹43.125 (₹1,725) + Oil 10.5L @ ₹140 (₹1,470) + Spices 1.2kg @ ₹200 (₹240) = ₹3,435.00
    - Packaging Materials: 194 Pouches @ ₹2.50 (₹485) + 9 Cartons @ ₹15 (₹135) = ₹620.00
    - Direct Factory Labour: ₹1,200.00
    - Gas & Power Utility: ₹600.00
    - Total Batch Cost: ₹3,435.00 + ₹620.00 + ₹1,200.00 + ₹600.00 = ₹5,855.00
    - Cost per Good Packet: $\frac{₹5,855.00}{188} = ₹31.14$.
    - Profit per Packet: $₹50.00 - ₹31.14 = ₹18.86$ (Gross Margin: 37.72%).

---

### Loop B: Sales, Billing & Dispatch Cycle

#### Step 1: Order Booking
- **Actor**: Salesman
- **Action**: Logs into portal, selects assigned customer (`Retailer A`, Tamil Nadu), inspects available finished goods catalog, and places order for 150 packets of Murukku 200g.
- **System Execution**: Order is created with initial status `Submitted`.

#### Step 2: Administrative Review & Approval
- **Actor**: Admin
- **Action**: Reviews order quantities, customer outstanding balance, and credit limit. Modifies quantities or approves.
- **System Execution**: Order status transitions to `Approved`, capturing `approvedBy` and `approvedAt` audit stamps.

#### Step 3: Tax Invoicing
- **Actor**: Admin
- **Action**: Triggers tax invoice generation for approved order.
- **System Execution**:
  - `gstService.js` inspects `Customer.stateCode` (`33` - Tamil Nadu).
  - Determines sale is Intra-State: Taxable Amount ₹7,500.00 + CGST 2.5% (₹187.50) + SGST 2.5% (₹187.50) = Grand Total ₹7,875.00.
  - Customer's `outstandingBalance` is incremented by ₹7,875.00.
  - Printable GST Tax Invoice PDF is dynamically available for download.

#### Step 4: Dispatch Enforcement & Stock Deduction
- **Actor**: Admin
- **Action**: Initiates warehouse dispatch for the order.
- **System Execution**:
  - **MANDATORY ENFORCEMENT CHECK**: The system queries `Product.currentStock`.
  - Case 1 (Retailer A): Order requires 150 packets. Current stock is 238 packets ($238 \ge 150$). **Approved**: Finished-goods stock decremented to $238 - 150 = 88$ packets, writing `StockLedger: SALES_DISPATCH`. Order marked `Dispatched`.
  - Case 2 (Distributor B): Order requires 120 packets. Current stock is 88 packets ($88 < 120$). **BLOCKED**: Returns HTTP 400 detailing a 32-packet shortage. Dispatch is halted until production replenishes stock.

#### Step 5: Payment Collection & AR Ageing
- **Actor**: Admin / Accountant
- **Action**: Customer remits ₹4,000.00 via NEFT/UPI against invoice. Admin enters receipt in Payments screen.
- **System Execution**:
  - `Payment` document created with reference number.
  - `Invoice.amountPaid` updated to ₹4,000.00; `balanceDue` updated to ₹3,875.00; `paymentStatus` set to `Partially Paid`.
  - `Customer.outstandingBalance` reduced to ₹3,875.00.
  - The outstanding balance dynamically populates the **Accounts Receivable Ageing Register** into the 0–30 day bucket.
