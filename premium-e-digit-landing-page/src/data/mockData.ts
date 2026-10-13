import {
  ServiceItem,
  CaseStudy,
  PricingPlan,
  Testimonial,
  FAQItem,
} from "../types";

export const SERVICES: ServiceItem[] = [
  {
    id: "digitalisation",
    title: "Digitalisation complète de votre activité",
    subtitle:
      "Tout centralisé dans une seule application web accessible partout",
    badge: "Service Principal",
    description:
      "Ventes, stocks, clients, employés, dépenses, marges — tout centralisé dans une seule application web accessible partout depuis votre téléphone.",
    features: [
      "Gestion des ventes et des encaissements en temps réel",
      "Suivi des stocks et alertes de réapprovisionnement",
      "Fichier clients centralisé avec historique complet",
      "Gestion des employés et de leurs accès",
    ],
    metrics: "Toutes vos données au même endroit, accessible 24/7",
    iconName: "LayoutGrid",
    cta: "Parler de mon projet",
  },
  {
    id: "dashboard",
    title: "Tableau de bord de pilotage temps réel",
    subtitle: "Pilotez votre activité comme les grandes entreprises",
    badge: "Indispensable",
    description:
      "Comme App_BOUL_CI : vous voyez votre chiffre d'affaires, vos marges, vos invendus et vos alertes en direct, depuis votre téléphone.",
    features: [
      "Chiffre d'affaires en temps réel, mis à jour en direct",
      "Marges par produit, par site et par période",
      "Alertes automatiques sur les seuils critiques",
      "Graphiques et courbes de tendances pour décider vite",
    ],
    metrics: "Prenez des décisions basées sur des données, pas sur l'instinct",
    iconName: "BarChart3",
    cta: "Parler de mon projet",
  },
  {
    id: "multisites",
    title: "Gestion multi-sites et multi-canaux",
    subtitle: "Plusieurs boutiques ? Une seule vue pour tout gérer",
    badge: "Pour les entreprises en croissance",
    description:
      "Plusieurs boutiques, plusieurs dépôts, plusieurs canaux de vente ? Une seule vue pour tout comparer, tout suivre, tout maîtriser.",
    features: [
      "Tableau de bord unifié pour tous vos sites",
      "Comparaison des performances entre sites",
      "Transferts de stock entre dépôts en 1 clic",
      "Rapprochement des ventes en boutique et en ligne",
    ],
    metrics: "Toutes vos activités, un seul endroit pour les gérer",
    iconName: "Globe",
    cta: "Parler de mon projet",
  },
  {
    id: "metier",
    title: "Application métier sur mesure",
    subtitle: "L'outil qui n'existe pas encore, mais dont vous avez besoin",
    badge: "Sur-Mesure",
    description:
      "Un besoin spécifique à votre secteur ? Je conçois l'outil qui correspond EXACTEMENT à votre façon de travailler. Pas de générique.",
    features: [
      "Conception 100% adaptée à vos processus",
      "Intégration avec vos outils existants",
      "Interface en français, simple à prendre en main",
      "Évolutif : l'outil grandit avec votre entreprise",
    ],
    metrics: "Votre métier est unique. Votre outil aussi.",
    iconName: "Wrench",
    cta: "Parler de mon projet",
  },
  {
    id: "reprise",
    title: "Reprise ou modernisation",
    subtitle: "Transformez votre Excel ou vieux logiciel en outil moderne",
    badge: "Réhabilitation",
    description:
      "Vous avez déjà un Excel ou un vieux logiciel qui vous limite ? Je le transforme en application web moderne, fiable et rapide.",
    features: [
      "Migration sécurisée de toutes vos données existantes",
      "Refonte de l'interface pour une utilisation simple",
      "Ajout des fonctionnalités qui vous manquaient",
      "Formation de vos équipes à la nouvelle version",
    ],
    metrics: "Ne partez pas de zéro : valorisez ce que vous avez déjà",
    iconName: "RefreshCw",
    cta: "Parler de mon projet",
  },
  {
    id: "accompagnement",
    title: "Accompagnement & formation",
    subtitle: "Je vous forme et je reste disponible. Vous n'êtes jamais seul.",
    badge: "Support complet",
    description:
      "Je forme vos équipes, je documente l'outil et je reste disponible après la mise en ligne. Votre succès est mon succès.",
    features: [
      "Formation sur site pour toute l'équipe",
      "Documentation détaillée en français simple",
      "Support technique réactif par WhatsApp/email",
      "Évolutions et mises à jour régulières",
    ],
    metrics: "Vous êtes accompagné du début à la fin, et après",
    iconName: "Users",
    cta: "Parler de mon projet",
  },
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "djasapay",
    title: "DjassaPay Côte d'Ivoire",
    sector: "FinTech & Paiements Marchands",
    location: "Abidjan (Marcory & Treichville)",
    client: "DjassaPay Technologies CI",
    accentColor: "#f97316",
    description:
      "Développement d'un portail web marchand unifié permettant à plus de 1 200 commerçants et PME ivoiriennes d'accepter Wave, Orange Money et MTN MoMo avec réconciliation comptable instantanée.",
    challenge:
      "Les commerçants perdaient un temps précieux à vérifier manuellement les SMS de paiement Mobile Money sur plusieurs téléphones différents, entraînant des fraudes et des erreurs de caisse quotidiennes.",
    solution:
      "Architecture d'une Web App PWA ultra-rapide connectée aux webhooks Wave et Orange Money avec génération de QR codes dynamiques et notification vocale en français et nouchi.",
    results: [
      { label: "Volume mensuel traité", value: "420M FCFA", change: "+310%" },
      { label: "Temps de validation", value: "1.4 sec", change: "-85%" },
      { label: "Erreurs de réconciliation", value: "0.02%", change: "-99%" },
    ],
    techStack: [
      "Next.js 15",
      "Node.js",
      "PostgreSQL",
      "Wave API",
      "Orange Money WebPay",
      "Tailwind CSS",
    ],
  },
  {
    id: "agrilink",
    title: "IvoireAgri Link",
    sector: "AgriTech & Négoce International",
    location: "San Pedro & Abidjan Plateau",
    client: "Union des Coopératives Agricoles CI",
    accentColor: "#10b981",
    description:
      "Plateforme B2B de traçabilité et de vente directe d'anacarde et de cacao reliant 42 coopératives de l'intérieur du pays aux exportateurs internationaux basés au Port de San Pedro et d'Abidjan.",
    challenge:
      "Absence de visibilité en temps réel sur les stocks disponibles en régions et lenteur des échanges contractuels entraînant des pénalités logistiques lourdes.",
    solution:
      "Application web offline-first avec synchronisation automatique lors des passages en zone 4G, génération de bordereaux certifiés par QR code et interface de vente aux enchères privées.",
    results: [
      { label: "Coopératives actives", value: "48+", change: "+140%" },
      {
        label: "Transactions sécurisées",
        value: "1.2 Md FCFA",
        change: "+220%",
      },
      { label: "Délai d'expédition", value: "-4 jours", change: "Optimisé" },
    ],
    techStack: [
      "React 19",
      "FastAPI Python",
      "PostGIS",
      "IndexedDB PWA",
      "Docker Cloud",
    ],
  },
  {
    id: "afrilogistix",
    title: "AfriLogistix Express",
    sector: "Supply Chain & Logistique",
    location: "Abidjan (Vridi, Yopougon, Cocody)",
    client: "AfriLogistix Group West Africa",
    accentColor: "#3b82f6",
    description:
      "Système centralisé de gestion de flotte de camions et livraisons de marchandises avec dispatching intelligent par algorithme et interface client de suivi en direct.",
    challenge:
      "Les réclamations clients saturaient le support téléphonique à cause du manque de visibilité sur l'avancée des livraisons dans les embouteillages d'Abidjan.",
    solution:
      "Application web pour les répartiteurs, portail client en marque blanche et application mobile web pour les chauffeurs avec géolocalisation optimisée consommant très peu de batterie et de data.",
    results: [
      { label: "Livraisons / jour", value: "3 800+", change: "+185%" },
      { label: "Appels au support", value: "-65%", change: "Drastique" },
      { label: "Satisfaction client", value: "4.9 / 5", change: "+28 pts" },
    ],
    techStack: [
      "Next.js",
      "NestJS",
      "Redis Queue",
      "Leaflet / Mapbox",
      "WhatsApp Cloud API",
    ],
  },
  {
    id: "ivoireclinic",
    title: "IvoireSanté Connect",
    sector: "Santé & E-Santé",
    location: "Abidjan (Cocody Ambassades & Deux Plateaux)",
    client: "Réseau Médical IvoireSanté",
    accentColor: "#06b6d4",
    description:
      "Portail web de prise de rendez-vous médicaux, téléconsultation sécurisée et carnet de santé numérique pour 14 cliniques privées d'Abidjan.",
    challenge:
      "Des temps d'attente excessifs en salle d'attente et des dossiers médicaux papier régulièrement égarés lors des transferts inter-cliniques.",
    solution:
      "Web app certifiée conforme aux normes de protection des données de santé (ARTCI), avec visioconférence WebRTC chiffrée de bout en bout et paiement préalable via Wave/MoMo.",
    results: [
      { label: "Patients actifs", value: "64 000+", change: "+410%" },
      { label: "Temps d'attente moyen", value: "12 min", change: "-72%" },
      { label: "No-show aux RDV", value: "3.4%", change: "-80%" },
    ],
    techStack: [
      "React",
      "WebRTC",
      "Supabase Postgres",
      "End-to-End Encryption",
      "Wave Direct",
    ],
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "mvp",
    name: "Pack MVP Rapide",
    tagline:
      "Pour startups & entrepreneurs prêts à lancer et valider leur concept",
    priceFCFA: 2450000,
    priceEUR: 3750,
    deliveryTime: "3 à 4 semaines",
    description:
      "Une application web robuste et élégante pour tester votre produit sur le marché ivoirien sans compromis sur la qualité d'ingénierie.",
    features: [
      "Architecture React 19 / Next.js moderne et responsive",
      "Authentification sécurisée (Email, Google, Téléphone)",
      "Intégration d'un système de paiement Mobile Money (Wave ou Orange)",
      "Tableau de bord administrateur sur-mesure pour piloter votre activité",
      "Optimisation SEO et temps de chargement éclair (<1.5s)",
      "Hébergement cloud configuré et nom de domaine sécurisé HTTPS",
      "Code source complet 100% cédé dès la livraison",
      "Garantie corrective et support réactif pendant 3 mois",
    ],
    idealFor: "Startups, créateurs de projets, lancements de nouveaux services",
    ctaText: "Lancer mon MVP",
  },
  {
    id: "scale",
    name: "Pack Pro Croissance",
    popular: true,
    tagline:
      "Le standard d'excellence pour PME et scale-ups ivoiriennes ambitieuses",
    priceFCFA: 5800000,
    priceEUR: 8850,
    deliveryTime: "6 à 8 semaines",
    description:
      "Une plateforme web complète, scalable et hautement sécurisée pour automatiser vos opérations et soutenir une croissance rapide.",
    features: [
      "Tout ce qui est inclus dans le pack MVP",
      "Multi-passerelles intégrées : Wave, Orange Money, MTN MoMo & Cartes Visa/Mastercard",
      "Rôles utilisateurs avancés (Super Admin, Manager, Agent, Client)",
      "Module de facturation conforme et exports automatiques (PDF, Excel)",
      "PWA installable sur smartphone avec mode hors-ligne partiel",
      "Intégration de notifications automatisées par WhatsApp Business & SMS",
      "Base de données haute performance avec sauvegardes automatiques quotidiennes",
      "Tests de charge jusqu'à 50 000 requêtes/minute sans ralentissement",
      "Garantie totale 6 mois & maintenance proactive dédiée",
    ],
    idealFor:
      "PME en expansion, plateformes e-commerce à fort trafic, entreprises B2B",
    ctaText: "Choisir le Pack Pro",
  },
  {
    id: "enterprise",
    name: "Pack Enterprise & Grand Compte",
    tagline:
      "Pour institutions financières, industriels et grandes entreprises",
    priceFCFA: 12500000,
    priceEUR: 19000,
    deliveryTime: "10 à 14 semaines",
    description:
      "Systèmes web critiques sur-mesure avec architecture microservices, haute disponibilité 99.99% et conformité réglementaire stricte.",
    features: [
      "Architecture cloud dédiée (AWS / Datacenter souverain local)",
      "Conformité réglementaire totale avec les directives ARTCI & BCEAO",
      "Audit de sécurité approfondi et tests d'intrusion (Pen-testing) par experts",
      "Intégration avec votre ERP existant (SAP, Sage, Odoo, Oracle)",
      "SLA contractuel de disponibilité à 99.99% avec astreinte technique 24/7",
      "Chiffrement militaire des données au repos et en transit",
      "Transfert complet de compétences et formation sur site à Abidjan",
      "Chef de projet senior dédié et comité de pilotage hebdomadaire",
    ],
    idealFor:
      "Banques, assurances, logistique portuaire, télécoms, institutions publiques",
    ctaText: "Planifier un échange stratégique",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Kouamé Jean-Marc",
    role: "Directeur Général & Fondateur",
    company: "DjassaPay Côte d'Ivoire",
    location: "Abidjan Marcory Zone 4",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&h=240&q=80",
    quote:
      "Avant E-DIGIT, notre application précédente plantait chaque fois que Wave mettait à jour ses webhooks. L'équipe d'E-DIGIT a reconstruit notre plateforme en 5 semaines. Aujourd'hui nous traitons plus de 400 millions de FCFA par mois sans le moindre accroc technique. C'est le meilleur investissement technologique que nous ayons fait.",
    projectType: "FinTech & Portails Marchands",
    impact: "+310% de volume de transactions",
    rating: 5,
  },
  {
    id: "2",
    name: "Amina Diop Coulibaly",
    role: "Directrice des Opérations",
    company: "IvoireAgri Coopératives",
    location: "Plateau & San Pedro",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&h=240&q=80",
    quote:
      "La compréhension des contraintes ivoiriennes par E-DIGIT a fait toute la différence. Leur solution PWA fonctionne même quand la 4G coupe dans les plantations autour de Divo et San Pedro. Dès que nos agents retrouvent le réseau, tout se synchronise automatiquement. Des professionnels hors pair.",
    projectType: "Web App Métier B2B & PWA",
    impact: "1.2 Milliard FCFA sécurisés",
    rating: 5,
  },
  {
    id: "3",
    name: "Dr. Patrick N'Goran",
    role: "Directeur Médical Associé",
    company: "Clinique Internationale de Cocody",
    location: "Cocody Danga",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&h=240&q=80",
    quote:
      "Nous cherchions une agence capable de respecter le secret médical ivoirien tout en offrant une interface aussi simple que WhatsApp pour nos patients. E-DIGIT a livré une application web d'une fluidité bluffante. Nos patients adorent payer leur consultation directement par Wave.",
    projectType: "Plateforme E-Santé & Téléconsultation",
    impact: "-72% de temps d'attente",
    rating: 5,
  },
  {
    id: "4",
    name: "Mireille Touré",
    role: "Chief Technology Officer (CTO)",
    company: "Boutik Privée Abidjan",
    location: "Abidjan Deux Plateaux Vallon",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&h=240&q=80",
    quote:
      "Le niveau d'exigence technique d'E-DIGIT est digne des meilleures boîtes de la Silicon Valley, mais avec la réactivité et la convivialité ivoirienne. Réunion de suivi chaque lundi matin, code propre et testé sur GitHub, livraison 4 jours avant la date limite !",
    projectType: "E-Commerce Haute Concurrence",
    impact: "< 0.9s de temps de chargement",
    rating: 5,
  },
];

