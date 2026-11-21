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
import BOMList from './pages/BOMList';
import Production from './pages/Production';
import Purchases from './pages/Purchases';
import Inventory from './pages/Inventory';
import Payments from './pages/Payments';
import Reports from './pages/Reports';

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
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['salesman', 'admin', 'production_supervisor', 'accountant_auditor', 'owner']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute allowedRoles={['salesman', 'admin', 'production_supervisor', 'accountant_auditor', 'owner']}>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute allowedRoles={['salesman', 'admin', 'accountant_auditor', 'owner']}>
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute allowedRoles={['admin', 'production_supervisor', 'accountant_auditor', 'owner']}>
                  <Suppliers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/materials"
              element={
                <ProtectedRoute allowedRoles={['admin', 'production_supervisor', 'accountant_auditor', 'owner']}>
                  <Materials />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={['salesman', 'admin', 'accountant_auditor', 'owner']}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/new"
              element={
                <ProtectedRoute allowedRoles={['salesman', 'admin', 'owner']}>
                  <NewOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute allowedRoles={['admin', 'accountant_auditor', 'owner']}>
                  <Invoices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bom"
              element={
                <ProtectedRoute allowedRoles={['admin', 'production_supervisor', 'accountant_auditor', 'owner']}>
                  <BOMList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/production"
              element={
                <ProtectedRoute allowedRoles={['admin', 'production_supervisor', 'accountant_auditor', 'owner']}>
                  <Production />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute allowedRoles={['admin', 'production_supervisor', 'accountant_auditor', 'owner']}>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchases"
              element={
                <ProtectedRoute allowedRoles={['admin', 'production_supervisor', 'accountant_auditor', 'owner']}>
                  <Purchases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute allowedRoles={['admin', 'accountant_auditor', 'owner']}>
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['admin', 'accountant_auditor', 'owner']}>
                  <Reports />
                </ProtectedRoute>
              }
            />
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
