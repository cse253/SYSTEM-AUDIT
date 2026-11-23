import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart,
  Plus,
  CheckCircle2,
  XCircle,
  FileText,
  Truck,
  AlertTriangle,
  Clock,
  Eye,
  Check,
  X,
  Edit,
} from 'lucide-react';

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminOrOwner = ['admin', 'owner'].includes(user?.role);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Edit Order State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [editRemarks, setEditRemarks] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders', {
        params: { status: selectedStatus },
      });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleApprove = async (orderId) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.put(`/orders/${orderId}/approve`);
      if (res.data.success) {
        setActionSuccess('Order approved successfully!');
        fetchOrders();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Error approving order');
    }
  };

  const handleGenerateInvoice = async (orderId) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.post(`/invoices/generate/${orderId}`);
      if (res.data.success) {
        setActionSuccess(`Invoice ${res.data.invoice.invoiceNumber} generated!`);
        fetchOrders();
        navigate('/invoices');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Error generating invoice');
    }
  };

  const handleDispatch = async (orderId) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.post(`/orders/${orderId}/dispatch`);
      if (res.data.success) {
        setActionSuccess('Order dispatched successfully! Finished-goods inventory updated.');
        fetchOrders();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error recording dispatch';
      const shortages = err.response?.data?.shortages;
      if (shortages && shortages.length > 0) {
        const shortStr = shortages
          .map((s) => `${s.productName}: Required ${s.requested}, Available ${s.available} (Shortage: ${s.shortage} pkts)`)
          .join(' | ');
        setActionError(`${msg} Details: ${shortStr}`);
      } else {
        setActionError(msg);
      }
    }
  };

  const handleReject = async (orderId) => {
    const reason = window.prompt('Enter rejection reason:', 'Price dispute / Customer requested cancellation');
    if (!reason) return;
    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.put(`/orders/${orderId}/reject`, { reason });
      if (res.data.success) {
        setActionSuccess(`Order ${res.data.order?.orderNumber || ''} marked as Rejected.`);
        fetchOrders();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Error rejecting order');
    }
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setEditItems(
      order.items.map((i) => ({
        product: i.product?._id || i.product,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        unit: i.unit || 'packets',
      }))
    );
    setEditRemarks(order.remarks || '');
    setEditModalOpen(true);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...editItems];
    updated[index][field] = value;
    setEditItems(updated);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    try {
      const payload = {
        items: editItems.map((i) => ({
          product: i.product,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
        remarks: editRemarks,
      };
      const res = await api.put(`/orders/${editingOrder._id}`, payload);
      if (res.data.success) {
        setActionSuccess(
          `Order ${res.data.order.orderNumber} updated successfully! New Grand Total: ₹${res.data.order.grandTotal.toFixed(2)}`
        );
        setEditModalOpen(false);
        fetchOrders();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update order');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Invoiced':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Dispatched':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected':
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
            <ShoppingCart className="w-6 h-6 text-amber-500" />
            Sales Orders & Fulfillment Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming orders, verify stock availability, approve, generate GST invoices, and dispatch.
          </p>
        </div>

        {['salesman', 'admin', 'owner'].includes(user?.role) && (
          <button
            onClick={() => navigate('/orders/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-900 font-semibold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Sales Order
          </button>
        )}
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {['', 'Submitted', 'Approved', 'Invoiced', 'Dispatched', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedStatus === status
                ? 'bg-navy-900 text-amber-400'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status || 'All Orders'}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer & State</th>
                <th className="py-3 px-4">Salesman</th>
                <th className="py-3 px-4">Items / Qty</th>
                <th className="py-3 px-4">Total Amount (₹)</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4">Status</th>
                {isAdminOrOwner && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    Loading sales orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const canFulfill = o.stockStatus?.canFulfill;
                  const shortages = o.stockStatus?.shortages || [];

                  return (
                    <tr key={o._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-navy-900">
                        {o.orderNumber}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-navy-900">{o.customer?.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {o.customer?.state} (Code: {o.customer?.stateCode})
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {o.salesman?.name || 'Sales Staff'}
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {o.items.map((i, idx) => (
                          <div key={idx} className="leading-tight">
                            {i.productName}: <span className="font-semibold">{i.quantity}</span> {i.unit}
                          </div>
                        ))}
                      </td>

                      <td className="py-3 px-4 font-semibold text-navy-900">
                        ₹{Number(o.grandTotal).toFixed(2)}
                      </td>

                      {/* Stock availability indicator */}
                      <td className="py-3 px-4">
                        {o.status === 'Dispatched' ? (
                          <span className="text-slate-500 font-medium">Dispatched</span>
                        ) : canFulfill ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Stock Ready
                          </span>
                        ) : (
                          <div className="inline-flex flex-col">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3.5 h-3.5" /> Shortage
                            </span>
                            {shortages.map((s, idx) => (
                              <span key={idx} className="text-[10px] text-rose-600 font-medium mt-0.5">
                                Short by {s.shortage} pkts
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(
                            o.status
                          )}`}
                        >
                          {o.status}
                        </span>
                      </td>

                      {isAdminOrOwner && (
                        <td className="py-3 px-4 text-right space-x-1">
                          {o.status === 'Submitted' && (
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleApprove(o._id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-[11px] transition-colors cursor-pointer"
                                title="Approve Order"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openEditModal(o)}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-[11px] transition-colors cursor-pointer"
                                title="Edit Quantities or Prices"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleReject(o._id)}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded text-[11px] transition-colors cursor-pointer"
                                title="Reject Order"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {o.status === 'Approved' && !o.invoice && (
                            <button
                              onClick={() => handleGenerateInvoice(o._id)}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded text-[11px] transition-colors cursor-pointer"
                              title="Generate GST Tax Invoice"
                            >
                              Generate Invoice
                            </button>
                          )}

                          {['Approved', 'Invoiced'].includes(o.status) && (
                            <button
                              onClick={() => handleDispatch(o._id)}
                              className={`px-2.5 py-1 text-navy-900 font-semibold rounded text-[11px] transition-colors cursor-pointer ${
                                canFulfill
                                  ? 'bg-amber-500 hover:bg-amber-400'
                                  : 'bg-slate-200 text-slate-500 hover:bg-rose-100 hover:text-rose-700'
                              }`}
                              title={
                                canFulfill
                                  ? 'Record Dispatch'
                                  : 'Cannot dispatch: Insufficient finished-goods stock!'
                              }
                            >
                              Dispatch
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Order Modal */}
      {editModalOpen && editingOrder && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Edit className="w-4 h-4 text-amber-400" />
                  Modify Order: {editingOrder.orderNumber}
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Customer: {editingOrder.customer?.name} ({editingOrder.customer?.state})
                </p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider">
                  Line Items
                </label>
                {editItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <div className="font-semibold text-xs text-navy-900">{item.productName}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-medium">Quantity ({item.unit})</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-medium">Unit Price (₹)</label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">Remarks / Note</label>
                <input
                  type="text"
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="e.g. Price adjusted per owner approval"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-navy-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-navy-900 hover:bg-navy-800 text-amber-400 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Save & Recalculate GST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
