
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingCart, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/components/ui/use-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    toast({
      title: "Ajouté au panier !",
      description: `${product.name} a été ajouté à votre panier.`,
    });
  };
  
  const handleToggleWishlist = (e) => {
    e.preventDefault();
    const added = toggleWishlist(product);
    toast({
      title: added ? "Ajouté aux favoris !" : "Retiré des favoris",
      description: added 
        ? `${product.name} a été ajouté à vos favoris.`
        : `${product.name} a été retiré de vos favoris.`,
    });
  };
  
  const getBadge = () => {
    const isNew = product.isNew || product.is_new;
    const discount = product.discount || 0;
    const rating = product.rating || 0;
    const isBestseller = product.is_bestseller;
    const isFeatured = product.is_featured;
    if (isNew) return { text: 'NOUVEAU', color: 'bg-[#FFD700] text-black' };
    if (discount > 0) return { text: `-${discount}%`, color: 'bg-[#8B7355] text-white' };
    if (isBestseller) return { text: 'BESTSELLER', color: 'bg-black border border-[#FFD700] text-[#FFD700]' };
    if (isFeatured) return { text: 'VEDETTE', color: 'bg-black border border-[#8B7355] text-[#8B7355]' };
    if (rating >= 4.8) return { text: 'PREMIUM', color: 'bg-black border border-[#FFD700] text-[#FFD700]' };
    return null;
  };

  // Formater le poids : grammes → g ou kg
  const formatWeight = (grams) => {
    if (!grams) return null;
    return grams >= 1000 ? `${(grams / 1000).toFixed(1)} kg` : `${grams} g`;
  };

  const weight = formatWeight(product.weight);
  const inStock = product.inStock ?? product.in_stock ?? true;
  const reviewsCount = product.reviews || product.reviews_count || 0;
  const categoryName = product.category?.name || product.category || '';
  
  const badge = getBadge();
  
  return (
    <Link to={`/produit/${product.id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-[#000000] rounded-xl overflow-hidden shadow-md hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all duration-300 group relative border border-[#8B7355] hover:border-[#FFD700]"
      >
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
            loading="lazy"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {badge && (
            <div className={`absolute top-3 left-3 ${badge.color} px-3 py-1 rounded-sm text-[10px] font-bold tracking-wider uppercase z-10`}>
              {badge.text}
            </div>
          )}

          {/* Badge stock épuisé */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <span className="bg-black/80 border border-bronze/50 text-gray-400 px-4 py-1.5 text-[10px] uppercase tracking-widest rounded-sm">
                Épuisé
              </span>
            </div>
          )}
          
          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleWishlist}
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg border ${
                isInWishlist(product.id)
                  ? 'bg-[#FFD700] border-[#FFD700] text-black'
                  : 'bg-black/50 border-[#8B7355] text-white hover:bg-[#FFD700] hover:border-[#FFD700] hover:text-black backdrop-blur-sm'
              } transition-all`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 bg-black/50 border border-[#8B7355] text-white rounded-full flex items-center justify-center hover:bg-[#FFD700] hover:border-[#FFD700] hover:text-black transition-all shadow-lg backdrop-blur-sm"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          </div>
          
          <motion.button
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 bg-[#FFD700] text-black py-3.5 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-300 ease-out z-10"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="font-bold text-sm tracking-wide uppercase">Ajouter</span>
          </motion.button>
        </div>
        
        {/* Product Info */}
        <div className="p-5">
          <p className="text-[10px] text-[#8B7355] font-semibold uppercase tracking-widest mb-2">
            {categoryName}
          </p>

          <h3 className="text-white font-serif text-lg mb-2 line-clamp-2 group-hover:text-[#FFD700] transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-sm ${i < Math.floor(product.rating || 0) ? 'text-[#FFD700]' : 'text-gray-700'}`}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-[11px] text-gray-500 tracking-wider uppercase">({reviewsCount})</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline space-x-3">
              <span className="text-xl font-bold text-[#FFD700]">
                {product.price.toLocaleString()} FCFA
              </span>
              {(product.oldPrice || product.old_price) && (
                <span className="text-sm text-[#8B7355] line-through decoration-[#8B7355]/50">
                  {(product.oldPrice || product.old_price).toLocaleString()}
                </span>
              )}
            </div>
            {/* Poids — utile pour frais de livraison */}
            {weight && (
              <div className="flex items-center gap-1 text-[10px] text-gray-600">
                <Scale className="w-3 h-3" />
                <span>{weight}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
