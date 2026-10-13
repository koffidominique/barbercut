import { PricingPlan, FeatureItem } from "./types";

// UI MOCK DATA
// DISCLAIMER: This data is for display purposes only.
// Replace with real database responses in your production app.

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 45000,
    description:
      "Pour les petites boulangeries qui veulent organiser leurs ventes et leur stock.",
    features: [
      "Suivi des stocks",
      "Caisse journalière",
      "Rapports simples",
      "Support par email",
    ],
    buttonText: "Choisir Starter",
  },
  {
    id: "pro",
    name: "Pro Boulangerie",
    price: 95000,
    description:
      "Pour les boulangeries qui veulent gérer production, caisse et comptabilité en un seul outil.",
    features: [
      "Gestion complète des produits",
      "Suivi des dettes clients",
      "Marge et comptabilité",
      "Support prioritaire",
    ],
    isPopular: true,
    buttonText: "Activer Pro",
  },
  {
    id: "enterprise",
    name: "Entreprise",
    price: 180000,
    description:
      "Pour plusieurs points de vente et équipes commerciales en croissance.",
    features: [
      "Multi-magasin",
      "Permissions multi-utilisateurs",
      "Audit et exports",
      "Suivi avancé",
    ],
    buttonText: "Demander un devis",
  },
];

export const FEATURES_LIST: FeatureItem[] = [
  {
    id: "tracking",
    title: "Suivi des ventes",
    description:
      "Visualisez les performances du jour, du mois et du point de vente en temps réel.",
    icon: "LineChart",
  },
  {
    id: "stock",
    title: "Gestion du stock",
    description:
      "Suivez farine, levure, beurre, sucre et ingrédients critiques avant rupture.",
    icon: "PackageCheck",
  },
  {
    id: "payments",
    title: "Caisse & comptabilité",
    description:
      "Contrôlez le cash, le mobile money, les ventes crédit et les marges de production.",
    icon: "Wallet",
  },
];
