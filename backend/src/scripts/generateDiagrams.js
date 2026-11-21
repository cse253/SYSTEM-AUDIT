const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../../../docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// =============================================================================
// 1. GENERATE ER_DIAGRAM.svg
// =============================================================================
function generateERDiagramSVG() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1150" width="100%" height="100%" style="background:#f8fafc; font-family:'Segoe UI', Inter, -apple-system, sans-serif;">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b"/>
    </marker>
    <marker id="arrow-emerald" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
    </marker>
    <marker id="arrow-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb"/>
    </marker>
  </defs>

  <!-- TITLE HEADER -->
  <rect x="40" y="30" width="1520" height="70" rx="8" fill="#1e293b"/>
  <text x="60" y="62" fill="#ffffff" font-size="20" font-weight="700">NIT TIRUCHIRAPPALLI — CDI PACKAGED FOOD MANUFACTURING ERP</text>
  <text x="60" y="85" fill="#94a3b8" font-size="13">Complete Entity-Relationship (ER) Data Model — 15 Mongoose Schemas with Document References &amp; Embedded Collections</text>
  <rect x="1390" y="48" width="150" height="32" rx="4" fill="#0ea5e9"/>
  <text x="1465" y="69" fill="#ffffff" font-size="12" font-weight="600" text-anchor="middle">MONGODB 8.x</text>

  <!-- ENTITY CARD: USER -->
  <g transform="translate(40, 130)" filter="url(#shadow)">
    <rect width="210" height="200" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="210" height="32" rx="6" fill="#3b82f6"/>
    <text x="105" y="21" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">USER</text>
    <text x="15" y="52" fill="#0f172a" font-size="11" font-weight="600">_id : ObjectId [PK]</text>
    <text x="15" y="70" fill="#475569" font-size="11">name : String</text>
    <text x="15" y="88" fill="#475569" font-size="11">email : String [UK]</text>
    <text x="15" y="106" fill="#475569" font-size="11">password : String (Hash)</text>
    <text x="15" y="124" fill="#0284c7" font-size="11" font-weight="600">role : Enum (5 Roles)</text>
    <text x="15" y="142" fill="#475569" font-size="11">phone : String</text>
    <text x="15" y="160" fill="#475569" font-size="11">isActive : Boolean</text>
    <text x="15" y="178" fill="#94a3b8" font-size="10">timestamps: true</text>
  </g>

  <!-- ENTITY CARD: CUSTOMER -->
  <g transform="translate(40, 360)" filter="url(#shadow)">
    <rect width="210" height="240" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="210" height="32" rx="6" fill="#f59e0b"/>
    <text x="105" y="21" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">CUSTOMER</text>
    <text x="15" y="52" fill="#0f172a" font-size="11" font-weight="600">_id : ObjectId [PK]</text>
    <text x="15" y="70" fill="#475569" font-size="11">name : String</text>
    <text x="15" y="88" fill="#475569" font-size="11">customerType: Retailer|Dist</text>
    <text x="15" y="106" fill="#475569" font-size="11">gstin : String</text>
    <text x="15" y="124" fill="#475569" font-size="11">address : String</text>
    <text x="15" y="142" fill="#0284c7" font-size="11" font-weight="600">stateCode: 33 (TN)|29 (KA)</text>
    <text x="15" y="160" fill="#475569" font-size="11">creditLimit : Number</text>
    <text x="15" y="178" fill="#dc2626" font-size="11" font-weight="600">outstandingBalance: Num</text>
    <text x="15" y="196" fill="#475569" font-size="11">customerPricing[]: Subdoc</text>
    <text x="15" y="214" fill="#475569" font-size="11">isActive : Boolean</text>
  </g>

  <!-- ENTITY CARD: SUPPLIER -->
  <g transform="translate(40, 630)" filter="url(#shadow)">
    <rect width="210" height="200" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="210" height="32" rx="6" fill="#64748b"/>
    <text x="105" y="21" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">SUPPLIER</text>
    <text x="15" y="52" fill="#0f172a" font-size="11" font-weight="600">_id : ObjectId [PK]</text>
    <text x="15" y="70" fill="#475569" font-size="11">name : String</text>
    <text x="15" y="88" fill="#475569" font-size="11">contactPerson : String</text>
    <text x="15" y="106" fill="#475569" font-size="11">gstin : String</text>
    <text x="15" y="124" fill="#475569" font-size="11">phone, email, address</text>
    <text x="15" y="142" fill="#475569" font-size="11">state : Tamil Nadu (33)</text>
    <text x="15" y="160" fill="#475569" font-size="11">suppliedTypes[]: Enum</text>
    <text x="15" y="178" fill="#475569" font-size="11">isActive : Boolean</text>
  </g>

  <!-- ENTITY CARD: PRODUCT -->
  <g transform="translate(320, 130)" filter="url(#shadow)">
    <rect width="230" height="250" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="230" height="32" rx="6" fill="#10b981"/>
    <text x="115" y="21" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">PRODUCT (Finished Goods)</text>
    <text x="15" y="52" fill="#0f172a" font-size="11" font-weight="600">_id : ObjectId [PK]</text>
    <text x="15" y="70" fill="#475569" font-size="11">name : String (Murukku, etc.)</text>
    <text x="15" y="88" fill="#0f172a" font-size="11" font-weight="600">sku : String [UK] (MRK-200G)</text>
    <text x="15" y="106" fill="#475569" font-size="11">category: Murukku|Mixture|Chips</text>
    <text x="15" y="124" fill="#475569" font-size="11">packSize : 200, unit: 'g'</text>
    <text x="15" y="142" fill="#16a34a" font-size="11" font-weight="600">sellingPrice : Number (₹50)</text>
    <text x="15" y="160" fill="#475569" font-size="11">gstPercentage : 5%</text>
    <text x="15" y="178" fill="#475569" font-size="11">hsnCode : 21069099</text>
    <text x="15" y="196" fill="#0284c7" font-size="11" font-weight="600">currentStock : Number (88 pkts)</text>
    <text x="15" y="214" fill="#475569" font-size="11">minStockLevel : Number (100)</text>
    <text x="15" y="232" fill="#475569" font-size="11">isActive : Boolean</text>
  </g>

  <!-- ENTITY CARD: BOM -->
  <g transform="translate(320, 420)" filter="url(#shadow)">
    <rect width="230" height="210" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="230" height="32" rx="6" fill="#8b5cf6"/>
    <text x="115" y="21" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">BILL OF MATERIALS (BOM)</text>
    <text x="15" y="52" fill="#0f172a" font-size="11" font-weight="600">_id : ObjectId [PK]</text>
    <text x="15" y="70" fill="#2563eb" font-size="11" font-weight="600">product : ObjectId [FK -> Product]</text>
    <text x="15" y="88" fill="#475569" font-size="11">version : 'v1.0'</text>
    <text x="15" y="106" fill="#475569" font-size="11">expectedOutput : 200 pkts</text>
    <text x="15" y="124" fill="#475569" font-size="11">outputUnit : 'packets'</text>
    <text x="15" y="142" fill="#059669" font-size="11">rawMaterials[] : Subdocs</text>
    <text x="25" y="158" fill="#64748b" font-size="10">{ material FK, qty, unit }</text>
    <text x="15" y="176" fill="#059669" font-size="11">packagingMaterials[] : Subdocs</text>
    <text x="25" y="192" fill="#64748b" font-size="10">{ material FK, qty, unit }</text>
  </g>

  <!-- ENTITY CARD: RAW_MATERIAL -->
  <g transform="translate(610, 130)" filter="url(#shadow)">
    <rect width="230" height="230" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="230" height="32" rx="6" fill="#0284c7"/>
    <text x="115" y="21" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">RAW MATERIAL</text>
    <text x="15" y="52" fill="#0f172a" font-size="11" font-weight="600">_id : ObjectId [PK]</text>
    <text x="15" y="70" fill="#475569" font-size="11">name : Rice Flour, Oil, etc.</text>
    <text x="15" y="88" fill="#475569" font-size="11">code : String [UK] (RM-FLR-01)</text>
    <text x="15" y="106" fill="#475569" font-size="11">unit : kg | litres | grams</text>
    <text x="15" y="124" fill="#0284c7" font-size="11" font-weight="600">currentStock : Number (120 kg)</text>
    <text x="15" y="142" fill="#475569" font-size="11">reorderLevel : Number</text>
    <text x="15" y="160" fill="#16a34a" font-size="11" font-weight="600">valuationRate : WAC (₹43.125)</text>
    <text x="15" y="178" fill="#475569" font-size="11">totalValue : Number (₹5,175)</text>
    <text x="15" y="196" fill="#475569" font-size="11">hsnCode : String</text>
    <text x="15" y="214" fill="#475569" font-size="11">isActive : Boolean</text>
  </g>

  <!-- ENTITY CARD: PACKAGING_MATERIAL -->
  <g transform="translate(610, 390)" filter="url(#shadow)">
    <rect width="230" height="210" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="230" height="32" rx="6" fill="#06b6d4"/>
    <text x="115" y="21" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">PACKAGING MATERIAL</text>
    <text x="15" y="52" fill="#0f172a" font-size="11" font-weight="600">_id : ObjectId [PK]</text>
    <text x="15" y="70" fill="#475569" font-size="11">name : 200g Pouch, Carton</text>
    <text x="15" y="88" fill="#475569" font-size="11">code : String [UK] (PKG-PCH-200)</text>
    <text x="15" y="106" fill="#475569" font-size="11">unit : 'pieces'</text>
    <text x="15" y="124" fill="#0284c7" font-size="11" font-weight="600">currentStock : Number (306 pcs)</text>
    <text x="15" y="142" fill="#475569" font-size="11">reorderLevel : Number</text>
    <text x="15" y="160" fill="#16a34a" font-size="11">valuationRate : Number (₹1.50)</text>
    <text x="15" y="178" fill="#475569" font-size="11">totalValue : Number</text>
    <text x="15" y="196" fill="#475569" font-size="11">isActive : Boolean</text>
  </g>

  <!-- ENTITY CARD: PURCHASE -->
  <g transform="translate(320, 660)" filter="url(#shadow)">
    <rect width="230" height="250" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="230" height="32" rx="6" fill="#475569"/>
    <text x="115" y="21" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">PURCHASE (PO / Receipt)</text>
    <text x="15" y="52" fill="#0f172a" font-size="11" font-weight="600">_id : ObjectId [PK]</text>
    <text x="15" y="70" fill="#475569" font-size="11">purchaseNumber : PO-2026-0001</text>
    <text x="15" y="88" fill="#2563eb" font-size="11" font-weight="600">supplier : ObjectId [FK -> Supp]</text>
    <text x="15" y="106" fill="#475569" font-size="11">invoiceNumber : String</text>
    <text x="15" y="124" fill="#475569" font-size="11">purchaseDate : Date</text>
    <text x="15" y="142" fill="#059669" font-size="11">items[] : Polymorphic Subdocs</text>
    <text x="25" y="158" fill="#64748b" font-size="10">{ item, qty, rate, gst, total }</text>
    <text x="15" y="176" fill="#475569" font-size="11">subtotal : Number (₹2,700)</text>
    <text x="15" y="194" fill="#475569" font-size="11">totalTax : 5% GST (₹135)</text>
    <text x="15" y="212" fill="#16a34a" font-size="11" font-weight="600">grandTotal : Number (₹2,835)</text>
    <text x="15" y="230" fill="#2563eb" font-size="11">receivedBy : ObjectId [FK -> User]</text>
  </g>

  <!-- ENTITY CARD: PRODUCTION_RUN -->
  <g transform="translate(900, 130)" filter="url(#shadow)">
    <rect width="260" height="380" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="260" height="32" rx="6" fill="#9333ea"/>
    <text x="130" y="21" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">PRODUCTION RUN (Batch)</text>
    <text x="15" y="52" fill="#0f172a" font-size="11" font-weight="600">_id : ObjectId [PK]</text>
    <text x="15" y="70" fill="#475569" font-size="11">runNumber : PR-2026-0001 [UK]</text>
    <text x="15" y="88" fill="#2563eb" font-size="11" font-weight="600">product : ObjectId [FK -> Prod]</text>
    <text x="15" y="106" fill="#2563eb" font-size="11" font-weight="600">bom : ObjectId [FK -> BOM]</text>
    <text x="15" y="124" fill="#475569" font-size="11">expectedOutput : 200 pkts</text>
    <text x="15" y="142" fill="#0284c7" font-size="11" font-weight="600">actualOutput : 188 pkts</text>
    <text x="15" y="160" fill="#dc2626" font-size="11" font-weight="600">yieldVariancePct : -6% [FLAGGED]</text>
    <text x="15" y="178" fill="#059669" font-size="11">rawMaterials[]: Consumption</text>
    <text x="25" y="194" fill="#64748b" font-size="10">{ planned, actual, variance, cost }</text>
    <text x="15" y="212" fill="#059669" font-size="11">packagingMaterials[]: Scrap</text>
    <text x="25" y="228" fill="#64748b" font-size="10">{ actual: 188, damaged: 6, total: 194 }</text>
    <text x="15" y="246" fill="#475569" font-size="11">totalRawMaterialCost : ₹3,150.00</text>
    <text x="15" y="264" fill="#475569" font-size="11">totalPackagingCost : ₹453.00</text>
    <text x="15" y="282" fill="#475569" font-size="11">labourCost : ₹1,500, power: ₹752</text>
    <text x="15" y="300" fill="#16a34a" font-size="11" font-weight="600">totalProductionCost : ₹5,855.00</text>
    <text x="15" y="318" fill="#16a34a" font-size="11" font-weight="600">costPerPacket : ₹31.14</text>
    <text x="15" y="336" fill="#475569" font-size="11">profitPerPacket : ₹18.86 (37.7%)</text>
    <text x="15" y="354" fill="#2563eb" font-size="11">supervisor : ObjectId [FK -> User]</text>
    <text x="15" y="370" fill="#475569" font-size="11">status : 'Completed'</text>
  </g>

  <!-- ENTITY CARD: SALES_ORDER -->
  <g transform="translate(1210, 130)" filter="url(#shadow)">
    <rect width="250" height="270" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="250" height="32" rx="6" fill="#f59e0b"/>
    <text x="125" y="21" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">SALES ORDER</text>
    <text x="15" y="52" fill="#0f172a" font-size="11" font-weight="600">_id : ObjectId [PK]</text>
    <text x="15" y="70" fill="#475569" font-size="11">orderNumber : SO-2026-0001 [UK]</text>
    <text x="15" y="88" fill="#2563eb" font-size="11" font-weight="600">customer : ObjectId [FK -> Cust]</text>
    <text x="15" y="106" fill="#2563eb" font-size="11" font-weight="600">salesman : ObjectId [FK -> User]</text>
    <text x="15" y="124" fill="#059669" font-size="11">items[] : Embedded Line Items</text>
    <text x="25" y="140" fill="#64748b" font-size="10">{ product FK, qty, price, tax }</text>
    <text x="15" y="158" fill="#475569" font-size="11">subtotal : ₹7,500.00</text>
    <text x="15" y="176" fill="#475569" font-size="11">totalTax : ₹375.00</text>
    <text x="15" y="194" fill="#16a34a" font-size="11" font-weight="600">grandTotal : ₹7,875.00</text>
    <text x="15" y="212" fill="#0284c7" font-size="11" font-weight="600">status: Submitted|Approved|Disp</text>
    <text x="15" y="230" fill="#2563eb" font-size="11">approvedBy : ObjectId [FK -> User]</text>
    <text x="15" y="248" fill="#2563eb" font-size="11">invoice : ObjectId [FK -> Invoice]</text>
    <text x="15" y="264" fill="#475569" font-size="10">dispatchedAt : Date (DISPATCH EVENT)</text>
  </g>

  <!-- ENTITY CARD: INVOICE -->
  <g transform="translate(1210, 430)" filter="url(#shadow)">
    <rect width="250" height="260" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="250" height="32" rx="6" fill="#ea580c"/>
    <text x="125" y="21" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">INVOICE (GST Tax Invoice)</text>
    <text x="15" y="52" fill="#0f172a" font-size="11" font-weight="600">_id : ObjectId [PK]</text>
    <text x="15" y="70" fill="#475569" font-size="11">invoiceNumber : INV-2026-0001</text>
    <text x="15" y="88" fill="#2563eb" font-size="11" font-weight="600">order : ObjectId [FK -> Order]</text>
    <text x="15" y="106" fill="#2563eb" font-size="11" font-weight="600">customer : ObjectId [FK -> Cust]</text>
    <text x="15" y="124" fill="#475569" font-size="11">customerStateCode : 33 (TN)</text>
    <text x="15" y="142" fill="#475569" font-size="11">taxableAmount : ₹7,500.00</text>
    <text x="15" y="160" fill="#475569" font-size="11">cgstTotal : ₹187.50, sgst: ₹187.50</text>
    <text x="15" y="178" fill="#16a34a" font-size="11" font-weight="600">grandTotal : ₹7,875.00</text>
    <text x="15" y="196" fill="#475569" font-size="11">amountPaid : ₹4,000.00</text>
    <text x="15" y="214" fill="#dc2626" font-size="11" font-weight="600">balanceDue : ₹3,875.00</text>
    <text x="15" y="232" fill="#f59e0b" font-size="11">paymentStatus : 'Partially Paid'</text>
    <text x="15" y="250" fill="#2563eb" font-size="11">generatedBy : ObjectId [FK -> User]</text>
  </g>

  <!-- ENTITY CARD: PAYMENT -->
  <g transform="translate(1210, 720)" filter="url(#shadow)">
    <rect width="250" height="190" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="250" height="32" rx="6" fill="#16a34a"/>
    <text x="125" y="21" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">PAYMENT (Receipt)</text>
    <text x="15" y="52" fill="#0f172a" font-size="11" font-weight="600">_id : ObjectId [PK]</text>
    <text x="15" y="70" fill="#475569" font-size="11">paymentNumber : PAY-2026-0001</text>
    <text x="15" y="88" fill="#2563eb" font-size="11" font-weight="600">customer : ObjectId [FK -> Cust]</text>
    <text x="15" y="106" fill="#2563eb" font-size="11" font-weight="600">invoice : ObjectId [FK -> Invoice]</text>
    <text x="15" y="124" fill="#16a34a" font-size="11" font-weight="600">amount : ₹4,000.00</text>
    <text x="15" y="142" fill="#475569" font-size="11">paymentMode : NEFT|UPI|CASH</text>
    <text x="15" y="160" fill="#475569" font-size="11">referenceNumber : String</text>
    <text x="15" y="178" fill="#2563eb" font-size="11">recordedBy : ObjectId [FK -> User]</text>
  </g>

  <!-- ENTITY CARD: STOCK_LEDGER -->
  <g transform="translate(610, 630)" filter="url(#shadow)">
    <rect width="260" height="280" rx="6" fill="#ffffff" stroke="#059669" stroke-width="2"/>
    <rect width="260" height="32" rx="6" fill="#059669"/>
    <text x="130" y="21" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">STOCK LEDGER (Double-Entry)</text>
    <text x="15" y="52" fill="#0f172a" font-size="11" font-weight="600">_id : ObjectId [PK]</text>
    <text x="15" y="70" fill="#059669" font-size="11" font-weight="600">itemType : RM | PM | Product</text>
    <text x="15" y="88" fill="#2563eb" font-size="11" font-weight="600">item : ObjectId [refPath: itemType]</text>
    <text x="15" y="106" fill="#475569" font-size="11">itemCategory : raw|pkg|finished</text>
    <text x="15" y="124" fill="#0284c7" font-size="11" font-weight="600">movementType : Enum (7 Types)</text>
    <text x="15" y="142" fill="#dc2626" font-size="11" font-weight="600">direction : +1 Inflow | -1 Outflow</text>
    <text x="15" y="160" fill="#475569" font-size="11">quantity : Number, unit: String</text>
    <text x="15" y="178" fill="#475569" font-size="11">unitRate : Number, totalValue: Num</text>
    <text x="15" y="196" fill="#475569" font-size="11">balanceBefore : Number</text>
    <text x="15" y="214" fill="#059669" font-size="11" font-weight="600">balanceAfter : Number</text>
    <text x="15" y="232" fill="#475569" font-size="11">sourceDocumentType : Enum</text>
    <text x="15" y="250" fill="#2563eb" font-size="11">sourceDocumentId : ObjectId [FK]</text>
    <text x="15" y="268" fill="#2563eb" font-size="11">user : ObjectId [FK -> User]</text>
  </g>

  <!-- ENTITY CARD: AUDIT_LOG -->
  <g transform="translate(900, 540)" filter="url(#shadow)">
    <rect width="260" height="190" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="260" height="32" rx="6" fill="#475569"/>
    <text x="130" y="21" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">AUDIT LOG (Security Trail)</text>
    <text x="15" y="52" fill="#0f172a" font-size="11" font-weight="600">_id : ObjectId [PK]</text>
    <text x="15" y="70" fill="#0f172a" font-size="11" font-weight="600">action : String (LOGIN, DISPATCH, etc.)</text>
    <text x="15" y="88" fill="#475569" font-size="11">entity : Enum (15 Model Names)</text>
    <text x="15" y="106" fill="#2563eb" font-size="11">entityId : ObjectId</text>
    <text x="15" y="124" fill="#2563eb" font-size="11" font-weight="600">performedBy : ObjectId [FK -> User]</text>
    <text x="15" y="142" fill="#475569" font-size="11">userName : String</text>
    <text x="15" y="160" fill="#475569" font-size="11">details : Mixed Object</text>
    <text x="15" y="178" fill="#475569" font-size="11">ipAddress : String, createdAt : Date</text>
  </g>

  <!-- ENTITY CARD: EXPENSE -->
  <g transform="translate(900, 760)" filter="url(#shadow)">
    <rect width="260" height="170" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="260" height="32" rx="6" fill="#64748b"/>
    <text x="130" y="21" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">EXPENSE (Direct Overheads)</text>
    <text x="15" y="52" fill="#0f172a" font-size="11" font-weight="600">_id : ObjectId [PK]</text>
    <text x="15" y="70" fill="#475569" font-size="11">expenseNumber : EXP-2026-0001</text>
    <text x="15" y="88" fill="#475569" font-size="11">category : LABOUR | GAS_POWER</text>
    <text x="15" y="106" fill="#16a34a" font-size="11" font-weight="600">amount : Number (₹1,500, ₹752)</text>
    <text x="15" y="124" fill="#2563eb" font-size="11">productionRun: ObjectId [FK -> Run]</text>
    <text x="15" y="142" fill="#2563eb" font-size="11">recordedBy : ObjectId [FK -> User]</text>
    <text x="15" y="160" fill="#475569" font-size="11">expenseDate : Date</text>
  </g>

  <!-- FOOTER NOTE -->
  <rect x="40" y="970" width="1520" height="140" rx="6" fill="#f1f5f9" stroke="#cbd5e1"/>
  <text x="60" y="995" fill="#1e293b" font-size="13" font-weight="700">ARCHITECTURAL DESIGN NOTES ON RELATIONSHIPS &amp; CARDINALITIES:</text>
  <text x="60" y="1020" fill="#475569" font-size="12">1. DISPATCH IS AN ATOMIC EVENT: Dispatch is NOT a standalone collection. It is an atomic operational action on SalesOrder (dispatchedAt, status: 'Dispatched')</text>
  <text x="60" y="1040" fill="#475569" font-size="12">   that decrements Product.currentStock, writes StockLedger (movementType: 'SALES_DISPATCH', direction: -1), and logs to AuditLog.</text>
  <text x="60" y="1060" fill="#475569" font-size="12">2. POLYMORPHIC DOUBLE-ENTRY STOCK LEDGER: StockLedger.item dynamically references RawMaterial, PackagingMaterial, or Product via Mongoose refPath.</text>
  <text x="60" y="1080" fill="#475569" font-size="12">3. DOCUMENT EMBEDDING: Line items in SalesOrder, Invoice, Purchase, and BOM are embedded subdocuments to ensure historic audit immutability.</text>
