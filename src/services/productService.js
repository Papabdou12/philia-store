import { supabase, uploadFile, deleteFile, isSupabaseConfigured } from '@/lib/supabase';
import { products as fallbackProducts } from '@/lib/productData';

// Catégories par défaut (fallback)
const fallbackCategories = [
  { id: 1, name: 'Mode & Vêtements', code: 'mode', emoji: '👗' },
  { id: 2, name: 'Beauté & Soin', code: 'beaute', emoji: '💄' },
  { id: 3, name: 'Technologie', code: 'tech', emoji: '📱' },
  { id: 4, name: 'Maison & Déco', code: 'maison', emoji: '🏠' },
  { id: 5, name: 'Enfants & Jouets', code: 'enfants', emoji: '🧸' },
  { id: 6, name: 'Sport & Fitness', code: 'sport', emoji: '🏋️' },
];

/**
 * Service pour gérer les produits
 */

/**
 * Récupère tous les produits avec filtres et pagination
 */
/**
 * Normalise le champ image d'un produit Supabase vers une string URL
 * ProductCard attend product.image (string), Supabase retourne product.images[{image_url}]
 */
const normalizeProductImage = (product) => {
  if (!product) return product;
  if (product.image) return product; // déjà normalisé (données statiques fallback)
  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    null;
  return { ...product, image: primaryImage };
};

export const getProducts = async ({
  category = null,
  search = '',
  minPrice = null,
  maxPrice = null,
  inStock = null,
  isNew = null,
  sortBy = 'created_at',
  sortOrder = 'desc',
  page = 1,
  limit = 20,
} = {}) => {
  // Mode fallback si Supabase non configuré
  if (!isSupabaseConfigured()) {
    return getFallbackProducts({ category, search, minPrice, maxPrice, inStock, isNew, sortBy, sortOrder, page, limit });
  }

  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, code),
        images:product_images(id, image_url, is_primary, sort_order),
        variants:product_variants(id, variant_type, variant_value)
      `, { count: 'exact' });

    // Filtres
    if (category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('code', category)
        .single();
      if (cat) {
        query = query.eq('category_id', cat.id);
      }
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (minPrice !== null) {
      query = query.gte('price', minPrice);
    }

    if (maxPrice !== null) {
      query = query.lte('price', maxPrice);
    }

    if (inStock !== null) {
      query = query.eq('in_stock', inStock);
    }

    if (isNew !== null) {
      query = query.eq('is_new', isNew);
    }

    // Tri
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // Normalise le champ `image` depuis product_images (compatibilité ProductCard)
    const products = (data || []).map(normalizeProductImage);

    return {
      products,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return getFallbackProducts({ category, search, minPrice, maxPrice, inStock, isNew, sortBy, sortOrder, page, limit });
  }
};

/**
 * Récupère un produit par ID
 */
export const getProductById = async (id) => {
  if (!isSupabaseConfigured()) {
    const product = fallbackProducts.find(p => p.id === parseInt(id));
    return product || null;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, code),
        images:product_images(id, image_url, is_primary, sort_order),
        variants:product_variants(id, variant_type, variant_value)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return normalizeProductImage(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    const product = fallbackProducts.find(p => p.id === parseInt(id));
    return product || null;
  }
};

/**
 * Crée un nouveau produit (Admin)
 */
export const createProduct = async (productData) => {
  const { images, variants, ...product } = productData;

  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) throw error;

  // Ajouter les images
  if (images && images.length > 0) {
    const imageRecords = images.map((img, index) => ({
      product_id: data.id,
      image_url: img.url,
      is_primary: index === 0,
      sort_order: index,
    }));

    await supabase.from('product_images').insert(imageRecords);
  }

  // Ajouter les variants
  if (variants) {
    const variantRecords = [];
    if (variants.colors) {
      variants.colors.forEach(color => {
        variantRecords.push({
          product_id: data.id,
          variant_type: 'color',
          variant_value: color,
        });
      });
    }
    if (variants.sizes) {
      variants.sizes.forEach(size => {
        variantRecords.push({
          product_id: data.id,
          variant_type: 'size',
          variant_value: size,
        });
      });
    }

    if (variantRecords.length > 0) {
      await supabase.from('product_variants').insert(variantRecords);
    }
  }

  return getProductById(data.id);
};

/**
 * Met à jour un produit (Admin)
 */
export const updateProduct = async (id, productData) => {
  const { images, variants, category, ...product } = productData;

  // Mise à jour du produit
  const { error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id);

  if (error) throw error;

  // Mettre à jour les images si fournies
  if (images !== undefined) {
    // Supprimer les anciennes images
    await supabase.from('product_images').delete().eq('product_id', id);

    // Ajouter les nouvelles
    if (images.length > 0) {
      const imageRecords = images.map((img, index) => ({
        product_id: id,
        image_url: typeof img === 'string' ? img : img.url,
        is_primary: index === 0,
        sort_order: index,
      }));

      await supabase.from('product_images').insert(imageRecords);
    }
  }

  // Mettre à jour les variants si fournis
  if (variants !== undefined) {
    // Supprimer les anciens variants
    await supabase.from('product_variants').delete().eq('product_id', id);

    // Ajouter les nouveaux
    const variantRecords = [];
    if (variants.colors) {
      variants.colors.forEach(color => {
        variantRecords.push({
          product_id: id,
          variant_type: 'color',
          variant_value: color,
        });
      });
    }
    if (variants.sizes) {
      variants.sizes.forEach(size => {
        variantRecords.push({
          product_id: id,
          variant_type: 'size',
          variant_value: size,
        });
      });
    }

    if (variantRecords.length > 0) {
      await supabase.from('product_variants').insert(variantRecords);
    }
  }

  return getProductById(id);
};

/**
 * Supprime un produit (Admin)
 */
export const deleteProduct = async (id) => {
  // Récupérer les images pour les supprimer du storage
  const { data: images } = await supabase
    .from('product_images')
    .select('image_url')
    .eq('product_id', id);

  // Supprimer les images du storage
  if (images) {
    for (const img of images) {
      if (img.image_url.includes('supabase')) {
        await deleteFile(img.image_url);
      }
    }
  }

  // Supprimer le produit (cascade supprime images et variants)
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

/**
 * Upload une image produit
 */
export const uploadProductImage = async (file) => {
  return uploadFile(file, 'products');
};

/**
 * Récupère toutes les catégories
 */
export const getCategories = async () => {
  if (!isSupabaseConfigured()) {
    return fallbackCategories;
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || fallbackCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return fallbackCategories;
  }
};

/**
 * Créer une catégorie
 */
export const createCategory = async (data) => {
  const { data: cat, error } = await supabase
    .from('categories')
    .insert([{ name: data.name, code: data.code, emoji: data.emoji || null, sort_order: data.sort_order || 0, is_active: data.is_active ?? true }])
    .select()
    .single();
  if (error) throw error;
  return cat;
};

/**
 * Modifier une catégorie
 */
export const updateCategory = async (id, data) => {
  const { data: cat, error } = await supabase
    .from('categories')
    .update({ name: data.name, code: data.code, emoji: data.emoji || null, sort_order: data.sort_order ?? 0, is_active: data.is_active ?? true })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return cat;
};

/**
 * Supprimer une catégorie
 */
export const deleteCategory = async (id) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
};

/**
 * Produits vedettes (rating >= 4.5)
 */
export const getFeaturedProducts = async (limit = 8) => {
  if (!isSupabaseConfigured()) {
    return fallbackProducts
      .filter(p => p.rating >= 4.5)
      .slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, code)
      `)
      .gte('rating', 4.5)
      .eq('in_stock', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return fallbackProducts.filter(p => p.rating >= 4.5).slice(0, limit);
  }
};

