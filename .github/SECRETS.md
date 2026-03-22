# Secrets GitHub Actions requis

Configurer dans **GitHub → Settings → Secrets and variables → Actions**

## Secrets communs (tous les workflows)

| Secret | Description |
|---|---|
| `VITE_STORE_PHONE` | Numéro de téléphone boutique |
| `VITE_STORE_WHATSAPP` | Numéro WhatsApp (format 221XXXXXXXXX) |
| `VITE_STORE_EMAIL` | Email contact boutique |
| `VITE_STORE_ADDRESS` | Adresse boutique |
| `VITE_STORE_FACEBOOK` | URL page Facebook |
| `VITE_STORE_INSTAGRAM` | URL compte Instagram |
| `VITE_STORE_TWITTER` | URL compte Twitter |
| `VITE_STORE_TIKTOK` | URL compte TikTok |

## Staging

| Secret | Description |
|---|---|
| `VITE_SUPABASE_URL_STAGING` | URL projet Supabase staging |
| `VITE_SUPABASE_ANON_KEY_STAGING` | Clé anon Supabase staging |
| `VITE_BASE_URL_STAGING` | URL du site staging (ex: https://staging.philiastore.sn) |

## Production

| Secret | Description |
|---|---|
| `VITE_SUPABASE_URL_PROD` | URL projet Supabase production |
| `VITE_SUPABASE_ANON_KEY_PROD` | Clé anon Supabase production |
| `VITE_BASE_URL_PROD` | URL du site (ex: https://philiastore.sn) |

## Vercel

| Secret | Description | Comment obtenir |
|---|---|---|
| `VERCEL_TOKEN` | Token API Vercel | vercel.com → Account Settings → Tokens |
| `VERCEL_ORG_ID` | ID de l'organisation Vercel | `vercel env ls` ou `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | ID du projet Vercel | `.vercel/project.json` après `vercel link` |

## Supabase

| Secret | Description | Comment obtenir |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | Token Supabase CLI | supabase.com → Account → Access Tokens |
| `SUPABASE_PROJECT_ID` | Ref du projet Supabase | Dashboard → Settings → General → Reference ID |

## Environnement GitHub à configurer

Dans **GitHub → Settings → Environments** :

### `production`
- Cocher **Required reviewers** → ajouter ton compte
- Cocher **Wait timer** → 5 minutes (délai de sécurité)
- Branches autorisées : `prod` uniquement

### `staging`
- Branches autorisées : `develop` uniquement
- Pas de reviewers requis

## Flux de branches

```
feature/ma-feature
    → PR vers develop  (CI + Security)
    → develop          (Staging deploy + Lighthouse)
    → PR vers prod     (CI + Security + Review)
    → prod             (Gate manuel → Production)
```
