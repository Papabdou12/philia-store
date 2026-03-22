-- ============================================================
-- MIGRATION SÉCURITÉ — PHILIA'STORE
-- Row Level Security (RLS) — politiques granulaires
--
-- À exécuter dans Supabase SQL Editor
-- Idempotent : DROP POLICY IF EXISTS avant chaque CREATE POLICY
--
-- Contexte :
--   - Boutique e-commerce marché sénégalais
--   - Auth admin via supabase.auth + app_metadata.role = 'admin'
--   - Checkout invité (anon) → insertion orders/order_items sans auth
--   - Coupons validés côté client → SELECT public requis
-- ============================================================

-- ============================================================
-- HELPER : fonction is_admin()
-- Centralise la vérification du rôle pour toutes les politiques.
-- Lecture depuis app_metadata (non modifiable par l'utilisateur côté client,
-- contrairement à user_metadata qui peut être écrit via supabase.auth.updateUser()).
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
$$;

COMMENT ON FUNCTION is_admin() IS
  'Retourne true si l''utilisateur connecté possède le rôle admin dans app_metadata (immuable côté client).';

-- ============================================================
-- 1. ACTIVATION DU ROW LEVEL SECURITY
-- (Safe à répéter : ALTER TABLE ... ENABLE RLS est idempotent)
-- ============================================================
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands            ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants  ENABLE ROW LEVEL SECURITY;
-- Tables étendues découvertes dans schema.sql
ALTER TABLE stock_history     ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history     ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_stock     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. TABLE : products
-- Règle : lecture publique (catalogue visible par tous),
--         écriture (INSERT/UPDATE/DELETE) réservée à l'admin.
-- ============================================================

-- Nettoyage idempotent
DROP POLICY IF EXISTS "products_select_public"   ON products;
DROP POLICY IF EXISTS "products_insert_admin"    ON products;
DROP POLICY IF EXISTS "products_update_admin"    ON products;
DROP POLICY IF EXISTS "products_delete_admin"    ON products;
-- Supprime également les éventuelles politiques FOR ALL du schéma initial
DROP POLICY IF EXISTS "Products: lecture publique" ON products;
DROP POLICY IF EXISTS "Products: écriture admin"   ON products;

-- Lecture publique : n'importe quel visiteur peut lire les produits
CREATE POLICY "products_select_public" ON products
  FOR SELECT
  USING (true);

-- Insertion admin : seul un admin authentifié peut ajouter un produit
CREATE POLICY "products_insert_admin" ON products
  FOR INSERT
  WITH CHECK (is_admin());

-- Mise à jour admin : seul un admin peut modifier un produit existant
CREATE POLICY "products_update_admin" ON products
  FOR UPDATE
  USING (is_admin());

-- Suppression admin : seul un admin peut supprimer un produit
-- Note : préférer un soft-delete (is_active = false) en pratique
CREATE POLICY "products_delete_admin" ON products
  FOR DELETE
  USING (is_admin());

-- ============================================================
-- 3. TABLE : categories
-- Règle : lecture publique (navigation par catégorie),
--         écriture admin uniquement.
-- ============================================================

DROP POLICY IF EXISTS "categories_select_public"  ON categories;
DROP POLICY IF EXISTS "categories_insert_admin"   ON categories;
DROP POLICY IF EXISTS "categories_update_admin"   ON categories;
DROP POLICY IF EXISTS "categories_delete_admin"   ON categories;
DROP POLICY IF EXISTS "Categories: lecture publique" ON categories;
DROP POLICY IF EXISTS "Categories: écriture admin"   ON categories;

-- Lecture publique : nécessaire pour afficher la navigation et les filtres
CREATE POLICY "categories_select_public" ON categories
  FOR SELECT
  USING (true);

-- Insertion admin
CREATE POLICY "categories_insert_admin" ON categories
  FOR INSERT
  WITH CHECK (is_admin());

-- Mise à jour admin
CREATE POLICY "categories_update_admin" ON categories
  FOR UPDATE
  USING (is_admin());

-- Suppression admin
CREATE POLICY "categories_delete_admin" ON categories
  FOR DELETE
  USING (is_admin());

-- ============================================================
-- 4. TABLE : subcategories
-- Règle : lecture publique (filtres boutique),
--         écriture admin uniquement.
-- ============================================================

DROP POLICY IF EXISTS "subcategories_select_public" ON subcategories;
DROP POLICY IF EXISTS "subcategories_insert_admin"  ON subcategories;
DROP POLICY IF EXISTS "subcategories_update_admin"  ON subcategories;
DROP POLICY IF EXISTS "subcategories_delete_admin"  ON subcategories;

-- Lecture publique : sous-catégories affichées dans les menus et filtres
CREATE POLICY "subcategories_select_public" ON subcategories
  FOR SELECT
  USING (true);

