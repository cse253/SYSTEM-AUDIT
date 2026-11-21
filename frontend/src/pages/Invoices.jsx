import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { generateInvoicePDF } from '../utils/invoicePdf';
import {
  FileText,
  Download,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  X,
  CreditCard,
} from 'lucide-react';

const Invoices = () => {
  const { user } = useAuth();
  const isAdminOrOwner = ['admin', 'owner'].includes(user?.role);

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices', {
        params: { paymentStatus: selectedPaymentStatus },
      });
      if (res.data.success) {
        setInvoices(res.data.invoices);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [selectedPaymentStatus]);

  const handleDownloadPDF = (inv) => {
    generateInvoicePDF(inv);
  };

  const handleCancelInvoice = async (invoiceId) => {
    const reason = window.prompt('Please enter the documented reason for cancelling this GST invoice:');
    if (!reason) return;

    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.put(`/invoices/${invoiceId}/cancel`, { cancellationReason: reason });
      if (res.data.success) {
        setActionSuccess('Invoice cancelled successfully. Customer balance adjusted.');
        fetchInvoices();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to cancel invoice');
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Partially Paid':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Unpaid':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" />
            GST Tax Invoices Register
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compliant with CGST/SGST/IGST rules (Tamil Nadu State Code: 33). Downloadable official PDFs.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          {actionError}
        </div>
      )}

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <select
          value={selectedPaymentStatus}
          onChange={(e) => setSelectedPaymentStatus(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
        >
          <option value="">All Payment Statuses</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Invoice # & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Tax Type</th>
                <th className="py-3 px-4">Taxable Amount</th>
                <th className="py-3 px-4">Total Tax (₹)</th>
                <th className="py-3 px-4">Grand Total (₹)</th>
                <th className="py-3 px-4">Amount Paid / Due</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-navy-900">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(inv.invoiceDate).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-navy-900">{inv.customerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        GSTIN: {inv.customerGstin || 'URP'} • State: {inv.customerState} ({inv.customerStateCode})
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {inv.isInterState ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          IGST 5% (Inter-State)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          CGST 2.5% + SGST 2.5%
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      ₹{Number(inv.taxableAmount).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      ₹{Number(inv.totalTax).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 font-bold text-navy-900">
                      ₹{Number(inv.grandTotal).toFixed(2)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-emerald-700 font-medium">
                        Paid: ₹{Number(inv.amountPaid || 0).toFixed(2)}
                      </div>
                      <div className="text-amber-800 font-semibold">
                        Due: ₹{Number(inv.balanceDue).toFixed(2)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getPaymentStatusBadge(
                          inv.paymentStatus
                        )}`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleDownloadPDF(inv)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-navy-900 hover:bg-navy-800 text-amber-400 font-semibold rounded text-[11px] shadow-xs cursor-pointer"
                        title="Download Tax Compliant PDF"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>

                      {isAdminOrOwner && inv.status === 'Active' && inv.amountPaid === 0 && (
                        <button
                          onClick={() => handleCancelInvoice(inv._id)}
                          className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded text-[11px] transition-colors"
                          title="Cancel Invoice Workflow"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
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

export default Invoices;
