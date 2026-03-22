import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Settings,
  LogOut,
  X,
  Grid3X3,
  MessageSquare,
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Produits', path: '/admin/products', icon: Package },
  { label: 'Catégories', path: '/admin/categories', icon: Grid3X3 },
  { label: 'Commandes', path: '/admin/orders', icon: ShoppingCart },
  { label: 'Coupons', path: '/admin/coupons', icon: Tags },
  { label: 'Témoignages', path: '/admin/testimonials', icon: MessageSquare },
  { label: 'Paramètres', path: '/admin/settings', icon: Settings },
];

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50 flex flex-col
          bg-white dark:bg-[#0A0A0A]
          border-r border-gray-200 dark:border-bronze/20
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-bronze/20 shrink-0">
          <a href="/" target="_blank" rel="noopener noreferrer" className="group">
            <h1 className="text-xl font-serif text-gold tracking-widest group-hover:opacity-80 transition-opacity">PHILIA</h1>
            <p className="text-gray-400 dark:text-white/40 text-xs mt-1">Admin Panel</p>
          </a>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 dark:text-white/60 hover:text-gray-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation — scrollable */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer
                ${isActive
                  ? 'bg-gold/10 text-gold border border-gold/30'
                  : 'text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border border-transparent'
                }
              `}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}

        </nav>

        {/* Footer — Déconnexion */}
        <div className="shrink-0 p-4 border-t border-gray-200 dark:border-bronze/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
