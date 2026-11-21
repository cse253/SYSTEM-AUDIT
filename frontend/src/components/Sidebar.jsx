import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  PlusCircle,
  FileText,
  Users,
  Package,
  Layers,
  Factory,
  Boxes,
  Truck,
  CreditCard,
  BarChart3,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role;

  // Define navigation sections and their allowed roles
  const navItems = [
    {
      title: 'Core Operations',
      items: [
        {
          name: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          roles: ['salesman', 'admin', 'production_supervisor', 'accountant_auditor', 'owner'],
        },
        {
          name: 'New Order',
          path: '/orders/new',
          icon: PlusCircle,
          roles: ['salesman', 'admin'],
          badge: 'Fast',
        },
        {
          name: 'Sales Orders',
          path: '/orders',
          icon: ShoppingCart,
          roles: ['salesman', 'admin', 'accountant_auditor', 'owner'],
        },
        {
          name: 'GST Invoices',
          path: '/invoices',
          icon: FileText,
          roles: ['admin', 'accountant_auditor', 'owner'],
        },
      ],
    },
    {
      title: 'Production & Inventory',
      items: [
        {
          name: 'Bill of Materials (BOM)',
          path: '/bom',
          icon: Layers,
          roles: ['admin', 'production_supervisor', 'accountant_auditor', 'owner'],
        },
        {
          name: 'Production Runs',
          path: '/production',
          icon: Factory,
          roles: ['admin', 'production_supervisor', 'accountant_auditor', 'owner'],
        },
        {
          name: 'Stock & Inventory',
          path: '/inventory',
          icon: Boxes,
          roles: ['admin', 'production_supervisor', 'accountant_auditor', 'owner'],
        },
        {
          name: 'Purchases',
          path: '/purchases',
          icon: Truck,
          roles: ['admin', 'production_supervisor', 'accountant_auditor', 'owner'],
        },
      ],
    },
    {
      title: 'Master Data & Partners',
      items: [
        {
          name: 'Products & Pricing',
          path: '/products',
          icon: Package,
          roles: ['salesman', 'admin', 'production_supervisor', 'accountant_auditor', 'owner'],
        },
        {
          name: 'Customers',
          path: '/customers',
          icon: Users,
          roles: ['salesman', 'admin', 'accountant_auditor', 'owner'],
        },
        {
          name: 'Suppliers',
          path: '/suppliers',
          icon: Truck,
          roles: ['admin', 'production_supervisor', 'accountant_auditor', 'owner'],
        },
        {
          name: 'Materials (RM & Pkg)',
          path: '/materials',
          icon: Boxes,
          roles: ['admin', 'production_supervisor', 'accountant_auditor', 'owner'],
        },
      ],
    },
    {
      title: 'Finance & Audit',
      items: [
        {
          name: 'Payments & Receivables',
          path: '/payments',
          icon: CreditCard,
          roles: ['admin', 'accountant_auditor', 'owner'],
        },
        {
          name: 'Audit & Reports (15)',
          path: '/reports',
          icon: BarChart3,
          roles: ['admin', 'accountant_auditor', 'owner'],
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navItems.map((section, sIdx) => {
            // Filter items visible to current role
            const visibleItems = section.items.filter((item) => item.roles.includes(role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx}>
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
                <div className="space-y-1">
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-amber-50 text-navy-900 font-semibold border-l-4 border-amber-500 shadow-xs'
                            : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className="w-4 h-4 text-slate-500 group-hover:text-navy-900" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-navy-900">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Auditor Read-only indicator */}
        {role === 'accountant_auditor' && (
          <div className="p-3 m-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold mb-0.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Auditor Read-Only
            </div>
            <p className="text-[11px] text-amber-800">
              Export permitted. Direct ledger modifications restricted.
            </p>
          </div>
        )}

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
          NIT Tiruchirappalli CDI ERP • v1.0
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
