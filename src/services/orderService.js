import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Service pour gérer les commandes
 */

/**
 * Crée une nouvelle commande via l'Edge Function Supabase.
 *
 * L'Edge Function effectue côté serveur :
 *   - Rate limiting (max 5 commandes / téléphone / 24h)
 *   - Recalcul des prix depuis la base (empêche la manipulation client)
 *   - Validation du coupon
 *   - Récupération du coût de livraison depuis delivery_zones
 *
 * Fallback : insertion directe si l'Edge Function n'est pas déployée.
 */
export const createOrder = async (orderData) => {
  const { customer, items, delivery, payment, coupon } = orderData;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

  // ── Appel Edge Function (prioritaire) ──────────────────────────────────
  if (supabaseUrl && supabaseKey) {
    const payload = {
      customer,
      items: items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        selectedColor: item.variant?.color ?? null,
        selectedSize: item.variant?.size ?? null,
      })),
      deliveryZone: delivery.zone,
      paymentMethod: payment.method,
      couponCode: coupon?.code ?? null,
    };

    const res = await fetch(`${supabaseUrl}/functions/v1/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.status === 429) {
      throw new Error(data.error || 'Trop de commandes. Réessayez dans 24h.');
    }
    if (!res.ok) {
      throw new Error(data.error || 'Erreur lors de la création de la commande');
    }

    return { order_number: data.order_number, ...data };
  }

  // ── Fallback : insertion directe (Edge Function non déployée) ──────────
  // ⚠️ Ce chemin n'effectue pas de recalcul serveur ni de rate limiting.
  // Déployer l'Edge Function avant la mise en production.
  const { subtotal, discountAmount, total } = orderData;
  const orderNumber = (() => {
    const d = new Date();
    const ds = d.toISOString().slice(2, 10).replace(/-/g, '');
    const r = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PH${ds}-${r}`;
  })();

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

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  if (coupon?.code) {
    await supabase.rpc('increment_coupon_uses', { coupon_code: coupon.code });
  }

  return { order_number: orderNumber, ...order };
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
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
  const PAID = ['confirmed', 'processing', 'shipped', 'delivered'];

  // Toutes les requêtes en parallèle
  const [
    { count: totalOrders },
    { count: todayOrders },
    { count: monthOrders },
    { data: statusCounts },
    { data: revenueData },
    { data: todayRevenueData },
    { data: monthRevenueData },
    { data: recentOrders },
    { data: weeklyData },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabase.from('orders').select('status'),
    supabase.from('orders').select('total').in('status', PAID),
    supabase.from('orders').select('total').gte('created_at', todayStart).in('status', PAID),
    supabase.from('orders').select('total').gte('created_at', monthStart).in('status', PAID),
    supabase.from('orders').select('id, order_number, customer_name, total, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('created_at, total').gte('created_at', weekStart).in('status', PAID),
  ]);

  const ordersByStatus = statusCounts?.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {}) || {};

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
    totalRevenue: revenueData?.reduce((s, o) => s + parseFloat(o.total), 0) || 0,
    todayRevenue: todayRevenueData?.reduce((s, o) => s + parseFloat(o.total), 0) || 0,
    monthRevenue: monthRevenueData?.reduce((s, o) => s + parseFloat(o.total), 0) || 0,
    recentOrders: recentOrders || [],
    salesByDay,
  };
};

/**
 * Récupère les produits les plus vendus (Admin Dashboard)
 */
export const getTopProducts = async (limit = 5) => {
  // Récupère seulement les N produits les plus commandés, triés côté DB
  const { data, error } = await supabase
    .from('order_items')
    .select('product_id, product_name, quantity')
    .order('quantity', { ascending: false })
    .limit(limit * 20); // marge pour l'agrégation JS

  if (error) throw error;

  const productSales = {};
  data?.forEach(item => {
    if (!productSales[item.product_id]) {
      productSales[item.product_id] = { id: item.product_id, name: item.product_name, totalSold: 0 };
    }
    productSales[item.product_id].totalSold += item.quantity;
  });

  return Object.values(productSales)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, limit);
};
