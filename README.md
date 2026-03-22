# Philia'Store — Boutique en Ligne Sénégalaise

![Node](https://img.shields.io/badge/Node-20.19.1-green) ![Vite](https://img.shields.io/badge/Vite-5.4.0-646CFF) ![React](https://img.shields.io/badge/React-18.3-61DAFB) ![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8) ![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.x-FF4154) ![License](https://img.shields.io/badge/License-MIT-yellow)

> Application e-commerce React + Supabase ciblant le marché sénégalais, avec paiement mobile (Wave, Orange Money, Free Money), livraison dans toutes les régions du Sénégal, panel d'administration complet et notifications temps réel.

## Aperçu

- **Démo** : `https://votre-domaine.sn`
- Interface en français, couleurs dorées sur fond noir, typographies DM Sans + Cormorant Garamond
- 498 produits dans 6 catégories : Mode, Beauté, Technologie, Maison, Enfants, Sport

## Stack Technique

| Couche | Technologies |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Framer Motion, Radix UI |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime + RLS) |
| State / Cache | Context API + TanStack Query 5 (stale-while-revalidate, 30s) |
| Edge Functions | Supabase Deno Functions (création commande sécurisée) |
| SEO | React Helmet, JSON-LD, Open Graph, sitemap.xml, llms.txt |
| Déploiement | Vercel (`vercel.json`) ou Netlify (`public/_headers`) |

---

## Fonctionnalités

### Boutique publique
- Catalogue avec filtres par catégorie, prix, couleur, taille, stock, nouveautés
- Recherche textuelle en temps réel
- Badges produit : promo, bestseller, nouveau, vedette
- Pagination côté serveur via Supabase

### Panier & Wishlist
- Ajout/suppression/modification des quantités
- Persistance LocalStorage (préfixe `philiastore_`)
- Favoris synchronisés entre onglets

### Checkout
- Commande sans compte obligatoire (guest checkout)
- Paiements mobiles : Wave, Orange Money, Free Money, Cash à la livraison
- Livraison Dakar Express (24h, 2 500 FCFA) ou régions (48-72h, 5 000 FCFA)
- 14 régions du Sénégal couvertes
- Codes promo validés **côté serveur** via Edge Function
- Prix recalculés côté serveur (protection contre la manipulation client)

### Panel d'administration
- **Dashboard** : métriques temps réel (CA, commandes, produits, KPIs), graphiques Recharts
- **Produits** : CRUD complet + upload images Supabase Storage
- **Catégories** : gestion des catégories du catalogue
- **Commandes** : liste, détail, changement de statut
- **Coupons** : création, activation/désactivation, limites d'usage
- **Témoignages** : CRUD + toggle visibilité + ordre d'affichage
- **Paramètres** : zones de livraison, frais, paramètres boutique
- **Notifications Realtime** : cloche en header avec badge non-lus, abonnement Supabase Realtime sur les nouvelles commandes

### PWA
- Service Worker (`public/sw.js`) pour le cache et le mode hors-ligne
- Page offline personnalisée (`public/offline.html`)
- Manifest installable (`public/manifest.json`)

### SEO & GEO
- Métadonnées par page via React Helmet (`src/lib/meta.js`)
- Open Graph et Twitter Cards
- `public/sitemap.xml` pour les moteurs de recherche
- `public/llms.txt` généré au build pour ChatGPT, Perplexity, Claude
- `public/robots.txt` avec directives pour crawlers IA

---

## Sécurité

| Mesure | Détail |
|---|---|
| **RLS** | Row Level Security activé sur les 14 tables Supabase |
| **Auth admin** | Rôle vérifié via JWT `app_metadata.role = 'admin'` (non modifiable côté client) |
| **Edge Function** | Création de commande : recalcul prix + validation coupon + rate limit 5/tel/24h |
| **XSS** | Sanitisation via `validators.js`, JSON-LD `</script>` échappé dans `SEOHead.jsx` |
| **Rate limiting login** | 5 tentatives max, blocage 15 min (AdminLogin.jsx) |
| **CSP** | Content Security Policy dans `vercel.json` (prod) et `vite.config.js` (dev) |
| **Headers** | `X-Frame-Options: DENY`, `X-Content-Type-Options`, `HSTS`, `Referrer-Policy` |
| **CORS Edge Function** | `ALLOWED_ORIGIN` paramétrable via secret Supabase |
| **Secrets** | Aucun secret dans le code — variables d'environnement uniquement |
| **Storage** | Upload images limité aux admins authentifiés (RLS Storage) |

