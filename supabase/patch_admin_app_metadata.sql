-- ============================================================
-- PATCH : Migrer le rôle admin de user_metadata → app_metadata
-- ============================================================
-- CONTEXTE :
--   user_metadata est modifiable par l'utilisateur lui-même via
--   supabase.auth.updateUser(). app_metadata ne peut être modifié
--   qu'avec la service_role key (backend uniquement).
--
-- À EXÉCUTER DANS : Supabase Dashboard > SQL Editor
-- UNE SEULE FOIS (idempotent par le || opérateur)
-- ============================================================

-- 1. Copier role:'admin' de user_metadata → app_metadata pour tous les admins existants
UPDATE auth.users
SET
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', 'admin'),
  updated_at = NOW()
WHERE raw_user_meta_data ->> 'role' = 'admin';

-- 2. Vérification
SELECT
  id,
  email,
  raw_user_meta_data ->> 'role'  AS role_user_metadata,
  raw_app_meta_data  ->> 'role'  AS role_app_metadata,
  updated_at
FROM auth.users
WHERE raw_app_meta_data ->> 'role' = 'admin';
