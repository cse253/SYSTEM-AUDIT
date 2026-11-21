/**
 * GST Calculation Service (Decimal-safe / Integer paise approach)
 * Factory State: Tamil Nadu (State Code: 33)
 * Intra-state: CGST 2.5% + SGST 2.5% (Total 5%)
 * Inter-state: IGST 5%
 */

const FACTORY_STATE = process.env.FACTORY_STATE || 'Tamil Nadu';
const FACTORY_STATE_CODE = process.env.FACTORY_STATE_CODE || '33';

// Safely round monetary values to 2 decimal places
const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

// Convert rupees to paise (integer) to prevent float drift
const toPaise = (rupees) => Math.round(rupees * 100);
const toRupees = (paise) => round2(paise / 100);

/**
 * Calculates GST breakdown for sales order or invoice line items
 * @param {Array} items - Array of { product, quantity, unitPrice, gstPercentage, hsnCode }
 * @param {String} customerState - Customer state name (e.g. 'Tamil Nadu' or 'Karnataka')
 * @param {String} customerStateCode - Customer state code (e.g. '33' or '29')
 */
const calculateGST = (items, customerState = 'Tamil Nadu', customerStateCode = '33') => {
  // Determine if sale is inter-state
  const isInterState =
    customerStateCode !== FACTORY_STATE_CODE &&
    customerState.trim().toLowerCase() !== FACTORY_STATE.trim().toLowerCase();

  let subtotalPaise = 0;
  let totalCgstPaise = 0;
  let totalSgstPaise = 0;
  let totalIgstPaise = 0;

  const processedItems = items.map((item) => {
    const qty = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const gstRate = Number(item.gstPercentage !== undefined ? item.gstPercentage : 5);

    // Taxable amount in paise = qty * unitPrice * 100
    const taxablePaise = Math.round(qty * unitPrice * 100);
    subtotalPaise += taxablePaise;

    let cgstRate = 0;
    let sgstRate = 0;
    let igstRate = 0;
    let cgstPaise = 0;
    let sgstPaise = 0;
    let igstPaise = 0;

    if (isInterState) {
      // Inter-state: IGST = full GST rate (e.g. 5%)
      igstRate = gstRate;
      igstPaise = Math.round((taxablePaise * igstRate) / 100);
      totalIgstPaise += igstPaise;
    } else {
      // Intra-state: CGST = half rate, SGST = half rate (e.g. 2.5% + 2.5%)
      cgstRate = gstRate / 2;
      sgstRate = gstRate / 2;
      cgstPaise = Math.round((taxablePaise * cgstRate) / 100);
      sgstPaise = Math.round((taxablePaise * sgstRate) / 100);
      totalCgstPaise += cgstPaise;
      totalSgstPaise += sgstPaise;
    }

    const itemTotalPaise = taxablePaise + cgstPaise + sgstPaise + igstPaise;

    return {
      product: item.product,
      productName: item.productName || item.description,
      sku: item.sku,
      hsnCode: item.hsnCode || '21069099',
      quantity: qty,
      unit: item.unit || 'packets',
      unitPrice,
      taxableAmount: toRupees(taxablePaise),
      gstPercentage: gstRate,
      cgstRate,
      cgstAmount: toRupees(cgstPaise),
      sgstRate,
      sgstAmount: toRupees(sgstPaise),
      igstRate,
      igstAmount: toRupees(igstPaise),
      totalAmount: toRupees(itemTotalPaise),
    };
  });

  const totalTaxPaise = totalCgstPaise + totalSgstPaise + totalIgstPaise;
  const grandTotalPaise = subtotalPaise + totalTaxPaise;

  return {
    isInterState,
    items: processedItems,
    taxableAmount: toRupees(subtotalPaise),
    cgstTotal: toRupees(totalCgstPaise),
    sgstTotal: toRupees(totalSgstPaise),
    igstTotal: toRupees(totalIgstPaise),
    totalTax: toRupees(totalTaxPaise),
    grandTotal: toRupees(grandTotalPaise),
  };
};

module.exports = {
  calculateGST,
  round2,
  toPaise,
  toRupees,
  FACTORY_STATE,
  FACTORY_STATE_CODE,
};
