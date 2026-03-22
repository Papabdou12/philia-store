
// Complete product catalog with 498 products across 6 categories
export const products = [
  // MODE & VÊTEMENTS (128 products)
  {
    id: 1,
    name: 'Robe Élégante Dorée',
    category: 'mode',
    price: 45000,
    oldPrice: 60000,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
      'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=500',
    ],
    rating: 4.8,
    reviews: 124,
    inStock: true,
    isNew: true,
    description: 'Robe élégante avec finitions dorées, parfaite pour les événements spéciaux.',
    variants: {
      colors: ['Or', 'Noir', 'Blanc'],
      sizes: ['S', 'M', 'L', 'XL'],
    },
    sku: 'MODE-001',
  },
  {
    id: 2,
    name: 'Ensemble Traditionnel Bazin',
    category: 'mode',
    price: 85000,
    oldPrice: null,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1583391733981-5aaf0ad2c201?w=500',
    images: ['https://images.unsplash.com/photo-1583391733981-5aaf0ad2c201?w=500'],
    rating: 4.9,
    reviews: 89,
    inStock: true,
    isNew: false,
    description: 'Ensemble traditionnel sénégalais en bazin riche avec broderies.',
    variants: {
      colors: ['Bleu Royal', 'Bordeaux', 'Vert Émeraude'],
      sizes: ['M', 'L', 'XL', 'XXL'],
    },
    sku: 'MODE-002',
  },
  {
    id: 3,
    name: 'Jean Skinny Femme',
    category: 'mode',
    price: 25000,
    oldPrice: 32000,
    discount: 22,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500',
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500'],
    rating: 4.5,
    reviews: 203,
    inStock: true,
    isNew: false,
    description: 'Jean skinny confortable et tendance pour femme.',
    variants: {
      colors: ['Bleu Foncé', 'Noir', 'Gris'],
      sizes: ['36', '38', '40', '42', '44'],
    },
    sku: 'MODE-003',
  },
  {
    id: 4,
    name: 'Chemise Homme Col Mao',
    category: 'mode',
    price: 18000,
    oldPrice: null,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500'],
    rating: 4.6,
    reviews: 156,
    inStock: true,
    isNew: true,
    description: 'Chemise homme élégante à col mao, parfaite pour toute occasion.',
    variants: {
      colors: ['Blanc', 'Bleu Ciel', 'Rose Poudré'],
      sizes: ['S', 'M', 'L', 'XL'],
    },
    sku: 'MODE-004',
  },
  {
    id: 5,
    name: 'Veste en Cuir Premium',
    category: 'mode',
    price: 95000,
    oldPrice: 120000,
    discount: 21,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'],
    rating: 4.9,
    reviews: 78,
    inStock: true,
    isNew: false,
    description: 'Veste en cuir véritable de qualité premium.',
    variants: {
      colors: ['Noir', 'Marron'],
      sizes: ['M', 'L', 'XL'],
    },
    sku: 'MODE-005',
  },
  // Adding more fashion items to reach 128...
  ...Array.from({ length: 123 }, (_, i) => ({
    id: i + 6,
    name: `Article Mode ${i + 6}`,
    category: 'mode',
    price: 15000 + Math.floor(Math.random() * 100000),
    oldPrice: Math.random() > 0.5 ? 20000 + Math.floor(Math.random() * 120000) : null,
    discount: Math.random() > 0.5 ? Math.floor(Math.random() * 40) : 0,
    image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=500`,
    images: [`https://images.unsplash.com/photo-${1500000000000 + i}?w=500`],
    rating: 3.5 + Math.random() * 1.5,
    reviews: Math.floor(Math.random() * 300),
    inStock: Math.random() > 0.1,
    isNew: Math.random() > 0.7,
    description: `Description pour article mode ${i + 6}`,
    variants: {
      colors: ['Couleur 1', 'Couleur 2'],
      sizes: ['S', 'M', 'L', 'XL'],
    },
    sku: `MODE-${String(i + 6).padStart(3, '0')}`,
  })),

  // BEAUTÉ & SOIN (96 products)
  {
    id: 129,
    name: 'Sérum Visage Anti-Âge',
    category: 'beaute',
    price: 35000,
    oldPrice: 45000,
    discount: 22,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500',
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500'],
    rating: 4.7,
    reviews: 234,
    inStock: true,
    isNew: true,
    description: 'Sérum anti-âge enrichi en vitamines pour une peau éclatante.',
    variants: {
      colors: [],
      sizes: ['30ml', '50ml'],
    },
    sku: 'BEAUTE-001',
  },
  {
    id: 130,
    name: 'Palette Maquillage Professionnelle',
    category: 'beaute',
    price: 28000,
    oldPrice: null,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500',
    images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500'],
    rating: 4.8,
    reviews: 187,
    inStock: true,
    isNew: false,
    description: 'Palette complète avec 24 teintes pour tous les styles.',
    variants: {
      colors: ['Nude', 'Smoky', 'Coloré'],
      sizes: [],
    },
    sku: 'BEAUTE-002',
  },
  ...Array.from({ length: 94 }, (_, i) => ({
    id: i + 131,
    name: `Produit Beauté ${i + 3}`,
    category: 'beaute',
    price: 10000 + Math.floor(Math.random() * 60000),
    oldPrice: Math.random() > 0.5 ? 15000 + Math.floor(Math.random() * 70000) : null,
    discount: Math.random() > 0.5 ? Math.floor(Math.random() * 35) : 0,
    image: `https://images.unsplash.com/photo-${1600000000000 + i}?w=500`,
    images: [`https://images.unsplash.com/photo-${1600000000000 + i}?w=500`],
    rating: 4 + Math.random() * 1,
    reviews: Math.floor(Math.random() * 250),
    inStock: Math.random() > 0.1,
    isNew: Math.random() > 0.7,
    description: `Description produit beauté ${i + 3}`,
    variants: {
      colors: [],
      sizes: [],
    },
    sku: `BEAUTE-${String(i + 3).padStart(3, '0')}`,
  })),

  // TECHNOLOGIE (74 products)
  {
    id: 225,
    name: 'Smartphone 5G Premium',
    category: 'tech',
    price: 450000,
    oldPrice: 550000,
    discount: 18,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'],
    rating: 4.9,
    reviews: 567,
    inStock: true,
    isNew: true,
    description: 'Smartphone dernière génération avec 5G et appareil photo 108MP.',
    variants: {
      colors: ['Noir', 'Blanc', 'Bleu'],
      sizes: ['128GB', '256GB', '512GB'],
    },
    sku: 'TECH-001',
  },
  {
    id: 226,
    name: 'Écouteurs Bluetooth Sans Fil',
    category: 'tech',
    price: 25000,
    oldPrice: 35000,
    discount: 29,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500'],
    rating: 4.6,
    reviews: 432,
    inStock: true,
    isNew: false,
    description: 'Écouteurs sans fil avec réduction de bruit active.',
    variants: {
      colors: ['Noir', 'Blanc', 'Rose'],
      sizes: [],
    },
    sku: 'TECH-002',
  },
  ...Array.from({ length: 72 }, (_, i) => ({
    id: i + 227,
    name: `Produit Tech ${i + 3}`,
    category: 'tech',
    price: 20000 + Math.floor(Math.random() * 500000),
    oldPrice: Math.random() > 0.5 ? 30000 + Math.floor(Math.random() * 600000) : null,
    discount: Math.random() > 0.5 ? Math.floor(Math.random() * 30) : 0,
    image: `https://images.unsplash.com/photo-${1550000000000 + i}?w=500`,
    images: [`https://images.unsplash.com/photo-${1550000000000 + i}?w=500`],
    rating: 4 + Math.random() * 1,
    reviews: Math.floor(Math.random() * 600),
    inStock: Math.random() > 0.15,
    isNew: Math.random() > 0.7,
    description: `Description produit tech ${i + 3}`,
    variants: {
      colors: ['Noir', 'Blanc'],
      sizes: [],
    },
    sku: `TECH-${String(i + 3).padStart(3, '0')}`,
  })),

  // MAISON & DÉCO (85 products)
  {
    id: 299,
    name: 'Lampe Design Scandinave',
    category: 'maison',
    price: 42000,
    oldPrice: null,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'],
    rating: 4.7,
    reviews: 156,
    inStock: true,
    isNew: true,
    description: 'Lampe élégante au design scandinave pour votre intérieur.',
    variants: {
      colors: ['Blanc', 'Noir', 'Bois'],
      sizes: [],
    },
    sku: 'MAISON-001',
  },
  {
    id: 300,
    name: 'Tapis Berbère Authentique',
    category: 'maison',
    price: 68000,
    oldPrice: 85000,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=500',
    images: ['https://images.unsplash.com/photo-1600166898405-da9535204843?w=500'],
    rating: 4.8,
    reviews: 98,
    inStock: true,
    isNew: false,
    description: 'Tapis berbère tissé main avec motifs traditionnels.',
    variants: {
      colors: ['Beige', 'Gris', 'Multicolore'],
      sizes: ['120x180cm', '160x230cm', '200x300cm'],
    },
    sku: 'MAISON-002',
  },
  ...Array.from({ length: 83 }, (_, i) => ({
    id: i + 301,
    name: `Article Maison ${i + 3}`,
    category: 'maison',
    price: 15000 + Math.floor(Math.random() * 150000),
    oldPrice: Math.random() > 0.5 ? 20000 + Math.floor(Math.random() * 180000) : null,
    discount: Math.random() > 0.5 ? Math.floor(Math.random() * 35) : 0,
    image: `https://images.unsplash.com/photo-${1570000000000 + i}?w=500`,
    images: [`https://images.unsplash.com/photo-${1570000000000 + i}?w=500`],
    rating: 4 + Math.random() * 1,
    reviews: Math.floor(Math.random() * 200),
    inStock: Math.random() > 0.1,
    isNew: Math.random() > 0.7,
    description: `Description article maison ${i + 3}`,
    variants: {
      colors: ['Couleur 1', 'Couleur 2'],
      sizes: [],
    },
    sku: `MAISON-${String(i + 3).padStart(3, '0')}`,
  })),

  // ENFANTS & JOUETS (52 products)
  {
    id: 384,
    name: 'Peluche Géante Licorne',
    category: 'enfants',
    price: 22000,
    oldPrice: 28000,
    discount: 21,
    image: 'https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=500',
    images: ['https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=500'],
    rating: 4.9,
    reviews: 234,
    inStock: true,
    isNew: true,
    description: 'Peluche douce et câline en forme de licorne.',
    variants: {
      colors: ['Rose', 'Blanc', 'Arc-en-ciel'],
      sizes: ['60cm', '80cm', '100cm'],
    },
    sku: 'ENFANT-001',
  },
  {
    id: 385,
    name: 'Jeu de Construction 500 Pièces',
    category: 'enfants',
    price: 35000,
    oldPrice: null,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=500',
    images: ['https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=500'],
    rating: 4.7,
    reviews: 178,
    inStock: true,
    isNew: false,
    description: 'Ensemble de construction pour développer la créativité.',
    variants: {
      colors: [],
      sizes: [],
    },
    sku: 'ENFANT-002',
  },
  ...Array.from({ length: 50 }, (_, i) => ({
    id: i + 386,
    name: `Jouet Enfant ${i + 3}`,
    category: 'enfants',
    price: 8000 + Math.floor(Math.random() * 50000),
    oldPrice: Math.random() > 0.5 ? 12000 + Math.floor(Math.random() * 60000) : null,
    discount: Math.random() > 0.5 ? Math.floor(Math.random() * 30) : 0,
    image: `https://images.unsplash.com/photo-${1530000000000 + i}?w=500`,
    images: [`https://images.unsplash.com/photo-${1530000000000 + i}?w=500`],
    rating: 4 + Math.random() * 1,
    reviews: Math.floor(Math.random() * 250),
    inStock: Math.random() > 0.1,
    isNew: Math.random() > 0.7,
    description: `Description jouet enfant ${i + 3}`,
    variants: {
      colors: [],
      sizes: [],
    },
    sku: `ENFANT-${String(i + 3).padStart(3, '0')}`,
  })),

  // SPORT & FITNESS (63 products)
  {
    id: 436,
    name: 'Tapis de Yoga Premium',
    category: 'sport',
    price: 18000,
    oldPrice: 25000,
    discount: 28,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'],
    rating: 4.8,
    reviews: 312,
    inStock: true,
    isNew: true,
    description: 'Tapis de yoga antidérapant et écologique.',
    variants: {
      colors: ['Violet', 'Bleu', 'Rose', 'Noir'],
      sizes: ['4mm', '6mm', '8mm'],
    },
    sku: 'SPORT-001',
  },
  {
    id: 437,
    name: 'Haltères Réglables 20kg',
    category: 'sport',
    price: 45000,
    oldPrice: null,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500',
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
    rating: 4.6,
    reviews: 189,
    inStock: true,
    isNew: false,
    description: 'Haltères ajustables pour musculation à domicile.',
    variants: {
      colors: ['Noir'],
      sizes: ['10kg', '15kg', '20kg'],
    },
    sku: 'SPORT-002',
  },
  ...Array.from({ length: 61 }, (_, i) => ({
    id: i + 438,
    name: `Article Sport ${i + 3}`,
    category: 'sport',
    price: 12000 + Math.floor(Math.random() * 80000),
    oldPrice: Math.random() > 0.5 ? 18000 + Math.floor(Math.random() * 100000) : null,
    discount: Math.random() > 0.5 ? Math.floor(Math.random() * 35) : 0,
    image: `https://images.unsplash.com/photo-${1520000000000 + i}?w=500`,
    images: [`https://images.unsplash.com/photo-${1520000000000 + i}?w=500`],
    rating: 4 + Math.random() * 1,
    reviews: Math.floor(Math.random() * 350),
    inStock: Math.random() > 0.1,
    isNew: Math.random() > 0.7,
    description: `Description article sport ${i + 3}`,
    variants: {
      colors: ['Noir', 'Bleu'],
      sizes: [],
    },
    sku: `SPORT-${String(i + 3).padStart(3, '0')}`,
  })),
];

export const getProductById = (id) => {
  return products.find(p => p.id === parseInt(id));
};

export const getProductsByCategory = (category) => {
  return products.filter(p => p.category === category);
};

export const getFeaturedProducts = (count = 8) => {
  return products
    .filter(p => p.rating >= 4.5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
};

export const getNewProducts = (count = 8) => {
  return products
    .filter(p => p.isNew)
    .slice(0, count);
};

export const getFlashSaleProducts = (count = 3) => {
  return products
    .filter(p => p.discount > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, count);
};

export const getRelatedProducts = (productId, count = 4) => {
  const product = getProductById(productId);
  if (!product) return [];
  
  return products
    .filter(p => p.category === product.category && p.id !== productId)
    .slice(0, count);
};
