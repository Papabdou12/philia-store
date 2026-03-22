-- ============================================================
-- MIGRATION SHOP V2 — À exécuter dans Supabase SQL Editor
-- Ajoute : poids, marque, tags, badges, sous-catégories, marques
-- ============================================================

-- 1. Nouveaux champs sur la table products (si pas encore ajoutés)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS weight          DECIMAL(8,2)  DEFAULT NULL,  -- Poids en grammes
  ADD COLUMN IF NOT EXISTS brand           VARCHAR(100)  DEFAULT NULL,  -- Marque
  ADD COLUMN IF NOT EXISTS tags            TEXT[]        DEFAULT '{}',  -- Tags recherche
  ADD COLUMN IF NOT EXISTS is_featured     BOOLEAN       DEFAULT false, -- Produit vedette
  ADD COLUMN IF NOT EXISTS is_bestseller   BOOLEAN       DEFAULT false, -- Bestseller
  ADD COLUMN IF NOT EXISTS min_order_quantity INT         DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_order_quantity INT         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS meta_title      VARCHAR(255)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS meta_description TEXT         DEFAULT NULL;

-- 2. Nouveaux champs sur categories
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS description  TEXT         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS image_url    TEXT         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sort_order   INT          DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active    BOOLEAN      DEFAULT true;

-- 3. Table sous-catégories
CREATE TABLE IF NOT EXISTS subcategories (
  id          SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  code        VARCHAR(50)  NOT NULL,
  sort_order  INT          DEFAULT 0,
  is_active   BOOLEAN      DEFAULT true,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE(category_id, code)
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);

-- 4. Table marques
CREATE TABLE IF NOT EXISTS brands (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  slug       VARCHAR(100) NOT NULL UNIQUE,
  logo_url   TEXT,
  is_active  BOOLEAN      DEFAULT true,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- Lier brand à products via brand_id (optionnel, en plus du champ texte)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS brand_id INT REFERENCES brands(id) ON DELETE SET NULL;

-- 5. Index pour les nouveaux champs fréquemment filtrés
CREATE INDEX IF NOT EXISTS idx_products_is_featured   ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON products(is_bestseller);
CREATE INDEX IF NOT EXISTS idx_products_brand         ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_tags          ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_weight        ON products(weight);

-- 6. Quelques sous-catégories de base
INSERT INTO subcategories (category_id, name, code, sort_order)
SELECT c.id, s.name, s.code, s.sort_order
FROM categories c
JOIN (VALUES
  ('mode',    'Robes',            'robes',          1),
  ('mode',    'Pantalons',        'pantalons',       2),
  ('mode',    'Chemises',         'chemises',        3),
  ('mode',    'Accessoires Mode', 'accessoires',     4),
  ('mode',    'Traditionnel',     'traditionnel',    5),
  ('beaute',  'Maquillage',       'maquillage',      1),
  ('beaute',  'Soins Visage',     'soins-visage',    2),
  ('beaute',  'Parfums',          'parfums',         3),
  ('beaute',  'Soins Corps',      'soins-corps',     4),
  ('tech',    'Smartphones',      'smartphones',     1),
  ('tech',    'Accessoires Tech', 'accessoires-tech',2),
  ('tech',    'Audio',            'audio',           3),
  ('tech',    'Informatique',     'informatique',    4),
  ('maison',  'Cuisine',          'cuisine',         1),
  ('maison',  'Décoration',       'decoration',      2),
  ('maison',  'Linge de Maison',  'linge',           3),
  ('enfants', 'Jouets',           'jouets',          1),
  ('enfants', 'Vêtements Enfants','vetements',       2),
  ('sport',   'Fitness',          'fitness',         1),
  ('sport',   'Football',         'football',        2),
  ('sport',   'Natation',         'natation',        3)
) AS s(cat_code, name, code, sort_order) ON c.code = s.cat_code
ON CONFLICT DO NOTHING;

-- 7. Mise à jour des produits existants pour ajouter des poids indicatifs par catégorie
UPDATE products p
SET weight = CASE c.code
  WHEN 'mode'    THEN FLOOR(RANDOM() * 800 + 200)::DECIMAL  -- 200g à 1kg
  WHEN 'beaute'  THEN FLOOR(RANDOM() * 300 + 50)::DECIMAL   -- 50g à 350g
  WHEN 'tech'    THEN FLOOR(RANDOM() * 1500 + 100)::DECIMAL -- 100g à 1.6kg
  WHEN 'maison'  THEN FLOOR(RANDOM() * 3000 + 500)::DECIMAL -- 500g à 3.5kg
  WHEN 'enfants' THEN FLOOR(RANDOM() * 1000 + 100)::DECIMAL -- 100g à 1.1kg
  WHEN 'sport'   THEN FLOOR(RANDOM() * 2000 + 200)::DECIMAL -- 200g à 2.2kg
  ELSE 500
END
FROM categories c
WHERE p.category_id = c.id
  AND p.weight IS NULL;
