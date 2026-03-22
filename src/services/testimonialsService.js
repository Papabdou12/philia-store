import { supabase } from '@/lib/supabase';

const FALLBACK = [
  { id: 1, name: 'Aïssatou D.', role: 'Cliente fidèle, Dakar',    text: 'Les tissus sont de très bonne qualité. J\'ai reçu ma commande en moins de 24h. Je recommande vivement !',                    rating: 5, avatar_letter: 'A', is_active: true, sort_order: 1 },
  { id: 2, name: 'Fatou S.',    role: 'Cliente, Thiès',            text: 'Super boutique ! Les accessoires sont exactement comme sur les photos. Livraison rapide et bien emballée.',                   rating: 5, avatar_letter: 'F', is_active: true, sort_order: 2 },
  { id: 3, name: 'Mariama K.',  role: 'Cliente régulière',         text: 'Philia\'store est mon adresse préférée pour les cadeaux. Service exceptionnel et prix très abordables.',                     rating: 5, avatar_letter: 'M', is_active: true, sort_order: 3 },
  { id: 4, name: 'Rokhaya B.',  role: 'Cliente, Saint-Louis',      text: 'J\'adore les wax proposés ! La qualité est au rendez-vous et le service client est toujours disponible.',                   rating: 5, avatar_letter: 'R', is_active: true, sort_order: 4 },
  { id: 5, name: 'Ndéye T.',    role: 'Cliente fidèle, Dakar',     text: 'Commande reçue en parfait état, bien emballée. Les produits sont conformes à la description. Je reviendrai !',              rating: 5, avatar_letter: 'N', is_active: true, sort_order: 5 },
  { id: 6, name: 'Aminata C.',  role: 'Cliente, Kaolack',          text: 'Très satisfaite de mon achat. La robe en bazin est magnifique, exactement ce que je cherchais. Merci Philia\'store !',      rating: 5, avatar_letter: 'A', is_active: true, sort_order: 6 },
];

// ─── Public ──────────────────────────────────────────────────────────────────

export const getActiveTestimonials = async () => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error || !data?.length) return FALLBACK;
  return data;
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const getAllTestimonials = async () => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('sort_order');

  if (error) {
    console.warn('testimonials table not available:', error.message);
    return [];
  }
  return data || [];
};

export const createTestimonial = async (form) => {
  const { data, error } = await supabase
    .from('testimonials')
    .insert([{
      name: form.name,
      role: form.role || null,
      text: form.text,
      rating: parseInt(form.rating) || 5,
      avatar_letter: (form.name?.charAt(0) || 'A').toUpperCase(),
      is_active: form.is_active ?? true,
      sort_order: form.sort_order ?? 0,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTestimonial = async (id, form) => {
  const { data, error } = await supabase
    .from('testimonials')
    .update({
      name: form.name,
      role: form.role || null,
      text: form.text,
      rating: parseInt(form.rating) || 5,
      avatar_letter: (form.name?.charAt(0) || 'A').toUpperCase(),
      is_active: form.is_active ?? true,
      sort_order: form.sort_order ?? 0,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTestimonial = async (id) => {
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw error;
};

export const toggleTestimonial = async (id, isActive) => {
  const { data, error } = await supabase
    .from('testimonials')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
