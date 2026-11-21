import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCheck, Shield, CheckCircle2 } from 'lucide-react';

const DashboardPlaceholder = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
              Phase 1 Verified
            </span>
            <h1 className="text-2xl font-bold text-navy-900 mt-2">
              Sri Murugan Traditional Foods ERP
            </h1>
            <p className="text-sm text-slate-500">
              Order-to-Audit Management System • NIT Tiruchirappalli Internship
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* User Card */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-navy-900 flex items-center justify-center text-amber-400 font-bold text-xl">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-navy-900">{user?.name}</h2>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  Role: <strong className="uppercase">{user?.role}</strong>
                </span>
                <span>•</span>
                <span>Phone: {user?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Phase 1 Deliverables Status:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-navy-900">1. Database Connection:</span>
                <p className="text-slate-500 mt-0.5">MongoDB 8.3 connected at port 27017</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-navy-900">2. Mongoose Schemas:</span>
                <p className="text-slate-500 mt-0.5">All 15 domain models generated & indexed</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-navy-900">3. Authentication & RBAC:</span>
                <p className="text-slate-500 mt-0.5">JWT tokens, bcrypt password hashing, auth middleware</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-navy-900">4. Seeded Roles:</span>
                <p className="text-slate-500 mt-0.5">Salesman, Admin, Supervisor, Auditor, Owner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPlaceholder;
