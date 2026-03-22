-- ============================================
-- PHILIA'STORE - SCHÉMA BASE DE DONNÉES
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- 1. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  emoji VARCHAR(10),
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les catégories par défaut
INSERT INTO categories (name, code, emoji, sort_order) VALUES
  ('Mode & Vêtements', 'mode', '👗', 1),
  ('Beauté & Soin', 'beaute', '💄', 2),
  ('Technologie', 'tech', '📱', 3),
  ('Maison & Déco', 'maison', '🏠', 4),
  ('Enfants & Jouets', 'enfants', '🧸', 5),
  ('Sport & Fitness', 'sport', '🏋️', 6)
ON CONFLICT (code) DO NOTHING;

-- 1b. SOUS-CATEGORIES
CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, code)
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);

-- Exemples de sous-catégories
INSERT INTO subcategories (category_id, name, code, sort_order)
SELECT c.id, s.name, s.code, s.sort_order
FROM categories c, (VALUES
  ('mode', 'Robes', 'robes', 1),
  ('mode', 'Pantalons', 'pantalons', 2),
  ('mode', 'Chemises', 'chemises', 3),
  ('mode', 'Accessoires', 'accessoires', 4),
  ('beaute', 'Maquillage', 'maquillage', 1),
  ('beaute', 'Soins Visage', 'soins-visage', 2),
  ('beaute', 'Parfums', 'parfums', 3),
  ('tech', 'Smartphones', 'smartphones', 1),
  ('tech', 'Accessoires Tech', 'accessoires-tech', 2),
  ('tech', 'Audio', 'audio', 3)
) AS s(cat_code, name, code, sort_order)
WHERE c.code = s.cat_code
ON CONFLICT DO NOTHING;

-- 1c. BRANDS (Marques)
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  sku VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  old_price DECIMAL(12,2),
  discount INT DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
  image_url TEXT,
  is_new BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INT DEFAULT 0,
  -- Nouveaux champs
  weight DECIMAL(8,2) DEFAULT NULL, -- Poids en grammes
  brand VARCHAR(100) DEFAULT NULL, -- Marque
  tags TEXT[] DEFAULT '{}', -- Tags pour recherche
  is_featured BOOLEAN DEFAULT false, -- Produit vedette
  is_bestseller BOOLEAN DEFAULT false, -- Bestseller
  min_order_quantity INT DEFAULT 1 CHECK (min_order_quantity >= 1),
  max_order_quantity INT DEFAULT NULL,
  meta_title VARCHAR(255) DEFAULT NULL, -- SEO
  meta_description TEXT DEFAULT NULL, -- SEO
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);

-- 3. PRODUCT_IMAGES
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- 4. PRODUCT_VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  variant_type VARCHAR(20) NOT NULL CHECK (variant_type IN ('color', 'size')),
  variant_value VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

-- 5. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INT,
  current_uses INT DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les coupons par défaut
INSERT INTO coupons (code, discount_type, discount_value, is_active) VALUES
  ('BIENVENUE', 'percentage', 15, true),
  ('FLASH25', 'percentage', 25, true),
  ('PROMO10K', 'fixed', 10000, true)
ON CONFLICT (code) DO NOTHING;

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_region VARCHAR(100) NOT NULL,
  delivery_zone VARCHAR(50) NOT NULL,
  delivery_cost DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  coupon_code VARCHAR(50),
  total DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- 7. ORDER_ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(50),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  selected_color VARCHAR(100),
  selected_size VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================
-- FONCTIONS ET TRIGGERS
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger sur products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger sur orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer un numéro de commande unique
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'PH' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN new_number;
END;
$$ language 'plpgsql';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- CATEGORIES: Lecture publique, écriture admin
DROP POLICY IF EXISTS "Categories: lecture publique" ON categories;
DROP POLICY IF EXISTS "Categories: écriture admin" ON categories;
CREATE POLICY "Categories: lecture publique" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Categories: écriture admin" ON categories
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- PRODUCTS: Lecture publique, écriture admin
DROP POLICY IF EXISTS "Products: lecture publique" ON products;
DROP POLICY IF EXISTS "Products: écriture admin" ON products;
CREATE POLICY "Products: lecture publique" ON products
  FOR SELECT USING (true);

CREATE POLICY "Products: écriture admin" ON products
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- PRODUCT_IMAGES: Lecture publique, écriture admin
DROP POLICY IF EXISTS "Product Images: lecture publique" ON product_images;
DROP POLICY IF EXISTS "Product Images: écriture admin" ON product_images;
CREATE POLICY "Product Images: lecture publique" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "Product Images: écriture admin" ON product_images
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- PRODUCT_VARIANTS: Lecture publique, écriture admin
DROP POLICY IF EXISTS "Product Variants: lecture publique" ON product_variants;
DROP POLICY IF EXISTS "Product Variants: écriture admin" ON product_variants;
CREATE POLICY "Product Variants: lecture publique" ON product_variants
  FOR SELECT USING (true);

CREATE POLICY "Product Variants: écriture admin" ON product_variants
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- COUPONS: Lecture publique (pour validation), écriture admin
DROP POLICY IF EXISTS "Coupons: lecture publique" ON coupons;
DROP POLICY IF EXISTS "Coupons: écriture admin" ON coupons;
CREATE POLICY "Coupons: lecture publique" ON coupons
  FOR SELECT USING (true);

