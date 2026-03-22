-- ============================================================
-- MIGRATION : TÉMOIGNAGES — PHILIA'STORE
-- Idempotent : CREATE TABLE IF NOT EXISTS + DROP POLICY IF EXISTS
-- ============================================================

-- Ensure helper functions exist (idempotent — safe to re-run)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    auth.role() = 'authenticated'
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin';
$$;

CREATE TABLE IF NOT EXISTS testimonials (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  role        VARCHAR(150),
  text        TEXT NOT NULL,
  rating      INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar_letter CHAR(2),
  is_active   BOOLEAN DEFAULT true,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_active    ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_sort      ON testimonials(sort_order);

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "testimonials_select_public" ON testimonials;
DROP POLICY IF EXISTS "testimonials_insert_admin"  ON testimonials;
DROP POLICY IF EXISTS "testimonials_update_admin"  ON testimonials;
DROP POLICY IF EXISTS "testimonials_delete_admin"  ON testimonials;

CREATE POLICY "testimonials_select_public" ON testimonials
  FOR SELECT USING (true);

CREATE POLICY "testimonials_insert_admin" ON testimonials
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "testimonials_update_admin" ON testimonials
  FOR UPDATE USING (is_admin());

CREATE POLICY "testimonials_delete_admin" ON testimonials
  FOR DELETE USING (is_admin());

-- Données par défaut
INSERT INTO testimonials (name, role, text, rating, avatar_letter, is_active, sort_order) VALUES
  ('Aïssatou D.', 'Cliente fidèle, Dakar',       'Les tissus sont de très bonne qualité. J''ai reçu ma commande en moins de 24h. Je recommande vivement !',                     5, 'A', true, 1),
  ('Fatou S.',    'Cliente, Thiès',               'Super boutique ! Les accessoires sont exactement comme sur les photos. Livraison rapide et bien emballée.',                    5, 'F', true, 2),
  ('Mariama K.',  'Cliente régulière',            'Philia''store est mon adresse préférée pour les cadeaux. Service exceptionnel et prix très abordables.',                      5, 'M', true, 3),
  ('Rokhaya B.',  'Cliente, Saint-Louis',         'J''adore les wax proposés ! La qualité est au rendez-vous et le service client est toujours disponible et à l''écoute.',     5, 'R', true, 4),
  ('Ndéye T.',    'Cliente fidèle, Dakar',        'Commande reçue en parfait état, bien emballée. Les produits sont conformes à la description. Je reviendrai !',               5, 'N', true, 5),
  ('Aminata C.',  'Cliente, Kaolack',             'Très satisfaite de mon achat. La robe en bazin est magnifique, exactement ce que je cherchais. Merci Philia''store !',       5, 'A', true, 6)
ON CONFLICT DO NOTHING;
