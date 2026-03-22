
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPageMeta } from '@/lib/meta';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const CartPage = () => {
  const meta = getPageMeta('cart');
  const { cart, removeFromCart, updateQuantity, applyCoupon, removeCoupon, getCartTotal, getDiscount, getTotal, coupon } = useCart();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState('');
  
  const handleApplyCoupon = () => {
    if (applyCoupon(couponCode)) {
      toast({
        title: "Privilège accordé",
        description: `Code ${couponCode} appliqué avec succès.`,
      });
      setCouponCode('');
    } else {
      toast({
        title: "Code non reconnu",
        description: "Ce code privilège est inactif ou expiré.",
        variant: "destructive",
      });
    }
  };
  
  const deliveryFee = 2500; // Dakar default
  
  if (cart.length === 0) {
    return (
      <>
        <Helmet>
          <title>{meta.title}</title>
          <meta name="description" content={meta.description} />
        </Helmet>
        
        <div className="min-h-screen bg-black flex items-center justify-center py-20">
          <div className="text-center p-12 max-w-lg w-full">
            <ShoppingBag className="w-16 h-16 text-bronze/50 mx-auto mb-6" />
            <h2 className="text-4xl font-serif text-white mb-4">
              Votre sélection est vide
            </h2>
            <div className="w-12 h-px bg-gold mx-auto mb-6"></div>
            <p className="text-gray-400 font-light mb-10">
              Découvrez nos dernières collections et ajoutez des pièces d'exception à votre sélection.
            </p>
            <Link to="/boutique">
              <Button className="bg-gold text-black hover:bg-bronze uppercase tracking-widest text-xs px-10 py-6 rounded-sm">
                Explorer la Collection
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
      </Helmet>
      
      <div className="min-h-screen bg-black text-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-12 pb-6 border-b border-bronze/20">
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-2">
              Votre Sélection
            </h1>
            <p className="text-bronze text-xs tracking-widest uppercase">Préparez votre commande</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item) => (
                <motion.div
                  key={`${item.id}-${JSON.stringify(item.variant)}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0A0A0A] border border-bronze/30 p-6 rounded-sm flex flex-col sm:flex-row gap-6 hover:border-gold/50 transition-luxury"
                >
                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-40 overflow-hidden rounded-sm border border-bronze/10">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <Link to={`/produit/${item.id}`} className="hover:text-gold transition-luxury">
                          <h3 className="font-serif text-xl text-white mb-1">{item.name}</h3>
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id, item.variant)}
                          className="text-bronze hover:text-gold transition-luxury ml-4"
                          title="Retirer cet article"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mb-3">RÉF: {item.sku}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        {item.variant.color && (
                          <p>Teinte: <span className="text-white">{item.variant.color}</span></p>
                        )}
                        {item.variant.size && (
                          <p>Taille: <span className="text-white">{item.variant.size}</span></p>
                        )}
                      </div>
                    </div>
                    
                    {/* Price & Quantity */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mt-6">
                      <div className="flex items-center border border-bronze/30 rounded-sm overflow-hidden focus-within:border-gold transition-luxury">
                        <button
                          onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}
                          className="w-8 h-8 bg-black flex items-center justify-center hover:bg-bronze/20 text-white transition-luxury"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold w-10 text-center text-sm border-x border-bronze/10 h-8 flex items-center justify-center bg-[#050505]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
                          className="w-8 h-8 bg-black flex items-center justify-center hover:bg-bronze/20 text-white transition-luxury"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-serif text-lg text-white mb-1">{item.price.toLocaleString()} FCFA</p>
                        <p className="text-xs text-gold tracking-widest uppercase">
                          Total: {(item.price * item.quantity).toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#0A0A0A] border border-bronze/30 rounded-sm p-8 sticky top-28">
                <h2 className="text-2xl font-serif text-white mb-6">Résumé</h2>
                <div className="w-full h-px bg-bronze/20 mb-8"></div>
                
                {/* Coupon Code */}
                <div className="mb-8">
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-3">Code Privilège</label>
                  {coupon ? (
                    <div className="flex items-center justify-between p-3 border border-gold bg-gold/5 rounded-sm">
                      <span className="text-gold font-bold tracking-widest text-sm">{coupon.code}</span>
                      <button
                        onClick={removeCoupon}
                        className="text-white hover:text-red-400 text-xs uppercase tracking-widest transition-colors"
                      >
                        Retirer
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="VOTRE CODE"
                        className="flex-1 px-4 py-2 bg-black border border-bronze/40 rounded-sm outline-none focus:border-gold text-white text-xs tracking-widest placeholder-gray-600 transition-luxury"
                      />
                      <Button onClick={handleApplyCoupon} className="bg-bronze/20 text-white hover:bg-bronze hover:text-black border border-bronze text-xs uppercase tracking-widest rounded-sm">
                        Valider
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Price Breakdown */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Sous-total</span>
                    <span className="font-mono">{getCartTotal().toLocaleString()} FCFA</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Livraison est.</span>
                    <span className="font-mono">{deliveryFee.toLocaleString()} FCFA</span>
                  </div>
                  
                  {coupon && (
                    <div className="flex justify-between text-sm text-gold">
                      <span>Privilège ({coupon.code})</span>
                      <span className="font-mono">-{getDiscount().toLocaleString()} FCFA</span>
                    </div>
                  )}
                </div>
                
                <div className="w-full h-px bg-bronze/20 mb-6"></div>
                
                {/* Total */}
                <div className="flex justify-between items-end mb-8">
                  <span className="text-sm uppercase tracking-widest text-gray-400">Total estimé</span>
                  <span className="text-2xl font-serif text-gold">
                    {(getTotal() + deliveryFee).toLocaleString()} FCFA
                  </span>
                </div>
                
                {/* Actions */}
                <div className="space-y-4">
                  <Link to="/checkout" className="block">
                    <Button className="w-full bg-gold hover:bg-[#B8962E] text-black py-7 text-xs font-bold uppercase tracking-widest rounded-sm shadow-glow-gold transition-luxury">
                      Valider la commande
                      <ArrowRight className="ml-3 w-4 h-4" />
                    </Button>
                  </Link>
                  
                  <Link to="/boutique" className="block text-center mt-4">
                    <span className="text-xs uppercase tracking-widest text-bronze hover:text-gold transition-luxury border-b border-transparent hover:border-gold pb-1">
                      Continuer mes achats
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
