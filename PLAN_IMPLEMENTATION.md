# 🗺️ Plan d'Implémentation — Barber Cuts

**Version :** 1.0  
**Date :** 02 novembre 2026  
**Branche :** `arena/74a4924c-barbercut`  
**Statut :** Boussole d'implementation — document de référence pour toutes les itérations à venir

---

## 1. Contexte & État des lieux

Barber Cuts est une application hybride **ERP de salon + Marketplace publique** pour salons de coiffure/barbier en Côte d'Ivoire.

### ✅ Ce qui existe déjà (v0.1.0)

| Domaine | Statut |
|---|---|
| Next.js 16 + React 19 + Tailwind 4 | ✅ Opérationnel |
| 3 routes (/, /onboarding, /marketplace) | ✅ Build OK |
| Store Zustand-like + localStorage | ✅ Fonctionnel |
| 2 salons de démo (Cocody, Marcory) | ✅ Données pré-remplies |
| 8 onglets ERP (RDV, Clients, Prestations, Équipe, Vitrine, Rapports, Paramètres) | ✅ UI complète |
| Marketplace publique avec réservation | ✅ UI complète |
| Graphique D3 du CA hebdomadaire | ✅ Interactif |
| Persistance offline (localStorage) | ✅ |

### ❌ Ce qui manque (gaps critiques)

| Domaine | Statut | Impact |
|---|---|---|
| Authentification & comptes | ❌ Absent | N'importe qui accède à l'ERP |
| Backend / Base de données | ❌ Absent | Données uniquement en localStorage |
| Multi-utilisateur / Multi-salon | ❌ Absent | Pas d'isolation des données |
| Notifications temps réel | ❌ Absent | Pas d'alertes RDV nouveaux |
| Paiements en ligne | ❌ Absent | Paiement "sur place" uniquement |
| Tests automatisés | ❌ Absent | Aucune couverture |
| TypeScript strict au build | ⚠️ Désactivé | `ignoreBuildErrors: true` |
| Déploiement / CI-CD | ❌ Absent | Build local uniquement |

---

## 2. Vision & Objectifs

### Vision à 6 mois
Barber Cuts devient une plateforme SaaS multi-salons avec authentification, base de données cloud, notifications en temps réel et paiements intégrés, déployée en production pour des salons réels en Côte d'Ivoire.

### Principes directeurs
1. **Mobile-first** : les gérants et clients utilisent principalement leurs téléphones.
2. **Localisé** : FCFA, +225, quartiers d'Abidjan, Wave/Orange Money, français.
3. **Progressif** : chaque phase apporte de la valeur indépendante, déployable seule.
4. **Données sûres** : pas de régression sur les fonctionnalités existantes.

---

## 3. Feuille de route par phases

### PHASE 1 — Fondation & Stabilisation (Semaines 1-3)
**Objectif :** Mettre le projet sur des bases solides (types, base de données, auth) sans casser l'existant.

#### 1.1 Rigueur TypeScript
- [ ] Passer `typescript.ignoreBuildErrors` à `false` dans `next.config.mjs`
- [ ] Exécuter `tsc --noEmit` et corriger toutes les erreurs de type
- [ ] Ajouter un script `lint` dans `package.json` (`next lint`)
- [ ] Créer un fichier `types/global.d.ts` pour les types globaux si nécessaire

#### 1.2 Base de données (Supabase — déjà connecté dans cette conversation)
- [ ] Initialiser le projet Supabase (URL + clé anon)
- [ ] Créer les tables : `salons`, `appointments`, `clients`, `staff_members`, `services`, `showcase_photos`, `users`
- [ ] Activer Row Level Security (RLS) avec politiques d'isolation par `salon_id`
- [ ] Remplacer progressivement les appels `localStorage` par des appels Supabase (hooks ou server actions)
- [ ] Garder un mode offline localStorage en fallback (graceful degradation)

#### 1.3 Authentification
- [ ] Intégrer Supabase Auth (email/mot de passe + magic link WhatsApp optionnel)
- [ ] Pages : `/login`, `/register`, `/forgot-password`
- [ ] Middleware de protection des routes ERP (`/dashboard/*`)
- [ ] Association `user_id → salon_id` (un utilisateur = un salon géré)
- [ ] Déconnexion et gestion de session

