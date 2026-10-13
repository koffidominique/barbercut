# Boulangerie CI

**Boulangerie CI** est un logiciel de gestion de boulangerie conçu pour la Côte d'Ivoire : ventes, clôtures de caisse, catalogue produits, crédit client, fournisseurs, pertes et recettes — avec un vrai backend **Neon Postgres** et une authentification maison.

> Contrairement à un simple starter UI, ce projet est une application **full-stack** : API, base de données et sessions sont incluses et fonctionnelles.

---

## Stack technique

| Domaine | Technologies |
|---|---|
| Framework | **Next.js 16** (App Router) · **React 19** · **TypeScript 5** |
| Styles | **Tailwind CSS v4** (thème dans `app/globals.css`) · dark mode natif (`next-themes`) |
| Composants | **Base UI** (`@base-ui/react`) + primitives Radix · composants style **shadcn** (`components/ui/*`) |
| Données | **Neon Postgres** via `@neondatabase/serverless` · migrations SQL versionnées |
| Auth | **JWT maison** (`jose`, HS256) · cookie httpOnly · mots de passe **bcrypt** (12 tours) |
| UI & data-viz | `recharts`, `framer-motion`, `lucide-react`, `@dnd-kit`, `react-day-picker`, `date-fns` |

## Fonctionnalités

- **Dashboard** — indicateurs de clôture, tendances de ventes, alertes d'écart de caisse
- **Ventes & catalogue** — produits, variants, prix, stocks, fournisseurs
- **Caisse** — clôture journalière, écart compté/attendu, historique
- **Crédit client** — encours, échéances, relance WhatsApp
- **Réseau** — boutiques, membres de l'équipe, suivi des pertes
- **Recettes & production** — fiches et planning de production
- **Acquisition** — landing marketing, tarifs, formulaire de demande d'accès
- **Mode démo** — page `/demo` pour explorer l'interface sans compte
- **Comptes locaux** — utilisateurs (`app_users`) avec rôles et boutiques rattachées

## Démarrage rapide

