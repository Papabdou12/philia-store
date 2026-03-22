import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Tag, Clock, Gift, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getPageMeta } from '@/lib/meta';
import { getFlashSaleProducts } from '@/lib/productData';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const PromoPage = () => {
  const meta = getPageMeta('promos');
  const { toast } = useToast();
  const flashSaleProducts = getFlashSaleProducts(8);

  const [countdown, setCountdown] = useState({ h: 11, m: 59, s: 59 });

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 11, m: 59, s: 59 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = n => String(n).padStart(2, '0');

  const promoCodes = [
    {
      code: 'BIENVENUE',
      discount: '15%',
      description: 'Réduction de 15% sur votre première commande',
      icon: Gift,
    },
    {
      code: 'FLASH25',
      discount: '25%',
      description: 'Vente flash : -25% sur une sélection de produits',
      icon: TrendingUp,
    },
    {
      code: 'PROMO10K',
      discount: '10 000 FCFA',
      description: 'Réduction fixe de 10 000 FCFA sur les commandes de plus de 100 000 FCFA',
      icon: Tag,
    },
  ];

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Code copié !',
      description: `Le code ${code} a été copié dans votre presse-papiers.`,
    });
  };

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
      </Helmet>

      <div className="min-h-screen bg-black">
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-[#D4AF37] via-[#C9A030] to-[#8B7355] py-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-black/60 text-xs uppercase tracking-[0.3em] mb-4">
                Offres exclusives
              </p>
              <h1 className="font-serif text-5xl md:text-6xl text-black mb-5">
                Promotions &amp; Codes Promo
              </h1>
              <p className="text-black/70 text-lg font-light">
                Profitez de nos offres exclusives et économisez sur vos achats
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Codes Promo ─────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-14">
              <p className="text-bronze text-xs uppercase tracking-widest mb-3">
                À utiliser lors du paiement
              </p>
              <h2 className="font-serif text-4xl text-black">
                Codes Promo Actifs
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {promoCodes.map((promo, index) => {
                const Icon = promo.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#0A0A0A] border border-bronze/20 p-8"
                  >
                    <Icon className="w-8 h-8 text-[#D4AF37] mb-5" />
                    <div className="text-3xl font-serif text-[#D4AF37] mb-2">
                      {promo.discount}
                    </div>
                    <p className="text-white/50 text-sm mb-6 leading-relaxed">
                      {promo.description}
                    </p>

                    <div className="border border-[#D4AF37]/30 bg-white/5 px-4 py-3 flex items-center justify-between gap-3">
                      <code className="text-[#D4AF37] font-bold tracking-widest text-lg">
                        {promo.code}
                      </code>
                      <Button
                        onClick={() => handleCopyCode(promo.code)}
                        size="sm"
                        className="bg-[#D4AF37] hover:bg-[#C9A030] text-black text-xs uppercase tracking-wider rounded-sm px-4"
                      >
                        Copier
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Flash Sale ──────────────────────────────────────────────── */}
        <section className="py-20 bg-[#0A0A0A]">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Header + Countdown */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-14">
              <div>
                <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 px-5 py-2 mb-5">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">
                    Vente Flash
                  </span>
                </div>
                <h2 className="font-serif text-4xl text-white mb-2">
                  Offres à Durée Limitée
                </h2>
                <p className="text-white/40 text-sm">
                  Profitez de réductions exceptionnelles avant la fin du compte à rebours
                </p>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-3">
                {[
                  { v: countdown.h, l: 'Heures' },
                  { v: countdown.m, l: 'Minutes' },
                  { v: countdown.s, l: 'Secondes' },
                ].map((c, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <span className="text-[#D4AF37]/40 text-3xl font-light">:</span>
                    )}
                    <div className="text-center bg-black/50 border border-[#D4AF37]/20 px-5 py-4 min-w-[80px]">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={c.v}
                          initial={{ y: -12, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 12, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="block font-serif text-3xl text-[#D4AF37]"
                        >
                          {pad(c.v)}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-[10px] text-white/30 uppercase tracking-widest block mt-1">
                        {c.l}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashSaleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Offres Saisonnières ──────────────────────────────────────── */}
        <section className="py-20 bg-[#FAF8F4]">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-14">
              <p className="text-bronze text-xs uppercase tracking-widest mb-3">
                En ce moment
              </p>
              <h2 className="font-serif text-4xl text-black">
                Offres Saisonnières
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-[#0A0A0A] border border-[#D4AF37]/20 p-10"
              >
                <p className="text-[#D4AF37] text-xs uppercase tracking-widest mb-2">
                  −20% sur la collection
                </p>
                <h3 className="font-serif text-2xl text-white mb-4">
                  Nouveautés Mode
                </h3>
                <p className="text-white/50 text-sm mb-8 leading-relaxed">
                  Découvrez les dernières tendances avec −20% sur toute la nouvelle collection
                </p>
                <Link to="/boutique?category=mode">
                  <Button className="bg-[#D4AF37] hover:bg-[#C9A030] text-black text-xs uppercase tracking-wider rounded-sm px-6">
                    Voir la collection
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-[#0A0A0A] border border-bronze/20 p-10"
              >
                <p className="text-bronze text-xs uppercase tracking-widest mb-2">
                  Jusqu'à −30%
                </p>
                <h3 className="font-serif text-2xl text-white mb-4">
                  Tech Week
                </h3>
                <p className="text-white/50 text-sm mb-8 leading-relaxed">
                  Jusqu'à −30% sur une sélection d'appareils électroniques premium
                </p>
                <Link to="/boutique?category=tech">
                  <Button className="bg-transparent hover:bg-bronze/10 text-bronze border border-bronze/40 hover:border-bronze text-xs uppercase tracking-wider rounded-sm px-6 transition-all">
                    Découvrir les offres
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Newsletter ──────────────────────────────────────────────── */}
        <section className="py-20 bg-bronze">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <p className="text-black/50 text-xs uppercase tracking-[0.3em] mb-3">
              Restez informé
            </p>
            <h2 className="font-serif text-4xl text-black mb-4">
              Ne Manquez Aucune Offre
            </h2>
            <p className="text-black/70 text-base mb-8 font-light">
              Inscrivez-vous à notre newsletter et recevez −15% sur votre première commande
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="px-6 py-4 bg-white text-black placeholder:text-black/40 outline-none flex-1 max-w-md text-sm rounded-sm"
              />
              <Button className="bg-black hover:bg-black/85 text-white px-8 py-4 text-xs uppercase tracking-widest rounded-sm transition-all">
                S'inscrire
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PromoPage;
