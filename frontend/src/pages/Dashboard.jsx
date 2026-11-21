import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart,
  TrendingUp,
  Factory,
  Boxes,
  AlertTriangle,
  CreditCard,
  PlusCircle,
  FileText,
  Clock,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/summary');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const summary = data?.summary || {
    todaysOrdersCount: 0,
    todaysOrdersValue: 0,
    monthlySalesTotal: 0,
    monthlyProductionUnits: 0,
    totalOutstandingReceivables: 0,
    rawMaterialValuation: 0,
    totalFinishedGoodsStock: 0,
  };

  const alerts = data?.alerts || {
    lowStockProductsCount: 0,
    lowStockRawMaterialsCount: 0,
    varianceAlertsCount: 0,
    lowStockItems: [],
    varianceRuns: [],
  };

  const recent = data?.recentData || {
    recentOrders: [],
    recentInvoices: [],
    recentLedger: [],
  };

  // Chart data for stock summary
  const stockChartData = [
    { name: 'Finished (Pkts)', amount: summary.totalFinishedGoodsStock, fill: '#F59E0B' },
    { name: 'RM Val (₹100s)', amount: Math.round(summary.rawMaterialValuation / 100), fill: '#0F172A' },
    { name: 'Receivables (₹100s)', amount: Math.round(summary.totalOutstandingReceivables / 100), fill: '#D97706' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Role Welcome & Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase tracking-wider">
              {user?.role?.replace('_', ' ')} Portal
            </span>
            <span className="text-xs text-slate-400">• Factory: Tiruchirappalli, Tamil Nadu</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-1">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sri Murugan Traditional Foods • Real-time Order-to-Audit Management System
          </p>
        </div>

        {/* Quick Action Button per Role */}
        <div className="flex items-center gap-2">
          {['salesman', 'admin'].includes(user?.role) && (
            <button
              onClick={() => navigate('/orders/new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-navy-900 font-semibold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Place New Sales Order
            </button>
          )}

          {['production_supervisor', 'admin'].includes(user?.role) && (
            <button
              onClick={() => navigate('/production')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-amber-400 font-semibold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              <Factory className="w-4 h-4" />
              Production Batches
            </button>
          )}

          {user?.role === 'accountant_auditor' && (
            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-amber-400 font-semibold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Audit Reports & Exports
            </button>
          )}
        </div>
      </div>

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Orders */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Today's Orders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-navy-900">{summary.todaysOrdersCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Value: ₹{Number(summary.todaysOrdersValue).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Monthly Invoiced Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-navy-900">
              ₹{Number(summary.monthlySalesTotal).toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">GST compliant billed</p>
          </div>
        </div>

        {/* Production Output */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Monthly Production Output</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-navy-900">
              {Number(summary.monthlyProductionUnits).toLocaleString()} pkts
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Murukku, Mixture & Sweets</p>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Customer Outstanding Due</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-navy-900">
              ₹{Number(summary.totalOutstandingReceivables).toLocaleString()}
            </div>
            <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Pending collections</p>
          </div>
        </div>
      </div>

      {/* Middle Grid: Operational Inventory Status & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Finished Goods & Raw Material Snapshot */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-navy-900">Inventory Valuation & Stock Balances</h2>
              <p className="text-xs text-slate-500">Current stock across warehouse & factory floor</p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
            >
              View Products <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-amber-500" />
                Finished Goods Stock
              </div>
              <div className="text-xl font-bold text-navy-900 mt-1">
                {summary.totalFinishedGoodsStock} <span className="text-xs font-normal text-slate-500">packets</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Boxes className="w-3.5 h-3.5 text-navy-900" />
                Raw Materials Valuation
              </div>
              <div className="text-xl font-bold text-navy-900 mt-1">
                ₹{Number(summary.rawMaterialValuation).toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                Receivables Ratio
              </div>
              <div className="text-xl font-bold text-navy-900 mt-1">
                ₹{Number(summary.totalOutstandingReceivables).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Minimal Clean Bar Chart */}
          <div className="h-44 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Alerts Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Factory Operational Alerts
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                {alerts.lowStockItems.length + alerts.varianceRuns.length} Alerts
              </span>
            </div>

            <div className="mt-3 space-y-2.5 overflow-y-auto max-h-72 pr-1">
              {alerts.lowStockItems.length === 0 && alerts.varianceRuns.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                  All stock levels & production yield variances within safe limits.
                </div>
              ) : (
                <>
                  {alerts.lowStockItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 text-xs text-rose-900 flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-rose-950">
                          Low Stock: {item.name}
                        </div>
                        <div className="text-[11px] text-rose-700 mt-0.5">
                          Current: {item.current} {item.unit} (Threshold: {item.min})
                        </div>
                      </div>
                    </div>
                  ))}

                  {alerts.varianceRuns.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2"
                    >
                      <Factory className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-navy-900">
                          Yield Variance Alert: {v.runNumber}
                        </div>
                        <div className="text-[11px] text-amber-800 mt-0.5">
                          {v.productName}: {v.yieldVariance > 0 ? `+${v.yieldVariance}` : v.yieldVariance}% variance (exceeds 3% limit)
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Automated alerts threshold: ±3.0% yield/consumption variance.
          </div>
        </div>
      </div>

      {/* Role-Specific Quick Link Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/orders')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900">Sales Orders & Dispatch</span>
            <ShoppingCart className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track orders through Submitted, Approved, Invoiced and Dispatched stages.
          </p>
        </div>

        <div
          onClick={() => navigate('/materials')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900">Raw & Packaging Materials</span>
            <Boxes className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review Flour (100kg), Oil (30L), Spice (5kg), Pouches (500pcs), and Cartons (30pcs).
          </p>
        </div>

        <div
          onClick={() => navigate('/customers')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900">Customer Directory & States</span>
            <CreditCard className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Retailer A (Tamil Nadu - 33) & Distributor B (Karnataka - 29) accounts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