-- Insertion admin
CREATE POLICY "subcategories_insert_admin" ON subcategories
  FOR INSERT
  WITH CHECK (is_admin());

-- Mise à jour admin
CREATE POLICY "subcategories_update_admin" ON subcategories
  FOR UPDATE
  USING (is_admin());

-- Suppression admin
CREATE POLICY "subcategories_delete_admin" ON subcategories
  FOR DELETE
  USING (is_admin());

-- ============================================================
-- 5. TABLE : brands
-- Règle : lecture publique (filtre par marque),
--         écriture admin uniquement.
-- ============================================================

DROP POLICY IF EXISTS "brands_select_public" ON brands;
DROP POLICY IF EXISTS "brands_insert_admin"  ON brands;
DROP POLICY IF EXISTS "brands_update_admin"  ON brands;
DROP POLICY IF EXISTS "brands_delete_admin"  ON brands;

-- Lecture publique : logo et nom de marque visibles sur le catalogue
CREATE POLICY "brands_select_public" ON brands
  FOR SELECT
  USING (true);

-- Insertion admin
CREATE POLICY "brands_insert_admin" ON brands
  FOR INSERT
  WITH CHECK (is_admin());

-- Mise à jour admin
CREATE POLICY "brands_update_admin" ON brands
  FOR UPDATE
  USING (is_admin());

-- Suppression admin
CREATE POLICY "brands_delete_admin" ON brands
  FOR DELETE
  USING (is_admin());

-- ============================================================
-- 6. TABLE : orders
-- Règle :
--   - INSERT public (checkout invité sans compte — aucune auth requise)
--   - SELECT/UPDATE/DELETE admin uniquement (dashboard commandes)
--
-- Sécurité checkout invité : orderService.js appelle supabase.from('orders')
-- .insert() sans session active → la politique INSERT WITH CHECK (true)
-- est indispensable pour ne pas bloquer le tunnel de vente.
-- ============================================================

DROP POLICY IF EXISTS "orders_insert_anon"    ON orders;
DROP POLICY IF EXISTS "orders_select_admin"   ON orders;
DROP POLICY IF EXISTS "orders_update_admin"   ON orders;
DROP POLICY IF EXISTS "orders_delete_admin"   ON orders;
DROP POLICY IF EXISTS "Orders: insertion publique" ON orders;
DROP POLICY IF EXISTS "Orders: lecture admin"      ON orders;
DROP POLICY IF EXISTS "Orders: modification admin" ON orders;

-- Insertion publique : tout visiteur (authentifié ou anonyme) peut passer commande
CREATE POLICY "orders_insert_anon" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Lecture admin : seul l'admin peut consulter la liste des commandes
CREATE POLICY "orders_select_admin" ON orders
  FOR SELECT
  USING (is_admin());

-- Mise à jour admin : changement de statut (confirmed, shipped, delivered…)
CREATE POLICY "orders_update_admin" ON orders
  FOR UPDATE
  USING (is_admin());

-- Suppression admin : accès restreint (à éviter — préférer un champ cancelled)
CREATE POLICY "orders_delete_admin" ON orders
  FOR DELETE
  USING (is_admin());

