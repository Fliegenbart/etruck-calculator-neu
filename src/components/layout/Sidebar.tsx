import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, LayoutDashboard, Calculator, GitCompare, Activity, FileText, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calculator', icon: Calculator, label: 'Rechner' },
  { to: '/scenarios', icon: GitCompare, label: 'Szenarien' },
  { to: '/sensitivity', icon: Activity, label: 'Sensitivität' },
  { to: '/report', icon: FileText, label: 'Report' },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-slate-200"
      >
        {mobileOpen ? <X className="w-6 h-6 text-slate-600" /> : <Menu className="w-6 h-6 text-slate-600" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : '-100%' }}
        className={`fixed lg:static lg:translate-x-0 inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col transition-transform lg:transition-none`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">E-Truck TCO</h1>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Pro</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl p-4">
            <p className="text-sm text-emerald-300 font-medium">Datenstand: Januar 2026</p>
            <p className="text-xs text-slate-400 mt-1">Quellen: BAG, BMWK, KBA</p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
