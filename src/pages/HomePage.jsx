
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Star, Truck, ShieldCheck, RefreshCw,
  Sparkles, ArrowRight, MessageCircle, Play, Check, Zap, Quote,
} from 'lucide-react';
import { getActiveTestimonials } from '@/services/testimonialsService';
import { getPageMeta } from '@/lib/meta';
import { CATEGORIES, CONTACT_INFO } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import SEOHead from '@/components/SEOHead';

// ─── Données ──────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 1,
    tag: 'Nouvelle Collection',
    title: 'Tissus\nAfricains',
    subtitle: 'Des wax, bazin et tissus brodés pour sublimer votre style traditionnel et moderne.',
    cta: 'Découvrir les tissus',
    ctaLink: '/boutique?category=mode',
    image: '/images/hero/hero-1.jpg',
    accent: '#D4AF37',
  },
  {
    id: 2,
    tag: 'Tendances Femme',
    title: 'Accessoires\nFéminins',
    subtitle: 'Sacs, bijoux et maroquinerie — une sélection curatée pour chaque occasion.',
    cta: 'Voir la collection',
    ctaLink: '/boutique?category=mode',
    image: '/images/hero/hero-2.jpg',
    accent: '#C9A84C',
  },
  {
    id: 3,
    tag: 'Beauté & Soin',
    title: 'Éclat\nNaturel',
    subtitle: 'Produits de beauté et soins sélectionnés pour la femme africaine moderne.',
    cta: 'Explorer la beauté',
    ctaLink: '/boutique?category=beaute',
    image: '/images/hero/hero-3.jpg',
    accent: '#E8C77A',
  },
  {
    id: 4,
    tag: 'Livraison Sénégal',
    title: 'Livré Chez\nVous',
    subtitle: '24h à Dakar • 48-72h partout au Sénégal. Paiement Wave, Orange Money ou cash.',
    cta: 'Commander maintenant',
    ctaLink: '/boutique',
    image: '/images/hero/hero-4.jpg',
    accent: '#D4AF37',
  },
];

const STATS = [
  { value: '2 500+', label: 'Commandes livrées' },
  { value: '98%', label: 'Clients satisfaits' },
  { value: '400+', label: 'Références disponibles' },
  { value: '24h', label: 'Livraison Dakar' },
];

const FEATURES = [
  { icon: Truck, title: 'Livraison Express', desc: '24h à Dakar, 48-72h en régions. Suivi de commande par WhatsApp.' },
  { icon: ShieldCheck, title: 'Paiement Sécurisé', desc: 'Wave, Orange Money, Free Money ou cash à la livraison.' },
  { icon: Sparkles, title: 'Qualité Garantie', desc: 'Chaque tissu et accessoire est rigoureusement sélectionné.' },
  { icon: RefreshCw, title: 'Service Client', desc: 'Une équipe disponible 7j/7 pour vous accompagner.' },
];

const TESTIMONIALS = [
  {
    name: 'Aïssatou D.',
    role: 'Cliente fidèle, Dakar',
    rating: 5,
    text: 'Les tissus sont de très bonne qualité. J\'ai reçu ma commande en moins de 24h. Je recommande vivement !',
    avatar: 'A',
  },
  {
    name: 'Fatou S.',
    role: 'Cliente, Thiès',
    rating: 5,
    text: 'Super boutique ! Les accessoires sont exactement comme sur les photos. Livraison rapide et bien emballée.',
    avatar: 'F',
  },
  {
    name: 'Mariama K.',
    role: 'Cliente régulière',
    rating: 5,
    text: 'Philia\'store est mon adresse préférée pour les cadeaux. Service exceptionnel et prix très abordables.',
    avatar: 'M',
  },
];

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Wax Ankara Premium',
    category: 'Tissus',
    price: 15000,
    badge: 'BESTSELLER',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 2,
    name: 'Sac Cuir Artisanal',
    category: 'Accessoires',
    price: 45000,
    badge: 'NOUVEAU',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 3,
    name: 'Bazin Riche Brodé',
    category: 'Tissus',
    price: 35000,
    badge: '-20%',
    image: 'https://images.unsplash.com/photo-1603189343302-e603f7add05a?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 4,
    name: 'Coffret Beauté Femme',
    category: 'Beauté',
    price: 28000,
    badge: 'VEDETTE',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600',
  },
];