#### 1.4 Critères d'acceptation Phase 1
- `npm run build` passe sans erreur TypeScript
- Un utilisateur peut se créer un compte, se connecter, et accéder à son ERP
- Les données créées dans l'ERP persistent dans Supabase (sur recharge de page, elles sont là)
- Deux utilisateurs différents ne voient pas les données de l'autre (RLS)

---

### PHASE 2 — ERP Renforcé (Semaines 4-6)
**Objectif :** Enrichir le cœur de gestion salon avec des fonctionnalités métier avancées.

#### 2.1 Calendrier & Planning visuel
- [ ] Remplacer la liste linéaire des RDV par une vue calendrier (semaine/jour)
- [ ] Drag & drop pour déplacer un RDV (modification d'heure/date)
- [ ] Vue par collaborateur (planning individuel de chaque barbier/coiffeur)
- [ ] Indicateurs de disponibilité (créneaux libres/occupés par staff)

#### 2.2 Notifications & Rappels
- [x] Notification in-app : nouveau RDV marketplace (toast + cloche)
- [ ] Rappel SMS 2h avant le RDV (intégration API SMS — Orange/SNS ou similaire)
- [ ] Confirmation WhatsApp automatique à la création d'un RDV
- [ ] Paramètres ON/OFF déjà existants dans `ERPSettingsView` — les brancher réellement

#### 2.3 Gestion financière & Paiements
- [x] Suivi des paiements (statut : payé / en attente / partiel) par RDV
- [x] Moyen de paiement : Espèces, Wave, Orange Money, Carte
- [ ] Journal de caisse quotidien (entrées/sorties)
- [x] Export des rapports en CSV/PDF (bouton "Exporter" génère un vrai fichier CSV)

#### 2.4 Clients & Fidélité
- [ ] Historique complet des visites par client (liste des RDV passés)
- [ ] Programme fidélité : X visites = une prestation offerte (configurable)
- [ ] Segmentation client automatique (VIP / Régulier / Nouveau — déjà dans le modèle)

#### 2.5 Critères d'acceptation Phase 2
- [ ] Un gérant peut voir son planning en calendrier et déplacer un RDV
- [x] Un nouveau RDV marketplace déclenche une notification in-app (toast)
- [x] Un RDV peut être marqué "payé" avec un moyen de paiement
- [x] L'export CSV génère un fichier téléchargeable

---

### 🎨 Améliorations UIX & Animations (immédiat)

L'interface utilisateur a été enrichie avec Framer Motion pour une expérience plus fluide et moderne :

- **Variantes d'animation** (`components/ui/motion.ts`) : `fadeInUp`, `fadeIn`, `scaleHover`, `lift3D`, `borderLift`, `buttonHover`, `cardHover`, `staggerContainer`, `staggerItem`, `modalOverlay`, `modalContent`
- **Bouton animé** (`components/ui/button.tsx`) : scale au survol, ombre prononcée au tap, transition fluide
- **Listes en stagger** : `ERPAppointmentsView`, `ERPClientsView`, `ERPServicesView`, `ERPTeamView`, `VitrineManager` — chaque élément apparaît avec un décalage progressif
- **Cartes en élévation 3D** : survol soulève la carte (`y: -6` à `-8`), ombre portée renforcée, bordure colorée
- **États vides animés** : `fadeInUp` pour les écrans "Aucun résultat"

#### 2.6 Critères d'acceptation UIX
- [x] Tous les boutons ont une animation de scale au survol
- [x] Les listes se dévoilent avec un effet de stagger progressif
- [x] Les cartes se soulèvent en 3D au survol avec ombre prononcée
- [x] Le build de production passe sans erreur
- [x] TypeScript strict : 0 erreur

---

### PHASE 3 — Marketplace & Expérience Client (Semaines 7-9)
**Objectif :** Développer la face publique pour attirer et convertir des clients.

#### 3.1 Découverte & Recherche
- [ ] Barre de recherche globale (nom salon, prestation, quartier)
- [ ] Filtres avancés : prix, note, disponibilité jour/heure, catégorie
- [ ] Tri : mieux noté, moins cher, plus proche, nouveautés
- [ ] Carte interactive (intégration Leaflet ou Google Maps avec les salons d'Abidjan)

#### 3.2 Fiche salon publique enrichie
- [ ] Page dédiée `/salon/[id]` avec SEO (meta tags dynamiques)
- [ ] Avis & notes clients (système de notation 1-5 étoiles + commentaire)
- [ ] Galerie photo en plein écran avec navigation (lightbox déjà existante — l'améliorer)
- <|open|>argument key="text" type="string"<|sep|>Bouton "Réserver" conduisant au BookingModal (déjà existant)

#### 3.3 Réservation client simplifiée
- [ ] Flow de réservation en 3 étapes (salon → prestation/créneau → confirmation)
- [ ] Création de compte client optionnelle (réservation en tant qu'invité possible)
- [ ] Email/SMS de confirmation de réservation
- [ ] Page "Mes rendez-vous" côté client (historique et annulation)

#### 3.4 Vitrine salon (côté gérant)
- [ ] Planification de publication (programmer une photo pour une date future)
- [ ] Statistiques de la vitrine : vues, clics, réservations générées
- <|open|>argument key="text" type="string"<|sep|>Bouton "Partager sur WhatsApp/Facebook" pour chaque annonce

#### 3.5 Critères d'acceptation Phase 3
- Un client peut chercher un salon, filtrer, et réserver en < 2 minutes
- Un salon publie une photo et voit ses statistiques de vitrine se mettre à jour
- Les avis clients s'affichent sur la fiche publique du salon
- Le SEO de base fonctionne (titres et descriptions uniques par salon)

---

### PHASE 4 — Multi-salons, Équipe & Analytics (Semaines 10-12)
**Objectif :** Passer d'un salon unique à une plateforme multi-salons avec analytics avancés.

#### 4.1 Multi-salons & Invitation d'équipe
- [ ] Un utilisateur peut gérer plusieurs salons (switch de salon dans la sidebar)
- [ ] Invitation de collaborateurs par email (rôle : admin, coiffeur, réceptionniste)
- [ ] Permissions granulaires (qui peut modifier les prix, qui peut voir les rapports)
- [ ] Planning des collaborateurs avec congés et jours de repos

#### 4.2 Analytics avancés
- [ ] Tableau de bord analytique : CA par jour/semaine/mois, prévisions
- <|open|>argument key="text" type="string"<|sep|>Comparatif période N vs période N-1
- [ ] Top prestations les plus rentables
- [ ] Taux de no-show (RDV non honorés) par collaborateur
- [ ] Churn client (clients qui ne reviennent pas)

#### 4.3 Abonnement & Facturation
- [ ] Plans d'abonnement : Gratuit / Pro (35 000 FCFA/mois — déjà dans l'UI)
- [ ] Intégration paiement mobile (Wave/Orange Money API)
- [ ] Facturation automatique et historique des factures
- [ ] Gestion des essais gratuits (14 jours)

#### 4.4 Critères d'acceptation Phase 4
- Un gérant peut inviter un coiffeur avec des permissions limitées
- Le dashboard affiche des graphiques comparatifs CA N vs N-1
- Un abonnement Pro peut être souscrit et payé via mobile money
- Deux salons différents ont des données complètement isolées

---

### PHASE 5 — Mobile, Performance & Production (Semaines 13-16)
**Objectif :** Déploiement production, PWA, optimisations.

#### 5.1 Progressive Web App (PWA)
- [ ] `next-pwa` ou configuration manuelle : service worker, manifest
- [ ] Installation sur écran d'accueil (iOS/Android)
- [ ] Fonctionnement offline partiel (derniers RDV consultés)
- [ ] Notifications push (via Supabase Realtime ou Firebase)

#### 5.2 Performance
- [ ] Optimisation des images (Next.js Image, formats WebP/AVIF)
- [ ] Chargement paresseux des composants lourds (D3 chart, modales)
- [ ] Bundle analysis et réduction de la taille JS
- [ ] Core Web Vitals : LCP < 2.5s, CLS < 0.1

#### 5.3 Déploiement & CI/CD
- [ ] Pipeline GitHub Actions : lint → type-check → build → deploy
- [ ] Déploiement sur Vercel ou Docker (standalone output déjà configuré)
- [ ] Variables d'environnement de production (Supabase, clés API)
- [ ] Monitoring d'erreurs (Sentry ou similaire)
- [ ] Sauvegardes automatisées de la base Supabase

#### 5.4 Critères d'acceptation Phase 5
- L'app s'installe comme une application mobile native
- Le build production passe en < 3 minutes sur CI
- L'application est accessible via une URL publique avec HTTPS
- Les erreurs sont capturées et alertent l'équipe

---

## 4. Matrice de priorisation (RICE simplifiée)

| Fonctionnalité | Reach | Impact | Confiance | Effort | Priorité |
|---|---|---|---|---|---|
| Authentification + Supabase | 5 | 5 | 5 | 3 | P0 (Phase 1) |
| TypeScript strict | 5 | 4 | 5 | 1 | P0 (Phase 1) |
| Calendrier drag & drop | 4 | 4 | 4 | 3 | P1 (Phase 2) |
| Notifications SMS/WhatsApp | 4 | 4 | 3 | 3 | P1 (Phase 2) |
| Export CSV/PDF | 3 | 3 | 5 | 1 | P1 (Phase 2) |
| Carte des salons | 3 | 3 | 4 | 3 | P2 (Phase 3) |
| Avis clients | 4 | 4 | 4 | 3 | P2 (Phase 3) |
| Multi-salons | 3 | 5 | 3 | 5 | P2 (Phase 4) |
| Paiements en ligne | 4 | 5 | 3 | 5 | P2 (Phase 4) |
| PWA / Push notifications | 3 | 3 | 3 | 4 | P3 (Phase 5) |

---

## 5. Planning indicatif (16 semaines)

```
Semaine  1-3  : Phase 1 — Fondation (Types, Supabase, Auth)
Semaine  4-6  : Phase 2 — ERP renforcé (Calendrier, Notifications, Paiements sur place)
Semaine  7-9  : Phase 3 — Marketplace (Recherche, Fiche salon, Réservation client)
Semaine 10-12 : Phase 4 — Multi-salons, Analytics, Abonnements
Semaine 13-16 : Phase 5 — PWA, Performance, CI/CD, Production
```

**Total estimé : 4 mois** pour une version production prête à accueillir des salons réels.

---

## 6. Risques & Mitigation

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Supabase RLS mal configuré → fuite de données | Moyenne | Critique | Tester avec deux comptes différents avant chaque release |
| API SMS/WhatsApp coûteuse ou indisponible CI | Basse | Moyen | Garder une file d'attente en local + fallback email |
| Perf dégradée avec beaucoup de RDV | Moyenne | Moyen | Pagination + indexation Supabase sur `date` et `salon_id` |
| Perte de données lors migration localStorage → Supabase | Basse | Critique | Script de migration avec dry-run, backup avant migration |
| Adoption faible par les gérants de salon | Moyenne | Moyen | Onboarding amélioré, tutoriel intégré, support WhatsApp |

---

## 7. Checklist de livraison par phase

Avant de considérer une phase comme terminée, valider :

- [ ] `npm run build` passe sans erreur
- [ ] `tsc --noEmit` passe (Phase 1+)
- [ ] Tests manuels sur les fonctionnalités de la phase
- [ ] Pas de régression sur les fonctionnalités des phases précédentes
- [ ] Documentation mise à jour (README, commentaires code)
- [ ] Commit sur la branche `arena/74a4924c-barbercut`

---

## 8. Prochaines actions immédiates (Semaine 1)

1. Passer `ignoreBuildErrors: false` et corriger les erreurs TypeScript
2. Créer le projet Supabase et connecter les variables d'environnement
3. Migrer le premier modèle (`Appointment`) du localStorage vers Supabase
4. Ajouter les pages de login/register et protéger les routes ERP

---

**Ce document est la référence unique.** Toute nouvelle fonctionnalité doit être ajoutée ici avec sa phase, ses critères d'acceptation et son estimation avant d'être codée.