</svg>`;
  fs.writeFileSync(path.join(docsDir, 'ER_DIAGRAM.svg'), svg, 'utf8');
  console.log('✓ Created docs/ER_DIAGRAM.svg');
}

// =============================================================================
// 2. GENERATE SYSTEM_ARCHITECTURE.svg
// =============================================================================
function generateArchitectureSVG() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1000" width="100%" height="100%" style="background:#f8fafc; font-family:'Segoe UI', Inter, -apple-system, sans-serif;">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569"/>
    </marker>
  </defs>

  <!-- TITLE -->
  <rect x="40" y="25" width="1420" height="65" rx="8" fill="#1e293b"/>
  <text x="65" y="55" fill="#ffffff" font-size="20" font-weight="700">NIT TIRUCHIRAPPALLI — FULL-STACK SYSTEM ARCHITECTURE</text>
  <text x="65" y="76" fill="#94a3b8" font-size="12">4-Tier Decoupled Enterprise Architecture: Presentation SPA, Express API Gateway, Domain Services &amp; MongoDB Persistence</text>

  <!-- TIER 1: USER ROLES -->
  <g transform="translate(40, 110)" filter="url(#shadow)">
    <rect width="1420" height="120" rx="8" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="1420" height="30" rx="8" fill="#e2e8f0"/>
    <text x="20" y="20" fill="#334155" font-size="12" font-weight="700">TIER 1: USER OPERATIONAL ROLES (5 DISTINCT PERSONAS)</text>
    
    <!-- Salesman -->
    <rect x="20" y="45" width="260" height="60" rx="6" fill="#eff6ff" stroke="#bfdbfe"/>
    <text x="35" y="68" fill="#1d4ed8" font-size="12" font-weight="700">1. SALESMAN</text>
    <text x="35" y="88" fill="#475569" font-size="11">Catalog view, order entry, status tracking</text>

    <!-- Admin -->
    <rect x="305" y="45" width="260" height="60" rx="6" fill="#fef3c7" stroke="#fde68a"/>
    <text x="320" y="68" fill="#b45309" font-size="12" font-weight="700">2. ADMIN</text>
    <text x="320" y="88" fill="#475569" font-size="11">Order approval, dispatch, GST invoicing</text>

    <!-- Production Supervisor -->
    <rect x="590" y="45" width="260" height="60" rx="6" fill="#f3e8ff" stroke="#e9d5ff"/>
    <text x="605" y="68" fill="#7e22ce" font-size="12" font-weight="700">3. PRODUCTION SUPERVISOR</text>
    <text x="605" y="88" fill="#475569" font-size="11">BOM, batch runs, consumption, scrap</text>

    <!-- Accountant / Auditor -->
    <rect x="875" y="45" width="260" height="60" rx="6" fill="#ecfdf5" stroke="#a7f3d0"/>
    <text x="890" y="68" fill="#047857" font-size="12" font-weight="700">4. ACCOUNTANT / AUDITOR</text>
    <text x="890" y="88" fill="#475569" font-size="11">Read-only, 15 registers, Excel/PDF exports</text>

    <!-- Owner -->
    <rect x="1160" y="45" width="240" height="60" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="1175" y="68" fill="#0f172a" font-size="12" font-weight="700">5. OWNER</text>
    <text x="1175" y="88" fill="#475569" font-size="11">Executive KPI dashboard, audit oversight</text>
  </g>

  <!-- CONNECTOR 1 -> 2 -->
  <line x1="750" y1="230" x2="750" y2="260" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="760" y="248" fill="#64748b" font-size="10">HTTPS / Responsive UI</text>

  <!-- TIER 2: PRESENTATION LAYER (FRONTEND) -->
  <g transform="translate(40, 260)" filter="url(#shadow)">
    <rect width="1420" height="150" rx="8" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="1420" height="30" rx="8" fill="#dbeafe"/>
    <text x="20" y="20" fill="#1e40af" font-size="12" font-weight="700">TIER 2: PRESENTATION LAYER (REACT 18 + VITE SINGLE PAGE APPLICATION)</text>

    <!-- Components -->
    <rect x="20" y="45" width="220" height="90" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="35" y="68" fill="#0f172a" font-size="12" font-weight="700">Routing &amp; Guards</text>
    <text x="35" y="86" fill="#475569" font-size="11">• React Router v6</text>
    <text x="35" y="104" fill="#475569" font-size="11">• ProtectedRoute (5 roles)</text>
    <text x="35" y="122" fill="#475569" font-size="11">• Direct URL redirect</text>

    <rect x="260" y="45" width="220" height="90" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="275" y="68" fill="#0f172a" font-size="12" font-weight="700">State &amp; Context</text>
    <text x="275" y="86" fill="#475569" font-size="11">• AuthContext (JWT)</text>
    <text x="275" y="104" fill="#475569" font-size="11">• localStorage token</text>
    <text x="275" y="122" fill="#475569" font-size="11">• Session timeout check</text>

    <rect x="500" y="45" width="230" height="90" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="515" y="68" fill="#0f172a" font-size="12" font-weight="700">Operational Views</text>
    <text x="515" y="86" fill="#475569" font-size="11">• Dashboard, Catalog, Orders</text>
    <text x="515" y="104" fill="#475569" font-size="11">• Invoices, Payments, BOM</text>
    <text x="515" y="122" fill="#475569" font-size="11">• Production &amp; Stock Ledger</text>

    <rect x="750" y="45" width="210" height="90" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="765" y="68" fill="#0f172a" font-size="12" font-weight="700">Visual Analytics</text>
    <text x="765" y="86" fill="#475569" font-size="11">• Recharts Visuals</text>
    <text x="765" y="104" fill="#475569" font-size="11">• Yield &amp; Scrap BarCharts</text>
    <text x="765" y="122" fill="#475569" font-size="11">• Stock Health &amp; Trends</text>

    <rect x="980" y="45" width="210" height="90" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="995" y="68" fill="#0f172a" font-size="12" font-weight="700">Document Exporters</text>
    <text x="995" y="86" fill="#475569" font-size="11">• jsPDF (Tax Invoices)</text>
    <text x="995" y="104" fill="#475569" font-size="11">• SheetJS (xlsx registers)</text>
    <text x="995" y="122" fill="#475569" font-size="11">• CSV formatted exports</text>

    <rect x="1210" y="45" width="190" height="90" rx="6" fill="#eff6ff" stroke="#3b82f6"/>
    <text x="1225" y="68" fill="#1d4ed8" font-size="12" font-weight="700">HTTP Client</text>
    <text x="1225" y="86" fill="#475569" font-size="11">• Axios client</text>
    <text x="1225" y="104" fill="#475569" font-size="11">• Bearer JWT Header</text>
    <text x="1225" y="122" fill="#475569" font-size="11">• 401 Interceptor</text>
  </g>

  <!-- CONNECTOR 2 -> 3 -->
  <line x1="750" y1="410" x2="750" y2="445" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="760" y="430" fill="#64748b" font-size="10">REST API / JSON Payload (Authorization: Bearer &lt;token&gt;)</text>

  <!-- TIER 3: APPLICATION & API GATEWAY TIER -->
  <g transform="translate(40, 445)" filter="url(#shadow)">
    <rect width="1420" height="265" rx="8" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="1420" height="30" rx="8" fill="#fae8ff"/>
    <text x="20" y="20" fill="#86198f" font-size="12" font-weight="700">TIER 3: BACKEND APPLICATION &amp; API GATEWAY TIER (NODE.JS + EXPRESS.JS)</text>

    <!-- Subgroup: Gateway & Security -->
    <rect x="20" y="45" width="280" height="205" rx="6" fill="#faf5ff" stroke="#d8b4fe"/>
    <text x="35" y="68" fill="#6b21a8" font-size="12" font-weight="700">API Gateway &amp; Middleware</text>
    <text x="35" y="90" fill="#475569" font-size="11">• CORS Origin Configuration</text>
    <text x="35" y="110" fill="#475569" font-size="11">• express.json(10mb limit)</text>
    <text x="35" y="130" fill="#1d4ed8" font-size="11" font-weight="600">• protect Middleware (JWT verification)</text>
    <text x="35" y="150" fill="#dc2626" font-size="11" font-weight="600">• authorize Middleware (5 roles RBAC)</text>
    <text x="35" y="170" fill="#475569" font-size="11">• Centralized errorHandler</text>
    <text x="35" y="190" fill="#475569" font-size="11">• AuditLog automatic action logging</text>
    <text x="35" y="210" fill="#475569" font-size="11">• Health check (/api/health)</text>
    <text x="35" y="230" fill="#475569" font-size="11">• Port: 5000 (dotenv configuration)</text>

    <!-- Subgroup: 13 Controllers -->
    <rect x="320" y="45" width="520" height="205" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="335" y="68" fill="#0f172a" font-size="12" font-weight="700">Business Logic Controllers (13 REST Modules)</text>
    
    <text x="335" y="92" fill="#475569" font-size="11">• authController (JWT login, me, user management)</text>
    <text x="335" y="110" fill="#475569" font-size="11">• customerController (CRUD, credit limit, balance guard)</text>
    <text x="335" y="128" fill="#475569" font-size="11">• productController (Catalog, active SKU stock tracking)</text>
    <text x="335" y="146" fill="#475569" font-size="11">• orderController (Booking, approval, dispatch blocking check)</text>
    <text x="335" y="164" fill="#475569" font-size="11">• invoiceController (GST billing, PDF data generation)</text>
    <text x="335" y="182" fill="#475569" font-size="11">• productionController (Batch runs, material issue, scrap)</text>
    <text x="335" y="200" fill="#475569" font-size="11">• costingController (Packet costing, gross profit margin %)</text>
    <text x="335" y="218" fill="#475569" font-size="11">• reportController (15 Date-filterable statutory registers)</text>
    <text x="335" y="236" fill="#475569" font-size="11">• paymentController, materialController, bomController, purchaseController</text>

    <!-- Subgroup: Calculation Engines -->
    <rect x="860" y="45" width="540" height="205" rx="6" fill="#f0fdf4" stroke="#86efac"/>
    <text x="875" y="68" fill="#15803d" font-size="12" font-weight="700">Statutory &amp; Mathematical Calculation Engines</text>
    
    <rect x="875" y="80" width="510" height="48" rx="4" fill="#ffffff" stroke="#bbf7d0"/>
    <text x="885" y="98" fill="#166534" font-size="11" font-weight="700">gstService (Indian GST Statutory Engine)</text>
    <text x="885" y="116" fill="#475569" font-size="10">Intra-State: CGST 2.5% + SGST 2.5% | Inter-State: IGST 5% | Integer paise math</text>

    <rect x="875" y="135" width="510" height="48" rx="4" fill="#ffffff" stroke="#bbf7d0"/>
    <text x="885" y="153" fill="#166534" font-size="11" font-weight="700">bomService (BOM &amp; Variance Engine)</text>
    <text x="885" y="171" fill="#475569" font-size="10">Yield Variance % | Consumption Variance % | Automated ±3% Alert Flagging</text>

    <rect x="875" y="190" width="510" height="48" rx="4" fill="#ffffff" stroke="#bbf7d0"/>
    <text x="885" y="208" fill="#166534" font-size="11" font-weight="700">inventoryService (Double-Entry Ledger &amp; WAC Engine)</text>
    <text x="885" y="226" fill="#475569" font-size="10">Atomic movement balance update | WAC recomputation | Negative stock prevention</text>
  </g>

  <!-- CONNECTOR 3 -> 4 -->
  <line x1="750" y1="710" x2="750" y2="745" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="760" y="730" fill="#64748b" font-size="10">Mongoose 9.x ODM / MongoDB Wire Protocol</text>

  <!-- TIER 4: PERSISTENCE LAYER -->
  <g transform="translate(40, 745)" filter="url(#shadow)">
    <rect width="1420" height="215" rx="8" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="1420" height="30" rx="8" fill="#fef3c7"/>
    <text x="20" y="20" fill="#92400e" font-size="12" font-weight="700">TIER 4: DATA PERSISTENCE TIER (MONGODB 8.x + MONGOOSE 9.x SCHEMAS)</text>

    <!-- Schema Groups -->
    <rect x="20" y="45" width="330" height="150" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="35" y="68" fill="#0f172a" font-size="12" font-weight="700">Master Data Collections</text>
    <text x="35" y="88" fill="#475569" font-size="11">• User (bcrypt hashed passwords, role)</text>
    <text x="35" y="106" fill="#475569" font-size="11">• Customer (stateCode 33/29, balances)</text>
    <text x="35" y="124" fill="#475569" font-size="11">• Supplier (vendors, GSTIN, materialTypes)</text>
    <text x="35" y="142" fill="#475569" font-size="11">• Product (Murukku, Mixture, Chips, Sweets)</text>
    <text x="35" y="160" fill="#475569" font-size="11">• RawMaterial &amp; PackagingMaterial</text>

    <rect x="370" y="45" width="330" height="150" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="385" y="68" fill="#0f172a" font-size="12" font-weight="700">Manufacturing &amp; BOM</text>
    <text x="385" y="88" fill="#475569" font-size="11">• BOM (Formulas, RM &amp; PM ratios)</text>
    <text x="385" y="106" fill="#475569" font-size="11">• ProductionRun (Batch runs, actuals)</text>
    <text x="385" y="124" fill="#475569" font-size="11">• Expense (Direct labour, power/gas)</text>
    <text x="385" y="142" fill="#475569" font-size="11">• Purchase (PO inward receipts, WAC)</text>
    <text x="385" y="160" fill="#475569" font-size="11">• Yield &amp; Scrap tracking collections</text>

    <rect x="720" y="45" width="330" height="150" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="735" y="68" fill="#0f172a" font-size="12" font-weight="700">Sales, Billing &amp; Receipts</text>
    <text x="735" y="88" fill="#475569" font-size="11">• SalesOrder (Lifecycle: Submitted to Disp)</text>
    <text x="735" y="106" fill="#475569" font-size="11">• Invoice (Tax invoices, CGST/SGST/IGST)</text>
    <text x="735" y="124" fill="#475569" font-size="11">• Payment (Remittances, NEFT/UPI/Cash)</text>
    <text x="735" y="142" fill="#475569" font-size="11">• Accounts Receivable aging data</text>
    <text x="735" y="160" fill="#475569" font-size="11">• Historic pricing subdocuments</text>

    <rect x="1070" y="45" width="330" height="150" rx="6" fill="#ecfdf5" stroke="#059669"/>
    <text x="1085" y="68" fill="#047857" font-size="12" font-weight="700">Audit &amp; Double-Entry Ledgers</text>
    <text x="1085" y="88" fill="#065f46" font-size="11" font-weight="700">• StockLedger (Immutable movements)</text>
    <text x="1095" y="106" fill="#475569" font-size="10">+1 Inflow / -1 Outflow with balance log</text>
    <text x="1085" y="126" fill="#065f46" font-size="11" font-weight="700">• AuditLog (Non-repudiation security)</text>
    <text x="1095" y="144" fill="#475569" font-size="10">Action, User, IP address, timestamp, delta</text>
    <text x="1085" y="166" fill="#475569" font-size="11">• Zero direct collection overwrite policy</text>
  </g>
</svg>`;
  fs.writeFileSync(path.join(docsDir, 'SYSTEM_ARCHITECTURE.svg'), svg, 'utf8');
  console.log('✓ Created docs/SYSTEM_ARCHITECTURE.svg');
}

