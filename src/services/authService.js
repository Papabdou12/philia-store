import { supabase } from '@/lib/supabase';

/**
 * Service pour l'authentification admin
 */

/**
 * Connexion admin
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object, error: string|null}>}
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: getErrorMessage(error) };
    }

    // Vérifier le rôle admin
    const role = data.user?.app_metadata?.role;
    if (role !== 'admin') {
      await supabase.auth.signOut();
      return { user: null, error: 'Accès non autorisé. Compte admin requis.' };
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error: 'Erreur de connexion' };
  }
};

/**
 * Déconnexion
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
};

/**
 * Récupère la session actuelle
 */
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

/**
 * Récupère l'utilisateur actuel
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

/**
 * Vérifie si l'utilisateur est admin
 */
export const isAdmin = async () => {
  const user = await getCurrentUser();
  return user?.app_metadata?.role === 'admin';
};

/**
 * Écoute les changements d'état d'authentification
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

/**
 * Crée un compte admin (utilisé uniquement pour le setup initial).
 *
 * SÉCURITÉ : Cette fonction ne doit être appelée QU'en setup initial.
 * En production, elle est désactivée pour empêcher la création non autorisée
 * de comptes admin. Utilisez le Dashboard Supabase pour créer des admins.
 */
export const createAdminAccount = async (email, password, name) => {
  // Désactivée en production
  if (import.meta.env.PROD) {
    console.error('createAdminAccount désactivée en production');
    return { user: null, error: 'Fonction désactivée en production' };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'admin',
          name,
        },
      },
    });

    if (error) {
      return { user: null, error: getErrorMessage(error) };
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Create admin error:', error);
    return { user: null, error: 'Erreur lors de la création du compte' };
  }
};

/**
 * Met à jour le profil admin
 */
export const updateProfile = async (updates) => {
  const { data, error } = await supabase.auth.updateUser({
    data: updates,
  });

  if (error) throw error;
  return data.user;
};

/**
 * Change le mot de passe
 */
export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return data.user;
};

/**
 * Envoie un email de réinitialisation de mot de passe
 */
export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password`,
  });

  if (error) throw error;
  return true;
};

/**
 * Traduit les messages d'erreur Supabase
 */
const getErrorMessage = (error) => {
  const messages = {
    'Invalid login credentials': 'Email ou mot de passe incorrect',
    'Email not confirmed': 'Veuillez confirmer votre email',
    'User already registered': 'Cet email est déjà utilisé',
    'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
    'Invalid email': 'Email invalide',
  };

  return messages[error.message] || error.message || 'Une erreur est survenue';
};
