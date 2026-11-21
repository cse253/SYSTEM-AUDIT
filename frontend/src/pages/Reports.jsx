import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/exportUtils';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  FileText,
  FileCode,
  ShieldCheck,
  Search,
} from 'lucide-react';

const reportEndpoints = [
  { id: 'sales-register', name: '1. Sales Register', endpoint: '/reports/sales-register' },
  { id: 'customer-sales', name: '2. Customer-wise Sales', endpoint: '/reports/customer-sales' },
  { id: 'product-sales', name: '3. Product-wise Sales', endpoint: '/reports/product-sales' },
  { id: 'gst-summary', name: '4. GST Summary (Intra vs Inter-State)', endpoint: '/reports/gst-summary' },
  { id: 'purchase-register', name: '5. Purchase Register', endpoint: '/reports/purchase-register' },
  { id: 'raw-materials', name: '6. Raw-Material Stock Report', endpoint: '/reports/raw-materials' },
  { id: 'packaging-materials', name: '7. Packaging Stock Report', endpoint: '/reports/packaging-materials' },
  { id: 'finished-goods', name: '8. Finished-Goods Stock Report', endpoint: '/reports/finished-goods' },
  { id: 'stock-ledger', name: '9. Stock Movement Ledger', endpoint: '/reports/stock-ledger' },
  { id: 'production', name: '10. Production Batch Report', endpoint: '/reports/production' },
  { id: 'consumption', name: '11. Planned vs Actual Consumption Report', endpoint: '/reports/consumption' },
  { id: 'wastage', name: '12. Wastage & Damage Report', endpoint: '/reports/wastage' },
  { id: 'cost-per-packet', name: '13. Cost Per Packet & Margin Report', endpoint: '/reports/cost-per-packet' },
  { id: 'collections', name: '14. Payment & Collection Report', endpoint: '/reports/collections' },
  { id: 'outstanding-ageing', name: '15. Outstanding Receivables with Ageing', endpoint: '/reports/outstanding-ageing' },
];

const Reports = () => {
  const { user } = useAuth();
  const [selectedReportId, setSelectedReportId] = useState('sales-register');
  const [reportData, setReportData] = useState([]);
  const [reportTitle, setReportTitle] = useState('Sales Register');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  const currentReport = reportEndpoints.find((r) => r.id === selectedReportId);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(currentReport.endpoint, {
        params: { startDate, endDate },
      });
      if (res.data.success) {
        setReportData(res.data.data || []);
        setReportTitle(res.data.reportType || currentReport.name);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedReportId, startDate, endDate]);

  const handleExportExcel = () => {
    exportToExcel(reportData, `${selectedReportId}_${new Date().toISOString().slice(0, 10)}`, reportTitle);
  };

  const handleExportCSV = () => {
    exportToCSV(reportData, `${selectedReportId}_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportPDF = () => {
    exportToPDF(reportTitle, reportData, `${selectedReportId}_${new Date().toISOString().slice(0, 10)}`);
  };

  // Filter table rows by search term if present
  const filteredData = reportData.filter((row) => {
    if (!search) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    );
  });

  const columns = reportData.length > 0 ? Object.keys(reportData[0]) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-500" />
            Financial, Operational & Audit Reporting Module (15 Reports)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Date-filterable registers and ledger reports. Exportable in Excel (.xlsx), CSV and official PDF formats.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
            title="Download Excel Worksheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel (.xlsx)
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-navy-800 hover:bg-navy-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
            title="Download Comma Separated CSV"
          >
            <FileCode className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-navy-900 font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
            title="Download Formatted PDF"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Auditor Notice Banner */}
      {user?.role === 'accountant_auditor' && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Accountant / Auditor Read-Only Access Active: </span>
            You have full statutory read access to all registers, GST summaries, and ledger entries with one-click export to Excel, CSV, and PDF.
          </div>
        </div>
      )}

      {/* Control Bar: Report Picker & Date Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          {/* Report Dropdown */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[11px] font-bold text-navy-900 mb-1">
              Select Audit / Management Report:
            </label>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-navy-900 focus:ring-1 focus:ring-amber-500"
            >
              {reportEndpoints.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search in Report */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Search in Report:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter results..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Date Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Calendar className="w-4 h-4 text-slate-400" />
            Date Range:
          </div>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg text-slate-700"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg text-slate-700"
          />

          <button
            type="button"
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="px-2 py-1 text-[11px] text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded"
          >
            Clear Dates
          </button>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-navy-900">{reportTitle}</h2>
            <span className="text-[11px] text-slate-500">
              {filteredData.length} total records listed
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                {columns.map((col) => (
                  <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                    {col.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={columns.length || 1} className="py-8 text-center text-slate-400">
                    Loading report data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length || 1} className="py-8 text-center text-slate-400">
                    No records found for the selected parameters.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                    {columns.map((col) => {
                      const val = row[col];
                      const isNumeric = typeof val === 'number';
                      const isFlagged = String(val).includes('ALERT') || String(val).includes('FLAGGED');
                      return (
                        <td
                          key={col}
                          className={`py-2 px-3 whitespace-nowrap ${
                            isFlagged
                              ? 'text-rose-600 font-bold'
                              : isNumeric
                              ? 'font-medium text-slate-800'
                              : 'text-slate-700'
                          }`}
                        >
                          {isNumeric ? (col.toLowerCase().includes('amount') || col.toLowerCase().includes('total') || col.toLowerCase().includes('cost') || col.toLowerCase().includes('price') || col.toLowerCase().includes('tax') ? `₹${val.toFixed(2)}` : val) : val || '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
