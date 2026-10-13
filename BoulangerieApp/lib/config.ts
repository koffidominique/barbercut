import { NavItem } from "./types";

export const siteConfig = {
  name: "Boulangerie CI",
  title: "Boulangerie CI - Gestion de boulangerie en Côte d’Ivoire",
  description:
    "Logiciel de gestion de boulangerie pour suivre les ventes, le stock, les paiements et la comptabilité en Côte d’Ivoire.",
  nav: [
    { label: "Solution", href: "/#features", target: "_self" },
    { label: "Fonctionnalités", href: "/#features", target: "_self" },
    { label: "Tarifs", href: "/#pricing", target: "_self" },
    { label: "Connexion client", href: "/auth/login", target: "_self" },
  ] as NavItem[],
  links: {
    github: "#",
    twitter: "#",
  },
};
