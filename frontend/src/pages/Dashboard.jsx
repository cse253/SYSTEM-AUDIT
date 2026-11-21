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
  CheckCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Calendar,
  DollarSign,
  Truck,
  Users,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Cell,
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
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/dashboard/summary');
      if (res.data && res.data.success) {
        setData(res.data);
      } else {
        throw new Error(res.data?.message || 'Failed to fetch dashboard metrics');
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.response?.data?.message || err.message || 'Unable to connect to ERP server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 font-semibold text-sm mt-4">Loading Real-time ERP Dashboard...</p>
        <p className="text-slate-400 text-xs mt-1">Aggregating live stock, sales & production data from MongoDB</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-xl mx-auto my-12 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-rose-900">Dashboard Data Unavailable</h2>
        <p className="text-xs text-rose-700 mt-2">{error}</p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={fetchSummary}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    todaysOrdersCount: 0,
    todaysOrdersValue: 0,
    totalOrdersCount: 0,
    monthlySalesTotal: 0,
    totalSalesTotal: 0,
    monthlyProductionUnits: 0,
    totalProductionUnits: 0,
    totalOutstandingReceivables: 0,
    rawMaterialValuation: 0,
    totalFinishedGoodsStock: 0,
    totalCollections: 0,
  };

  const alerts = data?.alerts || {
    lowStockProductsCount: 0,
    lowStockRawMaterialsCount: 0,
    lowStockPackagingCount: 0,
    varianceAlertsCount: 0,
    lowStockItems: [],
    varianceRuns: [],
  };

  const recent = data?.recentData || {
    recentOrders: [],
    recentInvoices: [],
    recentLedger: [],
    recentPayments: [],
  };

  const gst = data?.gstSummary || {
    taxableTurnover: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalGst: 0,
  };

  const roleData = data?.roleData || {};

  // Stock summary chart data with distinct brand colors
  const stockChartData = [
    { name: 'Finished (Pkts)', amount: summary.totalFinishedGoodsStock, fill: '#F59E0B' },
    { name: 'RM Val (₹100s)', amount: Math.round(summary.rawMaterialValuation / 100), fill: '#0F172A' },
    { name: 'Receivables (₹100s)', amount: Math.round(summary.totalOutstandingReceivables / 100), fill: '#D97706' },
  ];

  const roleName = user?.role ? user.role.replace('_', ' ') : 'User';

  return (
    <div className="space-y-6">
      {/* Top Banner with Role Welcome & Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase tracking-wider">
              {roleName} Portal
            </span>
            <span className="text-xs text-slate-400">• Factory: Tiruchirappalli, Tamil Nadu (State Code: 33)</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-1">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sri Murugan Traditional Foods • Order-to-Audit Management System (CDI NIT Tiruchirappalli)
          </p>
        </div>

        {/* Quick Action Buttons per Role */}
        <div className="flex items-center gap-2 flex-wrap">
          {['salesman', 'admin', 'owner'].includes(user?.role) && (
            <button
              onClick={() => navigate('/orders/new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-navy-900 font-semibold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Place New Sales Order
            </button>
          )}

          {['production_supervisor', 'admin', 'owner'].includes(user?.role) && (
            <button
              onClick={() => navigate('/production')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-amber-400 font-semibold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              <Factory className="w-4 h-4" />
              Production Batches
            </button>
          )}

          {['accountant_auditor', 'owner', 'admin'].includes(user?.role) && (
            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              Audit Reports (15)
            </button>
          )}

          <button
            onClick={fetchSummary}
            title="Refresh Live Metrics"
            className="p-2.5 text-slate-500 hover:text-navy-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Summary Cards Grid - Tailored per Role */}
      {user?.role === 'salesman' ? (
        /* Salesman KPI Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Today's Orders</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-navy-900">{summary.todaysOrdersCount}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Value: ₹{Number(summary.todaysOrdersValue).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">My Total Orders</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-navy-900">{roleData.myOrdersCount || summary.totalOrdersCount}</div>
              <p className="text-[11px] text-blue-600 mt-0.5 font-medium">Recorded in System</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Finished Goods Stock</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-navy-900">{summary.totalFinishedGoodsStock} pkts</div>
              <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">Ready for dispatch</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Customer Accounts</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-navy-900">{roleData.customerCount || 2} Active</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Tamil Nadu & Karnataka</p>
            </div>
          </div>
        </div>
      ) : user?.role === 'production_supervisor' ? (
        /* Production Supervisor KPI Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Monthly Production Output</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Factory className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-navy-900">{Number(summary.monthlyProductionUnits).toLocaleString()} pkts</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Murukku, Mixture & Sweets</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Production Batches</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-navy-900">{roleData.totalRunsCount || 1} Batch</div>
              <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">BOM executed</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Raw Material Valuation</span>
              <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-900 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-navy-900">₹{Number(summary.rawMaterialValuation).toLocaleString()}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Weighted Average Cost (WAC)</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Variance Alerts (&gt;3%)</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-amber-700">{alerts.varianceAlertsCount} Flagged</div>
              <p className="text-[11px] text-amber-800 mt-0.5 font-medium">Yield / RM Consumption</p>
            </div>
          </div>
        </div>
      ) : user?.role === 'accountant_auditor' ? (
        /* Accountant / Auditor KPI Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Invoiced Sales (GST Billed)</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-navy-900">₹{Number(summary.monthlySalesTotal).toLocaleString()}</div>
              <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">Taxable: ₹{Number(gst.taxableTurnover || 7500).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">GST Collected</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-navy-900">₹{Number(gst.totalGst || 375).toLocaleString()}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">CGST+SGST: ₹{gst.cgst + gst.sgst} | IGST: ₹{gst.igst}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Customer Outstanding</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-navy-900">₹{Number(summary.totalOutstandingReceivables).toLocaleString()}</div>
              <p className="text-[11px] text-amber-700 mt-0.5 font-medium">0-30 Days current</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Collections Recorded</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-navy-900">₹{Number(summary.totalCollections || 4000).toLocaleString()}</div>
              <p className="text-[11px] text-blue-600 mt-0.5 font-medium">NEFT / Bank Remittance</p>
            </div>
          </div>
        </div>
      ) : (
        /* Owner & Admin Full KPI Overview */
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
                Value: ₹{Number(summary.todaysOrdersValue).toLocaleString()} ({summary.totalOrdersCount} Total)
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
      )}

      {/* Middle Grid: Operational Inventory Status & Live Alerts */}
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
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 cursor-pointer"
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

          {/* Minimal Clean Bar Chart with Cell Colors */}
          <div className="h-48 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {stockChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
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
                <div className="p-6 text-center text-xs text-slate-400">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All stock levels & production yield variances are currently within safe limits.
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
                          {v.productName}: {v.yieldVariance > 0 ? `+${v.yieldVariance}` : v.yieldVariance}% yield variance (exceeds ±3% limit)
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Threshold limit: ±3.0%</span>
            <button
              onClick={() => navigate('/production')}
              className="text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
            >
              Review Batches &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section: Sales Orders, Invoices & Stock Movement Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-navy-900">Recent Enterprise Transactions</h2>
            <p className="text-xs text-slate-500">Live transaction stream across sales, invoicing and inventory ledgers</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'orders' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sales Orders ({recent.recentOrders?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'invoices' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Invoices ({recent.recentInvoices?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ledger' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Stock Ledger ({recent.recentLedger?.length || 0})
            </button>
          </div>
        </div>

        {/* Tab 1: Recent Sales Orders Table */}
        {activeTab === 'orders' && (
          <div className="mt-4 overflow-x-auto">
            {recent.recentOrders?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No recent sales orders found.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Order Number</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Salesman</th>
                    <th className="py-2.5 px-3">Total Amount</th>
                    <th className="py-2.5 px-3">Tax Type</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent.recentOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-navy-900">{o.orderNumber}</td>
                      <td className="py-2.5 px-3 text-slate-700">{o.customer?.name || 'Customer'}</td>
                      <td className="py-2.5 px-3 text-slate-500">{o.salesman?.name || 'Sales Staff'}</td>
                      <td className="py-2.5 px-3 font-bold text-navy-900">₹{Number(o.grandTotal).toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {o.isInterState ? 'IGST 5%' : 'CGST+SGST 5%'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            o.status === 'Dispatched'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'Invoiced'
                              ? 'bg-blue-100 text-blue-800'
                              : o.status === 'Approved'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Recent GST Invoices Table */}
        {activeTab === 'invoices' && (
          <div className="mt-4 overflow-x-auto">
            {recent.recentInvoices?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No recent GST invoices generated yet.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Invoice Number</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Taxable Value</th>
                    <th className="py-2.5 px-3">Grand Total</th>
                    <th className="py-2.5 px-3">Balance Due</th>
                    <th className="py-2.5 px-3">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent.recentInvoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-navy-900">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-3 text-slate-700">{inv.customerName || inv.customer?.name}</td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">₹{Number(inv.taxableAmount).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-bold text-navy-900">₹{Number(inv.grandTotal).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-semibold text-rose-600">₹{Number(inv.balanceDue).toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            inv.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.paymentStatus === 'Partially Paid'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Recent Stock Ledger Movements */}
        {activeTab === 'ledger' && (
          <div className="mt-4 overflow-x-auto">
            {recent.recentLedger?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No stock ledger transactions found.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Movement Type</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Balance After</th>
                    <th className="py-2.5 px-3">Doc Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent.recentLedger.map((sl) => (
                    <tr key={sl._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-navy-900">{sl.itemName}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                          {sl.itemCategory?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">{sl.movementType}</td>
                      <td className="py-2.5 px-3 font-bold">
                        <span className={sl.direction > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {sl.direction > 0 ? `+${sl.quantity}` : `-${sl.quantity}`} {sl.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-navy-900">
                        {sl.balanceAfter} {sl.unit}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">
                        {sl.sourceDocumentNumber || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Role-Specific Quick Link Navigation Cards */}
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
            Flour, Oil, Spice mix, Pouches, and Cartons inventory valuation.
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
