import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Factory, UserCheck, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const demoAccounts = [
    { role: 'Salesman', email: 'salesman@nitfood.com', label: 'Salesman (Orders & Customers)' },
    { role: 'Admin', email: 'admin@nitfood.com', label: 'Admin (Approvals, Stock, Invoices)' },
    { role: 'Supervisor', email: 'supervisor@nitfood.com', label: 'Production Supervisor (BOM & Runs)' },
    { role: 'Auditor', email: 'auditor@nitfood.com', label: 'Accountant / Auditor (Read-only)' },
    { role: 'Owner', email: 'owner@nitfood.com', label: 'Owner (Executive Business Overview)' },
  ];

  const handleQuickFill = (accEmail) => {
    setEmail(accEmail);
    setPassword('Password@123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center text-amber-500 shadow-md">
            <Factory className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy-900 tracking-tight leading-tight">
              SRI MURUGAN FOODS
            </h1>
            <p className="text-xs font-semibold text-amber-600 tracking-wider uppercase">
              Order-to-Audit Management System
            </p>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">
          Centre for Digital Infrastructure, NIT Tiruchirappalli Internship Assignment
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-navy-900">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a demo role below or enter your authorized credentials.
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-rose-50 border-l-4 border-rose-500 p-3.5 rounded flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 leading-snug">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@nitfood.com"
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="block w-full pl-10 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-navy-900 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-70 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Fillers */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              Demo Role Fast-Login (Password: Password@123)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickFill(acc.email)}
                  className={`text-left px-2.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                    email === acc.email
                      ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="font-semibold text-navy-900">{acc.role}</div>
                  <div className="text-[10px] text-slate-500 truncate">{acc.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center text-[11px] text-slate-500">
          Factory Location: Tiruchirappalli, Tamil Nadu (State Code: 33) • GST Enabled
        </div>
      </div>
    </div>
  );
};

export default Login;