-- ============================================================
-- 7. TABLE : order_items
-- Règle :
--   - INSERT public (lié à l'insertion de la commande invité)
--   - SELECT admin uniquement (détail commande dans le dashboard)
--   - UPDATE/DELETE admin (correction manuelle)
--
-- Note : order_items est inséré immédiatement après orders dans
-- orderService.js — même session anonyme, pas de transaction XA.
-- ============================================================

DROP POLICY IF EXISTS "order_items_insert_anon"  ON order_items;
DROP POLICY IF EXISTS "order_items_select_admin" ON order_items;
DROP POLICY IF EXISTS "order_items_update_admin" ON order_items;
DROP POLICY IF EXISTS "order_items_delete_admin" ON order_items;
DROP POLICY IF EXISTS "Order Items: insertion publique" ON order_items;
DROP POLICY IF EXISTS "Order Items: lecture admin"      ON order_items;

-- Insertion publique : indispensable pour le checkout invité
CREATE POLICY "order_items_insert_anon" ON order_items
  FOR INSERT
  WITH CHECK (true);

-- Lecture admin : consultation du détail des articles d'une commande
CREATE POLICY "order_items_select_admin" ON order_items
  FOR SELECT
  USING (is_admin());

-- Mise à jour admin : correction d'une quantité ou d'un prix
CREATE POLICY "order_items_update_admin" ON order_items
  FOR UPDATE
  USING (is_admin());

-- Suppression admin : retrait d'un article (cas de remboursement partiel)
CREATE POLICY "order_items_delete_admin" ON order_items
  FOR DELETE
  USING (is_admin());

-- ============================================================
-- 8. TABLE : coupons
-- Règle :
--   - SELECT public : le client doit pouvoir valider son code promo
--     sans être authentifié (CouponService.js appelle SELECT sur code
--     + is_active + valid_from + valid_until).
--   - INSERT/UPDATE/DELETE admin uniquement.
--
-- Attention : le SELECT public expose les colonnes discount_value,
-- max_uses etc. Acceptable pour une boutique grand public.
-- ============================================================

DROP POLICY IF EXISTS "coupons_select_public" ON coupons;
DROP POLICY IF EXISTS "coupons_insert_admin"  ON coupons;
DROP POLICY IF EXISTS "coupons_update_admin"  ON coupons;
DROP POLICY IF EXISTS "coupons_delete_admin"  ON coupons;
DROP POLICY IF EXISTS "Coupons: lecture publique" ON coupons;
DROP POLICY IF EXISTS "Coupons: écriture admin"   ON coupons;

-- Lecture publique : validation du code coupon au checkout
CREATE POLICY "coupons_select_public" ON coupons
  FOR SELECT
  USING (true);

-- Insertion admin : création de nouvelles promotions
CREATE POLICY "coupons_insert_admin" ON coupons
  FOR INSERT
  WITH CHECK (is_admin());

-- Mise à jour admin : désactivation, modification du seuil ou de la valeur
CREATE POLICY "coupons_update_admin" ON coupons
  FOR UPDATE
  USING (is_admin());

-- Suppression admin
CREATE POLICY "coupons_delete_admin" ON coupons
  FOR DELETE
  USING (is_admin());

-- ============================================================
-- 9. TABLE : product_images
-- Règle : lecture publique (galerie produit),
--         écriture admin uniquement.
-- ============================================================

DROP POLICY IF EXISTS "product_images_select_public" ON product_images;
DROP POLICY IF EXISTS "product_images_insert_admin"  ON product_images;
DROP POLICY IF EXISTS "product_images_update_admin"  ON product_images;
DROP POLICY IF EXISTS "product_images_delete_admin"  ON product_images;
DROP POLICY IF EXISTS "Product Images: lecture publique" ON product_images;
DROP POLICY IF EXISTS "Product Images: écriture admin"   ON product_images;

-- Lecture publique : images visibles dans la galerie et le détail produit
CREATE POLICY "product_images_select_public" ON product_images
  FOR SELECT
  USING (true);

-- Insertion admin : ajout d'images lors de la création/édition d'un produit
CREATE POLICY "product_images_insert_admin" ON product_images
  FOR INSERT
  WITH CHECK (is_admin());

-- Mise à jour admin : réordonnancement, changement d'image principale
CREATE POLICY "product_images_update_admin" ON product_images
  FOR UPDATE
  USING (is_admin());

-- Suppression admin : retrait d'une image
CREATE POLICY "product_images_delete_admin" ON product_images
  FOR DELETE
  USING (is_admin());

-- ============================================================
-- 10. TABLE : product_variants
-- Règle : lecture publique (sélecteur couleur/taille),
--         écriture admin uniquement.
-- ============================================================

DROP POLICY IF EXISTS "product_variants_select_public" ON product_variants;
DROP POLICY IF EXISTS "product_variants_insert_admin"  ON product_variants;
DROP POLICY IF EXISTS "product_variants_update_admin"  ON product_variants;
DROP POLICY IF EXISTS "product_variants_delete_admin"  ON product_variants;
DROP POLICY IF EXISTS "Product Variants: lecture publique" ON product_variants;
DROP POLICY IF EXISTS "Product Variants: écriture admin"   ON product_variants;

-- Lecture publique : variantes affichées sur la fiche produit
CREATE POLICY "product_variants_select_public" ON product_variants
  FOR SELECT
  USING (true);

-- Insertion admin
CREATE POLICY "product_variants_insert_admin" ON product_variants
  FOR INSERT
  WITH CHECK (is_admin());

-- Mise à jour admin
CREATE POLICY "product_variants_update_admin" ON product_variants
  FOR UPDATE
  USING (is_admin());

-- Suppression admin
CREATE POLICY "product_variants_delete_admin" ON product_variants
  FOR DELETE
  USING (is_admin());

-- ============================================================
-- 11. TABLE : variant_stock
-- Règle : lecture publique (affichage disponibilité par variante),
--         écriture admin uniquement.
-- ============================================================

DROP POLICY IF EXISTS "variant_stock_select_public" ON variant_stock;
DROP POLICY IF EXISTS "variant_stock_insert_admin"  ON variant_stock;
DROP POLICY IF EXISTS "variant_stock_update_admin"  ON variant_stock;
DROP POLICY IF EXISTS "variant_stock_delete_admin"  ON variant_stock;
DROP POLICY IF EXISTS "Variant stock: lecture publique" ON variant_stock;
DROP POLICY IF EXISTS "Variant stock: écriture admin"   ON variant_stock;

-- Lecture publique : stock par couleur/taille visible sur la fiche produit
CREATE POLICY "variant_stock_select_public" ON variant_stock
  FOR SELECT
  USING (true);

-- Insertion admin
CREATE POLICY "variant_stock_insert_admin" ON variant_stock
  FOR INSERT
  WITH CHECK (is_admin());

-- Mise à jour admin : ajustement du stock après réapprovisionnement
CREATE POLICY "variant_stock_update_admin" ON variant_stock
  FOR UPDATE
  USING (is_admin());

-- Suppression admin
CREATE POLICY "variant_stock_delete_admin" ON variant_stock
  FOR DELETE
  USING (is_admin());

-- ============================================================
-- 12. TABLE : stock_history
-- Règle : admin uniquement.
-- Données sensibles : traçabilité des mouvements de stock.
-- ============================================================

DROP POLICY IF EXISTS "stock_history_admin_all" ON stock_history;
DROP POLICY IF EXISTS "Stock history: admin only" ON stock_history;

-- Toutes opérations réservées à l'admin
CREATE POLICY "stock_history_admin_all" ON stock_history
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- 13. TABLE : price_history
-- Règle : admin uniquement.
-- Données sensibles : historique des prix et remises.
-- ============================================================

DROP POLICY IF EXISTS "price_history_admin_all" ON price_history;
DROP POLICY IF EXISTS "Price history: admin only" ON price_history;

-- Toutes opérations réservées à l'admin
CREATE POLICY "price_history_admin_all" ON price_history
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- 14. TABLE : stock_alerts
-- Règle : admin uniquement.
-- Les alertes de stock ne doivent pas être visibles publiquement.
-- ============================================================

DROP POLICY IF EXISTS "stock_alerts_admin_all" ON stock_alerts;
DROP POLICY IF EXISTS "Stock alerts: admin only" ON stock_alerts;

-- Toutes opérations réservées à l'admin
CREATE POLICY "stock_alerts_admin_all" ON stock_alerts
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- 15. TABLE : payments
-- Règle :
--   - INSERT public : le checkout crée l'enregistrement paiement
--     après la commande (même session anonyme).
--   - SELECT/UPDATE/DELETE admin uniquement.
--
-- Sécurité : les données de paiement (provider_response JSONB,
-- transaction_id) ne doivent jamais être exposées publiquement.
-- ============================================================

DROP POLICY IF EXISTS "payments_insert_anon"   ON payments;
DROP POLICY IF EXISTS "payments_select_admin"  ON payments;
DROP POLICY IF EXISTS "payments_update_admin"  ON payments;
DROP POLICY IF EXISTS "payments_delete_admin"  ON payments;
DROP POLICY IF EXISTS "Payments: insertion publique" ON payments;
DROP POLICY IF EXISTS "Payments: lecture admin"      ON payments;

-- Insertion publique : création de la trace de paiement au checkout
CREATE POLICY "payments_insert_anon" ON payments
  FOR INSERT
  WITH CHECK (true);

-- Lecture admin : consultation des transactions dans le dashboard
CREATE POLICY "payments_select_admin" ON payments
  FOR SELECT
  USING (is_admin());

-- Mise à jour admin : mise à jour du statut après confirmation Wave/OM
CREATE POLICY "payments_update_admin" ON payments
  FOR UPDATE
  USING (is_admin());

-- Suppression admin
CREATE POLICY "payments_delete_admin" ON payments
  FOR DELETE
  USING (is_admin());

-- ============================================================
-- VÉRIFICATION — décommenter et exécuter pour auditer les politiques
-- ============================================================
/*
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN (
  'products',
  'categories',
  'subcategories',
  'brands',
  'orders',
  'order_items',
  'coupons',
  'product_images',
  'product_variants',
  'variant_stock',
  'stock_history',
  'price_history',
  'stock_alerts',
  'payments'
)
ORDER BY tablename, cmd, policyname;
*/

-- ============================================================
-- STORAGE — Bucket public pour les images produits
-- ============================================================

-- Créer le bucket 'products' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,                          -- bucket public (URLs accessibles sans auth)
  5242880,                       -- 5 MB max par image
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'];

-- Politique lecture publique sur le storage (images visibles sans auth)
DROP POLICY IF EXISTS "storage_products_select_public" ON storage.objects;
CREATE POLICY "storage_products_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- Politique upload admin uniquement
DROP POLICY IF EXISTS "storage_products_insert_admin" ON storage.objects;
CREATE POLICY "storage_products_insert_admin"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Politique suppression admin uniquement
DROP POLICY IF EXISTS "storage_products_delete_admin" ON storage.objects;
CREATE POLICY "storage_products_delete_admin"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'products'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- FIN DE LA MIGRATION SÉCURITÉ
-- ============================================================
