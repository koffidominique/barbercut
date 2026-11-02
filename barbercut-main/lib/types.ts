/**
 * Types partagés de l'application Barber Cuts.
 * Séparés du store pour éviter qu'un import de type ne tire tout le code
 * client (React + localStorage) dans les fichiers qui n'en ont pas besoin.
 */

export interface ShowcasePhoto {
  id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
  isCover?: boolean;
}

export interface SalonService {
  id: string;
  name: string;
  category: "Hommes" | "Dames" | "Soins & Barbe" | "Enfants";
  price: number; // in FCFA
  duration: number; // in minutes
  description: string;
  isPopular?: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  specialty?: string;
  phone?: string;
  rating?: number;
  reviewsCount?: number;
  appointmentsCount?: number;
  status?: "active" | "leave";
  schedule?: string;
}

export interface SalonClient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  favoriteService: string;
  preferredStaff: string;
  totalVisits: number;
  totalSpent: number; // in FCFA
  lastVisit: string;
  nextAppointment?: string;
  status: "VIP" | "Régulier" | "Nouveau";
  source: "marketplace" | "direct";
  notes?: string;
}

export interface SalonSubscription {
  plan: "gratuit" | "pro";
  status: "active" | "trial" | "expired" | "cancelled";
  trialEndsAt?: string; // ISO date
  billingCycleStart?: string;
  billingCycleEnd?: string;
  priceFcfa: number; // 0 gratuit / 35000 pro
  paymentMethod?: "cash" | "wave" | "orange_money" | "card";
  lastPaymentAt?: string;
  nextPaymentAt?: string;
}

export interface Salon {
  id: string;
  name: string;
  tagline: string;
  description: string;
  city: string;
  neighborhood: string;
  address: string;
  phone: string;
  whatsapp: string;
  rating: number;
  reviewsCount: number;
  isPublished: boolean;
  coverImage: string;
  gallery: ShowcasePhoto[];
  features: string[];
  services: SalonService[];
  staff: StaffMember[];
  openingHours: string;
  rccm?: string;
  currency?: string;
  smsRemindersEnabled?: boolean;
  whatsappConfirmationEnabled?: boolean;
  latitude?: number;
  longitude?: number;
  subscription?: SalonSubscription;
  logo?: string;
}

/** Valeur brute acceptée pour une coordonnée GPS (formulaire, base, code). */
export type CoordinateInput = number | string | null | undefined;

/**
 * Normalise une coordonnée venant d'un formulaire ou de la base.
 * Retourne `undefined` si la valeur est vide ou non numérique.
 */
export function toCoordinate(value: CoordinateInput): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  const parsed =
    typeof value === "number" ? value : Number(value.trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Brouillon de salon accepté par `createSalon`.
 * Les formulaires manipulent des champs texte : on autorise donc des
 * coordonnées en `string` et des prestations partielles.
 */
export type SalonDraft = Omit<
  Partial<Salon>,
  "latitude" | "longitude" | "services" | "staff" | "gallery"
> & {
  latitude?: CoordinateInput;
  longitude?: CoordinateInput;
  services?: Array<
    Partial<Omit<SalonService, "price" | "duration">> & {
      name: string;
      /** Les formulaires saisissent des chaînes : normalisées à l'enregistrement. */
      price?: number | string;
      duration?: number | string;
    }
  >;
};

export type StaffRole = "admin" | "coiffeur" | "receptionniste";

export interface StaffPermissions {
  canEditPrices: boolean;
  canViewReports: boolean;
  canManageClients: boolean;
  canManageStaff: boolean;
  canPublishVitrine: boolean;
}

export interface TeamInvitation {
  id: string;
  salonId: string;
  email: string;
  role: StaffRole;
  status: "pending" | "accepted" | "declined";
  invitedBy: string;
  invitedAt: string;
  respondedAt?: string;
}

export interface SalonReview {
  id: string;
  salonId: string;
  clientName: string;
  clientPhone?: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  createdAt: string;
  source: "marketplace" | "direct";
}

export interface Appointment {
  id: string;
  salonId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  staffName: string;
  date: string; // e.g. "2026-11-02"
  time: string; // e.g. "14:30"
  status: "confirmed" | "pending" | "completed" | "cancelled";
  source: "marketplace" | "direct";
  notes?: string;
  createdAt: string;
  paymentStatus?: "unpaid" | "partial" | "paid";
  paymentMethod?: "cash" | "wave" | "orange_money" | "card";
}

export interface ClientAccount {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string; // En production, jamais en clair
  totalVisits: number;
  totalSpent: number;
  status: "VIP" | "Régulier" | "Nouveau";
  source: "marketplace" | "direct";
  createdAt: string;
}

export interface OfflineAction {
  id: string;
  type:
    | "book_appointment"
    | "update_status"
    | "update_payment"
    | "save_client"
    | "save_review";
  payload: any;
  timestamp: string;
  salonId: string;
}

/**
 * Salon neutre renvoyé quand aucun salon n'est encore chargé.
 * Évite les `undefined` pendant le rendu serveur et les états vides.
 */
export const EMPTY_SALON: Salon = {
  id: "",
  name: "Barber Cuts",
  tagline: "",
  description: "",
  city: "",
  neighborhood: "",
  address: "",
  phone: "",
  whatsapp: "",
  rating: 0,
  reviewsCount: 0,
  isPublished: false,
  coverImage: "",
  openingHours: "",
  features: [],
  gallery: [],
  services: [],
  staff: [],
};
