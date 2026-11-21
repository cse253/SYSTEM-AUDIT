import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Export JSON data array to Excel (.xlsx) file
export const exportToExcel = (data, filename = 'Report', sheetName = 'Report') => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Export JSON data array to CSV file
export const exportToCSV = (data, filename = 'Report') => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }
  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Header row
  csvRows.push(headers.join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header] !== undefined && row[header] !== null ? row[header] : '';
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to formatted PDF
export const exportToPDF = (title, data, filename = 'Report') => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }
  const doc = new jsPDF('landscape');

  // Navy banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 297, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SRI MURUGAN TRADITIONAL FOODS - AUDIT REGISTER', 14, 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${title} | Generated: ${new Date().toLocaleString('en-IN')}`, 14, 16);

  const headers = Object.keys(data[0]);
  const rows = data.map((d) => headers.map((h) => (d[h] !== undefined ? String(d[h]) : '-')));

  doc.autoTable({
    startY: 25,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
    },
  });

  doc.save(`${filename}.pdf`);
};
