import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Service pour gérer les coupons promotionnels
 */

// Coupons par défaut (fallback)
const defaultCoupons = {
  BIENVENUE: { type: 'percentage', value: 15 },
  FLASH25: { type: 'percentage', value: 25 },
  PROMO10K: { type: 'fixed', value: 10000 },
};

/**
 * Valide un code coupon
 * @param {string} code - Code coupon
 * @param {number} cartTotal - Total du panier
 * @returns {Promise<{valid: boolean, coupon?: object, error?: string}>}
 */
export const validateCoupon = async (code, cartTotal) => {
  const upperCode = code.toUpperCase().trim();

  // Mode fallback
  if (!isSupabaseConfigured()) {
    const fallbackCoupon = defaultCoupons[upperCode];
    if (fallbackCoupon) {
      return {
        valid: true,
        coupon: {
          code: upperCode,
          discount_type: fallbackCoupon.type,
          discount_value: fallbackCoupon.value,
        },
        discount: calculateDiscount(fallbackCoupon.type, fallbackCoupon.value, cartTotal),
      };
    }
    return { valid: false, error: 'Code promo invalide' };
  }

  try {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', upperCode)
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      return { valid: false, error: 'Code promo invalide' };
    }

    // Vérifier la validité temporelle
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return { valid: false, error: 'Ce code n\'est pas encore actif' };
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return { valid: false, error: 'Ce code a expiré' };
    }

    // Vérifier le nombre d'utilisations
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return { valid: false, error: 'Ce code a atteint sa limite d\'utilisation' };
    }

    // Vérifier le montant minimum
    if (coupon.min_order_amount && cartTotal < coupon.min_order_amount) {
      return {
        valid: false,
        error: `Montant minimum requis: ${coupon.min_order_amount.toLocaleString()} FCFA`,
      };
    }

    const discount = calculateDiscount(coupon.discount_type, coupon.discount_value, cartTotal);

    return {
      valid: true,
      coupon,
      discount,
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, error: 'Erreur lors de la validation' };
  }
};

/**
 * Calcule le montant de la réduction
 */
const calculateDiscount = (type, value, cartTotal) => {
  if (type === 'percentage') {
    return Math.round(cartTotal * (value / 100));
  }
  return Math.min(value, cartTotal); // Fixed amount, max = cart total
};

/**
 * Récupère tous les coupons (Admin)
 */
export const getCoupons = async ({
  isActive = null,
  search = '',
  page = 1,
  limit = 20,
} = {}) => {
  let query = supabase
    .from('coupons')
    .select('*', { count: 'exact' });

  if (isActive !== null) {
    query = query.eq('is_active', isActive);
  }

  if (search) {
    query = query.ilike('code', `%${search}%`);
  }

  query = query.order('created_at', { ascending: false });

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    coupons: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

/**
 * Récupère un coupon par ID (Admin)
 */
export const getCouponById = async (id) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Crée un nouveau coupon (Admin)
 */
export const createCoupon = async (couponData) => {
  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code: couponData.code.toUpperCase().trim(),
      discount_type: couponData.discountType,
      discount_value: couponData.discountValue,
      min_order_amount: couponData.minOrderAmount || 0,
      max_uses: couponData.maxUses || null,
      valid_from: couponData.validFrom || null,
      valid_until: couponData.validUntil || null,
      is_active: couponData.isActive ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Met à jour un coupon (Admin)
 */
export const updateCoupon = async (id, couponData) => {
  const updateData = {};

  if (couponData.code !== undefined) {
    updateData.code = couponData.code.toUpperCase().trim();
  }
  if (couponData.discountType !== undefined) {
    updateData.discount_type = couponData.discountType;
  }
  if (couponData.discountValue !== undefined) {
    updateData.discount_value = couponData.discountValue;
  }
  if (couponData.minOrderAmount !== undefined) {
    updateData.min_order_amount = couponData.minOrderAmount;
  }
  if (couponData.maxUses !== undefined) {
    updateData.max_uses = couponData.maxUses;
  }
  if (couponData.validFrom !== undefined) {
    updateData.valid_from = couponData.validFrom;
  }
  if (couponData.validUntil !== undefined) {
    updateData.valid_until = couponData.validUntil;
  }
  if (couponData.isActive !== undefined) {
    updateData.is_active = couponData.isActive;
  }

  const { data, error } = await supabase
    .from('coupons')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Supprime un coupon (Admin)
 */
export const deleteCoupon = async (id) => {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

/**
 * Active/désactive un coupon (Admin)
 */
export const toggleCouponStatus = async (id, isActive) => {
  return updateCoupon(id, { isActive });
};