// =============================================================================
// 3. GENERATE BUSINESS_WORKFLOW.svg
// =============================================================================
function generateWorkflowSVG() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1000" width="100%" height="100%" style="background:#f8fafc; font-family:'Segoe UI', Inter, -apple-system, sans-serif;">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7"/>
    </marker>
    <marker id="arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706"/>
    </marker>
    <marker id="arrow-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#16a34a"/>
    </marker>
  </defs>

  <!-- TITLE -->
  <rect x="40" y="25" width="1420" height="65" rx="8" fill="#1e293b"/>
  <text x="65" y="55" fill="#ffffff" font-size="20" font-weight="700">NIT TIRUCHIRAPPALLI — DUAL-LOOP BUSINESS WORKFLOW DIAGRAM</text>
  <text x="65" y="76" fill="#94a3b8" font-size="12">Integration of Loop A (Manufacturing &amp; Inventory) and Loop B (Order-to-Cash) with Finished Goods Convergence &amp; Audit Feeds</text>

  <!-- LEFT: LOOP A (PRODUCTION & PROCUREMENT) -->
  <g transform="translate(40, 110)" filter="url(#shadow)">
    <rect width="450" height="690" rx="8" fill="#ffffff" stroke="#bae6fd" stroke-width="2"/>
    <rect width="450" height="32" rx="8" fill="#0284c7"/>
    <text x="225" y="22" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">LOOP A: PROCUREMENT &amp; PRODUCTION CYCLE</text>

    <!-- Step P1 -->
    <rect x="25" y="50" width="400" height="60" rx="6" fill="#f0f9ff" stroke="#7dd3fc"/>
    <text x="40" y="73" fill="#0369a1" font-size="12" font-weight="700">1. Purchase Raw Materials &amp; Packaging</text>
    <text x="40" y="93" fill="#475569" font-size="11">PO-2026-0001: 60 kg Rice Flour @ ₹45/kg (Taxable ₹2,700, GST ₹135)</text>

    <!-- Step P2 -->
    <rect x="25" y="125" width="400" height="60" rx="6" fill="#f0f9ff" stroke="#7dd3fc"/>
    <text x="40" y="148" fill="#0369a1" font-size="12" font-weight="700">2. Inward Stock &amp; Dynamic WAC Valuation</text>
    <text x="40" y="168" fill="#475569" font-size="11">Flour Stock: 100 + 60 = 160 kg | WAC Rate: ₹43.125/kg | Ledger Inflow +1</text>

    <!-- Step P3 -->
    <rect x="25" y="200" width="400" height="60" rx="6" fill="#f0f9ff" stroke="#7dd3fc"/>
    <text x="40" y="223" fill="#0369a1" font-size="12" font-weight="700">3. Select Product Bill of Materials (BOM)</text>
    <text x="40" y="243" fill="#475569" font-size="11">Murukku 200g BOM: Flour 40kg, Oil 10L, Pouches 200, Cartons 10</text>

    <!-- Step P4 -->
    <rect x="25" y="275" width="400" height="60" rx="6" fill="#f0f9ff" stroke="#7dd3fc"/>
    <text x="40" y="298" fill="#0369a1" font-size="12" font-weight="700">4. Create Production Run (PR-2026-0001)</text>
    <text x="40" y="318" fill="#475569" font-size="11">Planned Batch Output: 200 pkts | Material requirements locked</text>

    <!-- Step P5 -->
    <rect x="25" y="350" width="400" height="60" rx="6" fill="#f0f9ff" stroke="#7dd3fc"/>
    <text x="40" y="373" fill="#0369a1" font-size="12" font-weight="700">5. Enter Actual Consumption &amp; Scrap</text>
    <text x="40" y="393" fill="#475569" font-size="11">Flour 40kg, Oil 10.5L (+0.5L), 188 good pouches + 6 damaged pouches</text>

    <!-- Step P6 -->
    <rect x="25" y="425" width="400" height="65" rx="6" fill="#fef2f2" stroke="#fca5a5"/>
    <text x="40" y="448" fill="#b91c1c" font-size="12" font-weight="700">6. Compute Variances &amp; Flag Outliers (&gt; 3%)</text>
    <text x="40" y="466" fill="#b91c1c" font-size="11">Yield Variance: -6.0% [FLAGGED] | Oil Variance: +5.0% [FLAGGED]</text>
    <text x="40" y="482" fill="#475569" font-size="10">Mandatory supervisor remarks required for audit compliance</text>

    <!-- Step P7 -->
    <rect x="25" y="505" width="400" height="60" rx="6" fill="#f0f9ff" stroke="#7dd3fc"/>
    <text x="40" y="528" fill="#0369a1" font-size="12" font-weight="700">7. Deduct RM &amp; Packaging Stock Atomically</text>
    <text x="40" y="548" fill="#475569" font-size="11">Flour: 120kg, Oil: 19.5L, Pouches: 306, Cartons: 21 | Ledger Direction: -1</text>

    <!-- Step P8 -->
    <rect x="25" y="580" width="400" height="85" rx="6" fill="#ecfdf5" stroke="#6ee7b7"/>
    <text x="40" y="603" fill="#047857" font-size="12" font-weight="700">8. Batch Costing &amp; Cost Per Packet</text>
    <text x="40" y="621" fill="#475569" font-size="11">RM: ₹3,150 + Pkg: ₹453 + Labour: ₹1,500 + Gas: ₹752 = ₹5,855</text>
    <text x="40" y="639" fill="#047857" font-size="12" font-weight="700">Cost/Packet: ₹31.14 | Selling: ₹50.00 | Profit: ₹18.86 (37.7%)</text>
    <text x="40" y="655" fill="#475569" font-size="10">INCREMENT FINISHED GOODS STOCK: +188 Packets</text>
  </g>

  <!-- CENTER: CENTRAL CONVERGENCE POINT (FINISHED GOODS) -->
  <g transform="translate(530, 260)" filter="url(#shadow)">
    <rect width="440" height="280" rx="10" fill="#ffffff" stroke="#16a34a" stroke-width="3"/>
    <rect width="440" height="36" rx="10" fill="#16a34a"/>
    <text x="220" y="24" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">CENTRAL PIVOT: FINISHED GOODS INVENTORY</text>

    <circle cx="220" cy="95" r="42" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
    <text x="220" y="93" fill="#15803d" font-size="18" font-weight="700" text-anchor="middle">88 pkts</text>
    <text x="220" y="112" fill="#15803d" font-size="10" font-weight="600" text-anchor="middle">CURRENT STOCK</text>

    <text x="30" y="160" fill="#0f172a" font-size="12" font-weight="700">Product: Murukku 200 g (MRK-200G)</text>
    <text x="30" y="180" fill="#475569" font-size="11">• Opening Balance: 50 packets (Ledger entry verified)</text>
    <text x="30" y="198" fill="#15803d" font-size="11" font-weight="600">• Production Inflow: +188 packets (Run PR-2026-0001)</text>
    <text x="30" y="216" fill="#475569" font-size="11">• Balance before dispatch: 238 packets</text>
    <text x="30" y="234" fill="#dc2626" font-size="11" font-weight="600">• Retailer A Sales Dispatch: -150 packets</text>
    <text x="30" y="252" fill="#047857" font-size="11" font-weight="700">• Final Closing Stock: 88 packets (100% Reconciled)</text>
  </g>

  <!-- CONNECTORS INTO CENTER -->
  <line x1="490" y1="620" x2="530" y2="460" stroke="#16a34a" stroke-width="3" marker-end="url(#arrow-green)"/>
  <text x="475" y="530" fill="#16a34a" font-size="11" font-weight="700">+188 Good Packets</text>

  <line x1="970" y1="460" x2="1010" y2="570" stroke="#dc2626" stroke-width="2" stroke-dasharray="4"/>
  <text x="965" y="530" fill="#dc2626" font-size="11" font-weight="700">-150 Dispatched</text>

  <!-- RIGHT: LOOP B (SALES & BILLING) -->
  <g transform="translate(1010, 110)" filter="url(#shadow)">
    <rect width="450" height="690" rx="8" fill="#ffffff" stroke="#fde68a" stroke-width="2"/>
    <rect width="450" height="32" rx="8" fill="#d97706"/>
    <text x="225" y="22" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">LOOP B: ORDER-TO-CASH &amp; DISPATCH CYCLE</text>

    <!-- Step S1 -->
    <rect x="25" y="50" width="400" height="55" rx="6" fill="#fffbeb" stroke="#fcd34d"/>
    <text x="40" y="73" fill="#92400e" font-size="12" font-weight="700">1. Salesman Login &amp; Catalog View</text>
    <text x="40" y="93" fill="#475569" font-size="11">Inspect catalog prices (Murukku 200g @ ₹50), view customer list</text>

    <!-- Step S2 -->
    <rect x="25" y="115" width="400" height="55" rx="6" fill="#fffbeb" stroke="#fcd34d"/>
    <text x="40" y="138" fill="#92400e" font-size="12" font-weight="700">2. Place Sales Order (SO-2026-0001)</text>
    <text x="40" y="158" fill="#475569" font-size="11">Customer: Retailer A (Tamil Nadu) | Qty: 150 pkts | Status: 'Submitted'</text>

    <!-- Step S3 -->
    <rect x="25" y="180" width="400" height="55" rx="6" fill="#fffbeb" stroke="#fcd34d"/>
    <text x="40" y="203" fill="#92400e" font-size="12" font-weight="700">3. Admin Order Verification &amp; Approval</text>
    <text x="40" y="223" fill="#475569" font-size="11">Verify customer credit limit &amp; pricing | Status updated to 'Approved'</text>

    <!-- Step S4 -->
    <rect x="25" y="245" width="400" height="65" rx="6" fill="#fffbeb" stroke="#fcd34d"/>
    <text x="40" y="268" fill="#92400e" font-size="12" font-weight="700">4. Generate GST Tax Invoice (INV-2026-0001)</text>
    <text x="40" y="286" fill="#475569" font-size="11">Intra-State: Taxable ₹7,500 + CGST 2.5% (₹187.50) + SGST 2.5% (₹187.50)</text>
    <text x="40" y="302" fill="#92400e" font-size="11" font-weight="700">Invoice Total: ₹7,875.00 | Customer Balance += ₹7,875.00</text>

    <!-- Step S5: Pre-Dispatch Check -->
    <rect x="25" y="320" width="400" height="85" rx="6" fill="#eff6ff" stroke="#93c5fd"/>
    <text x="40" y="343" fill="#1e40af" font-size="12" font-weight="700">5. Mandatory Pre-Dispatch Stock Availability Check</text>
    <text x="40" y="361" fill="#15803d" font-size="11" font-weight="600">✓ Retailer A (150 pkts): Available 238 pkts >= 150 pkts -> DISPATCH PASS</text>
    <text x="40" y="379" fill="#dc2626" font-size="11" font-weight="600">✗ Distributor B (120 pkts): Available 88 pkts &lt; 120 pkts -> DISPATCH BLOCKED</text>
    <text x="40" y="395" fill="#dc2626" font-size="10">System strictly returns HTTP 400 detailing exact 32-packet shortage</text>

    <!-- Step S6 -->
    <rect x="25" y="415" width="400" height="60" rx="6" fill="#fffbeb" stroke="#fcd34d"/>
    <text x="40" y="438" fill="#92400e" font-size="12" font-weight="700">6. Record Dispatch &amp; Handover</text>
    <text x="40" y="458" fill="#475569" font-size="11">Order status: 'Dispatched' | StockLedger: SALES_DISPATCH -150 packets</text>

    <!-- Step S7 -->
    <rect x="25" y="485" width="400" height="60" rx="6" fill="#fffbeb" stroke="#fcd34d"/>
    <text x="40" y="508" fill="#92400e" font-size="12" font-weight="700">7. Record Customer Payment (PAY-2026-0001)</text>
    <text x="40" y="528" fill="#475569" font-size="11">Retailer A pays ₹4,000.00 via NEFT | Invoice balanceDue: ₹3,875.00</text>

    <!-- Step S8 -->
    <rect x="25" y="555" width="400" height="60" rx="6" fill="#fffbeb" stroke="#fcd34d"/>
    <text x="40" y="578" fill="#92400e" font-size="12" font-weight="700">8. Customer Balance &amp; AR Ageing Classification</text>
    <text x="40" y="598" fill="#475569" font-size="11">Outstanding: ₹3,875.00 | Ageing Bucket: 0–30 Days | Deactivation Guard Active</text>

    <!-- Step S9 -->
    <rect x="25" y="625" width="400" height="50" rx="6" fill="#ecfdf5" stroke="#6ee7b7"/>
    <text x="40" y="645" fill="#047857" font-size="12" font-weight="700">9. Settlement &amp; Repeat Cycle</text>
    <text x="40" y="663" fill="#475569" font-size="11">Zero balance enables customer deactivation if account ever closes</text>
  </g>

  <!-- BOTTOM: MONTHLY AUDIT & REPORTING FEEDS -->
  <g transform="translate(40, 820)" filter="url(#shadow)">
    <rect width="1420" height="150" rx="8" fill="#ffffff" stroke="#cbd5e1"/>
    <rect width="1420" height="30" rx="8" fill="#f3e8ff"/>
    <text x="20" y="20" fill="#6b21a8" font-size="12" font-weight="700">FEEDING MONTHLY AUDIT &amp; STATUTORY REGISTERS (15 DATE-FILTERABLE REPORTS)</text>

    <rect x="20" y="45" width="220" height="90" rx="6" fill="#faf5ff" stroke="#d8b4fe"/>
    <text x="35" y="68" fill="#581c87" font-size="11" font-weight="700">Sales &amp; GST Registers</text>
    <text x="35" y="86" fill="#475569" font-size="10">• 1. Sales Register</text>
    <text x="35" y="102" fill="#475569" font-size="10">• 2. Customer-Wise Sales</text>
    <text x="35" y="118" fill="#475569" font-size="10">• 4. GST Summary (CGST/SGST/IGST)</text>

    <rect x="260" y="45" width="220" height="90" rx="6" fill="#faf5ff" stroke="#d8b4fe"/>
    <text x="275" y="68" fill="#581c87" font-size="11" font-weight="700">Procurement &amp; Materials</text>
    <text x="275" y="86" fill="#475569" font-size="10">• 5. Purchase Register (PO receipts)</text>
    <text x="275" y="102" fill="#475569" font-size="10">• 6. Raw Material Stock &amp; WAC</text>
    <text x="275" y="118" fill="#475569" font-size="10">• 7. Packaging Material Stock</text>

    <rect x="500" y="45" width="220" height="90" rx="6" fill="#faf5ff" stroke="#d8b4fe"/>
    <text x="515" y="68" fill="#581c87" font-size="11" font-weight="700">Stock &amp; Traceability</text>
    <text x="515" y="86" fill="#475569" font-size="10">• 8. Finished Goods Stock</text>
    <text x="515" y="102" fill="#475569" font-size="10">• 9. Stock Movement Ledger</text>
    <text x="515" y="118" fill="#475569" font-size="10">• Double-entry audit trail</text>

    <rect x="740" y="45" width="220" height="90" rx="6" fill="#faf5ff" stroke="#d8b4fe"/>
    <text x="755" y="68" fill="#581c87" font-size="11" font-weight="700">Production &amp; Variances</text>
    <text x="755" y="86" fill="#475569" font-size="10">• 10. Production Run Report</text>
    <text x="755" y="102" fill="#475569" font-size="10">• 11. Planned vs Actual Consumption</text>
    <text x="755" y="118" fill="#475569" font-size="10">• 12. Wastage &amp; Damage Scrap</text>

    <rect x="980" y="45" width="210" height="90" rx="6" fill="#faf5ff" stroke="#d8b4fe"/>
    <text x="995" y="68" fill="#581c87" font-size="11" font-weight="700">Costing &amp; Profitability</text>
    <text x="995" y="86" fill="#475569" font-size="10">• 13. Cost Per Packet &amp; Margin</text>
    <text x="995" y="102" fill="#475569" font-size="10">• Batch overhead allocation</text>
    <text x="995" y="118" fill="#475569" font-size="10">• Realized gross margin %</text>

    <rect x="1210" y="45" width="190" height="90" rx="6" fill="#faf5ff" stroke="#d8b4fe"/>
    <text x="1225" y="68" fill="#581c87" font-size="11" font-weight="700">Collections &amp; Ageing</text>
    <text x="1225" y="86" fill="#475569" font-size="10">• 14. Payment Collection</text>
    <text x="1225" y="102" fill="#475569" font-size="10">• 15. AR Ageing (0-90+ days)</text>
    <text x="1225" y="118" fill="#475569" font-size="10">• AuditLog Security Trail</text>
  </g>
</svg>`;
  fs.writeFileSync(path.join(docsDir, 'BUSINESS_WORKFLOW.svg'), svg, 'utf8');
  console.log('✓ Created docs/BUSINESS_WORKFLOW.svg');
}

generateERDiagramSVG();
generateArchitectureSVG();
generateWorkflowSVG();
