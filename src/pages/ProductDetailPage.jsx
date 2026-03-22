
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, MessageCircle, Star, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPageMeta } from '@/lib/meta';
import { getProductById, getRelatedProducts } from '@/services/productService';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { CONTACT_INFO, DELIVERY_ZONES } from '@/lib/constants';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CustomTabs, CustomTabsContent, CustomTabsList, CustomTabsTrigger } from '@/components/CustomTabs';
import SEOHead from '@/components/SEOHead';

// ---------------------------------------------------------------------------
// Helpers de normalisation (données Supabase ↔ données statiques)
// ---------------------------------------------------------------------------

const getImages = (product) => {
  if (!product) return [];
  if (product.images?.length && typeof product.images[0] === 'object') {
    return product.images
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((img) => img.image_url);
  }
  return product.images || (product.image ? [product.image] : []);
};

const getColors = (product) => {
  if (!product?.variants) return [];
  if (Array.isArray(product.variants) && product.variants[0]?.variant_type) {
    return product.variants
      .filter((v) => v.variant_type === 'color')
      .map((v) => v.variant_value);
  }
  return product.variants?.colors || [];
};

const getSizes = (product) => {
  if (!product?.variants) return [];
  if (Array.isArray(product.variants) && product.variants[0]?.variant_type) {
    return product.variants
      .filter((v) => v.variant_type === 'size')
      .map((v) => v.variant_value);
  }
  return product.variants?.sizes || [];
};

const formatWeight = (grams) => {
  if (!grams) return null;
  return grams >= 1000 ? `${(grams / 1000).toFixed(1)} kg` : `${grams} g`;
};

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

