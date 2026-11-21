import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Boxes,
  Layers,
  Archive,
  Package,
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

const Inventory = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMovementType, setSelectedMovementType] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, ledRes] = await Promise.all([
        api.get('/inventory/summary'),
        api.get('/inventory/ledger', {
          params: {
            itemCategory: selectedCategory,
            movementType: selectedMovementType,
          },
        }),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data);
      if (ledRes.data.success) setLedger(ledRes.data.ledger);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedMovementType]);

  const getMovementBadge = (type, direction) => {
    const isPositive = direction > 0;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
          isPositive
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}
      >
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {type.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
          <Boxes className="w-6 h-6 text-amber-500" />
          Triple Inventory Ledger (Raw Materials, Packaging, Finished Goods)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Formula: <span className="font-semibold text-navy-900">Closing Stock = Opening Stock + Receipts - Issues + Adjustments</span>. Immutable double-entry audit records.
        </p>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Raw Materials */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              1. Raw Materials Stock
            </span>
            <Layers className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3 text-2xl font-bold text-navy-900">
            ₹{Number(summary?.rawMaterials?.totalValuation || 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 space-y-0.5">
            {summary?.rawMaterials?.items?.map((rm) => (
              <div key={rm._id} className="flex justify-between">
                <span>{rm.name}:</span>
                <span className="font-semibold text-slate-800">
                  {rm.currentStock} {rm.unit} (₹{rm.valuationRate}/unit)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Packaging Materials */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              2. Packaging Materials Stock
            </span>
            <Archive className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3 text-2xl font-bold text-navy-900">
            ₹{Number(summary?.packagingMaterials?.totalValuation || 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 space-y-0.5">
            {summary?.packagingMaterials?.items?.map((pm) => (
              <div key={pm._id} className="flex justify-between">
                <span>{pm.name}:</span>
                <span className="font-semibold text-slate-800">
                  {pm.currentStock} {pm.unit} (₹{pm.valuationRate}/unit)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Finished Goods */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              3. Finished Goods Stock
            </span>
            <Package className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3 text-2xl font-bold text-navy-900">
            ₹{Number(summary?.finishedGoods?.totalValuation || 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 space-y-0.5">
            {summary?.finishedGoods?.items?.map((fg) => (
              <div key={fg._id} className="flex justify-between">
                <span>{fg.name}:</span>
                <span className="font-semibold text-navy-900">
                  {fg.currentStock} {fg.unit} (@ ₹{fg.sellingPrice})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Immutable Stock Movement Audit Ledger
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="">All Inventory Categories</option>
            <option value="raw_material">Raw Materials</option>
            <option value="packaging_material">Packaging Materials</option>
            <option value="finished_goods">Finished Goods</option>
          </select>

          <select
            value={selectedMovementType}
            onChange={(e) => setSelectedMovementType(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="">All Movement Types</option>
            <option value="OPENING_BALANCE">Opening Balance</option>
            <option value="PURCHASE_RECEIPT">Purchase Receipt (+)</option>
            <option value="PRODUCTION_ISSUE">Production Issue (-)</option>
            <option value="PRODUCTION_YIELD">Production Yield (+)</option>
            <option value="SALES_DISPATCH">Sales Dispatch (-)</option>
            <option value="STOCK_ADJUSTMENT">Stock Adjustment</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Item & Category</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4 text-right">Inflow (+) / Outflow (-)</th>
                <th className="py-3 px-4 text-right">Balance Before</th>
                <th className="py-3 px-4 text-right">Balance After</th>
                <th className="py-3 px-4">Source Document</th>
                <th className="py-3 px-4">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400 font-sans">
                    Loading stock ledger entries...
                  </td>
                </tr>
              ) : ledger.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400 font-sans">
                    No ledger entries found.
                  </td>
                </tr>
              ) : (
                ledger.map((entry) => {
                  const isInflow = entry.direction > 0;
                  return (
                    <tr key={entry._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-slate-500 font-sans">
                        {new Date(entry.movementDate).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>

                      <td className="py-2.5 px-4 font-sans">
                        <div className="font-semibold text-navy-900">{entry.itemName}</div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {entry.itemCategory.replace('_', ' ')}
                        </div>
                      </td>

                      <td className="py-2.5 px-4 font-sans">
                        {getMovementBadge(entry.movementType, entry.direction)}
                      </td>

                      <td
                        className={`py-2.5 px-4 text-right font-bold ${
                          isInflow ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {isInflow ? `+${entry.quantity}` : `-${entry.quantity}`} {entry.unit}
                      </td>

                      <td className="py-2.5 px-4 text-right text-slate-500">
                        {entry.balanceBefore} {entry.unit}
                      </td>

                      <td className="py-2.5 px-4 text-right font-bold text-navy-900">
                        {entry.balanceAfter} {entry.unit}
                      </td>

                      <td className="py-2.5 px-4 font-sans text-slate-700">
                        <div className="font-semibold">
                          {entry.sourceDocumentNumber || entry.sourceDocumentType}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {entry.remarks}
                        </div>
                      </td>

                      <td className="py-2.5 px-4 font-sans text-slate-600">
                        {entry.user?.name || 'System Admin'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