/**
 * Nouveaux produits
 */
export const getNewProducts = async (limit = 8) => {
  if (!isSupabaseConfigured()) {
    return fallbackProducts
      .filter(p => p.isNew)
      .slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, code)
      `)
      .eq('is_new', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching new products:', error);
    return fallbackProducts.filter(p => p.isNew).slice(0, limit);
  }
};

/**
 * Produits en promotion
 */
export const getFlashSaleProducts = async (limit = 8) => {
  if (!isSupabaseConfigured()) {
    return fallbackProducts
      .filter(p => p.discount > 0)
      .sort((a, b) => b.discount - a.discount)
      .slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, code)
      `)
      .gt('discount', 0)
      .order('discount', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching flash sale products:', error);
    return fallbackProducts.filter(p => p.discount > 0).slice(0, limit);
  }
};

/**
 * Produits similaires (même catégorie)
 */
export const getRelatedProducts = async (productId, limit = 4) => {
  const product = await getProductById(productId);
  if (!product) return [];

  if (!isSupabaseConfigured()) {
    return fallbackProducts
      .filter(p => p.category === product.category && p.id !== productId)
      .slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, code)
      `)
      .eq('category_id', product.category_id)
      .neq('id', productId)
      .limit(limit);

    if (error) throw error;
    return (data || []).map(normalizeProductImage);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
};

// ============================================
// FALLBACK FUNCTIONS (pour mode hors ligne)
// ============================================

const getFallbackProducts = ({
  category,
  search,
  minPrice,
  maxPrice,
  inStock,
  isNew,
  sortBy,
  sortOrder,
  page,
  limit,
}) => {
  let filtered = [...fallbackProducts];

  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower)
    );
  }

  if (minPrice !== null) {
    filtered = filtered.filter(p => p.price >= minPrice);
  }

  if (maxPrice !== null) {
    filtered = filtered.filter(p => p.price <= maxPrice);
  }

  if (inStock !== null) {
    filtered = filtered.filter(p => p.inStock === inStock);
  }

  if (isNew !== null) {
    filtered = filtered.filter(p => p.isNew === isNew);
  }

  // Tri
  filtered.sort((a, b) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  // Pagination
  const total = filtered.length;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    products: filtered.slice(start, end),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
