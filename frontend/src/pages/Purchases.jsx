import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  Calendar,
} from 'lucide-react';

const Purchases = () => {
  const { user } = useAuth();
  const canCreate = ['admin', 'owner', 'production_supervisor'].includes(user?.role);

  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [packagingMaterials, setPackagingMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [itemType, setItemType] = useState('RawMaterial');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantity, setQuantity] = useState(60); // Benchmark step 1: 60 kg
  const [unitRate, setUnitRate] = useState(45); // Benchmark step 1: ₹45/kg
  const [gstPercentage, setGstPercentage] = useState(5);
  const [remarks, setRemarks] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [purRes, supRes, rmRes, pkgRes] = await Promise.all([
        api.get('/purchases'),
        api.get('/suppliers'),
        api.get('/materials/raw'),
        api.get('/materials/packaging'),
      ]);

      if (purRes.data.success) setPurchases(purRes.data.purchases);
      if (supRes.data.success) {
        setSuppliers(supRes.data.suppliers);
        if (supRes.data.suppliers.length > 0 && !supplierId) {
          setSupplierId(supRes.data.suppliers[0]._id);
        }
      }
      if (rmRes.data.success) {
        setRawMaterials(rmRes.data.materials);
        const flour = rmRes.data.materials.find((m) => m.code === 'RM-FLOUR') || rmRes.data.materials[0];
        if (flour && !selectedMaterialId) {
          setSelectedMaterialId(flour._id);
        }
      }
      if (pkgRes.data.success) setPackagingMaterials(pkgRes.data.materials);
    } catch (err) {
      console.error('Failed to load purchases:', err);
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
    // Defaults for Benchmark Step 1
    const agroSupplier = suppliers.find((s) => s.name.includes('Annapoorna')) || suppliers[0];
    const flourMat = rawMaterials.find((m) => m.code === 'RM-FLOUR') || rawMaterials[0];

    if (agroSupplier) setSupplierId(agroSupplier._id);
    if (flourMat) setSelectedMaterialId(flourMat._id);
    setItemType('RawMaterial');
    setQuantity(60);
    setUnitRate(45);
    setInvoiceNumber('BILL-AGRO-2026-01');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        supplierId,
        invoiceNumber,
        items: [
          {
            itemType,
            item: selectedMaterialId,
            quantity: Number(quantity),
            unitRate: Number(unitRate),
            gstPercentage: Number(gstPercentage),
          },
        ],
        remarks: remarks || 'Raw material purchase receipt with WAC valuation update',
      };

      const res = await api.post('/purchases', payload);
      if (res.data.success) {
        setSuccess('Purchase recorded successfully! Stock and Weighted Average Valuation updated.');
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording purchase');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-500" />
            Purchases & Material Inflow Register
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Record raw material and packaging receipts. Inventory balances and Weighted Average Costs (WAC) update automatically.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-900 font-semibold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Purchase (Receipt)
          </button>
        )}
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {success}
        </div>
      )}

      {/* Purchases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">PO # / Bill #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Item & Qty</th>
                <th className="py-3 px-4">Unit Rate</th>
                <th className="py-3 px-4">Taxable Amount</th>
                <th className="py-3 px-4">GST (5%)</th>
                <th className="py-3 px-4">Grand Total (₹)</th>
                <th className="py-3 px-4">Received By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    Loading purchases...
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    No purchase receipts recorded yet. Click "Record Purchase" to add.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-navy-900">{p.purchaseNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.invoiceNumber ? `Bill: ${p.invoiceNumber}` : '-'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {new Date(p.purchaseDate).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 font-semibold text-navy-900">
                      {p.supplier?.name}
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      {p.items?.map((it, idx) => (
                        <div key={idx}>
                          {it.itemName}: <span className="font-semibold">{it.quantity}</span> {it.unit}
                        </div>
                      ))}
                    </td>

                    <td className="py-3 px-4 font-semibold text-navy-900">
                      ₹{Number(p.items?.[0]?.unitRate || 0).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      ₹{Number(p.subtotal).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      ₹{Number(p.totalTax).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 font-bold text-navy-900">
                      ₹{Number(p.grandTotal).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {p.receivedBy?.name || 'Store Supervisor'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Record Purchase (Stock Receipt)</h3>
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
                    Select Supplier *
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold"
                  >
                    {suppliers.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Vendor Bill / Invoice #
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="e.g. BILL-AGRO-01"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Material Type *
                  </label>
                  <select
                    value={itemType}
                    onChange={(e) => {
                      setItemType(e.target.value);
                      if (e.target.value === 'RawMaterial') {
                        setSelectedMaterialId(rawMaterials[0]?._id || '');
                      } else {
                        setSelectedMaterialId(packagingMaterials[0]?._id || '');
                      }
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="RawMaterial">Raw Material</option>
                    <option value="PackagingMaterial">Packaging Material</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Select Item *
                  </label>
                  <select
                    value={selectedMaterialId}
                    onChange={(e) => setSelectedMaterialId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold"
                  >
                    {(itemType === 'RawMaterial' ? rawMaterials : packagingMaterials).map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.code}) • Current: {m.currentStock} {m.unit} @ ₹{m.valuationRate}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Purchase Quantity *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Purchase Rate (₹ per unit) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitRate}
                    onChange={(e) => setUnitRate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              {/* Total preview */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                <span className="text-slate-600 font-medium">Estimated Total (incl. 5% GST):</span>
                <span className="text-navy-900 font-bold text-sm">
                  ₹{(Number(quantity) * Number(unitRate) * 1.05).toFixed(2)}
                </span>
              </div>

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
                  Save Receipt & Update WAC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
