# Mise en place de Neon (Postgres + auth maison)

## 1. Variables d'environnement

Renseignez dans `.env` :

- `DATABASE_URL` — chaîne de connexion Neon (pooler).
- `NEON_PROJECT_ID` — identifiant du projet Neon (utile côté dashboard/API Neon, non lu par le code applicatif).
- `AUTH_SECRET` — secret de signature des sessions JWT (généré via `openssl rand -base64 48`).

## 2. Créer les tables

Dans l'éditeur SQL de Neon, exécutez les fichiers de `lib/db/migrations/` **dans l'ordre chronologique** :

1. `20261006_neon_access_requests.sql` — `access_requests` + `app_users` (comptes locaux avec mot de passe haché bcrypt)
2. `20261006_neon_cash_closures.sql` — `cash_closures`
3. `20261007_neon_sales.sql` — `products`, `sales`, `sale_items`
4. `20261008_update_products_full_schema.sql` — `suppliers`, `product_variants` + évolutions du schéma `products`

## 3. Authentification

L'auth est maison : inscription/connexion via `/api/auth/register` et `/api/auth/login`,
session JWT httpOnly (`boulangerie-session`, 7 jours), déconnexion via `/api/auth/logout`.
Le dashboard est protégé côté serveur par `getCurrentUser()`.

## Parcours couvert et limites actuelles

- Le formulaire public enregistre une demande dans Neon via `/api/access-requests`.
- L'inscription crée directement un compte local (pas d'invitation manuelle).
- Les indicateurs du dashboard sont agrégés en base via `/api/dashboard-metrics`, avec les ventes (`/api/sales`) et les clôtures de caisse (`/api/cash-closures`).

Avant une mise en production publique, ajoutez une protection anti-spam avec limitation de débit et CAPTCHA,
ainsi qu'une politique de conservation des coordonnées conforme à vos obligations locales.
