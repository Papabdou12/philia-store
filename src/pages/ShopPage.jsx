
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Loader2, Package, Scale, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPageMeta } from '@/lib/meta';
import { getProducts, getCategories } from '@/services/productService';
import { products as fallbackProducts } from '@/lib/productData';
import { CATEGORIES as FALLBACK_CATEGORIES } from '@/lib/constants';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import PriceRangeSlider from '@/components/PriceRangeSlider';
import SEOHead from '@/components/SEOHead';

const PRODUCTS_PER_PAGE = 12;

// ─── Skeleton card ────────────────────────────────────────────────────────────
const ProductCardSkeleton = () => (
  <div className="bg-[#0A0A0A] rounded-xl overflow-hidden border border-bronze/10 animate-pulse">
    <div className="aspect-square bg-[#161616]" />
    <div className="p-5 space-y-3">
      <div className="h-2.5 bg-[#1C1C1C] rounded w-1/3" />
      <div className="h-4 bg-[#1C1C1C] rounded w-3/4" />
      <div className="h-4 bg-[#1C1C1C] rounded w-1/2" />
      <div className="flex justify-between items-center pt-1">
        <div className="h-5 bg-[#1C1C1C] rounded w-1/3" />
        <div className="h-3 bg-[#1C1C1C] rounded w-1/5" />
      </div>
    </div>
  </div>
);

// ─── Checkbox custom ──────────────────────────────────────────────────────────
const FilterCheckbox = ({ checked, onChange, label, icon }) => (
  <label className="flex items-center space-x-3 cursor-pointer group" onClick={onChange}>
    <div className={`w-4 h-4 border flex items-center justify-center transition-all ${
      checked ? 'border-gold bg-gold' : 'border-bronze/50 group-hover:border-gold'
    }`}>
      {checked && <div className="w-2 h-2 bg-black rounded-sm" />}
    </div>
    {icon && <span className="text-lg">{icon}</span>}
    <span className={`text-sm tracking-wide transition-all ${
      checked ? 'text-gold' : 'text-gray-400 group-hover:text-white'
    }`}>
      {label}
    </span>
  </label>
);

// ─── Chip filtre actif ────────────────────────────────────────────────────────
const ActiveChip = ({ label, onRemove }) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 bg-gold/10 border border-gold/40 text-gold text-[11px] uppercase tracking-wider rounded-sm"
  >
    {label}
    <button onClick={onRemove} className="hover:text-white transition-colors cursor-pointer">
      <X className="w-3 h-3" />
    </button>
  </motion.span>
);

