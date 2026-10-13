export type Currency = "FCFA" | "EUR";

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  features: string[];
  metrics: string;
  iconName: string;
  technologies?: string[];
  cta: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  sector: string;
  location: string;
  client: string;
  description: string;
  challenge: string;
  solution: string;
  results: {
    label: string;
    value: string;
    change: string;
  }[];
  techStack: string[];
  mockupImage?: string;
  accentColor: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  popular?: boolean;
  priceFCFA: number;
  priceEUR: number;
  deliveryTime: string;
  description: string;
  features: string[];
  idealFor: string;
  ctaText: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  avatar: string;
  quote: string;
  projectType: string;
  impact: string;
  rating: number;
}

export interface FAQItem {
  question: string;
  answer: string;
  category:
    | "Général"
    | "Finances & Délais"
    | "Technique & Mobile Money"
    | "Propriété & Sécurité";
}

export interface EstimatorOptions {
  projectType: "saas" | "ecommerce" | "erp" | "pwa" | "custom";
  features: string[];
  timeline: "urgent" | "standard" | "flexible";
  paymentIntegration: boolean;
  maintenanceMonths: number;
}
