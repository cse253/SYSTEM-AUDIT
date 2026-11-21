import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  AlertTriangle,
  CheckCircle,
  X,
  Layers,
  Archive,
} from 'lucide-react';

const Materials = () => {
  const { user } = useAuth();
  const canEdit = ['admin', 'owner', 'production_supervisor'].includes(user?.role);

  const [activeTab, setActiveTab] = useState('raw'); // 'raw' or 'packaging'
  const [rawMaterials, setRawMaterials] = useState([]);
  const [packagingMaterials, setPackagingMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'General',
    unit: 'kg',
    currentStock: 0,
    reorderLevel: 20,
    valuationRate: 0,
    hsnCode: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'raw') {
        const res = await api.get('/materials/raw', { params: { search } });
        if (res.data.success) setRawMaterials(res.data.materials);
      } else {
        const res = await api.get('/materials/packaging', { params: { search } });
        if (res.data.success) setPackagingMaterials(res.data.materials);
      }
    } catch (err) {
      console.error('Failed to load materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, search]);

  const handleOpenModal = (item = null) => {
    setError('');
    setSuccess('');
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        code: item.code,
        category: item.category || 'General',
        unit: item.unit,
        currentStock: item.currentStock,
        reorderLevel: item.reorderLevel,
        valuationRate: item.valuationRate,
        hsnCode: item.hsnCode || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        code: activeTab === 'raw' ? 'RM-' : 'PKG-',
        category: 'General',
        unit: activeTab === 'raw' ? 'kg' : 'pieces',
        currentStock: 0,
        reorderLevel: activeTab === 'raw' ? 20 : 100,
        valuationRate: 0,
        hsnCode: activeTab === 'raw' ? '11010000' : '39232100',
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = activeTab === 'raw' ? '/materials/raw' : '/materials/packaging';
      if (editingItem) {
        await api.put(`${endpoint}/${editingItem._id}`, formData);
        setSuccess('Material updated successfully!');
      } else {
        await api.post(endpoint, formData);
        setSuccess('Material added successfully!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving material');
    }
  };

  const currentList = activeTab === 'raw' ? rawMaterials : packagingMaterials;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-500" />
            Materials Inventory (Raw Materials & Packaging)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track ingredients (Flour, Oil, Spices) and packaging supplies (Pouches, Cartons) with Weighted Average Valuation.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-900 font-semibold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab === 'raw' ? 'Raw Material' : 'Packaging'}
          </button>
        )}
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('raw')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'raw'
              ? 'border-amber-500 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-600" />
          Raw Materials (Flour, Oil, Spices)
        </button>
        <button
          onClick={() => setActiveTab('packaging')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'packaging'
              ? 'border-amber-500 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Archive className="w-4 h-4 text-amber-600" />
          Packaging Materials (Pouches, Cartons)
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search material by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Item Name / Code</th>
                {activeTab === 'raw' && <th className="py-3 px-4">Category</th>}
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Valuation Rate</th>
                <th className="py-3 px-4">Total Inventory Value</th>
                <th className="py-3 px-4">Reorder Level</th>
                <th className="py-3 px-4">Status</th>
                {canEdit && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    Loading materials...
                  </td>
                </tr>
              ) : currentList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    No materials found.
                  </td>
                </tr>
              ) : (
                currentList.map((item) => {
                  const isLow = item.currentStock <= item.reorderLevel;
                  const totalVal = Math.round(item.currentStock * item.valuationRate * 100) / 100;
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-navy-900">{item.name}</div>
                        <div className="text-[10px] text-amber-700 font-mono font-medium">{item.code}</div>
                      </td>
                      {activeTab === 'raw' && (
                        <td className="py-3 px-4 text-slate-600">{item.category}</td>
                      )}
                      <td className="py-3 px-4 text-slate-700 font-medium">{item.unit}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            isLow ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {item.currentStock} {item.unit}
                        </span>
                        {isLow && (
                          <span className="ml-1.5 text-[10px] font-medium text-rose-600 inline-flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" /> Reorder
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-navy-900">
                        ₹{Number(item.valuationRate).toFixed(2)} / {item.unit}
                      </td>
                      <td className="py-3 px-4 font-semibold text-navy-900">
                        ₹{Number(totalVal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.reorderLevel} {item.unit}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          Active
                        </span>
                      </td>
                      {canEdit && (
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-1 text-slate-400 hover:text-navy-900 rounded hover:bg-slate-100 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingItem ? 'Edit Material' : `Add New ${activeTab === 'raw' ? 'Raw Material' : 'Packaging'}`}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
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
                    Material Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={activeTab === 'raw' ? 'e.g. Flour' : 'e.g. 200 g pouch'}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Item Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder={activeTab === 'raw' ? 'RM-FLOUR' : 'PKG-POUCH'}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Unit of Measurement *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="kg, litres, pieces"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Valuation Rate (₹ per unit) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.valuationRate}
                    onChange={(e) => setFormData({ ...formData, valuationRate: e.target.value })}
                    placeholder="e.g. 42.00"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Reorder Alert Level
                  </label>
                  <input
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    value={formData.hsnCode}
                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                    placeholder="e.g. 11010000"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
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
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;
