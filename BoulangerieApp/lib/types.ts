// Shared Type Definitions

export interface NavItem {
    label: string;
    href: string;
    target?: "_blank" | "_self";
}

export interface SocialLink {
    platform: string;
    href: string;
}

export interface PricingPlan {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
    isPopular?: boolean;
    buttonText: string;
}

export interface FeatureItem {
    id: string;
    title: string;
    description: string;
    icon: string;
}