const SkeletonDetail = () => (
  <div className="min-h-screen bg-black py-12">
    <div className="container mx-auto px-4">
      <div className="h-4 w-64 bg-[#1C1C1C] rounded animate-pulse mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="bg-[#0A0A0A] aspect-square animate-pulse rounded-sm" />
        <div className="space-y-6">
          <div className="h-3 w-24 bg-[#1C1C1C] rounded animate-pulse" />
          <div className="h-10 w-3/4 bg-[#1C1C1C] rounded animate-pulse" />
          <div className="h-8 w-1/3 bg-[#1C1C1C] rounded animate-pulse" />
          <div className="h-20 w-full bg-[#1C1C1C] rounded animate-pulse" />
          <div className="h-14 w-full bg-[#1C1C1C] rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setSelectedImage(0);
      setQuantity(1);
      try {
        const data = await getProductById(id);
        setProduct(data);
        if (data) {
          const colors = getColors(data);
          const sizes = getSizes(data);
          setSelectedColor(colors[0] || '');
          setSelectedSize(sizes[0] || '');
          const related = await getRelatedProducts(parseInt(id));
          setRelatedProducts(related);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ---------------------------------------------------------------------------
  // États dérivés (normalisés)
  // ---------------------------------------------------------------------------
  const images = getImages(product);
  const colors = getColors(product);
  const sizes = getSizes(product);
  const inStock = product?.in_stock ?? product?.inStock ?? true;
  const oldPrice = product?.old_price || product?.oldPrice;
  const reviewsCount = product?.reviews_count ?? product?.reviews ?? 0;
  const categoryName =
    typeof product?.category === 'object'
      ? product?.category?.name
      : product?.category || '';
  const weightLabel = formatWeight(product?.weight);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleAddToCart = () => {
    if (!product) return;
    const variant = { color: selectedColor, size: selectedSize };
    addToCart(product, variant, quantity);
    toast({
      title: 'Ajouté à votre sélection',
      description: `${quantity} × ${product.name} a rejoint votre panier.`,
    });
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;
    const message = encodeURIComponent(
      `Bonjour Philia'Store 👋\n\nJe suis intéressé(e) par cette création :\n${product.name}\nPrix : ${product.price.toLocaleString()} FCFA\n${selectedColor ? `Couleur : ${selectedColor}\n` : ''}${selectedSize ? `Taille : ${selectedSize}\n` : ''}Quantité : ${quantity}\n\nPouvez-vous m'assister ?`
    );
    window.open(`${CONTACT_INFO.whatsapp}?text=${message}`, '_blank');
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    const added = toggleWishlist(product);
    toast({
      title: added ? 'Conservé' : 'Retiré',
      description: added
        ? `${product.name} ajouté à vos pièces favorites.`
        : `${product.name} retiré de vos pièces favorites.`,
    });
  };

  // ---------------------------------------------------------------------------
  // Guards
  // ---------------------------------------------------------------------------
  if (loading) return <SkeletonDetail />;

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center border border-bronze/30 p-12 bg-[#0A0A0A]">
          <h2 className="text-3xl font-serif text-white mb-6">Création introuvable</h2>
          <Link to="/boutique">
            <Button className="bg-gold text-black hover:bg-bronze uppercase tracking-widest text-xs">
              Retour à la collection
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const meta = getPageMeta('product', {
    productName: product.name,
    description: product.description,
    productId: product.id,
    productImage: images[0],
  });

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images[0] || `https://philiastore.sn/og-image.jpg`,
    description: product.description || meta.description,
    brand: {
      '@type': 'Brand',
      name: product.brand || "Philia'Store",
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'XOF',
      price: String(product.price),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: "Philia'Store",
      },
    },
    ...(reviewsCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: String(reviewsCount),
        bestRating: '5',
        worstRating: '1',
      },
    }),
    ...(product.weight && {
      weight: {
        '@type': 'QuantitativeValue',
        value: product.weight,
        unitCode: 'GRM',
      },
    }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://philiastore.sn/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Boutique',
        item: 'https://philiastore.sn/boutique',
      },
      ...(categoryName
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: categoryName,
              item: `https://philiastore.sn/boutique?category=${encodeURIComponent(categoryName.toLowerCase())}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: product.name,
              item: `https://philiastore.sn/produit/${product.id}`,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.name,
              item: `https://philiastore.sn/produit/${product.id}`,
            },
          ]),
    ],
  };

  // ---------------------------------------------------------------------------
  // Rendu
  // ---------------------------------------------------------------------------
  return (
    <>
      <SEOHead
        {...meta}
        includeOrganization={true}
        extraSchemas={[productSchema, breadcrumbSchema]}
      />

      <div className="min-h-screen bg-black text-white py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8 text-xs tracking-widest uppercase text-gray-500">
            <Link to="/" className="hover:text-gold transition-luxury">Accueil</Link>
            <span className="mx-3 text-bronze">/</span>
            <Link to="/boutique" className="hover:text-gold transition-luxury">La Collection</Link>
            <span className="mx-3 text-bronze">/</span>
            <span className="text-white">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
            {/* Image Gallery */}
            <div>
              <motion.div
                className="bg-[#050505] border border-bronze/20 rounded-sm overflow-hidden mb-4 aspect-square flex items-center justify-center relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {images[selectedImage] && (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
              </motion.div>

              {/* Thumbnail Carousel */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-sm overflow-hidden border transition-luxury ${
                        selectedImage === index
                          ? 'border-gold opacity-100 shadow-glow-gold'
                          : 'border-transparent opacity-50 hover:opacity-100 hover:border-bronze'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} vue ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-8 border-b border-bronze/20 pb-8">
                <p className="text-gold tracking-widest text-xs uppercase mb-3">{categoryName}</p>
                <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-tight">
                  {product.name}
                </h1>
                <p className="text-gray-500 font-mono text-xs">RÉF: {product.sku}</p>
              </div>

              {/* Price */}
              <div className="flex items-end space-x-6 mb-8">
                <span className="text-4xl font-serif text-gold">
                  {product.price.toLocaleString()} FCFA
                </span>
                {oldPrice && (
                  <div className="flex flex-col pb-1">
                    <span className="text-sm text-bronze line-through decoration-bronze/50 mb-1">
                      {oldPrice.toLocaleString()} FCFA
                    </span>
                    <span className="text-[10px] tracking-widest uppercase text-white bg-bronze/30 border border-bronze px-2 py-0.5 rounded-sm">
                      Privilège -{product.discount}%
                    </span>
                  </div>
                )}
              </div>

              {/* Rating, Stock & Poids */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-[#0A0A0A] p-4 border border-bronze/10 rounded-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-gold fill-current' : 'text-gray-700'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">
                    {product.rating}{' '}
                    <span className="text-xs uppercase tracking-widest ml-1">
                      ({reviewsCount} avis)
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {weightLabel && (
                    <div className="flex items-center space-x-1 text-gray-400 text-xs">
                      <Scale className="w-3.5 h-3.5 text-bronze" />
                      <span>{weightLabel}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-gold shadow-glow-gold' : 'bg-red-500'}`} />
                    <span className={`text-xs tracking-widest uppercase ${inStock ? 'text-gold' : 'text-red-500'}`}>
                      {inStock ? 'Disponible' : 'Épuisé'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Color Selector */}
              {colors.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">
                    Teinte: <span className="text-white">{selectedColor}</span>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-6 py-2 text-sm tracking-wide rounded-sm transition-luxury border ${
                          selectedColor === color
                            ? 'border-gold text-gold bg-gold/5 shadow-[inset_0_0_10px_rgba(212,175,55,0.1)]'
                            : 'border-bronze/30 text-gray-400 hover:border-bronze hover:text-white'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">
                    Taille: <span className="text-white">{selectedSize}</span>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-5 py-2 text-sm rounded-sm transition-luxury border ${
                          selectedSize === size
                            ? 'border-gold text-gold bg-gold/5 shadow-[inset_0_0_10px_rgba(212,175,55,0.1)]'
                            : 'border-bronze/30 text-gray-400 hover:border-bronze hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto">
                {/* Quantity Selector */}
                <div className="mb-8 flex items-center gap-6">
                  <p className="text-xs uppercase tracking-widest text-gray-400">Quantité</p>
                  <div className="flex items-center border border-bronze/30 rounded-sm overflow-hidden focus-within:border-gold transition-luxury">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-[#0A0A0A] flex items-center justify-center hover:bg-bronze/20 hover:text-gold transition-luxury text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold w-12 text-center bg-black h-10 flex items-center justify-center text-white border-x border-bronze/10">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 bg-[#0A0A0A] flex items-center justify-center hover:bg-bronze/20 hover:text-gold transition-luxury text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="flex-1 bg-gold hover:bg-[#B8962E] text-black py-7 text-sm tracking-widest uppercase font-bold rounded-sm shadow-shadow-bronze transition-luxury"
                  >
                    <ShoppingCart className="w-4 h-4 mr-3" />
                    Ajouter au Panier
                  </Button>

                  <Button
                    onClick={handleToggleWishlist}
                    className={`px-8 py-7 rounded-sm transition-luxury border border-bronze/50 ${
                      isInWishlist(product.id)
                        ? 'bg-black text-gold border-gold'
                        : 'bg-[#0A0A0A] text-white hover:border-gold hover:text-gold'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current text-gold' : ''}`} />
                  </Button>
                </div>

                <Button
                  onClick={handleWhatsAppOrder}
                  variant="outline"
                  className="w-full border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366] hover:text-black py-6 text-xs uppercase tracking-widest rounded-sm transition-luxury bg-transparent"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Service Conciergerie WhatsApp
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="bg-[#0A0A0A] border border-bronze/20 rounded-sm p-8 md:p-12 mb-20">
            <CustomTabs defaultValue="description">
              <CustomTabsList className="mb-10 border-b border-bronze/20">
                <CustomTabsTrigger value="description" className="uppercase tracking-widest text-xs">
                  L&apos;Histoire
                </CustomTabsTrigger>
                <CustomTabsTrigger value="specs" className="uppercase tracking-widest text-xs">
                  Détails
                </CustomTabsTrigger>
                <CustomTabsTrigger value="reviews" className="uppercase tracking-widest text-xs">
                  Avis ({reviewsCount})
                </CustomTabsTrigger>
              </CustomTabsList>

              <CustomTabsContent value="description" className="prose prose-invert max-w-none">
                <p className="text-gray-300 font-light leading-relaxed text-lg">{product.description}</p>
              </CustomTabsContent>

              <CustomTabsContent value="specs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div className="flex justify-between py-4 border-b border-bronze/10">
                    <span className="text-gray-400 text-sm tracking-wide">Référence</span>
                    <span className="text-white font-mono text-sm">{product.sku}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-bronze/10">
                    <span className="text-gray-400 text-sm tracking-wide">Univers</span>
                    <span className="text-gold capitalize text-sm">{categoryName}</span>
                  </div>
                  {colors.length > 0 && (
                    <div className="flex justify-between py-4 border-b border-bronze/10">
                      <span className="text-gray-400 text-sm tracking-wide">Teintes</span>
                      <span className="text-white text-sm">{colors.join(', ')}</span>
                    </div>
                  )}
                  {sizes.length > 0 && (
                    <div className="flex justify-between py-4 border-b border-bronze/10">
                      <span className="text-gray-400 text-sm tracking-wide">Tailles</span>
                      <span className="text-white text-sm">{sizes.join(', ')}</span>
                    </div>
                  )}
                  {weightLabel && (
                    <div className="flex justify-between py-4 border-b border-bronze/10">
                      <span className="text-gray-400 text-sm tracking-wide">Poids</span>
                      <span className="text-white text-sm">{weightLabel}</span>
                    </div>
                  )}
                </div>
              </CustomTabsContent>

              <CustomTabsContent value="reviews">
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-12 pb-8 border-b border-bronze/20">
                    <div className="text-center">
                      <div className="text-6xl font-serif text-gold mb-2">{product.rating}</div>
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-gold fill-current' : 'text-gray-700'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs tracking-widest uppercase text-gray-500">
                        {reviewsCount} évaluations
                      </p>
                    </div>

                    <div className="flex-1 w-full">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center space-x-4 mb-3">
                          <span className="text-sm w-12 flex items-center text-gray-400">
                            {rating} <Star className="w-3 h-3 ml-1 text-gold" />
                          </span>
                          <div className="flex-1 h-1 bg-gray-900 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold"
                              style={{ width: `${Math.random() * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sample Review */}
                  <div className="p-6 border border-bronze/10 bg-black/50 rounded-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-serif text-lg text-white">Client Privilège</p>
                        <div className="flex mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-gold fill-current" />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs tracking-widest uppercase text-gray-600">Il y a 2 jours</span>
                    </div>
                    <p className="text-gray-400 font-light italic text-sm leading-relaxed">
                      Une pièce d&apos;exception. La qualité dépasse mes attentes et le service de livraison
                      fut d&apos;une grande discrétion et rapidité.
                    </p>
                  </div>
                </div>
              </CustomTabsContent>
            </CustomTabs>
          </div>

          {/* Services Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 border-y border-bronze/20 py-12">
            <div className="flex flex-col items-center text-center px-4">
              <Truck className="w-8 h-8 text-gold mb-4" />
              <p className="font-serif text-lg text-white mb-2">Livraison Gants Blancs</p>
              <p className="text-sm font-light text-gray-500">Expédition sous 24h à Dakar. Suivi personnalisé.</p>
            </div>
            <div className="flex flex-col items-center text-center px-4 border-y md:border-y-0 md:border-x border-bronze/20 py-8 md:py-0">
              <Shield className="w-8 h-8 text-gold mb-4" />
              <p className="font-serif text-lg text-white mb-2">Paiement Sécurisé</p>
              <p className="text-sm font-light text-gray-500">Transactions cryptées via Wave, Orange Money.</p>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <RotateCcw className="w-8 h-8 text-gold mb-4" />
              <p className="font-serif text-lg text-white mb-2">Retours Privilèges</p>
              <p className="text-sm font-light text-gray-500">Service d&apos;échange ou retour sous 14 jours.</p>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <div className="flex flex-col items-center mb-10">
                <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
                  Dans le même esprit
                </h2>
                <div className="w-12 h-px bg-gold" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((related) => (
                  <ProductCard key={related.id} product={related} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