> **Score sécurité : 7.5/10** — Voir les [actions manuelles requises](#actions-manuelles-supabase) avant la mise en production.

---

## Installation & Démarrage

### Prérequis
- Node.js 20.19.1 (voir `.nvmrc`)
- Compte Supabase (offre gratuite suffisante)

### 1. Cloner et installer

```bash
git clone git@github.com:VOTRE_USERNAME/philia-store.git
cd philia-store
nvm use        # Node 20.19.1 via .nvmrc
npm install
```

### 2. Variables d'environnement

Créer `.env.local` à la racine :

```env
VITE_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

> Clés disponibles dans **Supabase Dashboard** → **Settings** → **API**.
> Ne jamais committer ce fichier (protégé par `.gitignore`).

### 3. Démarrer en développement

```bash
npm run dev    # http://localhost:3000
```

---

## Migrations Supabase

### Ordre d'exécution

Les migrations doivent être exécutées **dans cet ordre** dans le Supabase SQL Editor :

| # | Script npm | Fichier | Description |
|---|---|---|---|
| 1 | `npm run db:schema` | `supabase/schema.sql` | Tables de base : products, categories, orders, order_items, coupons |
| 2 | `npm run db:shop` | `supabase/migration_shop_v2.sql` | Extension schema v2 (sous-catégories, marques, tags, badges SEO) |
| 3 | `npm run db:security` | `supabase/migration_security.sql` | RLS + `is_admin()` + bucket Storage `products` |
| 4 | `npm run db:settings` | `supabase/migration_settings.sql` | Zones de livraison + paramètres boutique |
| 5 | `npm run db:testimonials` | `supabase/migration_testimonials.sql` | Table témoignages + RLS |

Exécuter toutes les migrations d'un coup :

```bash
npm run db:all
```

### Créer le compte admin

**Option A — SQL Editor Supabase** (recommandé) :

```sql
-- 1. Créer l'utilisateur via Dashboard > Authentication > Users > Invite user
-- 2. Lui attribuer le rôle admin dans app_metadata :
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
  || '{"role": "admin"}'::jsonb
WHERE email = 'votre@email.com';
```

**Option B — Migration existante** :

Exécuter `supabase/patch_admin_app_metadata.sql` dans le SQL Editor pour migrer un admin existant de `user_metadata` vers `app_metadata`.

### Vérifier que les RLS sont actifs

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Toutes les tables doivent avoir rowsecurity = true
```

---

## Edge Function — Création de commande

L'Edge Function `create-order` sécurise le checkout :
- **Recalcul prix** côté serveur (les prix client ne sont jamais utilisés)
- **Validation coupon** côté serveur
- **Coût livraison** lu depuis `delivery_zones` (non fourni par le client)
- **Rate limiting** : 5 commandes max par numéro de téléphone par 24h

### Déploiement

```bash
# Lier le projet (une seule fois)
npx supabase link --project-ref VOTRE_PROJECT_ID

# Déployer la fonction
npx supabase functions deploy create-order

# Configurer le domaine de production pour le CORS
npx supabase secrets set ALLOWED_ORIGIN=https://votre-domaine.sn
```

> Tant que l'Edge Function n'est pas déployée, le checkout utilise un fallback avec insertion directe (moins sécurisé).

---

## Notifications Realtime

Le panel admin affiche en temps réel les nouvelles commandes et changements de statut.

### Activer Realtime sur Supabase

1. **Supabase Dashboard** → **Database** → **Replication**
2. Section `supabase_realtime` → table `orders`
3. Cocher **INSERT** et **UPDATE**

L'icône cloche dans le header affiche :
- Un badge rouge avec le nombre de notifications non lues
- Un point vert **Live** quand la connexion Realtime est établie
- Un historique persisté en `localStorage` (50 dernières entrées)

---

## Cache (TanStack Query)

Toutes les pages admin peuvent utiliser `useQuery` avec les clés centralisées :

```js
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';

// Exemple — liste des commandes avec cache 30s
const { data, isLoading } = useQuery({
  queryKey: queryKeys.orders.list(filters),
  queryFn: () => getOrders(filters),
});

// Invalider le cache après une mutation
queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
```

Configuration :
- `staleTime: 30s` — zéro re-fetch si la donnée est fraîche
- `gcTime: 5min` — navigation instantanée entre les pages admin
- `retry: 1` — une seule relance réseau (adapté 3G/4G)

---

## Structure du Projet

```
philia'store/
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service Worker
│   ├── offline.html         # Page hors-ligne
│   ├── robots.txt           # SEO + crawlers IA
│   ├── sitemap.xml          # Plan du site
│   ├── llms.txt             # GEO (ChatGPT/Perplexity/Claude)
│   ├── _headers             # Headers sécurité Netlify
│   └── _redirects           # Routing SPA Netlify
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── Header.jsx              # Header avec notifications
│   │   │   ├── Sidebar.jsx             # Navigation latérale
│   │   │   ├── NotificationDropdown.jsx # Cloche Realtime
│   │   │   ├── ProtectedRoute.jsx      # Garde admin
│   │   │   ├── StatsCard.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── DataTable.jsx
│   │   │   └── ImageUploader.jsx
│   │   └── ui/                         # Primitives Radix UI
│   ├── contexts/
│   │   ├── AppContext.jsx              # Panier, wishlist, coupons
│   │   ├── AdminAuthContext.jsx        # Auth admin (app_metadata)
│   │   ├── NotificationContext.jsx     # Supabase Realtime + cache TQ
│   │   └── ThemeContext.jsx            # Dark/light mode
│   ├── hooks/
│   │   ├── useCart.js
│   │   └── useWishlist.js
│   ├── lib/
│   │   ├── supabase.js                 # Client Supabase
│   │   ├── queryClient.js              # TanStack Query config + queryKeys
│   │   ├── constants.js                # Couleurs, contacts, livraison
│   │   ├── meta.js                     # Métadonnées SEO par page
│   │   ├── productData.js              # Fallback statique (498 produits)
│   │   └── validators.js               # Anti-XSS, validation formulaires
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── products/               # ProductList, ProductForm
│   │   │   ├── orders/                 # OrderList, OrderDetail
│   │   │   ├── coupons/                # CouponList, CouponForm
│   │   │   ├── categories/             # CategoryList
│   │   │   └── testimonials/           # TestimonialList
│   │   ├── HomePage.jsx
│   │   ├── ShopPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── WishlistPage.jsx
│   │   ├── PromoPage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── ContactPage.jsx
│   │   ├── CGVPage.jsx
│   │   ├── DeliveryPage.jsx
│   │   └── ReturnsPage.jsx
│   ├── services/
│   │   ├── productService.js           # CRUD produits + upload images
│   │   ├── orderService.js             # Commandes (Edge Function + fallback)
│   │   ├── couponService.js            # Validation et gestion coupons
│   │   ├── authService.js              # Auth admin (app_metadata)
│   │   ├── settingsService.js          # Zones livraison + paramètres
│   │   ├── testimonialsService.js      # Témoignages (public + admin)
│   │   └── analyticsService.js         # Métriques dashboard
│   └── App.jsx                         # Routeur + providers
├── supabase/
│   ├── schema.sql
│   ├── migration_shop_v2.sql
│   ├── migration_security.sql
│   ├── migration_settings.sql
│   ├── migration_testimonials.sql
│   ├── patch_admin_app_metadata.sql    # Migration user_metadata → app_metadata
│   └── functions/
│       └── create-order/
│           └── index.ts                # Edge Function checkout sécurisé
├── plugins/                            # Plugins Vite (éditeur Hostinger Horizons)
├── tools/
│   └── generate-llms.js               # Générateur llms.txt au build
├── vercel.json                         # Headers sécurité Vercel (CSP, HSTS...)
├── .nvmrc                              # Node 20.19.1
└── vite.config.js
```

---

## Routes

| Route | Page | Accès |
|---|---|---|
| `/` | Accueil | Public |
| `/boutique` | Boutique | Public |
| `/produit/:id` | Fiche produit | Public |
| `/panier` | Panier | Public |
| `/checkout` | Checkout | Public |
| `/wishlist` | Favoris | Public |
| `/promos` | Promotions | Public |
| `/a-propos` | À propos | Public |
| `/contact` | Contact | Public |
| `/cgv` | CGV | Public |
| `/livraison` | Livraison | Public |
| `/retours` | Retours | Public |
| `/admin/login` | Connexion admin | Public |
| `/admin` | Dashboard | Admin |
| `/admin/products` | Liste produits | Admin |
| `/admin/products/new` | Nouveau produit | Admin |
| `/admin/products/:id` | Modifier produit | Admin |
| `/admin/categories` | Catégories | Admin |
| `/admin/orders` | Liste commandes | Admin |
| `/admin/orders/:id` | Détail commande | Admin |
| `/admin/coupons` | Liste coupons | Admin |
| `/admin/coupons/new` | Nouveau coupon | Admin |
| `/admin/coupons/:id` | Modifier coupon | Admin |
| `/admin/testimonials` | Témoignages | Admin |
| `/admin/settings` | Paramètres & Livraison | Admin |

---

## Déploiement

### Vercel (recommandé)

```bash
npm run build
# Déployer le dossier dist/
```

Le fichier `vercel.json` configure automatiquement les headers sécurité et le routing SPA.

Variables d'environnement à configurer dans **Vercel** → Settings → Environment Variables :

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### Netlify

```bash
npm run build
# Output directory : dist/
```

Le fichier `public/_headers` configure les headers sécurité et `public/_redirects` gère le routing SPA.

---

## Commandes

```bash
npm run dev              # Dev server (http://localhost:3000)
npm run build            # Build production (génère llms.txt puis vite build)
npm run preview          # Preview du build (http://localhost:3000)
npm run lint             # ESLint silencieux (erreurs uniquement)
npm run lint:warn        # ESLint avec avertissements

# Migrations Supabase
npm run db:schema        # Schema de base
npm run db:shop          # Migration shop v2
npm run db:security      # RLS + Storage
npm run db:settings      # Zones livraison + paramètres
npm run db:testimonials  # Témoignages
npm run db:all           # Toutes les migrations dans l'ordre

# Edge Function
npx supabase functions deploy create-order
npx supabase secrets set ALLOWED_ORIGIN=https://votre-domaine.sn
```

---

## Actions manuelles Supabase

Ces actions ne peuvent pas être automatisées et doivent être faites manuellement dans le Dashboard Supabase avant la mise en production :

- [ ] **Changer le mot de passe admin** → Authentication → Users → Reset password
- [ ] **Migrer `app_metadata`** → Exécuter `supabase/patch_admin_app_metadata.sql` dans SQL Editor
- [ ] **Activer Realtime** → Database → Replication → `orders` → cocher INSERT et UPDATE
- [ ] **Déployer Edge Function** → `npx supabase functions deploy create-order`
- [ ] **Supprimer INSERT public orders** (après déploiement Edge Function) :
  ```sql
  DROP POLICY IF EXISTS "orders_insert_anon" ON orders;
  ```
- [ ] **Activer CAPTCHA** → Authentication → Settings → Enable CAPTCHA (hCaptcha)

---

## Contact

- **Email** : contact@votre-domaine.sn
- **WhatsApp** : +221 XX XXX XX XX
- **Adresse** : Dakar, Sénégal

---

## Licence

MIT
