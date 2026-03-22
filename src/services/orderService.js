import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Service pour gérer les commandes
 */

/**
 * Génère un numéro de commande unique
 */
const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PH${dateStr}-${random}`;
};

/**
 * Crée une nouvelle commande (Checkout)
 */
export const createOrder = async (orderData) => {
  const {
    customer,
    items,
    delivery,
    payment,
    coupon,
    subtotal,
    discountAmount,
    total,
  } = orderData;

  const orderNumber = generateOrderNumber();

  // Créer la commande
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_email: customer.email,
      customer_phone: customer.phone,
      customer_name: `${customer.firstName} ${customer.lastName}`,
      delivery_address: customer.address,
      delivery_region: delivery.region,
      delivery_zone: delivery.zone,
      delivery_cost: delivery.cost,
      subtotal,
      discount_amount: discountAmount || 0,
      coupon_code: coupon?.code || null,
      total,
      payment_method: payment.method,
      status: 'pending',
      notes: customer.notes || null,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Créer les articles de la commande
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    product_sku: item.sku,
    quantity: item.quantity,
    unit_price: item.price,
    selected_color: item.variant?.color || null,
    selected_size: item.variant?.size || null,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  // Incrémenter l'utilisation du coupon si applicable
  if (coupon?.code) {
    await supabase.rpc('increment_coupon_uses', { coupon_code: coupon.code });
  }

  return {
    orderNumber,
    ...order,
  };
};

/**
 * Récupère toutes les commandes (Admin)
 */
export const getOrders = async ({
  status = null,
  search = '',
  dateFrom = null,
  dateTo = null,
  sortBy = 'created_at',
  sortOrder = 'desc',
  page = 1,
  limit = 20,
} = {}) => {
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' });

  // Filtres
  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
  }

  if (dateFrom) {
    query = query.gte('created_at', dateFrom);
  }

  if (dateTo) {
    query = query.lte('created_at', dateTo);
  }

  // Tri
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    orders: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

/**
 * Récupère une commande par ID (Admin)
 */
export const getOrderById = async (id) => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError) throw orderError;

  // Récupérer les articles
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  if (itemsError) throw itemsError;

  return {
    ...order,
    items: items || [],
  };
};

/**
 * Met à jour le statut d'une commande (Admin)
 */
export const updateOrderStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Récupère les statistiques des commandes (Admin Dashboard)
 */
export const getOrderStats = async () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const weekStart = new Date(now.setDate(now.getDate() - 7)).toISOString();

  // Total des commandes
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  // Commandes aujourd'hui
  const { count: todayOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart);

  // Commandes ce mois
  const { count: monthOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', monthStart);

  // Commandes par statut
  const { data: statusCounts } = await supabase
    .from('orders')
    .select('status');

  const ordersByStatus = statusCounts?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {}) || {};

  // Chiffre d'affaires total
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total')
    .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

  const totalRevenue = revenueData?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;

  // CA aujourd'hui
  const { data: todayRevenueData } = await supabase
    .from('orders')
    .select('total')
    .gte('created_at', todayStart)
    .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

  const todayRevenue = todayRevenueData?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;

  // CA ce mois
  const { data: monthRevenueData } = await supabase
    .from('orders')
    .select('total')
    .gte('created_at', monthStart)
    .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

  const monthRevenue = monthRevenueData?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;

  // Commandes récentes
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // Ventes par jour (7 derniers jours)
  const { data: weeklyData } = await supabase
    .from('orders')
    .select('created_at, total')
    .gte('created_at', weekStart)
    .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

  const salesByDay = {};
  weeklyData?.forEach(order => {
    const day = new Date(order.created_at).toLocaleDateString('fr-FR', { weekday: 'short' });
    salesByDay[day] = (salesByDay[day] || 0) + parseFloat(order.total);
  });

  return {
    totalOrders: totalOrders || 0,
    todayOrders: todayOrders || 0,
    monthOrders: monthOrders || 0,
    ordersByStatus,
    totalRevenue,
    todayRevenue,
    monthRevenue,
    recentOrders: recentOrders || [],
    salesByDay,
  };
};

/**
 * Récupère les produits les plus vendus (Admin Dashboard)
 */
export const getTopProducts = async (limit = 5) => {
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      product_id,
      product_name,
      quantity
    `);

  if (error) throw error;

  // Agréger par produit
  const productSales = {};
  data?.forEach(item => {
    if (!productSales[item.product_id]) {
      productSales[item.product_id] = {
        id: item.product_id,
        name: item.product_name,
        totalSold: 0,
      };
    }
    productSales[item.product_id].totalSold += item.quantity;
  });

  // Trier et limiter
  return Object.values(productSales)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, limit);
};
