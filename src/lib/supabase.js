import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Using fallback mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Vérifie si Supabase est configuré
 */
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey &&
         !supabaseUrl.includes('placeholder') &&
         !supabaseAnonKey.includes('placeholder');
};

/**
 * Upload un fichier vers Supabase Storage
 * @param {File} file - Fichier à uploader
 * @param {string} bucket - Nom du bucket (default: 'products')
 * @param {string} path - Chemin dans le bucket
 * @returns {Promise<{url: string, error: Error|null}>}
 */
export const uploadFile = async (file, bucket = 'products', path = '') => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = path ? `${path}/${fileName}` : fileName;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    return { url: null, error };
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl, error: null };
};

/**
 * Supprime un fichier de Supabase Storage
 * @param {string} url - URL publique du fichier
 * @param {string} bucket - Nom du bucket
 */
export const deleteFile = async (url, bucket = 'products') => {
  // Extraire le path depuis l'URL
  const urlParts = url.split(`/storage/v1/object/public/${bucket}/`);
  if (urlParts.length < 2) return { error: 'Invalid URL' };

  const filePath = urlParts[1];
  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  return { error };
};

export default supabase;
