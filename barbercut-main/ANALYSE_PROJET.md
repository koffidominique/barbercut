# 🔍 Analyse complète — Barber Cuts

**Date :** 2 novembre 2026
**Branche analysée :** `arena/12a064b1-barbercut` (commit `c1670aa`)
**Périmètre :** intégralité du dépôt `koffidominique/barbercut`
**Méthode :** lecture de 100 % des fichiers sources, `npx tsc --noEmit`, `npm run build`, `npm ci`, `npm audit`, inspection du schéma SQL et des policies RLS.

---

> **Mise à jour — 2 novembre 2026 (soir).** Les correctifs P0 décrits au §10 ont été appliqués :
> le build passe, le typage est propre, la CI et les scripts sont réparés, et une migration SQL
> débloque l'inscription, la marketplace publique et la réservation. Détail complet en **§12**.

## 1. Synthèse exécutive

Barber Cuts est une **application Next.js 16 (React 19) monolithique** qui combine deux produits dans une seule SPA :

1. un **ERP de salon** (rendez-vous, clients, prestations, équipe, vitrine, rapports, analytics, abonnement) ;
2. une **marketplace publique** (recherche de salons, carte, fiche salon, réservation).

L'ambition produit est claire et le travail d'interface est réel (design soigné, animations Framer Motion, PWA, localisation FCFA/Abidjan). **Mais le socle technique n'est pas au niveau de l'interface** : le projet ne compile pas, la base de données ne permet ni l'inscription d'un nouveau gérant ni la réservation publique, et une bonne partie des fonctionnalités annoncées dans `PLAN_IMPLEMENTATION.md` sont soit des coquilles vides, soit des simulations.

| Axe | Note | Verdict |
|---|---|---|
| Design / UI / UX | 8/10 | Interface très travaillée, cohérente, animations soignées |
| Couverture fonctionnelle (UI) | 7/10 | 8 onglets ERP + marketplace réellement présents à l'écran |
| Couverture fonctionnelle (persistance) | 3/10 | Vitrine, prestations, équipe, avis, abos, invitations ne survivent pas à un rechargement |
| Qualité du code / typage | 4/10 | 5 erreurs TypeScript → **`npm run build` échoue** |
| Architecture | 3/10 | Pas d'état partagé, 9 instances de store, double couche localStorage/Supabase |
| Sécurité / données | 2/10 | RLS bloquent les parcours clés, mots de passe en clair, policies manquantes |
| Base de données | 3/10 | 7 tables pour ~12 domaines métier, 2 schémas divergents |
| Tests / CI / Ops | 1/10 | 0 test, workflow dans le mauvais dossier, déploiement = `echo` |
| **Global** | **4/10** | **Prototype avancé, pas encore une application exploitable** |

**Le point le plus important :** le projet se présente comme « Supabase + mode dégradé localStorage », mais en réalité **les deux modes sont cassés pour un utilisateur neuf** :

- **Sans Supabase** : les données de démo ont été supprimées (`DEFAULT_SALONS = []`), et `/register` + `/login` refusent de fonctionner sans Supabase → impossible de créer un salon → application vide et impasse.
- **Avec Supabase** : l'upsert dans `public.users` est bloqué par RLS (aucune policy `INSERT`), donc la FK `salons.owner_id → users.id` fait échouer `createSalon` → l'onboarding est infranchissable.

---

## 2. Identité du projet et structure

### 2.1 Carte d'identité technique

| Élément | Valeur |
|---|---|
| Framework | Next.js **16.4.3** (App Router, Turbopack) |
| UI | React **19.3.1**, Tailwind CSS **4**, shadcn/tw-animate, lucide-react, Framer Motion 14 |
| Graphiques | D3 7 (via composant maison), pas de librairie de charts |
| Cartes | Leaflet 1.9 + react-leaflet 5 |
| Backend | Supabase (`@supabase/ssr` 0.12, `supabase-js` 2.118) |
| Langage | TypeScript 5.7 `strict: true` |
| Rendu | 24 fichiers `'use client'` / 30 fichiers TS-TSX → **quasi 100 % client-side** |
| Volume | **11 638 lignes** TS/TSX (30 fichiers) + **280 lignes** SQL |
| Dépendances | 18 prod / 8 dev |
| Historique Git | **1 seul commit** (`chore: remove .env from tracking`) |
| Poids | 9,5 Mo hors `.git`/`node_modules`/`.next` |

### 2.2 Arborescence

