import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateInvoicePDF = (invoice) => {
  const doc = new jsPDF();

  // Color constants
  const navy = [15, 23, 42]; // #0F172A
  const slate = [100, 116, 139]; // #64748B

  // 1. Header & Factory Details
  doc.setFillColor(...navy);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SRI MURUGAN TRADITIONAL FOODS', 14, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('TAX INVOICE (Rule 46 of CGST Rules, 2017)', 14, 18);
  doc.text('Thuvakudi Industrial Estate, Tiruchirappalli, Tamil Nadu - 620015 | GSTIN: 33AAAAA0000A1Z5', 14, 23);

  // 2. Invoice Meta Box
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}`, 14, 43);
  doc.text(`Place of Supply: ${invoice.customerState} (${invoice.customerStateCode})`, 14, 48);

  // Right side: Customer Bill-To Details
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To (Customer):', 120, 38);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.customerName || invoice.customer?.name || 'Customer', 120, 43);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerAddress || invoice.customer?.address || 'Address', 120, 48);
  doc.text(`State: ${invoice.customerState} | Code: ${invoice.customerStateCode}`, 120, 53);
  doc.text(`GSTIN: ${invoice.customerGstin || invoice.customer?.gstin || 'URP (Unregistered)'}`, 120, 58);

  // 3. Line Items Table
  const isInterState = invoice.isInterState;

  const tableHeaders = isInterState
    ? [['#', 'Description', 'HSN', 'Qty', 'Unit', 'Rate (₹)', 'Taxable (₹)', 'IGST %', 'IGST (₹)', 'Total (₹)']]
    : [['#', 'Description', 'HSN', 'Qty', 'Unit', 'Rate (₹)', 'Taxable (₹)', 'CGST (₹)', 'SGST (₹)', 'Total (₹)']];

  const tableRows = invoice.items.map((item, index) => {
    if (isInterState) {
      return [
        index + 1,
        item.description || item.productName,
        item.hsnCode || '21069099',
        item.quantity,
        item.unit || 'pkts',
        Number(item.unitPrice).toFixed(2),
        Number(item.taxableAmount).toFixed(2),
        `${item.gstPercentage}%`,
        Number(item.igstAmount || 0).toFixed(2),
        Number(item.totalAmount).toFixed(2),
      ];
    } else {
      return [
        index + 1,
        item.description || item.productName,
        item.hsnCode || '21069099',
        item.quantity,
        item.unit || 'pkts',
        Number(item.unitPrice).toFixed(2),
        Number(item.taxableAmount).toFixed(2),
        Number(item.cgstAmount || 0).toFixed(2),
        Number(item.sgstAmount || 0).toFixed(2),
        Number(item.totalAmount).toFixed(2),
      ];
    }
  });

  doc.autoTable({
    startY: 64,
    head: tableHeaders,
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: navy,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 45 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 12 },
      4: { halign: 'center', cellWidth: 12 },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
      8: { halign: 'right' },
      9: { halign: 'right' },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // 4. Totals Summary Box on Right
  const rightX = 130;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Taxable Amount:', rightX, finalY);
  doc.text(`₹ ${Number(invoice.taxableAmount).toFixed(2)}`, 195, finalY, { align: 'right' });

  let curY = finalY + 5;
  if (isInterState) {
    doc.text('Integrated GST (IGST 5%):', rightX, curY);
    doc.text(`₹ ${Number(invoice.igstTotal || invoice.totalTax).toFixed(2)}`, 195, curY, { align: 'right' });
    curY += 5;
  } else {
    doc.text('Central GST (CGST 2.5%):', rightX, curY);
    doc.text(`₹ ${Number(invoice.cgstTotal).toFixed(2)}`, 195, curY, { align: 'right' });
    curY += 5;
    doc.text('State GST (SGST 2.5%):', rightX, curY);
    doc.text(`₹ ${Number(invoice.sgstTotal).toFixed(2)}`, 195, curY, { align: 'right' });
    curY += 5;
  }

  doc.setLineWidth(0.2);
  doc.line(rightX, curY - 1, 195, curY - 1);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Grand Total:', rightX, curY + 4);
  doc.text(`₹ ${Number(invoice.grandTotal).toFixed(2)}`, 195, curY + 4, { align: 'right' });

  // 5. Statutory Footnotes & Signature
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
    14,
    curY + 18
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('For SRI MURUGAN TRADITIONAL FOODS', 140, curY + 28);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorised Signatory', 140, curY + 40);

  // Download PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
};