// ─── Hero Carousel ────────────────────────────────────────────────────────────
const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 5500);
    return () => clearInterval(timerRef.current);
  }, [paused, next]);

  const slide = SLIDES[current];

  return (
    <section
      className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Images */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center">
        <div className="container mx-auto px-6 max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + '-content'}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="max-w-xl"
            >
              {/* Tag */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 mb-5"
              >
                <span className="w-8 h-[1px] bg-gold" />
                <span className="text-gold text-xs uppercase tracking-[0.25em] font-medium">
                  {slide.tag}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="font-serif text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-6 whitespace-pre-line"
              >
                {slide.title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="text-white/75 text-base md:text-lg font-light leading-relaxed mb-8 max-w-md"
              >
                {slide.subtitle}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                className="flex flex-wrap gap-4"
              >
                <Link to={slide.ctaLink}>
                  <button className="group inline-flex items-center gap-3 bg-gold hover:bg-gold/90 text-black font-semibold text-xs uppercase tracking-widest px-8 py-4 transition-all duration-200 cursor-pointer">
                    {slide.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <a
                  href={CONTACT_INFO.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-white/30 hover:border-gold text-white hover:text-gold text-xs uppercase tracking-widest px-6 py-4 transition-all duration-200 backdrop-blur-sm cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 border border-white/20 hover:border-gold bg-black/30 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:text-gold transition-all duration-200 cursor-pointer"
        aria-label="Slide précédent"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 border border-white/20 hover:border-gold bg-black/30 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:text-gold transition-all duration-200 cursor-pointer"
        aria-label="Slide suivant"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 cursor-pointer rounded-full ${
              i === current ? 'w-8 h-2 bg-gold' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-8 right-6 md:right-10 z-20 text-white/40 text-xs tracking-widest font-light">
        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>

      {/* TikTok badge */}
      <motion.a
        href="https://www.tiktok.com/@philia.store"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute top-8 right-6 md:right-10 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-white/10 hover:border-gold px-3 py-2 transition-all duration-200 cursor-pointer"
      >
        <Play className="w-3 h-3 text-gold fill-gold" />
        <span className="text-white/80 text-[11px] tracking-wider">@philia.store</span>
      </motion.a>

      {/* Progress bar */}
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-[2px] bg-white/10">
          <motion.div
            key={current}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 5.5, ease: 'linear' }}
            className="h-full bg-gold"
          />
        </div>
      )}
    </section>
  );
};