```
/home/user/barbercut              ← racine du dépôt Git (contient seulement .DS_Store)
└── barbercut-main/               ← ⚠️ tout le projet est dans un sous-dossier
    ├── app/                      ← 7 routes (App Router)
    │   ├── page.tsx              (967 l.)  ERP = dashboard à onglets
    │   ├── login/ | register/ | onboarding/
    │   ├── marketplace/page.tsx  (18 l. → délègue à MarketplaceView)
    │   ├── salon/[id]/           (fiche publique + ClientSalonPage 402 l.)
    │   └── client/rendez-vous/   (246 l. « Mes rendez-vous »)
    ├── components/               ← 14 composants (ERP*, Marketplace*, BookingModal 738 l., VitrineManager 999 l.)
    ├── lib/
    │   ├── store.ts              (1 032 l.) store localStorage + aiguillage
    │   ├── supabase-store.ts     (756 l.) store cloud
    │   ├── notifications.ts      (100 l.) notifications in-app en localStorage
    │   └── supabase.ts           (8 l.)   client navigateur
    ├── supabase/schema.sql + migrations/ (2 schémas divergents)
    ├── public/ (PWA : sw.js, manifest.json, 5,2 Mo d'images)
    ├── .github/workflows/ci-cd.yml  ← ⚠️ jamais exécuté (voir §7)
    └── PLAN_IMPLEMENTATION.md       ← feuille de route (2 lignes corrompues)
```

### 2.3 Routes et protection

| Route | Accès attendu | Protection réelle |
|---|---|---|
| `/` (ERP) | gérant connecté | ✅ redirige vers `/login` si pas de session |
| `/login`, `/register` | public | ✅ redirige vers `/` si session |
| `/onboarding` | gérant connecté | ⚠️ liste « publique » dans le middleware |
| `/marketplace` | public | ✅ |
| `/salon/[id]` | public | ⚠️ non listé comme public, non protégé non plus |
| `/client/rendez-vous` | client final | ❌ aucune protection serveur |

Le middleware ne protège **que** le chemin `/` exact (condition `middleware.ts:49`). Toute nouvelle route ERP ajoutée demain serait accessible sans authentification : la règle devrait être « tout sauf la liste publique », et non l'inverse.

---

## 3. État réel des fonctionnalités

Légende : ✅ réellement fonctionnel · ⚠️ fonctionne partiellement / en local seulement · ❌ coquille vide ou cassé en mode cloud · 🧪 simulé

### 3.1 Authentification & comptes

