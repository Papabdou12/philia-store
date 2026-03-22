#!/usr/bin/env node
/**
 * Runner de migrations Supabase
 * Usage: node scripts/migrate.js [nom_fichier.sql]
 * Sans argument: exécute tous les fichiers supabase/*.sql dans l'ordre
 *
 * Prérequis: SUPABASE_DB_URL dans .env.local
 * Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
 */

import { readFileSync, readdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import { resolve4 } from 'dns/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Lire .env.local
function loadEnv() {
  const envPath = join(ROOT, '.env.local');
  let content;
  try {
    content = readFileSync(envPath, 'utf8');
  } catch {
    console.error('❌  .env.local introuvable');
    process.exit(1);
  }
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

async function run() {
  const env = loadEnv();
  const dbUrl = env.SUPABASE_DB_URL;

  if (!dbUrl) {
    console.error(`
❌  SUPABASE_DB_URL manquant dans .env.local

Pour l'obtenir :
  1. Va sur https://supabase.com → ton projet → Settings → Database
  2. Section "Connection string" → mode "URI"
  3. Copie et remplace [YOUR-PASSWORD] par ton mot de passe
  4. Ajoute dans .env.local :
     SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.vxugdnsilougawdlvtra.supabase.co:5432/postgres
`);
    process.exit(1);
  }

  // Charger pg via createRequire pour éviter les problèmes ESM avec chemins spéciaux
  const require = createRequire(pathToFileURL(ROOT + '/package.json').href);
  let Pg;
  try {
    Pg = require('pg');
  } catch {
    console.log('📦  Installation de pg...');
    const { execSync } = await import('child_process');
    execSync('npm install pg --save-dev', { stdio: 'inherit', cwd: ROOT });
    Pg = require('pg');
  }

  // Résoudre le hostname en IPv4 pour éviter les problèmes IPv6
  let resolvedUrl = dbUrl;
  try {
    const parsed = new URL(dbUrl);
    const [ipv4] = await resolve4(parsed.hostname);
    resolvedUrl = dbUrl.replace(parsed.hostname, ipv4);
    console.log(`🌐  Résolution DNS : ${parsed.hostname} → ${ipv4}`);
  } catch {
    // Continuer avec l'URL originale si la résolution échoue
  }

  const client = new Pg.Client({ connectionString: resolvedUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅  Connecté à Supabase PostgreSQL\n');
  } catch (err) {
    console.error('❌  Connexion échouée:', err.message);
    process.exit(1);
  }

  // Déterminer quels fichiers exécuter
  const arg = process.argv[2];
  let files;

  if (arg) {
    // Fichier spécifique
    const filePath = arg.includes('/') ? arg : join(ROOT, 'supabase', arg);
    files = [filePath];
  } else {
    // Tous les fichiers dans supabase/ dans l'ordre alphabétique
    const dir = join(ROOT, 'supabase');
    files = readdirSync(dir)
      .filter((f) => f.endsWith('.sql'))
      .sort()
      .map((f) => join(dir, f));
  }

  for (const filePath of files) {
    const fileName = filePath.split('/').pop();
    console.log(`⏳  Exécution : ${fileName}`);
    try {
      const sql = readFileSync(filePath, 'utf8');
      await client.query(sql);
      console.log(`✅  ${fileName} — OK\n`);
    } catch (err) {
      console.error(`❌  ${fileName} — ERREUR:`, err.message, '\n');
      // Continuer malgré les erreurs (ex: "already exists")
    }
  }

  await client.end();
  console.log('🏁  Migration terminée');
}

run();
