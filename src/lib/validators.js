/**
 * validators.js — Validation et sanitisation des entrées utilisateur
 * Sécurité frontend : anti-XSS, validation de formulaires, rate limiting
 */

// ---------------------------------------------------------------------------
// Sanitisation générique anti-XSS
// ---------------------------------------------------------------------------

/**
 * Échappe les caractères HTML dangereux dans une chaîne.
 * À utiliser sur toute donnée saisie avant stockage ou affichage.
 * @param {string} str
 * @returns {string}
 */
export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

/**
 * Sanitise une requête de recherche pour prévenir les injections.
 * @param {string} query
 * @returns {string}
 */
export const sanitizeSearch = (query) => {
  if (typeof query !== 'string') return '';
  return query.replace(/[<>'";&]/g, '').trim().substring(0, 100);
};

// ---------------------------------------------------------------------------
// Validation des codes coupon
// ---------------------------------------------------------------------------

/**
 * Valide qu'un code coupon respecte le format attendu : 3-20 caractères
 * majuscules, chiffres, tirets ou underscores.
 * @param {string} code
 * @returns {boolean}
 */
export const validateCouponCode = (code) => {
  if (typeof code !== 'string') return false;
  return /^[A-Z0-9_-]{3,20}$/.test(code.toUpperCase());
};

// ---------------------------------------------------------------------------
// Schémas de validation pour le formulaire de commande (checkout)
// ---------------------------------------------------------------------------

/**
 * Règles de validation pour chaque champ du checkout.
 * Utilisé conjointement avec la fonction `validate()`.
 */
export const checkoutSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
    patternMessage: 'Le nom ne doit contenir que des lettres, espaces, apostrophes ou tirets.',
  },
  phone: {
    required: true,
    pattern: /^(\+221|00221)?[0-9]{9}$/,
    patternMessage: 'Numéro de téléphone invalide (format sénégalais attendu).',
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Adresse email invalide.',
  },
  address: {
    required: true,
    minLength: 5,
    maxLength: 200,
  },
  city: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
};

// ---------------------------------------------------------------------------
// Schémas de validation pour le formulaire de contact
// ---------------------------------------------------------------------------

export const contactSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
    patternMessage: 'Le nom ne doit contenir que des lettres.',
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Adresse email invalide.',
  },
  subject: {
    required: true,
    minLength: 3,
    maxLength: 150,
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 2000,
  },
};

// ---------------------------------------------------------------------------
// Fonction de validation générique
// ---------------------------------------------------------------------------

/**
 * Valide une valeur selon un jeu de règles.
 *
 * @param {string} value  — La valeur à valider
 * @param {object} rules  — Les règles (required, minLength, maxLength, pattern, patternMessage)
 * @returns {{ valid: boolean, message: string }}
 */
export const validate = (value, rules) => {
  const str = typeof value === 'string' ? value.trim() : '';

  if (rules.required && str.length === 0) {
    return { valid: false, message: 'Ce champ est obligatoire.' };
  }

  if (str.length === 0 && !rules.required) {
    return { valid: true, message: '' };
  }

  if (rules.minLength && str.length < rules.minLength) {
    return {
      valid: false,
      message: `Ce champ doit contenir au moins ${rules.minLength} caractères.`,
    };
  }

  if (rules.maxLength && str.length > rules.maxLength) {
    return {
      valid: false,
      message: `Ce champ ne doit pas dépasser ${rules.maxLength} caractères.`,
    };
  }

  if (rules.pattern && !rules.pattern.test(str)) {
    return {
      valid: false,
      message: rules.patternMessage || 'Format invalide.',
    };
  }

  return { valid: true, message: '' };
};

/**
 * Valide un objet de données contre un schéma complet.
 *
 * @param {object} data    — Les données du formulaire { fieldName: value }
 * @param {object} schema  — Le schéma de validation { fieldName: rules }
 * @returns {{ isValid: boolean, errors: object }} — errors = { fieldName: message }
 */
export const validateForm = (data, schema) => {
  const errors = {};
  let isValid = true;

  for (const field of Object.keys(schema)) {
    const result = validate(data[field] ?? '', schema[field]);
    if (!result.valid) {
      errors[field] = result.message;
      isValid = false;
    }
  }

  return { isValid, errors };
};
