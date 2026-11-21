import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Factory, LogOut, UserCheck, ChevronDown, Bell, Shield } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const demoRoles = [
    { name: 'Salesman', email: 'salesman@nitfood.com', role: 'salesman' },
    { name: 'Admin', email: 'admin@nitfood.com', role: 'admin' },
    { name: 'Production Supervisor', email: 'supervisor@nitfood.com', role: 'production_supervisor' },
    { name: 'Accountant / Auditor', email: 'auditor@nitfood.com', role: 'accountant_auditor' },
    { name: 'Owner', email: 'owner@nitfood.com', role: 'owner' },
  ];

  const handleQuickSwitchRole = async (email) => {
    setRoleMenuOpen(false);
    await login(email, 'Password@123');
    navigate('/dashboard');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'owner':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'salesman':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'production_supervisor':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'accountant_auditor':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatRoleLabel = (role) => {
    if (!role) return '';
    return role.replace('_', ' ').toUpperCase();
  };

  return (
    <header className="bg-navy-900 text-white sticky top-0 z-30 shadow-md">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Left: Brand & Mobile toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 focus:outline-none"
            aria-label="Toggle navigation"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-navy-900 shadow-sm font-bold">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">
                  SRI MURUGAN FOODS
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-navy-800 text-amber-400 border border-navy-700">
                  Tiruchirappalli (33)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Packaged Foods Order-to-Audit ERP
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Role Switcher (for demo/grading), User Profile, Logout */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs font-medium text-amber-400 border border-navy-700 transition-colors"
              title="Quickly switch role to test permissions"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Switch Role:</span>
              <span className="font-semibold text-white">{formatRoleLabel(user?.role)}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 z-50 border border-slate-200 text-slate-800">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Switch Active Role (Fast Demo)
                </div>
                {demoRoles.map((dr) => (
                  <button
                    key={dr.role}
                    onClick={() => handleQuickSwitchRole(dr.email)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-amber-50 transition-colors ${
                      user?.role === dr.role ? 'bg-amber-50 font-semibold text-navy-900' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div>{dr.name}</div>
                      <div className="text-[10px] text-slate-400">{dr.email}</div>
                    </div>
                    {user?.role === dr.role && (
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current User Badge */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-navy-800">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold text-white leading-tight">{user?.name}</div>
              <div className="text-[10px] text-slate-400">{user?.email}</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-navy-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-navy-700 transition-colors text-xs"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
