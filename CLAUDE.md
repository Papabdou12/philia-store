# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev        # Start dev server on port 3000
npm run build      # Production build (generates llms.txt first)
npm run preview    # Preview production build on port 3000
npm run lint       # ESLint (quiet mode, errors only)
npm run lint:warn  # ESLint with warnings
```

Node version: 20.19.1 (see .nvmrc)

## Architecture

**React + Vite e-commerce SPA** for the Senegalese market (French localization).

### Core Structure

- `src/pages/` - Route components: HomePage, ShopPage, ProductDetailPage, CartPage, CheckoutPage, AboutPage, ContactPage, PromoPage
- `src/components/` - Reusable components (ProductCard, StickyNavbar, Footer, etc.)
- `src/components/ui/` - Base UI components (Button, Toast) using Radix UI primitives
- `src/contexts/AppContext.jsx` - Global state provider (cart, wishlist, user, coupons)
- `src/hooks/` - Custom hooks: `useCart()`, `useWishlist()` for state access
- `src/lib/productData.js` - Product catalog (498 products, 6 categories)
- `src/lib/constants.js` - Brand colors, contact info, payment methods, delivery zones
- `src/lib/meta.js` - SEO metadata per page (used with React Helmet)

### State Management

Context API + custom hooks pattern. State persists to LocalStorage with `philiastore_` prefix.

```jsx
const { cart, addToCart, removeFromCart } = useCart();
const { wishlist, toggleWishlist } = useWishlist();
```

### Styling

Tailwind CSS with custom theme:
- Primary: gold (#D4AF37)
- Secondary: bronze (#8B7355)
- Background: black (#000000)
- Fonts: DM Sans (sans), Cormorant Garamond (serif)

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `App.jsx`
3. Add metadata in `src/lib/meta.js`

### Product Data Helpers

```js
import { getProductById, getProductsByCategory, getFeaturedProducts } from '@/lib/productData';
```

## Vite Plugins

Custom plugins in `plugins/` for visual editing features (inline editor, selection mode, edit mode) - used by Hostinger Horizons platform.
