import { supabase } from '@/lib/supabase';
import { DELIVERY_ZONES, SENEGAL_REGIONS } from '@/lib/constants';

// ─── DELIVERY ZONES ─────────────────────────────────────────────────────────

export const getDeliveryZones = async () => {
  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error || !data?.length) {
    // Fallback aux constantes statiques
    return DELIVERY_ZONES.map((z, i) => ({
      id: i + 1,
      name: z.name,
      price: z.price,
      delay: z.delay,
      regions: z.regions,
      is_active: true,
      sort_order: i,
    }));
  }
  return data;
};

export const getAllDeliveryZones = async () => {
  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .order('sort_order');

  if (error) {
    // Table may not exist yet (migration pending) — return empty array
    console.warn('delivery_zones table not available:', error.message);
    return [];
  }
  return data || [];
};

export const createDeliveryZone = async (zoneData) => {
  const { data, error } = await supabase
    .from('delivery_zones')
    .insert([{
      name: zoneData.name,
      price: parseFloat(zoneData.price),
      delay: zoneData.delay,
      regions: zoneData.regions,
      is_active: zoneData.is_active ?? true,
      sort_order: zoneData.sort_order ?? 0,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateDeliveryZone = async (id, zoneData) => {
  const { data, error } = await supabase
    .from('delivery_zones')
    .update({
      name: zoneData.name,
      price: parseFloat(zoneData.price),
      delay: zoneData.delay,
      regions: zoneData.regions,
      is_active: zoneData.is_active,
      sort_order: zoneData.sort_order,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteDeliveryZone = async (id) => {
  const { error } = await supabase
    .from('delivery_zones')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const toggleDeliveryZone = async (id, isActive) => {
  const { data, error } = await supabase
    .from('delivery_zones')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ─── STORE SETTINGS ─────────────────────────────────────────────────────────

export const getSetting = async (key) => {
  const { data, error } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) return null;
  return data?.value;
};

export const getAllSettings = async () => {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .order('key');

  if (error) {
    // Table may not exist yet (migration pending) — return empty object
    console.warn('store_settings table not available:', error.message);
    return {};
  }

  // Convertir en objet key => value
  return (data || []).reduce((acc, row) => {
    acc[row.key] = { value: row.value, description: row.description, updated_at: row.updated_at };
    return acc;
  }, {});
};

export const updateSetting = async (key, value) => {
  const { data, error } = await supabase
    .from('store_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateManySettings = async (settings) => {
  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('store_settings')
    .upsert(rows);

  if (error) throw error;
};

export const SENEGAL_REGIONS_LIST = SENEGAL_REGIONS;