// ─── Sidebar filtres ──────────────────────────────────────────────────────────
const FilterSidebar = ({
  categories, selectedCategories, toggleCategory,
  priceRange, setPriceRange,
  inStockOnly, setInStockOnly,
  isNewOnly, setIsNewOnly,
  availableColors, selectedColors, toggleColor,
  availableSizes, selectedSizes, toggleSize,
  activeFiltersCount, resetFilters, onClose,
}) => (
  <motion.aside
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2 }}
    className="lg:w-72 bg-[#0A0A0A] border border-bronze/20 p-6 rounded-sm h-fit lg:sticky lg:top-28"
  >
    {/* Header mobile */}
    <div className="flex items-center justify-between mb-6 lg:hidden">
      <h2 className="font-serif text-gold text-xl">Filtres</h2>
      <button onClick={onClose} className="text-white/60 hover:text-white transition-colors cursor-pointer">
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* CATÉGORIES */}
    <div className="mb-8">
      <h3 className="font-serif text-gold text-base mb-4 border-b border-bronze/20 pb-2 uppercase tracking-widest">
        Catégories
      </h3>
      <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-bronze/30">
        {categories.map((cat) => {
          const code = cat.code || cat.id;
          return (
            <FilterCheckbox
              key={code}
              checked={selectedCategories.includes(code)}
              onChange={() => toggleCategory(code)}
              label={cat.name}
              icon={cat.emoji}
            />
          );
        })}
      </div>
    </div>

    {/* PRIX */}
    <div className="mb-8">
      <h3 className="font-serif text-gold text-base mb-4 border-b border-bronze/20 pb-2 uppercase tracking-widest">
        Prix
      </h3>
      <PriceRangeSlider
        min={0}
        max={500000}
        step={5000}
        value={priceRange}
        onValueChange={setPriceRange}
        className="mb-4"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{priceRange[0].toLocaleString()} FCFA</span>
        <span>{priceRange[1].toLocaleString()} FCFA</span>
      </div>
    </div>

    {/* POIDS — info livraison */}
    <div className="mb-8 bg-bronze/5 border border-bronze/20 rounded-sm p-3">
      <div className="flex items-center gap-2 mb-1">
        <Scale className="w-3.5 h-3.5 text-bronze" />
        <span className="text-xs text-bronze uppercase tracking-widest font-semibold">Poids & Livraison</span>
      </div>
      <p className="text-[11px] text-gray-500 leading-relaxed">
        Le poids de chaque produit est affiché sur la fiche. Il détermine les frais de livraison pour les commandes hors Dakar.
      </p>
    </div>

    {/* COULEURS */}
    {availableColors.length > 0 && (
      <div className="mb-8">
        <h3 className="font-serif text-gold text-base mb-4 border-b border-bronze/20 pb-2 uppercase tracking-widest">
          Couleurs
        </h3>
        <div className="flex flex-wrap gap-2">
          {availableColors.slice(0, 10).map(color => (
            <button
              key={color}
              onClick={() => toggleColor(color)}
              className={`px-2.5 py-1 text-[11px] border rounded-sm transition-all cursor-pointer ${
                selectedColors.includes(color)
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-bronze/30 text-gray-400 hover:border-bronze hover:text-white'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* TAILLES */}
    {availableSizes.length > 0 && (
      <div className="mb-8">
        <h3 className="font-serif text-gold text-base mb-4 border-b border-bronze/20 pb-2 uppercase tracking-widest">
          Tailles
        </h3>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`w-9 h-9 text-xs border rounded-sm transition-all cursor-pointer ${
                selectedSizes.includes(size)
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-bronze/30 text-gray-400 hover:border-bronze hover:text-white'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* DISPONIBILITÉ */}
    <div className="mb-8">
      <h3 className="font-serif text-gold text-base mb-4 border-b border-bronze/20 pb-2 uppercase tracking-widest">
        Disponibilité
      </h3>
      <div className="space-y-3">
        <FilterCheckbox
          checked={inStockOnly}
          onChange={() => setInStockOnly(!inStockOnly)}
          label="En stock uniquement"
        />
        <FilterCheckbox
          checked={isNewOnly}
          onChange={() => setIsNewOnly(!isNewOnly)}
          label="Nouveautés uniquement"
        />
      </div>
    </div>

    {/* Reset */}
    {activeFiltersCount > 0 && (
      <Button
        onClick={resetFilters}
        variant="outline"
        className="w-full border-bronze/50 text-bronze hover:bg-bronze hover:text-black text-xs uppercase tracking-widest cursor-pointer"
      >
        Réinitialiser ({activeFiltersCount})
      </Button>
    )}
  </motion.aside>
);

// ─── Page principale ──────────────────────────────────────────────────────────
const ShopPage = () => {
  const meta = getPageMeta('shop');
  const [searchParams, setSearchParams] = useSearchParams();

  // Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Filtres
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isNewOnly, setIsNewOnly] = useState(false);
  const [sortBy, setSortBy] = useState('created_at-desc');
  const [showFilters, setShowFilters] = useState(false);

  // Variants
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data?.length > 0 ? data : FALLBACK_CATEGORIES);
      } catch {
        setCategories(FALLBACK_CATEGORIES);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategories([cat]);
  }, [searchParams]);

  const loadProducts = useCallback(async (page = 1, append = false) => {
    page === 1 ? setLoading(true) : setLoadingMore(true);

    try {
      const urlCategory = searchParams.get('category');
      const searchQuery = searchParams.get('search') || '';
      const activeCat = urlCategory || (selectedCategories.length === 1 ? selectedCategories[0] : null);
      const [sb, so] = sortBy.split('-');

      // Résoudre la colonne de tri (évite is_new → created_at silencieux)
      const sortColumn =
        sb === 'price' ? 'price' :
        sb === 'rating' ? 'rating' :
        sb === 'is_new' ? 'is_new' :
        'created_at';

      const result = await getProducts({
        category: activeCat,
        search: searchQuery,
        minPrice: priceRange[0] > 0 ? priceRange[0] : null,
        maxPrice: priceRange[1] < 500000 ? priceRange[1] : null,
        inStock: inStockOnly ? true : null,
        isNew: isNewOnly ? true : null,
        sortBy: sortColumn,
        sortOrder: so || 'desc',
        page,
        limit: PRODUCTS_PER_PAGE,
      });

      let filtered = result.products || [];

      // Multi-catégories : filtrage client-side (Supabase ne supporte qu'un code à la fois)
      if (selectedCategories.length > 1 && !urlCategory) {
        filtered = filtered.filter(p =>
          selectedCategories.includes(p.category?.code || p.category)
        );
      }

      // Helper : normalise variants quel que soit le format (Supabase vs fallback statique)
      const getVariantColors = (p) => {
        const v = p.variants;
        if (!v) return [];
        if (Array.isArray(v)) return v.filter(x => x.variant_type === 'color').map(x => x.variant_value);
        return v.colors || []; // format fallback { colors: [], sizes: [] }
      };
      const getVariantSizes = (p) => {
        const v = p.variants;
        if (!v) return [];
        if (Array.isArray(v)) return v.filter(x => x.variant_type === 'size').map(x => x.variant_value);
        return v.sizes || [];
      };

      if (page === 1) {
        const colors = new Set();
        const sizes = new Set();
        filtered.forEach(p => {
          getVariantColors(p).forEach(c => colors.add(c));
          getVariantSizes(p).forEach(s => sizes.add(s));
        });
        setAvailableColors([...colors]);
        setAvailableSizes([...sizes]);
      }

      if (selectedColors.length > 0) {
        filtered = filtered.filter(p =>
          getVariantColors(p).some(c => selectedColors.includes(c))
        );
      }
      if (selectedSizes.length > 0) {
        filtered = filtered.filter(p =>
          getVariantSizes(p).some(s => selectedSizes.includes(s))
        );
      }

      setProducts(prev => append ? [...prev, ...filtered] : filtered);
      setTotalProducts(result.total || filtered.length);
      setCurrentPage(page);
      setHasMore(page < (result.totalPages || 1));

    } catch (error) {
      console.error('Erreur chargement produits:', error);
      const start = (page - 1) * PRODUCTS_PER_PAGE;
      const slice = fallbackProducts.slice(start, start + PRODUCTS_PER_PAGE);
      setProducts(prev => append ? [...prev, ...slice] : slice);
      setTotalProducts(fallbackProducts.length);
      setHasMore(page * PRODUCTS_PER_PAGE < fallbackProducts.length);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchParams, selectedCategories, priceRange, inStockOnly, isNewOnly, sortBy, selectedColors, selectedSizes]);

  useEffect(() => {
    loadProducts(1, false);
  }, [loadProducts]);

  const loadMore = () => {
    if (hasMore && !loadingMore) loadProducts(currentPage + 1, true);
  };

  const toggleCategory = (code) => {
    setSelectedCategories(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
    if (searchParams.get('category')) {
      const next = new URLSearchParams(searchParams);
      next.delete('category');
      setSearchParams(next);
    }
  };

  const toggle = (setter) => (val) =>
    setter(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 500000]);
    setInStockOnly(false);
    setIsNewOnly(false);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSortBy('created_at-desc');
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    next.delete('search');
    setSearchParams(next);
  };

  const activeFiltersCount = [
    selectedCategories.length > 0,
    priceRange[0] > 0 || priceRange[1] < 500000,
    inStockOnly,
    isNewOnly,
    selectedColors.length > 0,
    selectedSizes.length > 0,
  ].filter(Boolean).length;

  // Chips des filtres actifs
  const activeChips = [
    ...selectedCategories.map(code => ({
      key: `cat-${code}`,
      label: categories.find(c => (c.code || c.id) === code)?.name || code,
      onRemove: () => toggleCategory(code),
    })),
    ...(inStockOnly ? [{ key: 'stock', label: 'En stock', onRemove: () => setInStockOnly(false) }] : []),
    ...(isNewOnly ? [{ key: 'new', label: 'Nouveautés', onRemove: () => setIsNewOnly(false) }] : []),
    ...selectedColors.map(c => ({ key: `col-${c}`, label: c, onRemove: () => toggle(setSelectedColors)(c) })),
    ...selectedSizes.map(s => ({ key: `sz-${s}`, label: `Taille ${s}`, onRemove: () => toggle(setSelectedSizes)(s) })),
    ...(priceRange[0] > 0 || priceRange[1] < 500000 ? [{
      key: 'price',
      label: `${priceRange[0].toLocaleString()}–${priceRange[1].toLocaleString()} FCFA`,
      onRemove: () => setPriceRange([0, 500000]),
    }] : []),
  ];

  const sidebarProps = {
    categories, selectedCategories, toggleCategory,
    priceRange, setPriceRange,
    inStockOnly, setInStockOnly,
    isNewOnly, setIsNewOnly,
    availableColors, selectedColors, toggleColor: toggle(setSelectedColors),
    availableSizes, selectedSizes, toggleSize: toggle(setSelectedSizes),
    activeFiltersCount, resetFilters,
    onClose: () => setShowFilters(false),
  };

  return (
    <>
      <SEOHead
        {...meta}
        includeOrganization={true}
        extraSchemas={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: "La Boutique — Philia'Store",
            description: "Catalogue de plus de 500 produits : mode africaine, beauté, tech, maison, enfants et sport. Livraison dans tout le Sénégal.",
            url: 'https://philiastore.sn/boutique',
            breadcrumb: {
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
              ],
            },
          },
        ]}
      />

      <div className="min-h-screen bg-black text-white py-12">
        <div className="container mx-auto px-4">

          {/* En-tête */}
          <div className="mb-12 border-b border-bronze/20 pb-8">
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-3">La Collection</h1>
            <p className="text-bronze tracking-widest uppercase text-xs">L'élégance sous toutes ses formes</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">

            {/* Bouton filtres mobile */}
            <div className="lg:hidden">
              <Button
                onClick={() => setShowFilters(true)}
                variant="outline"
                className="w-full border-bronze text-white hover:bg-bronze hover:text-white uppercase tracking-widest text-xs cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtres {activeFiltersCount > 0 && (
                  <span className="ml-1 bg-gold text-black text-[10px] font-bold w-4 h-4 rounded-full inline-flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Drawer mobile overlay */}
            <AnimatePresence>
              {showFilters && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
                    onClick={() => setShowFilters(false)}
                  />
                  {/* Drawer */}
                  <motion.div
                    key="drawer"
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="lg:hidden fixed left-0 top-0 bottom-0 w-80 max-w-[90vw] z-50 overflow-y-auto"
                  >
                    <FilterSidebar {...sidebarProps} />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Sidebar desktop */}
            <div className="hidden lg:block">
              <FilterSidebar {...sidebarProps} />
            </div>

            {/* Contenu principal */}
            <div className="flex-1 min-w-0">

              {/* Barre tri */}
              <div className="bg-[#0A0A0A] border border-bronze/20 p-4 rounded-sm mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-gray-400 text-sm">
                  {loading ? (
                    <span className="inline-block w-20 h-4 bg-[#1C1C1C] rounded animate-pulse" />
                  ) : (
                    <><span className="font-bold text-gold">{totalProducts}</span> produit{totalProducts > 1 ? 's' : ''} trouvé{totalProducts > 1 ? 's' : ''}</>
                  )}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 uppercase tracking-widest hidden sm:inline">Trier par :</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none border border-bronze/30 bg-black text-white pl-4 pr-8 py-2 text-sm outline-none focus:border-gold rounded-sm transition-all cursor-pointer"
                    >
                      <option value="created_at-desc">Plus récents</option>
                      <option value="is_new-desc">Nouveautés</option>
                      <option value="price-asc">Prix croissant</option>
                      <option value="price-desc">Prix décroissant</option>
                      <option value="rating-desc">Mieux notés</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-bronze pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Chips filtres actifs */}
              <AnimatePresence>
                {activeChips.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2 mb-6 overflow-hidden"
                  >
                    {activeChips.map(chip => (
                      <ActiveChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
                    ))}
                    {activeChips.length > 1 && (
                      <button
                        onClick={resetFilters}
                        className="text-[11px] text-gray-500 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
                      >
                        Tout effacer
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Skeleton / Grille */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.05 } },
                    }}
                  >
                    {products.map((product) => (
                      <motion.div
                        key={product.id}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                        }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Voir plus */}
                  {hasMore && (
                    <div className="text-center mt-12">
                      <Button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="bg-transparent border border-gold text-gold hover:bg-gold hover:text-black uppercase tracking-widest text-xs rounded-sm px-12 py-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {loadingMore ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Chargement...</>
                        ) : (
                          `Voir plus (${totalProducts - products.length} restants)`
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-24 bg-[#0A0A0A] border border-bronze/20 rounded-sm"
                >
                  <Package className="w-14 h-14 text-bronze/20 mx-auto mb-6" />
                  <p className="text-gray-400 text-lg mb-6 font-serif italic">
                    Aucun produit ne correspond à vos critères
                  </p>
                  <Button
                    onClick={resetFilters}
                    className="bg-transparent border border-gold text-gold hover:bg-gold hover:text-black uppercase tracking-widest text-xs rounded-sm transition-all cursor-pointer"
                  >
                    Réinitialiser les filtres
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopPage;
