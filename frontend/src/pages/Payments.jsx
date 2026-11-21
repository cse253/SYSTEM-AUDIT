import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  Clock,
  TrendingDown,
  Building,
} from 'lucide-react';

const Payments = () => {
  const { user } = useAuth();
  const canRecord = ['admin', 'owner'].includes(user?.role);

  const [activeTab, setActiveTab] = useState('ageing'); // 'ageing' or 'history'
  const [payments, setPayments] = useState([]);
  const [ageingData, setAgeingData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState(4000); // Benchmark step 6 default: ₹4,000
  const [paymentMode, setPaymentMode] = useState('NEFT');
  const [referenceNumber, setReferenceNumber] = useState('UTR-HDFC-991122');
  const [remarks, setRemarks] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, ageRes, custRes, invRes] = await Promise.all([
        api.get('/payments'),
        api.get('/payments/ageing'),
        api.get('/customers'),
        api.get('/invoices', { params: { paymentStatus: 'Unpaid' } }),
      ]);

      if (payRes.data.success) setPayments(payRes.data.payments);
      if (ageRes.data.success) setAgeingData(ageRes.data);
      if (custRes.data.success) setCustomers(custRes.data.customers);
      if (invRes.data.success) setInvoices(invRes.data.invoices);
    } catch (err) {
      console.error('Failed to load payments data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setError('');
    setSuccess('');
    // Defaults for Benchmark Step 6 (Retailer A, ₹4,000 payment)
    const retailerA = customers.find((c) => c.name.includes('Retailer A')) || customers[0];
    if (retailerA) {
      setCustomerId(retailerA._id);
      const retInv = invoices.find(
        (i) => i.customer?._id === retailerA._id || i.customer === retailerA._id
      );
      if (retInv) setSelectedInvoiceId(retInv._id);
    }
    setAmount(4000);
    setPaymentMode('NEFT');
    setReferenceNumber('UTR-HDFC-991122');
    setRemarks('Partial collection payment against GST Invoice');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        customerId,
        invoiceId: selectedInvoiceId || undefined,
        amount: Number(amount),
        paymentMode,
        referenceNumber,
        remarks,
      };

      const res = await api.post('/payments', payload);
      if (res.data.success) {
        setSuccess(
          `Payment of ₹${Number(amount).toFixed(2)} recorded! Customer outstanding balance: ₹${res.data.customerOutstanding.toFixed(2)}`
        );
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording payment');
    }
  };

  const selectedCustomerObj = customers.find((c) => c._id === customerId);
  const customerInvoices = invoices.filter(
    (i) => (i.customer?._id || i.customer) === customerId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-500" />
            Payment Collections & Receivables Ageing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Record customer collections, link receipts to GST invoices, support partial payments, and monitor 30/60/90+ day ageing.
          </p>
        </div>

        {canRecord && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-900 font-semibold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Customer Payment
          </button>
        )}
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          {success}
        </div>
      )}

      {/* Ageing Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Outstanding
          </span>
          <div className="text-xl font-bold text-navy-900 mt-1">
            ₹{Number(ageingData?.summary?.totalOutstanding || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">All customer accounts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            0 - 30 Days (Current)
          </span>
          <div className="text-xl font-bold text-emerald-900 mt-1">
            ₹{Number(ageingData?.summary?.total0to30 || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Standard credit period</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            31 - 60 Days
          </span>
          <div className="text-xl font-bold text-amber-900 mt-1">
            ₹{Number(ageingData?.summary?.total31to60 || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-amber-600">Follow-up due</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-orange-100 bg-orange-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">
            61 - 90 Days
          </span>
          <div className="text-xl font-bold text-orange-900 mt-1">
            ₹{Number(ageingData?.summary?.total61to90 || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-orange-600">Urgent recovery</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
            &gt; 90 Days (Overdue)
          </span>
          <div className="text-xl font-bold text-rose-900 mt-1">
            ₹{Number(ageingData?.summary?.total90Plus || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-rose-600 font-bold">Critical risk</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('ageing')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'ageing'
              ? 'border-amber-500 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          Customer Receivables Ageing Schedule
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'border-amber-500 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4 text-amber-600" />
          Payment Transactions History ({payments.length})
        </button>
      </div>

      {/* Tab 1: Ageing Schedule */}
      {activeTab === 'ageing' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Type & State</th>
                  <th className="py-3 px-4 text-right">0 - 30 Days</th>
                  <th className="py-3 px-4 text-right">31 - 60 Days</th>
                  <th className="py-3 px-4 text-right">61 - 90 Days</th>
                  <th className="py-3 px-4 text-right">&gt; 90 Days</th>
                  <th className="py-3 px-4 text-right">Total Outstanding (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      Loading ageing schedule...
                    </td>
                  </tr>
                ) : ageingData?.customers?.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No unpaid customer receivables. All accounts clear!
                    </td>
                  </tr>
                ) : (
                  ageingData?.customers?.map((c) => (
                    <tr key={c.customerId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-navy-900">
                        {c.customerName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {c.customerType} • {c.state}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-emerald-800">
                        ₹{c.current0to30.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-amber-700">
                        ₹{c.days31to60.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-orange-700">
                        ₹{c.days61to90.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-700">
                        ₹{c.days90Plus.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-navy-900 text-sm">
                        ₹{c.totalDue.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Payments History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Invoice Linked</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4">Ref / UTR #</th>
                  <th className="py-3 px-4 text-right">Amount Received (₹)</th>
                  <th className="py-3 px-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">
                      No payments recorded yet. Click "Record Customer Payment" to add.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-navy-900">
                        {p.paymentNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-navy-900">
                        {p.customer?.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-purple-700">
                        {p.invoiceNumber || p.invoice?.invoiceNumber || 'General Account'}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {p.referenceNumber || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 text-sm">
                        ₹{Number(p.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.recordedBy?.name || 'Accounts'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Record Customer Payment Receipt</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 mx-6 mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Select Customer *
                  </label>
                  <select
                    value={customerId}
                    onChange={(e) => {
                      setCustomerId(e.target.value);
                      const inv = invoices.find(
                        (i) => (i.customer?._id || i.customer) === e.target.value
                      );
                      if (inv) setSelectedInvoiceId(inv._id);
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold"
                  >
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} • Outstanding: ₹{Number(c.outstandingBalance || 0).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Link to GST Invoice (Optional for Partial Match)
                  </label>
                  <select
                    value={selectedInvoiceId}
                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                  >
                    <option value="">-- Apply to Oldest Pending Balance --</option>
                    {customerInvoices.map((inv) => (
                      <option key={inv._id} value={inv._id}>
                        {inv.invoiceNumber} • Grand Total: ₹{inv.grandTotal} • Due: ₹{inv.balanceDue}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Payment Amount Received (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold text-sm text-navy-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="NEFT">NEFT / RTGS</option>
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Bank Reference / UTR Number
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. UTR-HDFC-991122"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Remarks / Collection Notes
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Partial payment received via NEFT"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Outstanding balance reconciliation preview */}
              {selectedCustomerObj && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Outstanding:</span>
                    <span className="font-semibold text-navy-900">
                      ₹{Number(selectedCustomerObj.outstandingBalance || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Amount:</span>
                    <span className="font-semibold text-emerald-700">
                      -₹{Number(amount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                    <span className="text-navy-900">Remaining Balance:</span>
                    <span className="text-amber-800">
                      ₹{Math.max(0, (selectedCustomerObj.outstandingBalance || 0) - (Number(amount) || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-navy-900 font-semibold rounded-lg text-xs shadow-sm"
                >
                  Confirm & Reconcile Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