export const FAQS: FAQItem[] = [
  {
    category: "Général",
    question:
      "Combien coûte la construction d'une application web sur-mesure en Côte d'Ivoire ?",
    answer:
      "Chez E-DIGIT, nous croyons à la transparence totale. Une application MVP prête pour le marché démarre à 2 450 000 FCFA (3 750 €). Pour une plateforme complète avec paiements multiples (Wave, Orange, MTN), gestion multi-rôles et tableaux de bord avancés, le budget se situe généralement entre 4 500 000 et 8 500 000 FCFA. Les projets d'envergure bancaire ou institutionnelle sont chiffrés sur cahier des charges. Vous pouvez utiliser notre calculateur interactif plus haut pour obtenir une estimation instantanée.",
  },
  {
    category: "Technique & Mobile Money",
    question:
      "Prenez-vous en charge l'intégration complète de Wave, Orange Money et MTN MoMo ?",
    answer:
      "Absolument. C'est l'une de nos spécialités majeures. Nous ne nous contentons pas de coller un bouton : nous implémentons des webhooks sécurisés, la gestion automatique des échecs réseau, la validation instantanée par QR code ou notification push, et un module de réconciliation financière automatisé pour que votre service comptable n'ait aucune erreur de rapprochement de caisse.",
  },
  {
    category: "Finances & Délais",
    question:
      "Quelles sont les modalités de paiement pour démarrer un projet ?",
    answer:
      "Nos conditions sont pensées pour instaurer une confiance mutuelle : 40% d'acompte au démarrage des travaux et validation du design UI/UX, 30% lors de la livraison de la version de recette (bêta fonctionnelle démontrée), et les 30% restants uniquement après mise en ligne officielle et validation complète du procès-verbal de livraison. Paiement possible par virement bancaire local (BICI-CI, SGCI, NSIA, Ecobank) ou contrat d'entreprise.",
  },
  {
    category: "Propriété & Sécurité",
    question:
      "Le code source de l'application m'appartient-il à 100% après la livraison ?",
    answer:
      "Oui, à 100%. Contrairement à certaines agences qui enferment leurs clients dans des abonnements captifs, chez E-DIGIT, vous êtes l'unique propriétaire exclusif de l'intégralité du code source (dépôt GitHub/GitLab transféré à votre nom), de la base de données, des maquettes Figma et de tous les accès serveurs. Vous êtes totalement libre.",
  },
  {
    category: "Général",
    question:
      "Pouvons-nous vous rencontrer en personne à Abidjan pour discuter de notre projet ?",
    answer:
      "Avec grand plaisir ! Nos bureaux sont situés à Abidjan (Cocody / Plateau). Nous pouvons organiser une session de cadrage stratégique en présentiel autour d'un café, ou une visio Google Meet / Teams si vous êtes en déplacement ou basé dans la diaspora.",
  },
  {
    category: "Technique & Mobile Money",
    question:
      "L'application web sera-t-elle rapide pour les utilisateurs disposant d'une connexion mobile faible ?",
    answer:
      "C'est notre obsession quotidienne. Le marché ivoirien compte plus de 85% d'utilisateurs mobiles naviguant sur réseaux 3G/4G parfois instables. Nous appliquons des techniques de pointe : compression d'images Next-Gen (WebP/AVIF), mise en cache Edge Cloudflare au plus près d'Abidjan, code-splitting et architecture PWA pour garantir un affichage en moins de 1.5 seconde même avec 2 barres de réseau.",
  },
  {
    category: "Propriété & Sécurité",
    question:
      "Vos applications respectent-elles les réglementations de l'ARTCI sur les données personnelles ?",
    answer:
      "Oui. Toutes nos solutions sont conçues dans le respect strict des dispositions de la loi ivoirienne n° 2013-450 relative à la protection des données à caractère personnel encadrée par l'ARTCI (chiffrement SSL/TLS, consentement cookies, sécurisation des mots de passe avec sel cryptographique, hébergement conforme).",
  },
  {
    category: "Finances & Délais",
    question: "Quel est le délai moyen de livraison d'une application web ?",
    answer:
      "Pour un MVP ou une première version opérationnelle, comptez entre 3 et 5 semaines grâce à notre méthodologie agile par sprints de 7 jours. Pour une plateforme complexe d'envergure, le délai oscille entre 6 et 10 semaines avec des démonstrations hebdomadaires pour tester chaque module au fil de l'eau.",
  },
];