| Fonction | État | Preuve |
|---|---|---|
| Inscription gérant (email/mdp) | ⚠️ | `app/register/page.tsx` → `signUp` OK, mais l'étape suivante casse |
| Création du profil `public.users` | ❌ | `app/onboarding/page.tsx:76` upsert sans policy `INSERT` → erreur seulement `console.error` |
| Création du salon à l'onboarding | ❌ | FK `owner_id → users.id` non satisfaite → `createSalon` renvoie `null` → alerte « Création du salon échouée » |
| Connexion / déconnexion | ✅ | `login/page.tsx` (pas de bouton déconnexion dans l'ERP hormis via Supabase implicite) |
| Mot de passe oublié | ❌ | route inexistante (annoncée en Phase 1 du plan) |
| Comptes **clients** (marketplace) | ❌ / 🔒 | `ClientAccount.password` en clair dans `localStorage` (`lib/store.ts:154`) ; `BookingModal` se connecte avec `'demo-password'` codé en dur (`BookingModal.tsx:82`) → **auth contournable** ; en mode Supabase, `loginClient` **lève une exception** |
| Rôles & permissions | 🧪 | `StaffPermissions` défini dans les types, jamais appliqué à l'UI ou aux requêtes |

### 3.2 ERP

| Onglet | État | Détail |
|---|---|---|
| Vue d'ensemble | ✅ | KPI calculés en direct depuis les RDV, chart D3 |
| Rendez-vous | ⚠️ | CRUD OK côté Supabase (`appointments`), mais pas de contrôle de disponibilité ni de chevauchement |
| Clients | ⚠️ | CRUD OK ; mais `saveClient` insère avec `salon_id: currentSalon?.id || ""` → échec FK si salon vide |
| Prestations | ❌ | `ERPServicesView` modifie `salon.services` puis `updateSalon` ; or `updateSalon` ne persiste **jamais** `services`, et `loadData` les remet à `[]` (`supabase-store.ts:92`) → **toute modification est perdue au rechargement** |
| Équipe | ⚠️ | `saveStaffMember` écrit bien dans `salon_staff`, mais `loadData` ne lit jamais la table et force `staff: []` (`supabase-store.ts:93`) → l'onglet est **toujours vide** après reload ; les invitations lèvent une exception en mode Supabase |
| Vitrine | ❌ | `VitrineManager` (999 l.) manipule `salon.gallery` ; ni la galerie ni `showcase_photos` ne sont chargées/persistées (`supabase-store.ts:91`) |
| Rapports | ✅ | Export CSV réel (`ERPReportsView.tsx:78-98`) ; le toast annonce « PDF & CSV » alors que seul le CSV est produit |
| Analytics | ✅ | Calculs N vs N-1 sur les RDV réels |
| Abonnement | ❌ / 🧪 | `upgradeToPro` lève une exception en mode Supabase, appelée dans un `setTimeout` **sans try/catch** (`ERPSubscriptionView.tsx:53-59`) → exception non capturée + toast « succès » |
| Paramètres | ⚠️ | `updateSalon` persiste les champs scalaires ; logo/galerie non persistés |

### 3.3 Marketplace (public)

| Fonction | État | Détail |
|---|---|---|
| Liste des salons publiés | ❌ en cloud | `MarketplaceView` filtre `salons.filter(s => s.isPublished)` ; en mode Supabase un visiteur anonyme ne reçoit **aucune ligne** (RLS `auth.uid() = owner_id`) |
| Recherche / filtres / tri | ✅ | Implémentés côté client |
| Carte Leaflet | ⚠️ | Fonctionne, mais `salon.services`/`staff` vides → cartes appauvries ; tuiles OSM = dépendance réseau externe |
| Fiche `/salon/[id]` | ⚠️ | `generateMetadata` renvoie un titre **codé en dur** (pas de SEO par salon) ; `params` n'est pas `await` (Next 15+ : `params` est asynchrone) |
| Réservation | ❌ en cloud | `BookingModal` lit `salon.services[0]` ; en mode Supabase `services = []` → `activeService` undefined → **crash**. Et l'insertion `appointments` est refusée par RLS pour un visiteur → `bookAppointment` est *fire-and-forget*, l'utilisateur voit « confirmé » alors que rien n'est enregistré |
| Date par défaut | 🧪 | `useState('2026-11-02')` codé en dur (`BookingModal.tsx:59`) |
| Avis & notes | ❌ | `saveReview: () => {}` en mode Supabase (`supabase-store.ts:729`) ; **aucune table `reviews`** dans le schéma |
| « Mes rendez-vous » | ❌ | Filtre par téléphone sur des RDV qu'un visiteur ne peut pas lire ; annulation refusée par RLS |

### 3.4 Notifications & PWA

| Fonction | État | Détail |
|---|---|---|
| Notifications in-app | 🧪 | `lib/notifications.ts` = `localStorage` local à l'appareil ; aucun push, aucune synchro multi-appareils |
| SMS / WhatsApp | ❌ | Annoncés « ✅ » dans le plan ; aucun code d'envoi, drapeaux ON/OFF purement décoratifs |
| Service worker | ⚠️ | Cache `'/'` et `'/salon/barber-cuts-cocody'`, **salons de démo supprimés** → `cache.addAll` échoue probablement à l'install ; `globals.css` n'existe pas comme URL servie ; `CACHE_NAME` figé `v1` |
| Manifeste installable | ❌ | Icônes 32×32 + SVG uniquement ; **aucune icône 192×192 ni 512×512** → critère d'installabilité non rempli sur Android |

---

## 4. Vérifications exécutées (preuves)

### 4.1 Installation

```
npm ci  →  OK, 364 paquets en 15 s
npm audit --omit=dev → 6 vulnérabilités (2 low, 4 moderate) via ts-morph/minimatch (chaîne de build de shadcn)
```

### 4.2 TypeScript — `npx tsc --noEmit`

**5 erreurs** (aucune n'est un faux positif) :

```
app/onboarding/page.tsx(97,9):   TS2322 – {name,price,duration}[] non assignable à SalonService[]
lib/supabase-store.ts(320,70):   TS2367 – comparaison number/string impossible
lib/supabase-store.ts(323,72):   TS2367 – idem                                    [latitude/longitude]
lib/supabase-store.ts(380,74):   TS2367 – idem
lib/supabase-store.ts(386,76):   TS2367 – idem
```

Les quatre erreurs `TS2367` sont **le symptôme d'un bug réel** : `Salon.latitude/longitude` sont typés `number`, mais l'onboarding envoie des **chaînes** et le code teste `!== ""`.

### 4.3 Build de production — `npm run build`

```
✓ Compiled successfully in 8.9s
Running TypeScript ...
✗ Failed to type check.        ← BUILD EN ÉCHEC
```

`next.config.mjs` a bien été corrigé (`ignoreBuildErrors: false`), mais **les erreurs n'ont jamais été corrigées derrière**. Conséquence : aucun déploiement n'est possible en l'état.

> Note : `npm run lint` **est** `tsc --noEmit` → le job « Lint & Type Check » du workflow échouerait de toute façon.

---

## 5. Base de données & sécurité

### 5.1 Deux schémas divergents

| Fichier | `uuid_generate_v4` | `latitude/longitude` |
|---|---|---|
| `supabase/schema.sql` | ✅ (extension `uuid-ossp`) | ❌ **absentes** |
| `supabase/migrations/20240101000000_initial_schema.sql` | ❌ (`gen_random_uuid`) | ✅ **présentes** |

Deux sources de vérité qui ne produisent pas la même base. Le code applicatif écrit `latitude`/`longitude` (avec un *fallback* « tentative sans coordonnées », `supabase-store.ts:340`) : ce *fallback* est l'aveu que la base réelle n'a pas ces colonnes.

### 5.2 Couverture métier : 7 tables pour ~13 domaines

Présentes : `users`, `salons`, `salon_staff`, `salon_services`, `showcase_photos`, `salon_clients`, `appointments`.

**Absentes** alors que le code les utilise ou les promet : `reviews`, `client_accounts`, `subscriptions`, `invoices`, `team_invitations`, `notifications`, `payments`, `loyalty`, `salon_hours`. Toutes ces fonctionnalités vivent dans `localStorage`… ou nulle part.

### 5.3 RLS : trois trous bloquants

1. **Aucune policy `INSERT` sur `public.users`.** L'`upsert` de l'onboarding est rejeté → le profil n'existe pas → la FK `salons.owner_id` échoue → **l'onboarding ne peut jamais aboutir**. Il manque aussi le trigger standard `handle_new_user` sur `auth.users`.
2. **Aucune policy publique de lecture.** La marketplace, les fiches salon et toute la réservation sont rendues côté navigateur, donc avec la clé `anon` : `using (auth.uid() = owner_id)` renvoie 0 ligne à un visiteur. Il faut une policy du type `for select to anon using (is_published = true)` + des vues restreintes (pas d'exposition de `phone`, `notes`, `rccm`).
3. **Aucune policy `INSERT` pour les visiteurs sur `appointments`.** La réservation « en invité », présentée comme acquise, est rejetée silencieusement.

À noter aussi : les policies ne sont pas scopées par rôle (`to authenticated`), et **aucune table n'a de policy de service** → pas de chemin pour un webhook de paiement.

### 5.4 Autres points de sécurité

| Risque | Sévérité | Détail |
|---|---|---|
| Mots de passe clients en clair | **Critique** | `ClientAccount.password` en `localStorage` (`lib/store.ts:154`, commentaire « En production, jamais en clair ») |
| Authentification bypassable | **Critique** | `loginClient(phone, 'demo-password')` (`BookingModal.tsx:82`) : tout compte existant se connecte sans secret |
| `getSession()` dans le middleware | Moyen | Lit le cookie sans revalider le JWT → préférer `getUser()` |
| Référence de projet Supabase versionnée | Faible/Moyen | `supabase/.temp/{project-ref,linked-project.json,pooler-url}` commités (ref `bdqfqekjidmkasvyvgee` + `organization_id`) |
| `.env` non ignoré | Moyen | `.gitignore:16` contient `.DS_Store.env` (deux motifs collés) → **`.env` n'est pas ignoré** ; un futur `.env` avec `service_role` serait committé |
| XSS via données utilisateur | Faible | React échappe par défaut ; seul risque résiduel sur les URLs d'images base64 stockées en base |

---

## 6. Architecture & bugs critiques

### 6.1 Pas d'état partagé : 9 stores indépendants, 27 canaux Realtime

`useSalonStore()` est appelé **9 fois** dans l'arbre (`app/page.tsx`, `BookingModal`, `ERPTeamView`, `ERPSubscriptionView`, `MarketplaceMap`, `ClientSalonPage`, `client/rendez-vous`, …). Chaque appel :

- crée **son propre** client Supabase (`createBrowserClient`),
- crée **3 canaux Realtime** (`salons-changes`, `appointments-changes`, `clients-changes`),
- maintient **son propre** `useState`.

Conséquences : jusqu'à **~27 abonnements WebSocket** simultanés, désynchronisation entre composants (un RDV créé dans la modale n'apparaît pas dans la liste tant que Realtime n'a pas renvoyé), et un rechargement complet de toutes les tables à chaque `postgres_changes`. Il manque un `SalonProvider` + contexte (ou Zustand/React Query).

### 6.2 Boucle de rendu potentielle (mode Supabase)

```ts
// lib/supabase-store.ts:38
const supabase = createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)  // nouvelle instance à CHAQUE rendu
...
}, [supabase])  // ligne 207 → dépendance qui change à chaque rendu
```

`createBrowserClient` ne mémoïse pas : la dépendance `supabase` change à chaque rendu → l'effet se relance → `setSalons`/`setAppointments` → nouveau rendu → **effet relancé**. C'est une boucle de rechargement permanente (et `supabase.removeAllChannels()` ligne 170 tue au passage les canaux des autres instances). Correctif : `useMemo(() => createBrowserClient(...), [])` ou un singleton dans `lib/supabase.ts`.

### 6.3 Le store « cloud » est une coquille

`lib/supabase-store.ts` renvoie des **valeurs factices** pour la moitié de l'interface :

```ts
clientAccounts: [], clientAccount: null, subscriptions: {},
teamInvitations: [], reviews: [], saveReview: () => {},
registerClient: () => { throw new Error("Non disponible avec Supabase") },
upgradeToPro:  () => { throw new Error("Non disponible avec Supabase") },
inviteTeamMember: () => { throw new Error("Non disponible avec Supabase") },
```

Autrement dit, **dès que Supabase est configuré — c'est-à-dire en production — la moitié du produit est désactivée.** Le `PLAN_IMPLEMENTATION.md` coche pourtant ces lignes comme livrées (`[x] Intégration paiement mobile`, `[x] Invitation de collaborateurs`, `[x] Avis clients`).

### 6.4 Le « mode dégradé » n'existe pas

`lib/store.ts:309-311` : `DEFAULT_SALONS`, `DEFAULT_CLIENTS`, `DEFAULT_APPOINTMENTS` valent `[]` avec le commentaire « l'application charge exclusivement depuis Supabase ». Or, sans Supabase, `/register` et `/login` s'arrêtent sur un message d'erreur. **Il n'y a donc aucun chemin permettant d'utiliser l'application hors Supabase** — le fallback localStorage est mort-né (et `createSalon` local n'est atteignable que par l'onboarding, lui-même protégé par une session Supabase).

### 6.5 Divers bugs fonctionnels vérifiés

| # | Bug | Fichier | Impact |
|---|---|---|---|
| 1 | Prestations / galerie / équipe non rechargées (`services: []`, `gallery: []`, `staff: []`) | `supabase-store.ts:110-112` | 3 onglets ERP vides en permanence |
| 2 | `updateSalon` ignore `services`, `gallery`, `features` | `supabase-store.ts:239-300` | Toute édition est perdue au refresh |
| 3 | Réservation : `activeService` peut être `undefined` → `activeService.id` | `BookingModal.tsx:132` | Crash de la modale sur un salon cloud |
| 4 | Insertion RDV `fire-and-forget`, erreur seulement loguée | `supabase-store.ts:434-453` | Réservation « confirmée » mais non enregistrée |
| 5 | `bookAppointment` retourne un ID local `apt-<timestamp>` jamais réutilisé | `supabase-store.ts:426` | État incohérent côté client |
| 6 | `saveClient` avec `salon_id: ""` | `supabase-store.ts:531` | Erreur FK silencieuse |
| 7 | `upgradeToPro` en `setTimeout` sans `try/catch` | `ERPSubscriptionView.tsx:53` | Exception non capturée + faux succès |
| 8 | `params` non `await` (Next 16) + metadata statique | `salon/[id]/page.tsx:9-16` | SEO par salon inexistant, warning Next |
| 9 | Date de réservation codée en dur `'2026-11-02'` | `BookingModal.tsx:59` | Date obsolète dès demain |
| 10 | Aucune contrainte d'unicité `(salon_id, staff_name, date, time)` | `schema.sql` | Double réservation possible |
| 11 | Service worker : `cache.addAll` sur salons de démo supprimés + `/globals.css` inexistant | `public/sw.js:11-15` | Install du SW en échec |
| 12 | Notification marquée lue dès l'affichage du toast | `app/page.tsx:158-165` | Compteur « non lues » incohérent |
| 13 | `useEffect` d'onboarding dépend de `salons` | `app/page.tsx:154` | Boucle de redirection potentielle pendant le chargement |
| 14 | Redirection `/onboarding` si salon incomplet malgré un salon existant | `app/page.tsx:144-150` | Risque de blocage si `address`/`phone` vides |

---

## 7. Dépôt, CI/CD et chaîne de livraison

| Problème | Détail | Impact |
|---|---|---|
| **Workflow CI jamais exécuté** | `.github/workflows/ci-cd.yml` est dans `barbercut-main/`, or GitHub ne lit que `/.github/workflows` **à la racine** | Aucun check sur les PR, aucun build automatique |
| **Branche codée en dur obsolète** | Le workflow cible `arena/74a4924c-barbercut` | Ne se déclencherait pas sur les branches actuelles |
| **Job « deploy » = `echo`** | `echo "Dockerfile requis…"` | Aucun déploiement réel ; **aucun Dockerfile** dans le dépôt |
| CI duplique le type-check | `npx tsc --noEmit` **puis** `npm run lint` (= `tsc --noEmit`) | ~30 s perdues, aucune valeur ajoutée (**pas d'ESLint**) |
| Deux lockfiles | `package-lock.json` **et** `bun.lock` | Divergence de résolution garantie |
| Artefacts versionnés | `tsconfig.tsbuildinfo`, `supabase/.temp/*`, `.DS_Store` à la racine du dépôt | Bruit, fuite d'infos projet |
| Images en double | `public/images/*.jpg` **et** `src/assets/images/*.jpg` (identiques, 3,3 Mo) | Le dossier `src/` n'est même pas utilisé par l'app |
| Image non optimisée | `barber-shop-hero.png` = 1,8 Mo, `images.unoptimized: true` | LCP dégradé sur mobile 3G/4G |
| Pas de README | — | Aucun onboarding développeur |
| Pas de tests | 0 fichier de test, aucune lib de test installée | Aucun filet de sécurité |
| Pas d'ESLint/Prettier | `shadcn` en dépendance de prod, pas d'ESLint | Style non vérifié |
| Documentation corrompue | `PLAN_IMPLEMENTATION.md:170` et `:191` contiennent `<\|open\|>argument key="text" type="string"<\|sep\|>` | Artefact de génération LLM laissé dans le doc de référence |
| Métadonnées parasites | `metadata.json` (`MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`) mais **aucun appel Gemini** | Vestige du scaffolding v0.dev |
| Dépendances inutiles | `shadcn` (CLI en prod), `@types/react-leaflet` (incompatible react-leaflet 5, non utilisé) | Poids + confusion |
| `middleware.ts` déprécié | Next 16 : convention `proxy.ts` | Warning de build officiel |

---

## 8. Performance, UX et accessibilité

**Points forts**
- Chargement paresseux réel des vues lourdes (D3, analytics, marketplace) via `next/dynamic` + `ssr: false`.
- Squelettes de chargement sur ces mêmes vues.
- Animations cohérentes centralisées (`components/ui/motion.ts`), respectant une direction artistique claire.
- Mobile-first assumé (sidebar coulissante, grilles responsive).

**Points faibles**
- **Tout est client-side** : aucune donnée au premier rendu, donc pas de SEO réel (la fiche salon, pourtant « SEO ✅ » dans le plan, n'a pas de contenu serveur ni de metadata dynamique) et LCP dépendant du JS.
- **`.next` = 68 Mo**, bundle JS non analysé (le plan le note d'ailleurs comme non fait).
- **Realtime global** : chaque `INSERT` sur `appointments` déclenche un rechargement complet des 3 tables, pour tous les canaux, tous les composants.
- **Pas de pagination** : `select("*")` sans `limit` sur `appointments`, `salon_clients`. Au-delà de quelques milliers de lignes, la marketplace et l'ERP deviendront lents (le plan identifie le risque sans le traiter).
- **Accessibilité** : modales sans `role="dialog"`/`aria-modal`/piège de focus, `confirm()` et `alert()` natifs, contrastes non vérifiés, navigation clavier incomplète.
- **Formulaires** : validations dispersées, messages d'erreur Supabase bruts affichés à l'utilisateur.

---

## 9. Écart entre le plan et la réalité

`PLAN_IMPLEMENTATION.md` coche `[x]` 40+ éléments. Vérification par lecture du code :

| Annoncé ✅ dans le plan | Réalité |
|---|---|
| « Deux utilisateurs ne voient pas les données de l'autre (RLS) » | Vrai… mais **personne ne voit rien** : pas de policy publique, onboarding bloqué |
| « Invitation de collaborateurs par email » | `throw new Error("Non disponible avec Supabase")` |
| « Paiement mobile Wave/Orange Money » | `setTimeout(1500)` + exception ; aucune API appelée |
| « Avis clients » | `saveReview: () => {}` ; pas de table |
| « Comparatif N vs N-1 » | Réellement implémenté ✅ |
| « Export CSV » | Réellement implémenté ✅ (mais pas de PDF) |
| « Pipeline CI/CD » | Fichier au mauvais endroit, deploy = `echo` |
| « PWA installable » | Manifest sans icônes 192/512 |
| « TypeScript strict : 0 erreur » | **5 erreurs**, build en échec |
| « Réservation en invité possible » | Refusée par RLS et crash sur `services[0]` |
| « Photothèque vitrine » | Jamais persistée ni relue |
| « Notifications temps réel » | `localStorage` local, aucun push |

**Conclusion :** le plan décrit l'application telle qu'elle a été *dessinée*, pas telle qu'elle *fonctionne*. Il doit être réécrit à partir de cette analyse, sinon il continuera à masquer les vrais blocages.

---

## 10. Plan d'action priorisé

### P0 — Débloquer (≈ 2 à 3 jours)

1. **Faire passer le build.** Corriger les 5 erreurs TS : typer `latitude/longitude` en `string | number | undefined` en entrée et normaliser (`Number(x)`) une seule fois ; typer `services` de l'onboarding en `Partial<SalonService>[]` + mapping.
2. **Débloquer l'inscription.** Ajouter une migration : policy `INSERT` sur `public.users` + trigger `handle_new_user` sur `auth.users` (crée le profil automatiquement). Supprimer l'`upsert` manuel de l'onboarding.
3. **Débloquer la marketplace.** Policies publiques en lecture seule : `salons` où `is_published = true`, `salon_services`, `salon_staff` (champs publics), `showcase_photos`, avis. Créer une **vue** `public_salons` pour ne pas exposer `rccm`/`phone`.
4. **Débloquer la réservation.** Policy `INSERT` sur `appointments` pour `anon` avec `with check (salon_id in (select id from salons where is_published))` + rendu d'erreur visible dans `BookingModal` (ne plus mentir sur le succès).
5. **Stabiliser le store.** Client Supabase en singleton `useMemo` ; charger `services`, `staff`, `gallery` dans `loadData` ; persister ces collections dans `updateSalon` (ou créer les actions dédiées `saveService`, `savePhoto`, `saveStaff`) ; supprimer `removeAllChannels()` du chemin de rendu.
6. **Sécuriser `.gitignore`** (`.env`, `.env*.local`, `.DS_Store`, `*.tsbuildinfo`, `supabase/.temp/`), purger les artefacts déjà suivis.

### P1 — Rendre le produit cohérent (≈ 1 à 2 semaines)

7. **Un seul état global** : `SalonProvider` + contexte (ou React Query) → 1 client, 1 canal Realtime, mutations optimistes.
8. **Refonte du schéma** : `reviews`, `client_accounts`, `subscriptions`, `invoices`, `team_invitations`, `notifications`, `payments` ; une seule source de vérité (migrations seules, supprimer `schema.sql` ou le générer) ; colonnes `latitude/longitude` partout ; index et contraintes d'unicité anti-double-booking.
9. **Décider du mode hors-ligne** : soit un vrai mode démo avec seed réaliste et un bouton « Explorer la démo », soit retirer le fallback. Le statu quo (ni l'un ni l'autre) rend le projet indémarrable pour un développeur.
10. **Authentification client propre** : utiliser Supabase Auth (ou magic link) au lieu du `localStorage` avec mot de passe en clair et `demo-password` codé en dur.
11. **Remplacer les `throw`** de `supabase-store` par des implémentations réelles (ou masquer les onglets concernés).
12. **CI** : déplacer le workflow à la racine du dépôt (et/ou remonter le projet à la racine), cibler `main` + `arena/*`, ajouter ESLint, Prettier et un vrai job de tests ; supprimer le faux job deploy ou ajouter un `Dockerfile` (l'output `standalone` est déjà configuré).

### P2 — Qualité, perf, production (≈ 3 à 4 semaines)

13. **Tests** : Vitest + Testing Library sur le store et les helpers (dates, prix FCFA, CSV) ; Playwright sur les 3 parcours critiques (inscription → salon, réservation invité, encaissement d'un RDV).
14. **SEO/SSR** : rendre la fiche salon serveur (`params` await, `generateMetadata` réel, JSON-LD `LocalBusiness`), prérendre la marketplace.
15. **Perf** : `next/image` (ou `unoptimized: false` avec formats AVIF/WebP), compresser les 4 photos (3,3 Mo → ~600 Ko), supprimer `src/assets/images`, pagination, `select` de colonnes explicites.
16. **PWA** : icônes 192/512, `CACHE_NAME` versionné, précache basé sur des routes réelles, `skipWaiting` piloté par l'UI.
17. **Accessibilité** : `role="dialog"`, focus trap, remplacer `alert`/`confirm`, audit contraste + clavier.
18. **Notifications** : Supabase Realtime → table `notifications` + Web Push ; brancher réellement SMS/WhatsApp (ou retirer les drapeaux).
19. **Observabilité** : Sentry, logs structurés, `error.tsx`/`loading.tsx` par route, monitoring des policies RLS (tests avec 2 comptes).
20. **Nettoyage documentaire** : README, corriger les 2 lignes corrompues du plan, réécrire le statut des phases à partir de la réalité, supprimer `metadata.json` (résidu v0) et les dépendances inutiles.

---

## 11. Conclusion

Le projet a **une vraie direction artistique et une vraie intuition produit** : l'ERP et la marketplace sont visuellement crédibles, la localisation ivoirienne est précise, et le découpage en phases du plan est sain.

Mais l'écart entre l'interface et le socle est aujourd'hui le risque principal : **aucun des deux parcours d'entrée (créer un salon, réserver un RDV) ne fonctionne réellement**, le build échoue, et le mode « dégradé » tant vanté n'existe pas. Ce sont des problèmes de plomberie, pas de conception — donc réparables rapidement.

Avec le lot **P0** (2-3 jours), l'application devient démontrable de bout en bout : un gérant s'inscrit, crée son salon, le publie ; un visiteur le trouve, réserve ; le gérant voit le RDV. C'est à mon avis le seul objectif à viser avant toute nouvelle fonctionnalité — et la condition pour que la feuille de route cesse d'être une liste de cases cochées et devienne un plan de livraison.

---

## 12. Journal des corrections appliquées

### 12.1 Build & TypeScript — ✅ réparé

| Avant | Après |
|---|---|
| `npm run build` → `Failed to type check` (5 erreurs TS) | `npm run build` → **succès**, 8 routes générées |
| `npm run lint` = `tsc --noEmit` (doublon) | ESLint 9 + `eslint-config-next` (flat config) → **0 erreur** |
| `currentSalon` pouvait être `undefined` → crash au prerender de `/` | `EMPTY_SALON` exporté et utilisé par les deux stores |

Correctifs de typage :
- nouveau type `CoordinateInput` + helper `toCoordinate()` (`lib/store.ts`) : les formulaires envoient des chaînes, la base attend des nombres ;
- nouveau type `SalonDraft` (`lib/store.ts`) : brouillon de salon acceptant `latitude/longitude` en `string` et des prestations partielles (`price`/`duration` en `string`) ;
- `createSalon()` des deux stores aligné sur `SalonDraft` → les 4 erreurs `TS2367` disparaissent à la racine, sans cast.

### 12.2 Corrections de bugs

| Bug | Correctif |
|---|---|
| Boucle de chargement (client Supabase recréé à chaque rendu) | `useMemo(() => createBrowserClient(...), [])` + dépendance d'effet stable |
| `removeAllChannels()` tuait les canaux des autres instances | un seul canal par instance, supprimé proprement au démontage |
| 3 canaux Realtime → 1 | canal unique `barbercuts-content-changes` sur les 6 tables |
| Prestations / équipe / vitrine jamais relues → onglets vides | `loadData` charge `salon_services`, `salon_staff`, `showcase_photos` et les rattache au salon |
| Modifications de prestations et de vitrine perdues au rechargement | `updateSalon` synchronise les deux tables (update / insert / delete) avec signatures anti-écriture inutile |
| Prestations saisies à l'onboarding jamais enregistrées | insertion dans `salon_services` juste après la création du salon |
| `saveClient` insérait avec `salon_id: ""` (erreur FK silencieuse) | garde explicite + log |
| `BookingModal` crashait si le salon n'avait aucune prestation | garde dans `handleConfirm` + accès optionnels dans le récapitulatif |
| `params` non `await` sur `/salon/[id]` (Next 16) | `generateMetadata` et la page attendent `params` |
| Aiguillage conditionnel de hooks dans `useSalonStore` | sélection de l'implémentation au niveau du module (`useLocalSalonStore` / `useSupabaseSalonStore`) → règle des Hooks respectée |

### 12.3 Scripts npm

```json
"dev":        "next dev -p 3000 -H 0.0.0.0",
"build":      "next build",
"start":      "next start -p 3000 -H 0.0.0.0",
"lint":       "eslint .",
"lint:fix":   "eslint . --fix",
"typecheck":  "tsc --noEmit",
"check":      "npm run typecheck && npm run lint && npm run build",
"clean":      "rm -rf .next tsconfig.tsbuildinfo"
```

- `engines.node: ">=20.9.0"` (minimum requis par Next 16).
- Dépendances rangées : `shadcn`, `@types/leaflet` passent en `devDependencies` ; `@types/react-leaflet` supprimé (incompatible avec react-leaflet 5, non utilisé) ; `@eslint/eslintrc` retiré.
- ESLint configuré via `eslint.config.mjs` (règles Next/React/Hooks/a11y/TS, `0 error`).

### 12.4 CI/CD

- Workflow déplacé à la **racine du dépôt** (`.github/workflows/ci.yml`) : il est enfin lu par GitHub.
- Déclencheurs : `push` sur `main` et `arena/**`, PR vers `main`, `workflow_dispatch`.
- Job unique `quality` : `npm ci` → `typecheck` → `lint` → `build` → `npm audit` (informatif).
- `working-directory: barbercut-main`, cache npm branché sur le bon lockfile, Node 22, `concurrency` pour annuler les runs obsolètes.
- Ancien fichier `barbercut-main/.github/workflows/ci-cd.yml` supprimé (jamais exécuté, job `deploy` factice).

### 12.5 Dépôt & hygiène

- `.gitignore` corrigé : le motif `.DS_Store.env` collé laissait **`.env` non ignoré**. Deux fichiers propres désormais (racine + `barbercut-main`).
- Artefacts retirés du suivi Git : `.DS_Store`, `tsconfig.tsbuildinfo`, `supabase/.temp/*` (référence de projet Supabase).

### 12.6 Base de données

Nouvelle migration `supabase/migrations/20240102000000_public_access_and_profiles.sql` :

1. colonnes `latitude` / `longitude` sur `public.salons` (idempotent) ;
2. trigger `handle_new_user` sur `auth.users` → création automatique du profil ;
3. policy `INSERT` manquante sur `public.users` ;
4. lecture publique des **salons publiés** ;
5. lecture publique des prestations / équipe / photos d'un salon publié ;
6. `INSERT` sur `appointments` pour les visiteurs, restreint aux salons publiés ;
7. index anti-double-réservation fourni en commentaire (à activer après nettoyage des doublons).

`supabase/schema.sql` est désormais **régénéré à partir des migrations** : plus de divergence entre les deux sources.

> **À faire côté Supabase :** appliquer la migration (`supabase db push`, ou copier `supabase/schema.sql` dans l'éditeur SQL). Sans elle, l'inscription et la marketplace restent bloquées.

### 12.7 Vérifications après correctifs

```
npm run typecheck   → 0 erreur
npm run lint        → 0 erreur, 142 avertissements (imports inutilisés, `any` Supabase)
npm run build       → ✓ 8 routes générées (/ ƒ /salon/[id])
npm run dev         → / 200 · /marketplace 200 · /login 200 · /register 200
                      /onboarding 200 · /client/rendez-vous 200 · /salon/xyz 404
```

### 12.8 Reste à faire (P1/P2, non traité ici)

- Remplacer les `throw new Error("Non disponible avec Supabase")` (avis, abonnements, invitations, comptes clients).
- Définir le mode démo : seed localStorage réaliste **ou** suppression assumée du fallback.
- Authentification client via Supabase Auth (aujourd'hui mots de passe en clair + `demo-password`).
- Tests automatisés (aucun), pagination, `next/image`, icônes PWA 192/512, SEO serveur réel.
- Migration `middleware.ts` → `proxy.ts` (dépréciation Next 16, simple avertissement).
