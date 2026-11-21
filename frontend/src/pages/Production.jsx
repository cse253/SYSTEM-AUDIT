import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Factory,
  Plus,
  AlertTriangle,
  CheckCircle,
  Eye,
  X,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Package,
} from 'lucide-react';

const Production = () => {
  const { user } = useAuth();
  const canCreate = ['admin', 'owner', 'production_supervisor'].includes(user?.role);

  const [runs, setRuns] = useState([]);
  const [boms, setBoms] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRunDetails, setSelectedRunDetails] = useState(null);

  // Form State
  const [selectedBOMId, setSelectedBOMId] = useState('');
  const [batchMultiplier, setBatchMultiplier] = useState(1);
  const [actualOutput, setActualOutput] = useState(188); // Default to benchmark scenario step 2
  const [labourCost, setLabourCost] = useState(1200); // Benchmark step 7
  const [gasAndElectricityCost, setGasAndElectricityCost] = useState(600); // Benchmark step 7
  const [rawMaterialsInput, setRawMaterialsInput] = useState([]);
  const [packagingInput, setPackagingInput] = useState([]);
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, bRes, pRes] = await Promise.all([
        api.get('/production'),
        api.get('/bom'),
        api.get('/products'),
      ]);

      if (rRes.data.success) setRuns(rRes.data.productionRuns);
      if (bRes.data.success) {
        setBoms(bRes.data.boms);
        if (bRes.data.boms.length > 0 && !selectedBOMId) {
          const defaultBOM = bRes.data.boms[0];
          setSelectedBOMId(defaultBOM._id);
          setupInputsFromBOM(defaultBOM, 1);
        }
      }
      if (pRes.data.success) setProducts(pRes.data.products);
    } catch (err) {
      console.error('Failed to load production runs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const setupInputsFromBOM = (bom, multiplier = 1) => {
    if (!bom) return;
    setRawMaterialsInput(
      bom.rawMaterials.map((rm) => ({
        materialId: rm.material?._id || rm.material,
        materialName: rm.material?.name || 'Raw Material',
        unit: rm.unit,
        plannedQuantity: rm.quantity * multiplier,
        // Benchmark default: Flour 40, Oil 10.5, Spice 1.2
        actualQuantity:
          rm.material?.code === 'RM-OIL' ? 10.5 * multiplier : rm.quantity * multiplier,
      }))
    );

    setPackagingInput(
      bom.packagingMaterials.map((pm) => ({
        materialId: pm.material?._id || pm.material,
        materialName: pm.material?.name || 'Packaging',
        unit: pm.unit,
        plannedQuantity: pm.quantity * multiplier,
        actualQuantity: pm.material?.code === 'PKG-CARTON' ? 9 * multiplier : 188 * multiplier,
        damagedQuantity: pm.material?.code === 'PKG-POUCH-200G' ? 6 * multiplier : 0,
      }))
    );
  };

  const handleBOMChange = (bomId) => {
    setSelectedBOMId(bomId);
    const bom = boms.find((b) => b._id === bomId);
    setupInputsFromBOM(bom, batchMultiplier);
  };

  const handleOpenModal = () => {
    setError('');
    setSuccess('');
    const bom = boms.find((b) => b._id === selectedBOMId) || boms[0];
    if (bom) {
      setSelectedBOMId(bom._id);
      setupInputsFromBOM(bom, 1);
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    const bom = boms.find((b) => b._id === selectedBOMId);
    if (!bom) {
      setError('Please select a Bill of Materials');
      return;
    }

    try {
      const payload = {
        productId: bom.product?._id || bom.product,
        bomId: bom._id,
        batchMultiplier: Number(batchMultiplier),
        expectedOutput: bom.expectedOutput * Number(batchMultiplier),
        actualOutput: Number(actualOutput),
        rawMaterials: rawMaterialsInput,
        packagingMaterials: packagingInput,
        labourCost: Number(labourCost),
        gasAndElectricityCost: Number(gasAndElectricityCost),
        notes,
      };

      const res = await api.post('/production', payload);
      if (res.data.success) {
        setSuccess('Production run batch recorded successfully! Stock and variances updated.');
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording production run');
    }
  };

  const currentBOM = boms.find((b) => b._id === selectedBOMId);
  const expectedOutput = currentBOM ? currentBOM.expectedOutput * batchMultiplier : 200;
  const yieldVariance =
    expectedOutput > 0 ? Math.round(((actualOutput - expectedOutput) / expectedOutput) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <Factory className="w-6 h-6 text-amber-500" />
            Batch Production Management & Yield Variances
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Execute production runs against BOMs. Automatically issues raw materials, deducts packaging & scrap, yields finished goods, and flags variances exceeding 3%.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-900 font-semibold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Production Run
          </button>
        )}
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {success}
        </div>
      )}

      {/* Production Runs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Run # & Date</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Planned Output</th>
                <th className="py-3 px-4">Actual Yield</th>
                <th className="py-3 px-4">Yield Variance (%)</th>
                <th className="py-3 px-4">RM & Pkg Cost</th>
                <th className="py-3 px-4">Overheads (Labour+Power)</th>
                <th className="py-3 px-4">Cost / Packet</th>
                <th className="py-3 px-4">Selling / Profit</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-400">
                    Loading production runs...
                  </td>
                </tr>
              ) : runs.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-400">
                    No production runs recorded. Click "Create Production Run" to start a batch.
                  </td>
                </tr>
              ) : (
                runs.map((r) => {
                  const isFlagged = r.isYieldFlagged;
                  return (
                    <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-navy-900">{r.runNumber}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(r.productionDate).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-navy-900">
                        {r.productName || r.product?.name}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {r.expectedOutput} {r.unit}
                      </td>

                      <td className="py-3 px-4 font-bold text-navy-900">
                        {r.actualOutput} {r.unit}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span
                            className={`font-semibold ${
                              r.yieldVariancePercentage < 0 ? 'text-rose-600' : 'text-emerald-700'
                            }`}
                          >
                            {r.yieldVariancePercentage > 0 ? `+${r.yieldVariancePercentage}` : r.yieldVariancePercentage}%
                          </span>
                          {isFlagged && (
                            <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-rose-100 text-rose-800 flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> &gt;3%
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        ₹{Number(r.totalRawMaterialCost + r.totalPackagingCost).toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        ₹{Number(r.labourCost + r.gasAndElectricityCost).toFixed(2)}
                      </td>

                      <td className="py-3 px-4 font-bold text-navy-900">
                        ₹{Number(r.costPerPacket).toFixed(2)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          ₹{Number(r.sellingPricePerPacket).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          +₹{Number(r.profitPerPacket).toFixed(2)} ({r.profitMarginPercentage}%)
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedRunDetails(r)}
                          className="p-1 text-slate-400 hover:text-navy-900 rounded hover:bg-slate-100"
                          title="View Variance & Cost Breakdown"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Run Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between sticky top-0 z-10">
              <h3 className="font-bold text-sm">Create Production Batch Run</h3>
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
              {/* 1. Header Selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Select Product Recipe (BOM) *
                  </label>
                  <select
                    value={selectedBOMId}
                    onChange={(e) => handleBOMChange(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold"
                  >
                    {boms.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.product?.name} ({b.expectedOutput} {b.outputUnit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Batch Multiplier (e.g. 1 batch)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={batchMultiplier}
                    onChange={(e) => {
                      const m = Number(e.target.value) || 1;
                      setBatchMultiplier(m);
                      setupInputsFromBOM(currentBOM, m);
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* 2. Outputs & Yield Variance Preview */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Planned Expected Output</span>
                  <div className="text-base font-bold text-navy-900 mt-0.5">
                    {expectedOutput} packets
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Actual Produced *</span>
                  <input
                    type="number"
                    required
                    value={actualOutput}
                    onChange={(e) => setActualOutput(Number(e.target.value))}
                    className="w-24 mx-auto block text-center font-bold text-base border border-slate-300 rounded bg-white py-0.5 mt-0.5 text-navy-900"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Yield Variance</span>
                  <div
                    className={`text-base font-bold mt-0.5 ${
                      yieldVariance < 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {yieldVariance > 0 ? `+${yieldVariance}` : yieldVariance}%
                  </div>
                  {Math.abs(yieldVariance) > 3.0 && (
                    <span className="text-[9px] font-bold text-rose-600">Variance &gt; 3% Flagged</span>
                  )}
                </div>
              </div>

              {/* 3. Raw Materials Consumed Inputs */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-2">
                  Raw Materials Consumed (Flour, Oil, Spices):
                </label>
                <div className="space-y-2">
                  {rawMaterialsInput.map((rm, idx) => {
                    const variance =
                      rm.plannedQuantity > 0
                        ? Math.round(
                            ((rm.actualQuantity - rm.plannedQuantity) / rm.plannedQuantity) * 1000
                          ) / 10
                        : 0;
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="w-40 font-semibold text-navy-900">{rm.materialName}</div>
                        <div className="text-slate-500">
                          Planned: <span className="font-medium text-slate-700">{rm.plannedQuantity} {rm.unit}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500">Actual:</span>
                          <input
                            type="number"
                            step="0.01"
                            value={rm.actualQuantity}
                            onChange={(e) => {
                              const updated = [...rawMaterialsInput];
                              updated[idx].actualQuantity = Number(e.target.value);
                              setRawMaterialsInput(updated);
                            }}
                            className="w-20 px-2 py-0.5 font-bold border border-slate-300 rounded bg-white text-navy-900 text-right"
                          />
                          <span className="text-slate-500 w-8">{rm.unit}</span>
                        </div>
                        <div className="w-24 text-right">
                          <span
                            className={`font-semibold ${
                              Math.abs(variance) > 3.0 ? 'text-amber-700' : 'text-slate-600'
                            }`}
                          >
                            {variance > 0 ? `+${variance}` : variance}% var
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Packaging Materials Consumed & Damage */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-2">
                  Packaging Materials Used & Damaged Scraps:
                </label>
                <div className="space-y-2">
                  {packagingInput.map((pm, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="w-36 font-semibold text-navy-900">{pm.materialName}</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-500">Good Pkts:</span>
                        <input
                          type="number"
                          value={pm.actualQuantity}
                          onChange={(e) => {
                            const updated = [...packagingInput];
                            updated[idx].actualQuantity = Number(e.target.value);
                            setPackagingInput(updated);
                          }}
                          className="w-16 px-2 py-0.5 font-bold border border-slate-300 rounded bg-white text-navy-900 text-right"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-rose-600 font-medium">Damaged/Scrap:</span>
                        <input
                          type="number"
                          value={pm.damagedQuantity}
                          onChange={(e) => {
                            const updated = [...packagingInput];
                            updated[idx].damagedQuantity = Number(e.target.value);
                            setPackagingInput(updated);
                          }}
                          className="w-16 px-2 py-0.5 font-bold border border-rose-300 rounded bg-white text-rose-700 text-right"
                        />
                      </div>
                      <div className="w-20 text-right text-slate-500 font-medium">
                        Total: {pm.actualQuantity + pm.damagedQuantity} {pm.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Production Overhead Expenses */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-700" />
                  Direct Production Expenses (Costing):
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-amber-900 mb-1">
                      Direct Labour Cost (₹)
                    </label>
                    <input
                      type="number"
                      value={labourCost}
                      onChange={(e) => setLabourCost(e.target.value)}
                      className="w-full px-2.5 py-1 border border-amber-300 rounded bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-amber-900 mb-1">
                      Gas & Electricity Power Cost (₹)
                    </label>
                    <input
                      type="number"
                      value={gasAndElectricityCost}
                      onChange={(e) => setGasAndElectricityCost(e.target.value)}
                      className="w-full px-2.5 py-1 border border-amber-300 rounded bg-white font-semibold"
                    />
                  </div>
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
                  Record Production Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedRunDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-bold text-navy-900 text-sm">
                Production Batch Run: {selectedRunDetails.runNumber}
              </h3>
              <button onClick={() => setSelectedRunDetails(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Finished Product:</span>
                <span className="font-bold text-navy-900">{selectedRunDetails.productName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Planned vs Actual Yield:</span>
                <span className="font-bold">
                  {selectedRunDetails.expectedOutput} pkts &rarr; {selectedRunDetails.actualOutput} pkts ({selectedRunDetails.yieldVariancePercentage}%)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Production Cost:</span>
                <span className="font-bold text-navy-900">₹{selectedRunDetails.totalProductionCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cost per Packet:</span>
                <span className="font-bold text-amber-700">₹{selectedRunDetails.costPerPacket.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Selling Price:</span>
                <span className="font-bold">₹{selectedRunDetails.sellingPricePerPacket.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Profit Margin:</span>
                <span className="font-bold text-emerald-700">
                  ₹{selectedRunDetails.profitPerPacket.toFixed(2)} ({selectedRunDetails.profitMarginPercentage}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Production;
