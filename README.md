# Philia'Store — Boutique E-Commerce Sénégalaise

> Application e-commerce complète ciblant le marché sénégalais — paiements mobile money, livraison dans les 14 régions, panel admin temps réel et mode PWA hors-ligne.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

> ⚠️ Code source privé — ce dépôt présente l'architecture et les fonctionnalités du projet.

---

## Aperçu

- **498 produits** dans 6 catégories : Mode, Beauté, Technologie, Maison, Enfants, Sport
- Interface en français, design doré sur fond sombre
- Paiements : Wave · Orange Money · Free Money · Cash à la livraison
- Livraison couvrant les **14 régions du Sénégal**
- PWA installable avec mode hors-ligne

---

## Fonctionnalités

### Boutique
- Catalogue avec filtres : catégorie, prix, couleur, taille, stock, nouveautés
- Recherche textuelle temps réel
- Badges : promo, bestseller, nouveau, vedette
- Pagination côté serveur via Supabase

### Panier & Checkout
- Commande sans compte obligatoire (guest checkout)
- Codes promo validés **côté serveur** via Edge Function (protection anti-manipulation)
- Prix recalculés côté serveur
- Livraison Dakar Express (24h, 2 500 FCFA) ou régions (48-72h, 5 000 FCFA)

### Panel Admin
- Dashboard : métriques temps réel (CA, commandes, KPIs), graphiques Recharts
- CRUD produits + upload images Supabase Storage
- Gestion commandes, coupons, témoignages, paramètres
- Notifications temps réel (Supabase Realtime) sur nouvelles commandes

### PWA
- Service Worker + cache hors-ligne
- Page offline personnalisée
- Manifest installable

---

## Architecture

```
philia-store/
├── src/
│   ├── components/
│   │   ├── shop/            ← Catalogue, produit, panier
│   │   ├── checkout/        ← Tunnel de commande
│   │   ├── admin/           ← Panel administration
│   │   └── ui/              ← Composants partagés
│   ├── hooks/               ← TanStack Query hooks
│   ├── lib/
│   │   └── supabase.ts      ← Client Supabase
│   └── pages/
├── supabase/
│   └── functions/           ← Edge Functions (commandes sécurisées)
└── public/
    ├── sw.js                ← Service Worker
    └── manifest.json
```

---

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, Vite 5, TailwindCSS 3, Framer Motion, Radix UI |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime + RLS) |
| State / Cache | Context API + TanStack Query 5 |
| Edge Functions | Supabase Deno Functions |
| SEO | React Helmet, JSON-LD, Open Graph, sitemap.xml |
| Paiements | Wave · Orange Money · Free Money |
| Déploiement | Vercel / Netlify + GitHub Actions |

---

## Auteur

**Abdou Niang** — Full Stack Engineer & DevOps  
📧 [abdouniang30@gmail.com](mailto:abdouniang30@gmail.com) · [LinkedIn](https://www.linkedin.com/in/abdou-niang-305272159/) · [GitHub](https://github.com/Papabdou12)  
📍 Keur Massar, Dakar — disponible en remote
