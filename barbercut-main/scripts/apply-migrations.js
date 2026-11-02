#!/usr/bin/env node
/**
 * Applique les migrations SQL du dépôt sur une base PostgreSQL
 * (Supabase ou autre) via l'URL de connexion — sans Docker ni CLI Supabase.
 *
 * Usage :
 *   DATABASE_URL="postgresql://postgres:<mdp>@db.<ref>.supabase.co:5432/postgres?sslmode=require" \
 *     npm run db:migrate            # applique les migrations en attente
 *   npm run db:migrate -- --dry-run # liste sans rien modifier
 *   npm run db:migrate -- --status  # montre l'état d'application
 *
 * Comportement :
 *   - Lit supabase/migrations/*.sql dans l'ordre chronologique ;
 *   - Enregistre chaque migration appliquée dans `public.schema_migrations`
 *     (idempotent : les migrations déjà appliquées sont sautées) ;
 *   - Chaque migration est exécutée dans une transaction (tout ou rien).
 */

const fs = require('node:fs');
const path = require('node:path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');
const TRACKING_TABLE_SQL = `
create table if not exists public.schema_migrations (
  name text primary key,
  applied_at timestamp with time zone default timezone('utc'::text, now()) not null
);`;

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

function loadMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fail(`Dossier introuvable : ${MIGRATIONS_DIR}`);
  }
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((name) => ({
      name,
      sql: fs.readFileSync(path.join(MIGRATIONS_DIR, name), 'utf8'),
    }));
}

function getConnectionString() {
  const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (url) return url;
  fail(
    'DATABASE_URL (ou SUPABASE_DB_URL) manquant.\n' +
      '  Récupérez l’URL de base : Dashboard Supabase → Project Settings →\n' +
      '  Database → Connection string → URI (choisissez "Session pooler" ou\n' +
      '  direct, ajoutez ?sslmode=require si nécessaire).\n' +
      '  Exemple :\n' +
      '    DATABASE_URL="postgresql://postgres.<ref>:<mot-de-passe>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require" \\\n' +
      '      npm run db:migrate'
  );
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const statusOnly = args.includes('--status');
  const migrations = loadMigrations();

  console.log(`Migrations trouvées (${migrations.length}) :`);
  for (const m of migrations) console.log(`  - ${m.name}`);

  if (dryRun) {
    console.log('\n[dry-run] Aucune modification ne sera effectuée.');
    return;
  }

  const connectionString = getConnectionString();
  const { Client } = require('pg');
  // SSL activé par défaut (Supabase exige TLS) ; désactivable via PGSSLMODE=disable.
  // 'require' = chiffrement sans vérification du CA, comportement historique libpq.
  const sslDisabled = process.env.PGSSLMODE === 'disable';
  const client = new Client({
    connectionString,
    ssl: sslDisabled ? false : { rejectUnauthorized: false },
  });

  console.log('\n→ Connexion à la base …');
  try {
    await client.connect();
  } catch (e) {
    fail(
      `Connexion impossible : ${e.message}\n` +
        '  Vérifiez : mot de passe, hôte (direct/pooler), blocage pare-feu,\n' +
        '  et que l’option ssl est adaptée (?sslmode=require dans l’URL).'
    );
  }

  let appliedSet = new Set();
  if (!statusOnly) {
    await client.query(TRACKING_TABLE_SQL);
  }
  try {
    const { rows } = await client.query(
      'select name from public.schema_migrations order by name'
    );
    appliedSet = new Set(rows.map((r) => r.name));
  } catch {
    // Table de suivi absente (--status sur une base vierge) : tout est en attente.
  }

  if (statusOnly) {
    console.log('\nÉtat des migrations :');
    for (const m of migrations) {
      console.log(`  ${appliedSet.has(m.name) ? '✓ appliquée' : '… en attente '}  ${m.name}`);
    }
    await client.end();
    return;
  }

  let count = 0;
  for (const m of migrations) {
    if (appliedSet.has(m.name)) {
      console.log(`✓ ${m.name} — déjà appliquée, ignorée`);
      continue;
    }
    console.log(`⏳ ${m.name} …`);
    try {
      await client.query('begin');
      await client.query(m.sql);
      await client.query(
        'insert into public.schema_migrations (name) values ($1)',
        [m.name]
      );
      await client.query('commit');
      console.log(`✓ ${m.name} — appliquée`);
      count++;
    } catch (e) {
      await client.query('rollback').catch(() => {});
      await client.end().catch(() => {});
      fail(`${m.name} a échoué : ${e.message}\n  Transaction annulée, aucune modification partielle.`);
    }
  }

  await client.end();
  console.log(
    `\nTerminé : ${count} migration(s) appliquée(s), ${migrations.length - count} déjà présente(s).`
  );
}

main().catch((e) => fail(e.stack || String(e)));
