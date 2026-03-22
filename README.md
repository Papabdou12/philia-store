# Philia'Store — Boutique en Ligne Sénégalaise

![Node](https://img.shields.io/badge/Node-20.19.1-green) ![Vite](https://img.shields.io/badge/Vite-5.4.0-646CFF) ![React](https://img.shields.io/badge/React-18.3-61DAFB) ![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8) ![License](https://img.shields.io/badge/License-MIT-yellow)

> Application e-commerce React + Supabase ciblant le marché sénégalais, avec paiement mobile (Wave, Orange Money, Free Money), livraison dans toutes les régions du Sénégal, et panel d'administration complet.

## Aperçu

- **Démo** : `https://philiastore.sn` *(placeholder)*
- Interface en français, couleurs dorées sur fond noir, typographies DM Sans + Cormorant Garamond
- 498 produits dans 6 catégories : Mode, Beauté, Technologie, Maison, Enfants, Sport

## Stack Technique

| Couche | Technologies |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Framer Motion, Radix UI |
| Backend | Supabase (PostgreSQL + Auth + Storage + RLS) |
| State | Context API + hooks personnalisés, persistance LocalStorage |
| SEO | React Helmet, JSON-LD, Open Graph, sitemap.xml, llms.txt |
| Deploiement | Netlify (recommandé) ou Vercel |

## Fonctionnalités

### Boutique
- Catalogue avec filtres par catégorie, sous-catégorie, marque et fourchette de prix
- Recherche textuelle en temps réel
- Badges produit : promo, bestseller, nouveau, vedette
- Pagination côté serveur via Supabase

### Panier & Wishlist
- Ajout/suppression/modification des quantités
- Persistance LocalStorage avec préfixe `philiastore_`
- Favoris synchronisés entre onglets

### Checkout
- Commande sans compte obligatoire (guest checkout)
- Paiements mobiles : Wave, Orange Money, Free Money
- Paiement cash à la livraison
- Livraison Dakar Express (24h, 2 500 FCFA) ou régions (48-72h, 5 000 FCFA)
- Zones couvertes : les 14 régions du Sénégal
- Codes promo avec validation côté client

### Admin Panel
- Dashboard avec métriques (chiffre d'affaires, commandes, produits)
- Gestion des produits : création, modification, suppression, upload images
- Gestion des commandes : liste, détail, changement de statut
- Gestion des coupons : création, activation/désactivation
- Authentification par email/mot de passe via Supabase Auth
- Accès protégé : rôle `admin` vérifié via JWT `user_metadata.role`

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

### Securite
- Row Level Security (RLS) activé sur toutes les tables Supabase
- Fonction SQL `is_admin()` centralisée pour les politiques RLS
- Validation des formulaires côté client (`src/lib/validators.js`) — anti-XSS, format téléphone sénégalais
- Rate limiting sur le login admin : 5 tentatives max, blocage 15 min
- Content Security Policy via `public/_headers` (Netlify)
- Upload d'images limité aux admins authentifiés

---

## Installation & Demarrage

### Prerequis
- Node.js 20.19.1 (voir `.nvmrc`)
- Compte Supabase (offre gratuite suffisante)

### 1. Cloner et installer

```bash
git clone <repo>
cd philia-store
nvm use        # utilise Node 20.19.1 via .nvmrc
npm install
```

### 2. Variables d'environnement

```bash
cp .env.local .env.local.bak   # sauvegarde si besoin
```

Editer `.env.local` :

```env
VITE_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

> Les clés se trouvent dans **Supabase Dashboard** → **Settings** → **API**.
> Ne jamais committer ce fichier (il est dans `.gitignore`).

### 3. Demarrer en developpement

```bash
npm run dev    # http://localhost:3000
```

---

## Migrations Supabase

### Ordre d'execution (IMPORTANT)

Les migrations doivent être exécutées **dans cet ordre** dans le Supabase SQL Editor :

| # | Fichier | Description |
|---|---------|-------------|
| 1 | `supabase/schema.sql` | Tables de base : products, categories, subcategories, brands, orders, order_items, coupons |
| 2 | `supabase/migration_shop_v2.sql` | Nouveaux champs (poids, marque, tags, badges, min/max quantité, méta SEO) + table sous-catégories et marques |
| 3 | `supabase/migration_security.sql` | RLS (Row Level Security) + helper `is_admin()` + bucket Storage `products` |

### Comment executer une migration

1. Ouvrir [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner ton projet → **SQL Editor**
3. Cliquer **New query**
4. Copier-coller le contenu du fichier SQL
5. Cliquer **Run** (ou `Ctrl+Enter`)
6. Vérifier que le message `Success` s'affiche

### Verifier que les RLS sont actifs

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

> Toutes les tables doivent avoir `rowsecurity = true`.

### Creer le compte admin (premiere fois)

Dans **Supabase Dashboard** → **Authentication** → **Users** → **Invite user**, puis :

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'votre@email.com';
```

---

## Gestion des Images Produits

### Upload depuis l'Admin Panel

1. Aller dans `/admin/products/new` ou modifier un produit existant
2. La section **Images** permet de glisser-déposer ou sélectionner des fichiers
3. Les images sont uploadées automatiquement dans **Supabase Storage** (bucket `products`)
4. Formats acceptés : JPEG, PNG, WebP, GIF — max **5 MB** par image

### Bucket Storage public

Le bucket `products` est configuré en public par `migration_security.sql`.
Les URLs ont la forme :

```
https://VOTRE_PROJECT_ID.supabase.co/storage/v1/object/public/products/NOM_FICHIER.jpg
```

### Verifier le bucket dans Supabase

1. Supabase Dashboard → **Storage**
2. Le bucket `products` doit apparaître avec l'icône publique
3. Si absent : exécuter à nouveau `migration_security.sql`

### Fallback images

Si Supabase n'est pas configuré, le site utilise les données statiques de `src/lib/productData.js` (498 produits avec images hébergées en externe). Tous les services appliquent ce même mécanisme de fallback.

---

## Structure du Projet

```
philia'store/
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service Worker
│   ├── offline.html        # Page hors-ligne
│   ├── robots.txt          # SEO + crawlers IA
│   ├── sitemap.xml         # Plan du site
│   ├── llms.txt            # GEO (ChatGPT/Perplexity/Claude)
│   ├── _headers            # Headers securite Netlify (CSP, HSTS...)
│   └── _redirects          # Routing SPA Netlify
├── src/
│   ├── components/         # Composants reusables
│   │   ├── admin/          # Composants panel admin (ProtectedRoute, etc.)
│   │   └── ui/             # Primitives Radix UI (Button, Toast...)
│   ├── contexts/
│   │   ├── AppContext.jsx       # Etat global : panier, wishlist, user, coupons
│   │   └── AdminAuthContext.jsx # Authentification admin
│   ├── hooks/
│   │   ├── useCart.js      # Acces etat panier
│   │   └── useWishlist.js  # Acces etat favoris
│   ├── lib/
│   │   ├── supabase.js     # Client + helpers Supabase
│   │   ├── constants.js    # Couleurs, contacts, livraison, categories
│   │   ├── meta.js         # Metadonnees SEO par page
│   │   ├── productData.js  # Donnees statiques fallback (498 produits)
│   │   └── validators.js   # Validation formulaires (anti-XSS)
│   ├── pages/
│   │   ├── admin/          # Dashboard, Produits, Commandes, Coupons
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── products/   # ProductList, ProductForm
│   │   │   ├── orders/     # OrderList, OrderDetail
│   │   │   └── coupons/    # CouponList, CouponForm
│   │   ├── HomePage.jsx
│   │   ├── ShopPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── WishlistPage.jsx
│   │   ├── PromoPage.jsx
│   │   ├── AboutPage.jsx
│   │   └── ContactPage.jsx
│   ├── services/
│   │   ├── productService.js    # CRUD produits + upload images
│   │   ├── orderService.js      # Gestion commandes
│   │   ├── couponService.js     # Validation et gestion coupons
│   │   ├── authService.js       # Authentification admin
│   │   └── analyticsService.js  # Metriques dashboard
│   └── App.jsx             # Routeur principal
├── supabase/
│   ├── schema.sql               # Schema de base
│   ├── migration_shop_v2.sql    # Extension schema v2
│   └── migration_security.sql  # RLS + Storage
├── plugins/                # Plugins Vite (editeur Hostinger Horizons)
├── tools/
│   └── generate-llms.js    # Generateur llms.txt au build
├── .nvmrc                  # Node 20.19.1
└── vite.config.js
```

---

## Routes

| Route | Page | Acces |
|-------|------|-------|
| `/` | Accueil | Public |
| `/boutique` | Boutique | Public |
| `/produit/:id` | Fiche produit | Public |
| `/panier` | Panier | Public |
| `/checkout` | Checkout | Public |
| `/wishlist` | Favoris | Public |
| `/promos` | Promotions | Public |
| `/a-propos` | A propos | Public |
| `/contact` | Contact | Public |
| `/admin/login` | Connexion admin | Public |
| `/admin` | Dashboard admin | Admin |
| `/admin/products` | Liste produits | Admin |
| `/admin/products/new` | Nouveau produit | Admin |
| `/admin/products/:id` | Modifier produit | Admin |
| `/admin/orders` | Liste commandes | Admin |
| `/admin/orders/:id` | Detail commande | Admin |
| `/admin/coupons` | Liste coupons | Admin |
| `/admin/coupons/new` | Nouveau coupon | Admin |
| `/admin/coupons/:id` | Modifier coupon | Admin |

---

## Deploiement

### Netlify (recommande)

```bash
npm run build
# Deployer le dossier dist/
```

Variables d'environnement à configurer dans **Netlify** → Site settings → Environment variables :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Le fichier `public/_headers` configure automatiquement les headers sécurité (CSP, HSTS, X-Frame-Options...).
Le fichier `public/_redirects` gère le routing SPA (`/* → /index.html 200`).

### Vercel

```bash
npm run build
# Output directory : dist
```

Configurer les mêmes variables d'environnement dans le dashboard Vercel.

---

## Commandes

```bash
npm run dev        # Dev server (http://localhost:3000)
npm run build      # Build production (genere llms.txt puis vite build)
npm run preview    # Preview du build (http://localhost:3000)
npm run lint       # ESLint en mode silencieux (erreurs uniquement)
npm run lint:warn  # ESLint avec avertissements
```

---

## Securite

| Mesure | Details |
|---|---|
| RLS | Row Level Security active sur toutes les tables Supabase |
| Auth admin | Role verifie via JWT `user_metadata.role = 'admin'` |
| Validation | Tous les formulaires valides cote client — anti-XSS, format tel. senegalais |
| Rate limiting | 5 tentatives max sur le login admin, blocage 15 min |
| CSP | Content Security Policy configure via `public/_headers` |
| Storage | Upload images limite aux admins authentifies |
| Secrets | Aucun secret dans le code — variables d'environnement uniquement |

---

## Contact

- **Email** : contact@philiastore.sn
- **WhatsApp** : +221 78 396 89 70
- **Adresse** : Dakar, Senegal
- **Facebook** : https://facebook.com/philiastore
- **Instagram** : https://instagram.com/philiastore

---

## Licence

MIT