```bash
# 1. Dépendances
npm install

# 2. Variables d'environnement
#    Créer un fichier .env (voir tableau ci-dessous), puis générer le secret :
openssl rand -base64 48   # → valeur pour AUTH_SECRET

# 3. Base de données : exécuter dans l'éditeur SQL de Neon, dans l'ordre :
#    lib/db/migrations/20261006_neon_access_requests.sql
#    lib/db/migrations/20261006_neon_cash_closures.sql
#    lib/db/migrations/20261007_neon_sales.sql
#    lib/db/migrations/20261008_update_products_full_schema.sql

# 4. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

> Guide de mise en place détaillé : [`docs/NEON_SETUP.md`](./docs/NEON_SETUP.md).

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Connexion Neon Postgres (consommée par `lib/db/neon.ts`) |
| `AUTH_SECRET` | Clé de signature des sessions JWT — refuse toute valeur par défaut (`change-me`) |
| `NEON_PROJECT_ID` | Identifiant du projet Neon (utile pour le dashboard/API Neon — **non lu** par le code applicatif) |

## Base de données

Client unique : `getNeonClient()` dans `lib/db/neon.ts`. Schéma géré par des migrations SQL fichiers (`lib/db/migrations/`) :

| Table | Rôle |
|---|---|
| `app_users` | Comptes locaux (email, mot de passe bcrypt, rôle) |
| `access_requests` | Demandes d'accès déposées via le site public |
| `products` / `product_variants` | Catalogue et déclinaisons |
| `suppliers` | Fournisseurs |
| `sales` / `sale_items` | Tickets de vente et lignes |
| `cash_closures` | Clôtures de caisse (attendu, compté, écart) |

## Authentification

- Inscription / connexion via `POST /api/auth/register` et `POST /api/auth/login`
- Session dans un cookie **httpOnly** `boulangerie-session` (JWT HS256, validité **7 jours**), signé avec `AUTH_SECRET`
- Mots de passe hachés avec `bcrypt` (12 tours) — `lib/auth/password.ts`
- Protection côté serveur du dashboard par `getCurrentUser()` — `lib/auth/user.ts`
- Déconnexion via `POST /api/auth/logout`

## Structure du projet

```
app/
├── (marketing)/          # Landing page + demande d’accès
├── (auth)/               # Connexion / inscription
├── (dashboard)/          # Espace connecté (10 modules)
│   ├── dashboard/        #   Vue d’ensemble
│   ├── ventes/           #   Ventes
│   ├── catalogue/        #   Produits & variants
│   ├── caisse/           #   Clôtures de caisse
│   ├── credit/           #   Crédit client
│   ├── boutiques/        #   Boutiques
│   ├── fournisseurs/     #   Fournisseurs
│   ├── membres/          #   Équipe
│   ├── pertes/           #   Pertes
│   └── recettes/         #   Recettes & production
├── demo/                 # Page de démonstration
└── api/                  # Routes API (voir tableau plus bas)
components/
├── ui/                   # Primitives (dialog, table, switch, …)
├── marketing/ dashboard/ caisse/ credit/ products/ recettes/ …
contexts/                 # StatsPanelContext (panneau de statistiques)
hooks/                    # hooks partagés (use-mobile)
lib/
├── auth/                 # session JWT, bcrypt, utilisateur courant
├── db/                   # client Neon + migrations SQL
├── sales/                # métriques et catalogue
├── config.ts             # identité du site (siteConfig)
└── types.ts utils.ts constants.ts
```

## Design system

Le thème vit dans **`app/globals.css`** (Tailwind v4). Le fichier `tailwind.config.ts` à la racine est chargé via la directive `@config` et fournit encore des utilitaires utilisés partout (`bg-background-light`, `bg-background-dark`, `font-display`, `primary`) :

```css
--primary: #10b981;                  /* émeraude — couleur de marque */
--primary-foreground: #003322;
--ring: #10b981;
--font-heading: var(--font-spline);  /* titres */
--font-sans: var(--font-noto);       /* texte courant */
```

L’identité du site (nom, titre, navigation) se modifie dans `lib/config.ts` → `siteConfig` (« Boulangerie CI »).

## Routes API

| Route | Méthodes | Rôle |
|---|---|---|
| `/api/auth/register` · `/api/auth/login` · `/api/auth/logout` | POST | Inscription, connexion, déconnexion |
| `/api/access-requests` | POST | Demandes d’accès (site public) |
| `/api/demo-login` | POST | Connexion au compte de démonstration |
| `/api/products` | GET/POST/PUT/DELETE | Catalogue produits (requêtes paramétrées `sql.unsafe`) |
| `/api/sales` | GET/POST | Enregistrement et lecture des ventes |
| `/api/cash-closures` | GET/POST | Clôtures de caisse |
| `/api/dashboard-metrics` | GET | Agrégats Neon du dashboard |

## Scripts

```bash
npm run dev     # serveur de développement
npm run build   # build de production (typecheck + export des pages)
npm run start   # serveur de production
npm run lint    # ESLint (eslint-config-next)
```

État qualité du dépôt : `tsc --noEmit` **0 erreur**, `npm run lint` **0 problème**, `npm run build` **✅** (27 pages générées).

## Limites connues / travail restant

- **Vestiges du starter d’origine supprimés** (nettoyage à la racine) : `DOCUMENTATION.html`, `PRODUCT_DESCRIPTION.txt`, `lint.log`, `supabase/` et l’ancien `docs/SUPABASE_SETUP.md`. Le guide à jour est [`docs/NEON_SETUP.md`](./docs/NEON_SETUP.md).
- Aucun script de test unitaire pour l’instant (pas de `npm test`).
- Avant une mise en production publique : protéger `/api/access-requests` contre les robots (rate-limit + CAPTCHA) et définir une politique de conservation des données.
- L’auth est « maison » (pas de NextAuth/Clerk) : régénérer `AUTH_SECRET` au déploiement et revérifier l’expiration des sessions.

## Licence

Le code de base hérite de la licence du starter **Dark Eagle** (© 2025 Future Fit Inc.) : voir [`LICENSE.txt`](./LICENSE.txt).
Usage en produit final autorisé (licences Regular/Extended) — redistribution du code source « tel quel » interdite.