export const STATS = [
  {
    value: "+65",
    label: "Applications web déployées",
    subtext: "En Côte d'Ivoire & sous-région UEMOA",
  },
  {
    value: "4.2 Md",
    label: "FCFA de flux financiers sécurisés",
    subtext: "Traités via nos solutions Mobile Money",
  },
  {
    value: "< 1.1s",
    label: "Temps de chargement moyen",
    subtext: "Optimisé pour la 4G ivoirienne",
  },
  {
    value: "99.98%",
    label: "Disponibilité garantie (SLA)",
    subtext: "Hébergement cloud haute résilience",
  },
  {
    value: "100%",
    label: "Code propriétaire cédé",
    subtext: "Zéro dépendance, liberté totale",
  },
];

export const TECH_STACK = [
  {
    category: "Frontend Web & PWA",
    items: [
      "React 19",
      "Next.js 15",
      "TypeScript",
      "Tailwind CSS",
      "Vite",
      "Workbox PWA",
    ],
  },
  {
    category: "Backend & APIs",
    items: [
      "Node.js",
      "NestJS",
      "Python FastAPI",
      "Go",
      "GraphQL",
      "RESTful API",
    ],
  },
  {
    category: "Bases de Données & Cache",
    items: ["PostgreSQL", "Supabase", "Redis", "MongoDB", "PostGIS"],
  },
  {
    category: "FinTech & Paiements CI",
    items: [
      "Wave Business API",
      "Orange Money WebPay",
      "MTN MoMo API",
      "Djamo Connect",
      "CinetPay",
      "Bizao",
    ],
  },
  {
    category: "Cloud & Infrastructure",
    items: [
      "AWS Cape Town / Europe",
      "Cloudflare Edge CDN",
      "Docker",
      "Kubernetes",
      "GitHub CI/CD",
    ],
  },
];