CREATE POLICY "Coupons: écriture admin" ON coupons
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ORDERS: Insertion publique (checkout), lecture/modification admin
DROP POLICY IF EXISTS "Orders: insertion publique" ON orders;
DROP POLICY IF EXISTS "Orders: lecture admin" ON orders;
DROP POLICY IF EXISTS "Orders: modification admin" ON orders;
CREATE POLICY "Orders: insertion publique" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders: lecture admin" ON orders
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Orders: modification admin" ON orders
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ORDER_ITEMS: Insertion publique, lecture admin
DROP POLICY IF EXISTS "Order Items: insertion publique" ON order_items;
DROP POLICY IF EXISTS "Order Items: lecture admin" ON order_items;
CREATE POLICY "Order Items: insertion publique" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Order Items: lecture admin" ON order_items
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ============================================
-- GESTION STOCK AVANCÉE
-- ============================================

-- 8. STOCK_HISTORY - Historique des mouvements de stock
CREATE TABLE IF NOT EXISTS stock_history (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  change_amount INT NOT NULL,
  change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('sale', 'restock', 'adjustment', 'return')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_stock_history_product ON stock_history(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_created ON stock_history(created_at DESC);

-- 9. PRICE_HISTORY - Historique des prix
CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  old_price DECIMAL(12,2),
  new_price DECIMAL(12,2) NOT NULL,
  old_discount INT,
  new_discount INT,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id);

-- 10. STOCK_ALERTS - Alertes de stock
CREATE TABLE IF NOT EXISTS stock_alerts (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'restock_needed')),
  threshold INT NOT NULL,
  current_stock INT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 11. VARIANT_STOCK - Stock par variante (couleur + taille)
CREATE TABLE IF NOT EXISTS variant_stock (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  color VARCHAR(100),
  size VARCHAR(100),
  sku_variant VARCHAR(100),
  stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, color, size)
);

CREATE INDEX IF NOT EXISTS idx_variant_stock_product ON variant_stock(product_id);

-- 12. PAYMENTS - Historique des paiements
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE SET NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_provider VARCHAR(50), -- 'wave', 'orange_money', 'cash'
  transaction_id VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'XOF',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  provider_response JSONB,
  phone_number VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at DESC);

-- ============================================
-- FONCTIONS ANALYTICS
-- ============================================

-- Fonction pour enregistrer les mouvements de stock
CREATE OR REPLACE FUNCTION log_stock_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stock_quantity != NEW.stock_quantity THEN
    INSERT INTO stock_history (
      product_id,
      previous_quantity,
      new_quantity,
      change_amount,
      change_type,
      created_by
    ) VALUES (
      NEW.id,
      OLD.stock_quantity,
      NEW.stock_quantity,
      NEW.stock_quantity - OLD.stock_quantity,
      CASE
        WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'restock'
        ELSE 'adjustment'
      END,
      auth.uid()
    );

    -- Créer alerte si stock bas
    IF NEW.stock_quantity <= 5 AND NEW.stock_quantity > 0 THEN
      INSERT INTO stock_alerts (product_id, alert_type, threshold, current_stock)
      VALUES (NEW.id, 'low_stock', 5, NEW.stock_quantity)
      ON CONFLICT DO NOTHING;
    ELSIF NEW.stock_quantity = 0 THEN
      INSERT INTO stock_alerts (product_id, alert_type, threshold, current_stock)
      VALUES (NEW.id, 'out_of_stock', 0, 0)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_stock_change ON products;
CREATE TRIGGER trigger_log_stock_change
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_stock_change();

-- Fonction pour enregistrer les changements de prix
CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price != NEW.price OR COALESCE(OLD.discount, 0) != COALESCE(NEW.discount, 0) THEN
    INSERT INTO price_history (
      product_id,
      old_price,
      new_price,
      old_discount,
      new_discount,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.price,
      NEW.price,
      OLD.discount,
      NEW.discount,
      auth.uid()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_price_change ON products;
CREATE TRIGGER trigger_log_price_change
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_price_change();

-- Fonction pour incrémenter les utilisations de coupon
CREATE OR REPLACE FUNCTION increment_coupon_uses(coupon_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons SET current_uses = current_uses + 1 WHERE code = coupon_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS pour nouvelles tables
-- ============================================

ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Stock history: admin seulement
DROP POLICY IF EXISTS "Stock history: admin only" ON stock_history;
CREATE POLICY "Stock history: admin only" ON stock_history
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Price history: admin seulement
DROP POLICY IF EXISTS "Price history: admin only" ON price_history;
CREATE POLICY "Price history: admin only" ON price_history
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Stock alerts: admin seulement
DROP POLICY IF EXISTS "Stock alerts: admin only" ON stock_alerts;
CREATE POLICY "Stock alerts: admin only" ON stock_alerts
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Variant stock: lecture publique, écriture admin
DROP POLICY IF EXISTS "Variant stock: lecture publique" ON variant_stock;
DROP POLICY IF EXISTS "Variant stock: écriture admin" ON variant_stock;
CREATE POLICY "Variant stock: lecture publique" ON variant_stock
  FOR SELECT USING (true);

CREATE POLICY "Variant stock: écriture admin" ON variant_stock
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Payments: insertion publique (checkout), lecture admin
DROP POLICY IF EXISTS "Payments: insertion publique" ON payments;
DROP POLICY IF EXISTS "Payments: lecture admin" ON payments;
CREATE POLICY "Payments: insertion publique" ON payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Payments: lecture admin" ON payments
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- À créer manuellement dans Supabase Dashboard:
-- 1. Aller dans Storage
-- 2. Créer un bucket "products" (public)
-- 3. Politique: permettre upload pour authenticated, lecture publique
