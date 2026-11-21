import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Materials from './pages/Materials';
import Orders from './pages/Orders';
import NewOrder from './pages/NewOrder';
import Invoices from './pages/Invoices';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Application Shell */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/materials" element={<Materials />} />

            {/* Placeholders for upcoming phases */}
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/new" element={<NewOrder />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/bom" element={<div className="p-6 bg-white rounded-xl border border-slate-200">Phase 4: Bill of Materials Module</div>} />
            <Route path="/production" element={<div className="p-6 bg-white rounded-xl border border-slate-200">Phase 4: Production Runs Module</div>} />
            <Route path="/inventory" element={<div className="p-6 bg-white rounded-xl border border-slate-200">Phase 4: Stock Ledger Module</div>} />
            <Route path="/purchases" element={<div className="p-6 bg-white rounded-xl border border-slate-200">Phase 4: Purchases Module</div>} />
            <Route path="/payments" element={<div className="p-6 bg-white rounded-xl border border-slate-200">Phase 5: Payments & Receivables Module</div>} />
            <Route path="/reports" element={<div className="p-6 bg-white rounded-xl border border-slate-200">Phase 6: Audit & Reports Module</div>} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
