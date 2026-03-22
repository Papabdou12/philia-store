-- ============================================
-- PHILIA'STORE - SETTINGS & DELIVERY ZONES
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- 1. TABLE DELIVERY_ZONES
CREATE TABLE IF NOT EXISTS delivery_zones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  delay VARCHAR(50) NOT NULL,
  regions TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les zones par défaut
INSERT INTO delivery_zones (name, price, delay, regions, sort_order) VALUES
  ('Dakar Express', 2500, '24h', ARRAY['Dakar'], 1),
  ('Régions du Sénégal', 5000, '48-72h', ARRAY[
    'Thiès','Diourbel','Fatick','Kaolack','Kaffrine','Kolda','Louga',
    'Matam','Saint-Louis','Sédhiou','Tambacounda','Kédougou','Ziguinchor'
  ], 2)
ON CONFLICT DO NOTHING;

-- 2. TABLE STORE_SETTINGS (clé/valeur JSON)
CREATE TABLE IF NOT EXISTS store_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paramètres par défaut
INSERT INTO store_settings (key, value, description) VALUES
  ('announcement_bar', '"Livraison gratuite dès 50 000 FCFA • Paiement à la livraison • WhatsApp : +221 78 396 89 70"', 'Texte de la barre d''annonce'),
  ('store_name', '"Philia''Store"', 'Nom de la boutique'),
  ('store_phone', '"+221 78 396 89 70"', 'Numéro de téléphone principal'),
  ('store_email', '"contact@philiastore.sn"', 'Email de contact'),
  ('store_address', '"Dakar, Sénégal"', 'Adresse'),
  ('store_whatsapp', '"https://wa.me/221783968970"', 'Lien WhatsApp'),
  ('returns_delay_days', '7', 'Délai de retour en jours'),
  ('returns_policy', '"Les retours sont acceptés dans un délai de 7 jours suivant la réception de votre commande, pour des articles en parfait état avec étiquettes."', 'Résumé politique de retour')
ON CONFLICT (key) DO NOTHING;

-- 3. RLS
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Policies idempotentes (DROP IF EXISTS avant CREATE)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read delivery_zones" ON delivery_zones;
  DROP POLICY IF EXISTS "Admin write delivery_zones" ON delivery_zones;
  DROP POLICY IF EXISTS "Public read store_settings" ON store_settings;
  DROP POLICY IF EXISTS "Admin write store_settings" ON store_settings;
END $$;

-- Lecture publique
CREATE POLICY "Public read delivery_zones" ON delivery_zones
  FOR SELECT USING (true);

CREATE POLICY "Public read store_settings" ON store_settings
  FOR SELECT USING (true);

-- Écriture admin uniquement
CREATE POLICY "Admin write delivery_zones" ON delivery_zones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin write store_settings" ON store_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger updated_at (idempotent via CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_delivery_zones_updated_at ON delivery_zones;
CREATE TRIGGER update_delivery_zones_updated_at
  BEFORE UPDATE ON delivery_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_settings_updated_at ON store_settings;
CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
