
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://philiastore.sn';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;
const SITE_NAME = "Philia'Store";

export const getPageMeta = (page, data = {}) => {
  const baseTitle = "Philia'Store";
  const baseSuffix = "- Boutique en Ligne au Sénégal";

  const metaConfig = {
    home: {
      title: `${baseTitle} ${baseSuffix}`,
      description: "Découvrez les meilleures tendances mode, beauté, tech et maison au Sénégal. Livraison rapide à Dakar et dans toutes les régions. Paiement mobile sécurisé.",
      canonical: `${BASE_URL}/`,
      ogTitle: `${baseTitle} — Mode, Beauté, Tech & Maison au Sénégal`,
      ogDescription: "Boutique en ligne sénégalaise. Plus de 500 produits sélectionnés : mode africaine, beauté, tech et maison. Livraison 24h à Dakar, 48-72h partout au Sénégal. Wave, Orange Money, Free Money.",
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website',
      twitterCard: 'summary_large_image',
    },
    shop: {
      title: `Boutique ${baseSuffix}`,
      description: "Parcourez notre catalogue de plus de 500 produits : vêtements, beauté, technologie, maison, enfants et sport. Livraison dans tout le Sénégal.",
      canonical: `${BASE_URL}/boutique`,
      ogTitle: `La Boutique — Philia'Store`,
      ogDescription: "500+ produits mode, beauté, tech, maison, enfants et sport. Filtres avancés, paiement mobile et livraison dans tout le Sénégal.",
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website',
      twitterCard: 'summary_large_image',
    },
    product: {
      title: `${data.productName || 'Produit'} ${baseSuffix}`,
      description: data.description || "Découvrez ce produit tendance disponible sur Philia'Store avec livraison rapide au Sénégal.",
      canonical: data.productId ? `${BASE_URL}/produit/${data.productId}` : `${BASE_URL}/boutique`,
      ogTitle: data.productName ? `${data.productName} — Philia'Store` : `Produit ${baseSuffix}`,
      ogDescription: data.description || "Découvrez ce produit tendance disponible sur Philia'Store avec livraison rapide au Sénégal.",
      ogImage: data.productImage || DEFAULT_OG_IMAGE,
      ogType: 'product',
      twitterCard: 'summary_large_image',
    },
    cart: {
      title: `Panier ${baseSuffix}`,
      description: "Finalisez votre commande sur Philia'Store. Paiement sécurisé par Wave, Orange Money ou Free Money.",
      canonical: `${BASE_URL}/panier`,
      ogTitle: `Votre Panier — Philia'Store`,
      ogDescription: "Finalisez votre commande. Paiement sécurisé Wave, Orange Money, Free Money ou cash à la livraison.",
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website',
      twitterCard: 'summary_large_image',
    },
    checkout: {
      title: `Commande ${baseSuffix}`,
      description: "Complétez votre commande en 3 étapes simples. Livraison rapide dans tout le Sénégal.",
      canonical: `${BASE_URL}/commande`,
      ogTitle: `Finaliser la Commande — Philia'Store`,
      ogDescription: "Commandez en 3 étapes simples. Livraison express 24h à Dakar, 48-72h dans toutes les régions du Sénégal.",
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website',
      twitterCard: 'summary_large_image',
    },
    about: {
      title: `À Propos ${baseSuffix}`,
      description: "Philia'Store, votre boutique en ligne de confiance au Sénégal. Qualité, prix compétitifs et service client exceptionnel.",
      canonical: `${BASE_URL}/a-propos`,
      ogTitle: `À Propos de Philia'Store`,
      ogDescription: "Philia'Store, votre boutique en ligne de confiance au Sénégal. Qualité garantie, prix compétitifs et service client disponible 7j/7.",
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website',
      twitterCard: 'summary_large_image',
    },
    contact: {
      title: `Contact ${baseSuffix}`,
      description: "Contactez Philia'Store par téléphone, WhatsApp ou email. Notre équipe est à votre écoute.",
      canonical: `${BASE_URL}/contact`,
      ogTitle: `Contactez Philia'Store`,
      ogDescription: "Joignez notre équipe par WhatsApp (+221 78 396 89 70), email ou formulaire. Disponibles 7j/7 pour vous accompagner.",
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website',
      twitterCard: 'summary_large_image',
    },
    promos: {
      title: `Promotions ${baseSuffix}`,
      description: "Ne manquez pas nos offres spéciales et codes promo exclusifs. Économisez sur vos achats chez Philia'Store.",
      canonical: `${BASE_URL}/promos`,
      ogTitle: `Promotions & Offres Spéciales — Philia'Store`,
      ogDescription: "Ventes flash, remises exclusives et codes promo sur des centaines de produits. Livraison rapide dans tout le Sénégal.",
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website',
      twitterCard: 'summary_large_image',
    },
  };

  const config = metaConfig[page] || metaConfig.home;

  return {
    ...config,
    siteName: SITE_NAME,
  };
};
