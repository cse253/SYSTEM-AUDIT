import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Building,
  User,
  Package,
} from 'lucide-react';

const NewOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState([
    { product: '', quantity: 1, unitPrice: 0, taxableAmount: 0, totalAmount: 0 },
  ]);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [cRes, pRes] = await Promise.all([
          api.get('/customers', { params: { activeOnly: 'true' } }),
          api.get('/products', { params: { activeOnly: 'true' } }),
        ]);
        if (cRes.data.success) setCustomers(cRes.data.customers);
        if (pRes.data.success) {
          setProducts(pRes.data.products);
          // Default first item to Murukku if available
          const defaultProd = pRes.data.products.find((p) => p.sku === 'MRK-200G') || pRes.data.products[0];
          if (defaultProd) {
            setItems([
              {
                product: defaultProd._id,
                quantity: 1,
                unitPrice: defaultProd.sellingPrice,
                taxableAmount: defaultProd.sellingPrice,
                totalAmount: Math.round(defaultProd.sellingPrice * 1.05 * 100) / 100,
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedCustomer = customers.find((c) => c._id === selectedCustomerId);
  const isInterState =
    selectedCustomer &&
    selectedCustomer.state?.trim().toLowerCase() !== 'tamil nadu' &&
    selectedCustomer.stateCode !== '33';

  // Update item fields & recalculate
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    const currentItem = { ...updated[index], [field]: value };

    if (field === 'product') {
      const prod = products.find((p) => p._id === value);
      if (prod) {
        // Check custom price on customer
        let rate = prod.sellingPrice;
        if (selectedCustomer && selectedCustomer.customerPricing) {
          const cp = selectedCustomer.customerPricing.find((c) => c.product === prod._id);
          if (cp) rate = cp.customPrice;
        }
        currentItem.unitPrice = rate;
      }
    }

    const qty = Number(currentItem.quantity) || 0;
    const price = Number(currentItem.unitPrice) || 0;
    currentItem.taxableAmount = Math.round(qty * price * 100) / 100;
    // 5% GST
    currentItem.totalAmount = Math.round(currentItem.taxableAmount * 1.05 * 100) / 100;

    updated[index] = currentItem;
    setItems(updated);
  };

  const handleAddItem = () => {
    const defaultProd = products[0];
    setItems([
      ...items,
      {
        product: defaultProd?._id || '',
        quantity: 1,
        unitPrice: defaultProd?.sellingPrice || 0,
        taxableAmount: defaultProd?.sellingPrice || 0,
        totalAmount: Math.round((defaultProd?.sellingPrice || 0) * 1.05 * 100) / 100,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Calculations
  const subtotal = items.reduce((acc, i) => acc + (Number(i.taxableAmount) || 0), 0);
  const totalTax = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = Math.round((subtotal + totalTax) * 100) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }
    if (items.some((i) => !i.product || i.quantity <= 0)) {
      setError('Please check product selections and positive quantities.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/orders', {
        customerId: selectedCustomerId,
        items: items.map((i) => ({
          product: i.product,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
        remarks,
      });

      if (res.data.success) {
        setSuccess('Sales order submitted successfully!');
        setTimeout(() => {
          navigate('/orders');
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/orders')}
          className="text-xs font-semibold text-slate-500 hover:text-navy-900 flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase">
          Rapid Order Entry (&lt; 1 min)
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-5">
          <h1 className="text-xl font-bold text-navy-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-500" />
            Place Customer Sales Order
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select customer and specify finished goods order quantities. Taxes auto-computed.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Customer */}
          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1.5">
              1. Select Customer *
            </label>
            <select
              required
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white font-medium text-navy-900"
            >
              <option value="">-- Choose Retailer or Distributor --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.customerType}) • {c.state} [Code: {c.stateCode}]
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-wrap gap-4 text-slate-700">
                <div>
                  <span className="text-slate-400">Jurisdiction: </span>
                  <span className="font-semibold text-navy-900">{selectedCustomer.state}</span>
                </div>
                <div>
                  <span className="text-slate-400">Tax Type: </span>
                  <span className="font-semibold text-amber-700">
                    {isInterState ? 'IGST 5% (Inter-State)' : 'CGST 2.5% + SGST 2.5% (Intra-State TN)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Current Outstanding: </span>
                  <span className="font-semibold text-navy-900">
                    ₹{Number(selectedCustomer.outstandingBalance || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-navy-900">
                2. Order Line Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Product
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => {
                const prod = products.find((p) => p._id === item.product);
                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <label className="block text-[10px] text-slate-500 mb-1">Product</label>
                      <select
                        value={item.product}
                        onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.sku}) • Stock: {p.currentStock} pkts
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <label className="block text-[10px] text-slate-500 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold"
                      />
                    </div>

                    <div className="w-24">
                      <label className="block text-[10px] text-slate-500 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        readOnly
                        value={item.unitPrice}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-100 font-medium"
                      />
                    </div>

                    <div className="w-28 text-right">
                      <label className="block text-[10px] text-slate-500 mb-1">Item Total</label>
                      <div className="text-xs font-bold text-navy-900 py-1.5">
                        ₹{Number(item.totalAmount || 0).toFixed(2)}
                      </div>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 mt-4 sm:mt-0"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Order Notes / Remarks</label>
            <input
              type="text"
              placeholder="e.g. Urgent dispatch requested by customer"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          {/* Order Totals Summary Card */}
          <div className="p-4 bg-navy-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400">Total Calculation Preview:</div>
              <div className="text-xs text-slate-300 mt-0.5">
                Taxable: ₹{subtotal.toFixed(2)} + GST (5%): ₹{totalTax.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                Grand Total Amount
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                ₹{grandTotal.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-navy-900 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Submitting Order...' : 'Submit Sales Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrder;
