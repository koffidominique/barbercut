#!/usr/bin/env node
/**
 * Vérifie que supabase/schema.sql reste synchronisé avec les migrations
 * de supabase/migrations/ (source de vérité : les migrations).
 *
 * Utilisation : npm run check:migrations  (sortie 1 si désynchronisation)
 */
const fs = require("node:fs");
const path = require("node:path");

const MIGRATIONS_DIR = path.join(__dirname, "..", "supabase", "migrations");
const SCHEMA_FILE = path.join(__dirname, "..", "supabase", "schema.sql");

/** Retire les lignes de commentaires/séparateurs et les lignes vides. */
function normalize(sql) {
  return sql
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== "" && !line.trim().startsWith("--"))
    .join("\n")
    .trim();
}

function main() {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.error("Aucun fichier de migration trouvé dans supabase/migrations/");
    process.exit(1);
  }

  const migrationsSql = normalize(
    files.map((f) => fs.readFileSync(path.join(MIGRATIONS_DIR, f), "utf8")).join("\n"),
  );
  const schemaSql = normalize(fs.readFileSync(SCHEMA_FILE, "utf8"));

  if (migrationsSql === schemaSql) {
    console.log(
      `✓ schema.sql est synchronisé avec ${files.length} migration(s) :`,
    );
    files.forEach((f) => console.log(`  - ${f}`));
    process.exit(0);
  }

  console.error(
    "✗ schema.sql n'est PAS à jour par rapport aux migrations.\n" +
      "  Régénérez-le : cat supabase/migrations/*.sql > supabase/schema.sql\n" +
      "  (puis réajoutez l'en-tête du fichier)",
  );
  process.exit(1);
}

main();
