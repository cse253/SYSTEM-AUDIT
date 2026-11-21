import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Plus,
  Edit2,
  Package,
  Boxes,
  CheckCircle,
  X,
  Trash2,
} from 'lucide-react';

const BOMList = () => {
  const { user } = useAuth();
  const canEdit = ['admin', 'owner', 'production_supervisor'].includes(user?.role);

  const [boms, setBoms] = useState([]);
  const [products, setProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [packagingMaterials, setPackagingMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    product: '',
    version: 'v1.0',
    expectedOutput: 200,
    outputUnit: 'packets',
    rawMaterials: [],
    packagingMaterials: [],
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, pRes, rmRes, pkgRes] = await Promise.all([
        api.get('/bom'),
        api.get('/products'),
        api.get('/materials/raw'),
        api.get('/materials/packaging'),
      ]);

      if (bRes.data.success) setBoms(bRes.data.boms);
      if (pRes.data.success) setProducts(pRes.data.products);
      if (rmRes.data.success) setRawMaterials(rmRes.data.materials);
      if (pkgRes.data.success) setPackagingMaterials(pkgRes.data.materials);
    } catch (err) {
      console.error('Failed to load BOM data:', err);
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
    const defaultProduct = products[0];
    setFormData({
      product: defaultProduct?._id || '',
      version: 'v1.0',
      expectedOutput: 200,
      outputUnit: 'packets',
      rawMaterials: rawMaterials.slice(0, 3).map((rm) => ({
        material: rm._id,
        quantity: rm.code === 'RM-FLOUR' ? 40 : rm.code === 'RM-OIL' ? 10 : 1.2,
        unit: rm.unit,
      })),
      packagingMaterials: packagingMaterials.slice(0, 2).map((pm) => ({
        material: pm._id,
        quantity: pm.code === 'PKG-POUCH-200G' ? 200 : 10,
        unit: pm.unit,
      })),
      notes: '',
    });
    setModalOpen(true);
  };

  const handleAddRM = () => {
    const defaultRM = rawMaterials[0];
    if (!defaultRM) return;
    setFormData({
      ...formData,
      rawMaterials: [
        ...formData.rawMaterials,
        { material: defaultRM._id, quantity: 1, unit: defaultRM.unit },
      ],
    });
  };

  const handleRemoveRM = (idx) => {
    setFormData({
      ...formData,
      rawMaterials: formData.rawMaterials.filter((_, i) => i !== idx),
    });
  };

  const handleAddPkg = () => {
    const defaultPkg = packagingMaterials[0];
    if (!defaultPkg) return;
    setFormData({
      ...formData,
      packagingMaterials: [
        ...formData.packagingMaterials,
        { material: defaultPkg._id, quantity: 1, unit: defaultPkg.unit },
      ],
    });
  };

  const handleRemovePkg = (idx) => {
    setFormData({
      ...formData,
      packagingMaterials: formData.packagingMaterials.filter((_, i) => i !== idx),
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/bom', formData);
      if (res.data.success) {
        setSuccess('Bill of Materials saved successfully!');
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving BOM');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-500" />
            Bill of Materials (BOM) Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standard production recipes defining expected output, required raw material weights, and packaging quantities.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-900 font-semibold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New BOM
          </button>
        )}
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {success}
        </div>
      )}

      {/* BOM Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-8 text-center text-slate-400 text-xs">
            Loading Bills of Materials...
          </div>
        ) : boms.length === 0 ? (
          <div className="col-span-2 py-8 text-center text-slate-400 text-xs">
            No BOM configured. Click "Create New BOM" to define standard recipes.
          </div>
        ) : (
          boms.map((bom) => (
            <div
              key={bom._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-navy-900">{bom.product?.name}</h3>
                      <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        SKU: {bom.product?.sku} • {bom.version}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-slate-500">Batch Output</div>
                    <div className="text-sm font-bold text-navy-900">
                      {bom.expectedOutput} {bom.outputUnit}
                    </div>
                  </div>
                </div>

                {/* Ingredients & Raw Materials */}
                <div className="mt-4">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Raw Material Quantities (per batch):
                  </div>
                  <div className="space-y-1.5">
                    {bom.rawMaterials?.map((rm, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-100"
                      >
                        <span className="font-medium text-slate-800">
                          {rm.material?.name || 'Raw Material'}
                        </span>
                        <span className="font-semibold text-navy-900">
                          {rm.quantity} {rm.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Packaging Materials */}
                <div className="mt-4">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Packaging Materials (per batch):
                  </div>
                  <div className="space-y-1.5">
                    {bom.packagingMaterials?.map((pm, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-100"
                      >
                        <span className="font-medium text-slate-800">
                          {pm.material?.name || 'Packaging'}
                        </span>
                        <span className="font-semibold text-navy-900">
                          {pm.quantity} {pm.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Standard Recipe Active</span>
                <span className="text-emerald-700 font-semibold">Yield Base: 100%</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* BOM Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between sticky top-0 z-10">
              <h3 className="font-bold text-sm">Define Bill of Materials (BOM)</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 mx-6 mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Select Finished Product *
                  </label>
                  <select
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold"
                  >
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Expected Output per Batch *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.expectedOutput}
                    onChange={(e) => setFormData({ ...formData, expectedOutput: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Output Unit
                  </label>
                  <input
                    type="text"
                    value={formData.outputUnit}
                    onChange={(e) => setFormData({ ...formData, outputUnit: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Raw Materials Lines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-navy-900">
                    Raw Material Ingredients
                  </label>
                  <button
                    type="button"
                    onClick={handleAddRM}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Ingredient
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.rawMaterials.map((rmLine, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={rmLine.material}
                        onChange={(e) => {
                          const updated = [...formData.rawMaterials];
                          const selectedMat = rawMaterials.find((m) => m._id === e.target.value);
                          updated[idx].material = e.target.value;
                          if (selectedMat) updated[idx].unit = selectedMat.unit;
                          setFormData({ ...formData, rawMaterials: updated });
                        }}
                        className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg"
                      >
                        {rawMaterials.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name} ({m.code})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        step="0.01"
                        placeholder="Quantity"
                        value={rmLine.quantity}
                        onChange={(e) => {
                          const updated = [...formData.rawMaterials];
                          updated[idx].quantity = e.target.value;
                          setFormData({ ...formData, rawMaterials: updated });
                        }}
                        className="w-24 px-2.5 py-1 text-xs border border-slate-300 rounded-lg font-semibold"
                      />

                      <span className="w-16 text-xs text-slate-500">{rmLine.unit}</span>

                      <button
                        type="button"
                        onClick={() => handleRemoveRM(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Packaging Materials Lines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-navy-900">
                    Packaging Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPkg}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Packaging
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.packagingMaterials.map((pkgLine, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={pkgLine.material}
                        onChange={(e) => {
                          const updated = [...formData.packagingMaterials];
                          const selectedMat = packagingMaterials.find((m) => m._id === e.target.value);
                          updated[idx].material = e.target.value;
                          if (selectedMat) updated[idx].unit = selectedMat.unit;
                          setFormData({ ...formData, packagingMaterials: updated });
                        }}
                        className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg"
                      >
                        {packagingMaterials.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name} ({m.code})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        placeholder="Quantity"
                        value={pkgLine.quantity}
                        onChange={(e) => {
                          const updated = [...formData.packagingMaterials];
                          updated[idx].quantity = e.target.value;
                          setFormData({ ...formData, packagingMaterials: updated });
                        }}
                        className="w-24 px-2.5 py-1 text-xs border border-slate-300 rounded-lg font-semibold"
                      />

                      <span className="w-16 text-xs text-slate-500">{pkgLine.unit}</span>

                      <button
                        type="button"
                        onClick={() => handleRemovePkg(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
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
                  Save BOM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOMList;
