import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Service pour les analytics et rapports
 */

/**
 * Récupère les statistiques de ventes par période
 */
export const getSalesStats = async (period = 'week') => {
  if (!isSupabaseConfigured()) {
    return getDemoSalesStats(period);
  }

  const now = new Date();
  let startDate;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 7));
  }

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('created_at, total, status')
      .gte('created_at', startDate.toISOString())
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

    if (error) throw error;

    // Grouper par jour
    const salesByDay = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('fr-FR');
      if (!salesByDay[date]) {
        salesByDay[date] = { revenue: 0, orders: 0 };
      }
      salesByDay[date].revenue += parseFloat(order.total);
      salesByDay[date].orders += 1;
    });

    return {
      period,
      startDate: startDate.toISOString(),
      data: salesByDay,
      totalRevenue: orders.reduce((sum, o) => sum + parseFloat(o.total), 0),
      totalOrders: orders.length,
    };
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    return getDemoSalesStats(period);
  }
};

/**
 * Récupère les ventes par catégorie
 */
export const getSalesByCategory = async () => {
  if (!isSupabaseConfigured()) {
    return getDemoSalesByCategory();
  }

  try {
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        unit_price,
        product:products(category:categories(name, code))
      `);

    if (error) throw error;

    // Grouper par catégorie
    const byCategory = {};
    orderItems.forEach(item => {
      const categoryName = item.product?.category?.name || 'Autre';
      if (!byCategory[categoryName]) {
        byCategory[categoryName] = { revenue: 0, quantity: 0 };
      }
      byCategory[categoryName].revenue += item.quantity * item.unit_price;
      byCategory[categoryName].quantity += item.quantity;
    });

    return Object.entries(byCategory).map(([name, data]) => ({
      name,
      ...data,
    })).sort((a, b) => b.revenue - a.revenue);
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    return getDemoSalesByCategory();
  }
};

/**
 * Récupère l'historique des stocks
 */
export const getStockHistory = async (productId = null, limit = 50) => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    let query = supabase
      .from('stock_history')
      .select(`
        *,
        product:products(name, sku)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching stock history:', error);
    return [];
  }
};

/**
 * Récupère les alertes de stock actives
 */
export const getStockAlerts = async () => {
  if (!isSupabaseConfigured()) {
    return getDemoStockAlerts();
  }

  try {
    const { data, error } = await supabase
      .from('stock_alerts')
      .select(`
        *,
        product:products(id, name, sku, image_url, stock_quantity)
      `)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    return getDemoStockAlerts();
  }
};

/**
 * Résout une alerte de stock
 */
export const resolveStockAlert = async (alertId) => {
  const { error } = await supabase
    .from('stock_alerts')
    .update({ is_resolved: true, resolved_at: new Date().toISOString() })
    .eq('id', alertId);

  if (error) throw error;
  return true;
};

/**
 * Récupère l'historique des prix d'un produit
 */
export const getPriceHistory = async (productId) => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('product_id', productId)
      .order('changed_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching price history:', error);
    return [];
  }
};

/**
 * Récupère les KPIs principaux
 */
export const getKPIs = async () => {
  if (!isSupabaseConfigured()) {
    return getDemoKPIs();
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

  const PAID = ['confirmed', 'processing', 'shipped', 'delivered'];

  try {
    // Toutes les requêtes en parallèle
    const [
      { count: monthOrders },
      { count: lastMonthOrders },
      { data: monthRevenueData },
      { data: lastMonthRevenueData },
      { data: soldProducts },
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
      supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', lastMonthStart).lte('created_at', lastMonthEnd),
      supabase.from('orders').select('total').gte('created_at', monthStart).in('status', PAID),
      supabase.from('orders').select('total').gte('created_at', lastMonthStart).lte('created_at', lastMonthEnd).in('status', PAID),
      supabase.from('order_items').select('quantity, order:orders!inner(created_at)').gte('order.created_at', monthStart),
    ]);

    const monthRevenue = monthRevenueData?.reduce((s, o) => s + parseFloat(o.total), 0) || 0;
    const lastMonthRevenue = lastMonthRevenueData?.reduce((s, o) => s + parseFloat(o.total), 0) || 0;
    const totalSold = soldProducts?.reduce((s, i) => s + i.quantity, 0) || 0;

    // Taux de conversion (simulé)
    const conversionRate = monthOrders > 0 ? Math.min(((monthOrders / 100) * 100), 15).toFixed(1) : 0;

    // Panier moyen
    const avgOrderValue = monthOrders > 0 ? Math.round(monthRevenue / monthOrders) : 0;

    return {
      monthOrders: monthOrders || 0,
      orderGrowth: lastMonthOrders > 0 ? (((monthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1) : 0,
      monthRevenue,
      revenueGrowth: lastMonthRevenue > 0 ? (((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1) : 0,
      totalSold,
      conversionRate,
      avgOrderValue,
    };
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return getDemoKPIs();
  }
};

// ============================================
// DONNÉES DEMO (mode hors ligne)
// ============================================

const getDemoSalesStats = (period) => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const data = {};
  days.forEach((day, i) => {
    data[day] = {
      revenue: Math.floor(Math.random() * 500000) + 100000,
      orders: Math.floor(Math.random() * 15) + 5,
    };
  });

  return {
    period,
    data,
    totalRevenue: Object.values(data).reduce((s, d) => s + d.revenue, 0),
    totalOrders: Object.values(data).reduce((s, d) => s + d.orders, 0),
  };
};

const getDemoSalesByCategory = () => [
  { name: 'Mode & Vêtements', revenue: 1850000, quantity: 145 },
  { name: 'Beauté & Soin', revenue: 920000, quantity: 89 },
  { name: 'Technologie', revenue: 1250000, quantity: 32 },
  { name: 'Maison & Déco', revenue: 680000, quantity: 54 },
  { name: 'Enfants & Jouets', revenue: 420000, quantity: 67 },
  { name: 'Sport & Fitness', revenue: 380000, quantity: 41 },
];

const getDemoStockAlerts = () => [
  { id: 1, alert_type: 'low_stock', current_stock: 3, product: { id: 1, name: 'Robe Wax Élégante', sku: 'MODE-001' } },
  { id: 2, alert_type: 'out_of_stock', current_stock: 0, product: { id: 45, name: 'Sérum Vitamine C', sku: 'BEAUTE-012' } },
  { id: 3, alert_type: 'low_stock', current_stock: 2, product: { id: 78, name: 'Écouteurs Bluetooth', sku: 'TECH-005' } },
];

const getDemoKPIs = () => ({
  monthOrders: 89,
  orderGrowth: 12.5,
  monthRevenue: 4850000,
  revenueGrowth: 8.3,
  totalSold: 428,
  conversionRate: 3.2,
  avgOrderValue: 54494,
});