// ─── Stats bar — fond BRONZE ──────────────────────────────────────────────────
const StatsSection = () => (
  <section className="bg-bronze py-10">
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x-0 md:divide-x divide-white/20">
        {STATS.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="text-center px-4 py-2"
          >
            <p className="text-3xl md:text-4xl font-serif text-white mb-1">{stat.value}</p>
            <p className="text-[11px] text-white/60 uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Catégories — fond BLANC ──────────────────────────────────────────────────
const CategoriesSection = () => (
  <section className="py-24 bg-white">
    <div className="container mx-auto px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-bronze text-xs tracking-[0.3em] uppercase mb-3">Explorer par univers</p>
        <h2 className="font-serif text-4xl md:text-5xl text-black">Nos Collections</h2>
        <div className="w-12 h-[1px] bg-bronze mx-auto mt-4" />
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
          >
            <Link to={`/boutique?category=${cat.id}`}>
              <div className="group relative bg-[#FAF8F4] border border-[#E8DFD0] hover:border-bronze hover:shadow-md transition-all duration-300 p-8 text-center overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-bronze/0 group-hover:from-bronze/5 transition-all duration-500" />
                <div className="relative">
                  <span className="text-3xl mb-4 block">{cat.emoji}</span>
                  <h3 className="text-sm font-semibold text-[#333] group-hover:text-bronze transition-colors uppercase tracking-wider mb-1">
                    {cat.name.split('&')[0].trim()}
                  </h3>
                  <p className="text-[11px] text-[#999]">{cat.count} articles</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-bronze scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Featured Products ────────────────────────────────────────────────────────
const FeaturedProducts = () => (
  <section className="py-24 bg-[#0D0B08]">
    <div className="container mx-auto px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-end justify-between mb-14"
      >
        <div>
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Coups de cœur</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white">Sélection Vedette</h2>
          <div className="w-12 h-[1px] bg-bronze mt-4" />
        </div>
        <Link to="/boutique" className="hidden md:inline-flex items-center gap-2 text-bronze hover:text-gold text-xs uppercase tracking-widest transition-colors cursor-pointer">
          Tout voir <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURED_PRODUCTS.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to="/boutique">
              <div className="group bg-[#120F0B] border border-bronze/20 hover:border-gold transition-all duration-300 overflow-hidden cursor-pointer">
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                  {/* Badge */}
                  <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    product.badge === 'BESTSELLER' ? 'bg-black border border-gold text-gold'
                    : product.badge === 'NOUVEAU' ? 'bg-gold text-black'
                    : product.badge === 'VEDETTE' ? 'bg-black border border-bronze text-bronze'
                    : 'bg-bronze text-white'
                  }`}>
                    {product.badge}
                  </span>
                  {/* Quick buy */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gold text-black py-3 flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Commander</span>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <p className="text-[10px] text-bronze uppercase tracking-widest mb-1">{product.category}</p>
                  <h3 className="text-white text-sm font-serif group-hover:text-gold transition-colors">{product.name}</h3>
                  <p className="text-gold font-bold mt-2">{product.price.toLocaleString()} <span className="text-xs font-normal">FCFA</span></p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10 md:hidden">
        <Link to="/boutique">
          <button className="inline-flex items-center gap-2 border border-gold text-gold hover:bg-gold hover:text-black text-xs uppercase tracking-widest px-8 py-4 transition-all duration-200 cursor-pointer">
            Voir tout <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  </section>
);

// ─── Promo Banner — fond GOLD/BRONZE dégradé ──────────────────────────────────
const PromoBanner = () => {
  const [countdown, setCountdown] = useState({ h: 23, m: 59, s: 59 });

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 23, m: 59, s: 59 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = n => String(n).padStart(2, '0');

  return (
    <section className="py-20 bg-gradient-to-br from-[#D4AF37] via-[#C9A030] to-[#8B7355]">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <span className="inline-flex items-center gap-2 text-black/70 text-xs uppercase tracking-[0.3em] mb-4">
              <Zap className="w-3.5 h-3.5 fill-black/70 text-black/70" /> Offre Flash
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-black mb-4">Édition Éphémère</h2>
            <p className="text-black/60 font-light mb-6">Jusqu'à 30% sur une sélection exclusive. Offre limitée dans le temps.</p>
            <Link to="/promos">
              <button className="inline-flex items-center gap-2 bg-black hover:bg-black/85 text-white font-semibold text-xs uppercase tracking-widest px-8 py-4 transition-all cursor-pointer">
                Voir les promos <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            {[{ v: countdown.h, l: 'Heures' }, { v: countdown.m, l: 'Minutes' }, { v: countdown.s, l: 'Secondes' }].map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-black/30 text-3xl font-light">:</span>}
                <div className="text-center bg-black/15 backdrop-blur-sm border border-black/10 px-5 py-4 min-w-[80px]">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={c.v}
                      initial={{ y: -15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 15, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="block text-3xl font-serif text-black"
                    >
                      {pad(c.v)}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[10px] text-black/50 uppercase tracking-widest block mt-1">{c.l}</span>
                </div>
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── Features — fond BLANC ────────────────────────────────────────────────────
const FeaturesSection = () => (
  <section className="py-24 bg-white">
    <div className="container mx-auto px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-bronze text-xs tracking-[0.3em] uppercase mb-3">Nos engagements</p>
        <h2 className="font-serif text-4xl md:text-5xl text-black">Pourquoi Philia'Store ?</h2>
        <div className="w-12 h-[1px] bg-bronze mx-auto mt-4" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-[#FAF8F4] border border-[#E8DFD0] hover:border-bronze hover:shadow-md p-8 transition-all duration-300"
            >
              <div className="w-12 h-12 border border-bronze/40 group-hover:border-bronze group-hover:bg-bronze/5 flex items-center justify-center mb-5 transition-all">
                <Icon className="w-5 h-5 text-bronze" />
              </div>
              <h3 className="font-serif text-black text-lg mb-3">{f.title}</h3>
              <p className="text-[#666] text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

// ─── Testimonials Carousel ────────────────────────────────────────────────────
const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState(TESTIMONIALS.map((t) => ({
    ...t, avatar_letter: t.avatar,
  })));
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoRef = useRef(null);

  useEffect(() => {
    getActiveTestimonials()
      .then((data) => { if (data?.length) setTestimonials(data); })
      .catch(() => {});
  }, []);

  const perPage = useMemo(() => {
    if (typeof window === 'undefined') return 3;
    return window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
  }, []);

  const total = testimonials.length;
  const maxIndex = Math.max(0, total - perPage);

  const go = useCallback((dir) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((c) => {
      const next = c + dir;
      return next < 0 ? maxIndex : next > maxIndex ? 0 : next;
    });
    setTimeout(() => setIsAnimating(false), 400);
  }, [isAnimating, maxIndex]);

  useEffect(() => {
    autoRef.current = setInterval(() => go(1), 5000);
    return () => clearInterval(autoRef.current);
  }, [go]);

  const pause = () => clearInterval(autoRef.current);
  const resume = () => { autoRef.current = setInterval(() => go(1), 5000); };

  const visible = testimonials.slice(current, current + perPage);
  if (visible.length < perPage) {
    visible.push(...testimonials.slice(0, perPage - visible.length));
  }

  return (
    <section className="py-24 bg-[#FAF8F4]">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Témoignages</p>
          <h2 className="font-serif text-4xl md:text-5xl text-gray-900">Elles en parlent</h2>
          <div className="w-12 h-[1px] bg-bronze mx-auto mt-4" />
        </motion.div>

        <div
          className="relative"
          onMouseEnter={pause}
          onMouseLeave={resume}
          onTouchStart={pause}
          onTouchEnd={resume}
        >
          {/* Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {visible.map((t, i) => (
                <div
                  key={`${t.id ?? t.name}-${i}`}
                  className="bg-white border border-[#E8E0D4] p-8 shadow-[0_2px_20px_rgba(139,115,85,0.08)] hover:shadow-[0_4px_32px_rgba(139,115,85,0.14)] transition-shadow duration-300"
                >
                  {/* Quote mark */}
                  <Quote className="w-6 h-6 text-[#D4AF37]/40 mb-4" />

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating || 5 }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                  </div>

                  <p className="text-gray-700 font-serif italic text-base leading-relaxed mb-6">
                    "{t.text}"
                  </p>

                  <div className="flex items-center gap-3 border-t border-[#E8E0D4] pt-5">
                    <div className="w-9 h-9 shrink-0 bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-serif text-sm font-bold">
                      {t.avatar_letter || t.avatar || (t.name?.charAt(0)?.toUpperCase())}
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-medium">{t.name}</p>
                      {t.role && <p className="text-[11px] text-[#8B7355]/70">{t.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next */}
          {total > perPage && (
            <>
              <button
                onClick={() => go(-1)}
                className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-[#E8E0D4] shadow-md flex items-center justify-center text-gray-600 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-colors cursor-pointer z-10"
                aria-label="Précédent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => go(1)}
                className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-[#E8E0D4] shadow-md flex items-center justify-center text-gray-600 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-colors cursor-pointer z-10"
                aria-label="Suivant"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {total > perPage && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 cursor-pointer rounded-full ${
                  i === current
                    ? 'w-6 h-2 bg-[#D4AF37]'
                    : 'w-2 h-2 bg-[#D4AF37]/30 hover:bg-[#D4AF37]/60'
                }`}
                aria-label={`Aller au témoignage ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ─── Social + WhatsApp CTA — fond BRONZE dégradé ─────────────────────────────
const SocialCTA = () => (
  <section className="py-20 bg-gradient-to-br from-[#6B5640] via-[#8B7355] to-[#5C4730]">
    <div className="container mx-auto px-4 max-w-4xl text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-4">Commander facilement</p>
        <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">
          Commandez par WhatsApp
        </h2>
        <p className="text-white/70 font-light mb-10 max-w-xl mx-auto leading-relaxed">
          Tissus, accessoires, beauté — contactez-nous directement sur WhatsApp pour passer commande, demander des disponibilités ou obtenir un conseil personnalisé.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href={CONTACT_INFO.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm uppercase tracking-widest px-10 py-5 transition-all duration-200 cursor-pointer shadow-[0_4px_24px_rgba(37,211,102,0.4)]"
          >
            <MessageCircle className="w-5 h-5" />
            Commander sur WhatsApp
          </a>
          <Link to="/boutique">
            <button className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs uppercase tracking-widest px-8 py-5 transition-all duration-200 cursor-pointer backdrop-blur-sm">
              Parcourir la boutique
            </button>
          </Link>
        </div>

        {/* Trust bullets */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-10 text-xs text-white/60">
          {['Réponse rapide', 'Livraison 24-72h', 'Wave & Orange Money acceptés', 'Cash à la livraison'].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-white" /> {item}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

// ─── Newsletter ───────────────────────────────────────────────────────────────
const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      toast({ title: 'Inscription réussie', description: 'Merci de rejoindre notre cercle.' });
      setEmail('');
    }
  };

  return (
    <section className="py-24 bg-[#FAF8F4]">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-bronze text-xs tracking-[0.3em] uppercase mb-3">Restez informée</p>
          <h2 className="font-serif text-4xl md:text-5xl text-black mb-4">Le Cercle Philia</h2>
          <p className="text-[#777] mb-10 font-light">
            Nouveautés, offres exclusives et conseils mode — directement dans votre boîte mail.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              required
              className="flex-1 px-5 py-4 bg-white border border-[#D5C8B8] focus:border-bronze outline-none text-black text-sm placeholder:text-[#AAA] transition-colors"
            />
            <button
              type="submit"
              className="bg-black hover:bg-[#222] text-white font-semibold text-xs uppercase tracking-widest px-8 py-4 whitespace-nowrap transition-colors cursor-pointer"
            >
              Rejoindre
            </button>
          </form>
          <p className="text-gray-600 text-xs mt-4">Aucun spam. Désinscription à tout moment.</p>
        </motion.div>
      </div>
    </section>
  );
};

// ─── WhatsApp floating button ─────────────────────────────────────────────────
const WhatsAppFloat = () => (
  <motion.a
    href={CONTACT_INFO.whatsapp}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 2, type: 'spring' }}
    className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_30px_rgba(37,211,102,0.6)] transition-all duration-200 cursor-pointer"
    aria-label="Commander sur WhatsApp"
  >
    <MessageCircle className="w-6 h-6 text-white fill-white" />
    {/* Pulse ring */}
    <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
  </motion.a>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const HomePage = () => {
  const meta = getPageMeta('home');

  return (
    <>
      <SEOHead
        {...meta}
        includeOrganization={true}
        includeWebSite={true}
      />

      <div className="bg-black text-white">
        <HeroCarousel />
        <StatsSection />
        <CategoriesSection />
        <FeaturedProducts />
        <PromoBanner />
        <FeaturesSection />
        <TestimonialsSection />
        <SocialCTA />
        <NewsletterSection />
      </div>

      <WhatsAppFloat />
    </>
  );
};

export default HomePage;
