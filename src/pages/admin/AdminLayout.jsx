import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

// Map des titres par route
const routeTitles = {
  '/admin': 'Dashboard',
  '/admin/products': 'Produits',
  '/admin/products/new': 'Nouveau Produit',
  '/admin/categories': 'Catégories',
  '/admin/orders': 'Commandes',
  '/admin/coupons': 'Coupons',
  '/admin/coupons/new': 'Nouveau Coupon',
  '/admin/settings': 'Paramètres & Livraison',
  '/admin/testimonials': 'Témoignages',
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isDark } = useTheme();

  const getTitle = () => {
    if (routeTitles[location.pathname]) return routeTitles[location.pathname];
    if (location.pathname.startsWith('/admin/products/')) return 'Modifier Produit';
    if (location.pathname.startsWith('/admin/orders/')) return 'Détail Commande';
    if (location.pathname.startsWith('/admin/coupons/')) return 'Modifier Coupon';
    return 'Administration';
  };

  return (
    <NotificationProvider>
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-50 dark:bg-black flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
            <Header title={getTitle()} onMenuClick={() => setSidebarOpen(true)} />

            <main className="flex-1 p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default AdminLayout;
