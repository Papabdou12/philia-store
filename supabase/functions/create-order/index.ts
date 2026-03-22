// supabase/functions/create-order/index.ts
// Edge Function Supabase — Création de commande sécurisée
//
// Sécurités :
//   - Rate limiting : max 5 commandes / téléphone / 24h
//   - Recalcul des prix côté serveur (empêche la manipulation côté client)
//   - Validation du coupon côté serveur
//   - Coût de livraison lu depuis la base (pas envoyé par le client)
//   - Insertion via service_role → bypass RLS en toute sécurité

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// En production : définir ALLOWED_ORIGIN dans Supabase Edge Function secrets
//   npx supabase secrets set ALLOWED_ORIGIN=https://philiastore.sn
// En dev : '*' est utilisé par défaut
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? '*';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  // Répondre aux requêtes OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Méthode non autorisée' }, 405);
  }

  // Client Supabase avec service_role — bypasse le RLS pour les insertions
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const body = await req.json();
    const { customer, items, deliveryZone, paymentMethod, couponCode } = body;

    // ── Validation basique des champs requis ──────────────────────────────
    if (!customer?.phone || !customer?.email || !customer?.firstName || !customer?.lastName) {
      return json({ error: 'Informations client incomplètes' }, 400);
    }
    if (!Array.isArray(items) || items.length === 0) {
      return json({ error: 'Panier vide' }, 400);
    }
    if (!deliveryZone || !paymentMethod) {
      return json({ error: 'Zone de livraison ou méthode de paiement manquante' }, 400);
    }

    // ── 1. Rate limiting : max 5 commandes par téléphone en 24h ──────────
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recentOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('customer_phone', customer.phone)
      .gte('created_at', since24h);

    if ((recentOrders ?? 0) >= 5) {
      return json(
        { error: 'Trop de commandes depuis ce numéro. Réessayez dans 24h ou contactez le support.' },
        429,
      );
    }

    // ── 2. Récupérer les prix réels depuis la base de données ─────────────
    const productIds = items.map((i: { product_id: number }) => i.product_id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, sku, price, in_stock')
      .in('id', productIds);

    if (productsError) throw new Error('Impossible de charger les produits');

    const productMap = new Map(products!.map((p) => [p.id, p]));

    // Vérifier que tous les produits existent et sont en stock
    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) return json({ error: `Produit introuvable (id: ${item.product_id})` }, 400);
      if (!product.in_stock) return json({ error: `"${product.name}" est actuellement hors stock` }, 400);
      if (!item.quantity || item.quantity < 1) return json({ error: 'Quantité invalide' }, 400);
    }

    // ── 3. Calcul serveur du sous-total ───────────────────────────────────
    const subtotal = items.reduce((sum: number, item: { product_id: number; quantity: number }) => {
      const product = productMap.get(item.product_id)!;
      return sum + product.price * item.quantity;
    }, 0);

    // ── 4. Validation du coupon côté serveur ──────────────────────────────
    let discountAmount = 0;
    let validatedCoupon: { id: number; code: string; current_uses: number } | null = null;

    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', String(couponCode).toUpperCase().trim())
        .eq('is_active', true)
        .single();

      if (coupon) {
        const now = new Date();
        const validFrom = coupon.valid_from ? new Date(coupon.valid_from) : null;
        const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;
        const withinUses = !coupon.max_uses || (coupon.current_uses ?? 0) < coupon.max_uses;
        const withinDates =
          (!validFrom || now >= validFrom) && (!validUntil || now <= validUntil);
        const meetsMin = subtotal >= (coupon.min_order_amount ?? 0);

        if (withinUses && withinDates && meetsMin) {
          discountAmount =
            coupon.discount_type === 'percentage'
              ? Math.round((subtotal * coupon.discount_value) / 100)
              : coupon.discount_value;
          validatedCoupon = coupon;
        }
      }
    }

    // ── 5. Coût de livraison depuis la base de données ────────────────────
    const { data: zoneData } = await supabase
      .from('delivery_zones')
      .select('price, name')
      .eq('code', deliveryZone)
      .single();

    const deliveryCost = zoneData?.price ?? 0;
    const total = subtotal - discountAmount + deliveryCost;

    // ── 6. Génération du numéro de commande ───────────────────────────────
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `PH${dateStr}-${random}`;

    // ── 7. Insertion de la commande ───────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_name: `${customer.firstName} ${customer.lastName}`,
        delivery_address: customer.address,
        delivery_region: customer.region ?? deliveryZone,
        delivery_zone: deliveryZone,
        delivery_cost: deliveryCost,
        subtotal,
        discount_amount: discountAmount,
        coupon_code: validatedCoupon?.code ?? null,
        total,
        payment_method: paymentMethod,
        status: 'pending',
        notes: customer.notes ?? null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // ── 8. Insertion des articles ─────────────────────────────────────────
    const orderItems = items.map((item: {
      product_id: number;
      quantity: number;
      selectedColor?: string;
      selectedSize?: string;
    }) => {
      const product = productMap.get(item.product_id)!;
      return {
        order_id: order.id,
        product_id: item.product_id,
        product_name: product.name,
        product_sku: product.sku,
        quantity: item.quantity,
        unit_price: product.price,
        selected_color: item.selectedColor ?? null,
        selected_size: item.selectedSize ?? null,
      };
    });

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // ── 9. Incrémenter l'usage du coupon ──────────────────────────────────
    if (validatedCoupon) {
      await supabase
        .from('coupons')
        .update({ current_uses: (validatedCoupon.current_uses ?? 0) + 1 })
        .eq('id', validatedCoupon.id);
    }

    // ── Réponse succès ────────────────────────────────────────────────────
    return json({
      order_number: order.order_number,
      id: order.id,
      subtotal,
      discount_amount: discountAmount,
      delivery_cost: deliveryCost,
      total,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return json({ error: message }, 400);
  }
});
