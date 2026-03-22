import React from 'react';
import { Helmet } from 'react-helmet';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useWishlist } from '@/hooks/useWishlist';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const WishlistPage = () => {
  const { wishlist, clearWishlist } = useWishlist();
  const { toast } = useToast();

  const handleClearWishlist = () => {
    clearWishlist();
    toast({
      title: 'Liste vidée',
      description: 'Tous vos favoris ont été supprimés.',
    });
  };

  return (
    <>
      <Helmet>
        <title>Mes Favoris — Philia'Store</title>
        <meta
          name="description"
          content="Retrouvez tous vos produits favoris sur Philia'Store."
        />
      </Helmet>

      <div className="min-h-screen bg-black">
        {/* Header */}
        <section className="pt-20 pb-12 border-b border-white/10">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
            >
              <div>
                <p className="text-bronze text-xs uppercase tracking-widest mb-3">
                  Ma collection
                </p>
                <h1 className="font-serif text-4xl md:text-5xl text-white">
                  Mes Favoris
                </h1>
                {wishlist.length > 0 && (
                  <p className="text-white/40 text-sm mt-2">
                    {wishlist.length} {wishlist.length === 1 ? 'article' : 'articles'}
                  </p>
                )}
              </div>

              {wishlist.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={handleClearWishlist}
                    variant="outline"
                    className="flex items-center gap-2 border-bronze/40 text-bronze bg-transparent hover:bg-red-900/20 hover:border-red-500/60 hover:text-red-400 transition-all rounded-sm text-xs uppercase tracking-widest px-6 py-3"
                  >
                    <Trash2 className="w-4 h-4" />
                    Tout supprimer
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            {wishlist.length === 0 ? (
              /* Empty state */
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center mb-8 bg-white/5">
                  <Heart className="w-10 h-10 text-bronze/60" />
                </div>
                <h2 className="font-serif text-3xl text-white mb-3">
                  Votre liste est vide
                </h2>
                <p className="text-white/40 text-sm max-w-xs leading-relaxed mb-10">
                  Les pièces qui vous font vibrer méritent d'être gardées précieusement.
                  Explorez notre boutique et ajoutez vos coups de cœur.
                </p>
                <Link to="/boutique">
                  <Button className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#C9A030] text-black font-semibold text-xs uppercase tracking-widest px-8 py-4 rounded-sm transition-all">
                    Découvrir la boutique
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            ) : (
              /* Product grid */
              <AnimatePresence>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {wishlist.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, delay: index * 0.07 }}
                      layout
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* CTA bottom when wishlist has items */}
        {wishlist.length > 0 && (
          <section className="pb-20">
            <div className="container mx-auto px-4 max-w-6xl text-center">
              <Link to="/boutique">
                <Button
                  variant="outline"
                  className="inline-flex items-center gap-2 border-white/20 text-white/60 hover:border-[#D4AF37] hover:text-[#D4AF37] bg-transparent rounded-sm text-xs uppercase tracking-widest px-8 py-3 transition-all"
                >
                  Continuer mes achats
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default WishlistPage;
