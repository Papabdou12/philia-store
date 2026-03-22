import React from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ScrollToTop from '@/components/ScrollToTop';
import AnnouncementBar from '@/components/AnnouncementBar';
import StickyNavbar from '@/components/StickyNavbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Toaster } from '@/components/ui/toaster';

// Pages publiques
import HomePage from '@/pages/HomePage';
import ShopPage from '@/pages/ShopPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import PromoPage from '@/pages/PromoPage';
import WishlistPage from '@/pages/WishlistPage';
import DeliveryPage from '@/pages/DeliveryPage';
import ReturnsPage from '@/pages/ReturnsPage';
import CGVPage from '@/pages/CGVPage';

// Pages admin
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminLayout from '@/pages/admin/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import ProductList from '@/pages/admin/products/ProductList';
import ProductForm from '@/pages/admin/products/ProductForm';
import OrderList from '@/pages/admin/orders/OrderList';
import OrderDetail from '@/pages/admin/orders/OrderDetail';
import CouponList from '@/pages/admin/coupons/CouponList';
import CouponForm from '@/pages/admin/coupons/CouponForm';
import AdminSettings from '@/pages/admin/Settings';
import CategoryList from '@/pages/admin/categories/CategoryList';
import TestimonialList from '@/pages/admin/testimonials/TestimonialList';

// Layout pour les pages publiques (avec navbar, footer, etc.)
const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <StickyNavbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

// Composant pour déterminer si on est sur une route admin
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Routes>
        {/* Admin Login (sans protection) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Routes Admin protégées */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="coupons" element={<CouponList />} />
          <Route path="coupons/new" element={<CouponForm />} />
          <Route path="coupons/:id" element={<CouponForm />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="testimonials" element={<TestimonialList />} />
        </Route>
      </Routes>
    );
  }

  return (
    <PublicLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/boutique" element={<ShopPage />} />
        <Route path="/produit/:id" element={<ProductDetailPage />} />
        <Route path="/panier" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/a-propos" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/promos" element={<PromoPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/livraison" element={<DeliveryPage />} />
        <Route path="/retours" element={<ReturnsPage />} />
        <Route path="/cgv" element={<CGVPage />} />
      </Routes>
    </PublicLayout>
  );
};

function App() {
  return (
    <AppProvider>
      <AdminAuthProvider>
        <ThemeProvider>
          <Router>
            <ScrollToTop />
            <AppContent />
            <Toaster />
          </Router>
        </ThemeProvider>
      </AdminAuthProvider>
    </AppProvider>
  );
}

export default App;
