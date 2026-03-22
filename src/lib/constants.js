
// Demo commit — feature branch workflow test
export const BRAND_COLORS = {
  bronze: '#8B7355',
  gold: '#D4AF37',
  black: '#000000',
  white: '#FFFFFF',
};

const _wa = import.meta.env.VITE_STORE_WHATSAPP || '221783968970';

export const CONTACT_INFO = {
  phone: import.meta.env.VITE_STORE_PHONE || '',
  whatsapp: _wa ? `https://wa.me/${_wa}` : '',
  email: import.meta.env.VITE_STORE_EMAIL || '',
  address: import.meta.env.VITE_STORE_ADDRESS || 'Dakar, Sénégal',
  facebook: import.meta.env.VITE_STORE_FACEBOOK || '',
  instagram: import.meta.env.VITE_STORE_INSTAGRAM || '',
  twitter: import.meta.env.VITE_STORE_TWITTER || '',
  tiktok: import.meta.env.VITE_STORE_TIKTOK || '',
};

export const SENEGAL_REGIONS = [
  'Dakar',
  'Thiès',
  'Diourbel',
  'Fatick',
  'Kaolack',
  'Kaffrine',
  'Kolda',
  'Louga',
  'Matam',
  'Saint-Louis',
  'Sédhiou',
  'Tambacounda',
  'Kédougou',
  'Ziguinchor',
];

export const PAYMENT_METHODS = [
  {
    id: 'cash',
    name: 'Cash à la livraison',
    icon: '💵',
    description: 'Payer en espèces à la réception',
    available: true,
  },
  {
    id: 'wave',
    name: 'Wave',
    icon: '💳',
    description: 'Bientôt disponible',
    available: false,
  },
  {
    id: 'orange',
    name: 'Orange Money',
    icon: '🟠',
    description: 'Bientôt disponible',
    available: false,
  },
  {
    id: 'free',
    name: 'Free Money',
    icon: '💰',
    description: 'Bientôt disponible',
    available: false,
  },
];

export const DELIVERY_ZONES = [
  {
    name: 'Dakar Express',
    regions: ['Dakar'],
    delay: '24h',
    price: 2500,
  },
  {
    name: 'Régions du Sénégal',
    regions: SENEGAL_REGIONS.filter(r => r !== 'Dakar'),
    delay: '48-72h',
    price: 5000,
  },
];

export const CATEGORIES = [
  {
    id: 'mode',
    name: 'MODE & VÊTEMENTS',
    emoji: '👗',
    count: 128,
  },
  {
    id: 'beaute',
    name: 'BEAUTÉ & SOIN',
    emoji: '💄',
    count: 96,
  },
  {
    id: 'tech',
    name: 'TECHNOLOGIE',
    emoji: '📱',
    count: 74,
  },
  {
    id: 'maison',
    name: 'MAISON & DÉCO',
    emoji: '🏠',
    count: 85,
  },
  {
    id: 'enfants',
    name: 'ENFANTS & JOUETS',
    emoji: '🧸',
    count: 52,
  },
  {
    id: 'sport',
    name: 'SPORT & FITNESS',
    emoji: '⚽',
    count: 63,
  },
];
