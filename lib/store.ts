"use client";

import { useState, useEffect } from "react";

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

export type StaffRole = "admin" | "coiffeur" | "receptionniste";

export interface StaffPermissions {
  canEditPrices: boolean;
  canViewReports: boolean;
  canManageClients: boolean;
  canManageStaff: boolean;
  canPublishVitrine: boolean;
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

const STORAGE_KEYS = {
  SALONS: "barbercuts_salons_v1",
  APPOINTMENTS: "barbercuts_appointments_v1",
  CLIENTS: "barbercuts_clients_v1",
  REVIEWS: "barbercuts_reviews_v1",
  CLIENT_ACCOUNTS: "barbercuts_client_accounts_v1",
  ACTIVE_SALON_ID: "barbercuts_active_salon_id_v1",
  CLIENT_SESSION: "barbercuts_client_session_v1",
  SUBSCRIPTIONS: "barbercuts_subscriptions_v1",
  TEAM_INVITATIONS: "barbercuts_team_invitations_v1",
  OFFLINE_QUEUE: "barbercuts_offline_queue_v1",
};

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

export function getStoredOfflineQueue(): OfflineAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredOfflineQueue(queue: OfflineAction[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    window.dispatchEvent(new Event("barbercuts_storage_update"));
  } catch (e) {
    console.error("Error saving offline queue", e);
  }
}

export function getStoredSubscriptions(): Record<string, SalonSubscription> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveStoredSubscriptions(
  data: Record<string, SalonSubscription>,
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(data));
    window.dispatchEvent(new Event("barbercuts_storage_update"));
  } catch (e) {
    console.error("Error saving subscriptions", e);
  }
}

export function getStoredTeamInvitations(): TeamInvitation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAM_INVITATIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredTeamInvitations(invitations: TeamInvitation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEYS.TEAM_INVITATIONS,
      JSON.stringify(invitations),
    );
    window.dispatchEvent(new Event("barbercuts_storage_update"));
  } catch (e) {
    console.error("Error saving team invitations", e);
  }
}

export function getStoredClientAccounts(): ClientAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENT_ACCOUNTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredClientAccounts(accounts: ClientAccount[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEYS.CLIENT_ACCOUNTS,
      JSON.stringify(accounts),
    );
    window.dispatchEvent(new Event("barbercuts_storage_update"));
  } catch (e) {
    console.error("Error saving client accounts", e);
  }
}

export function getClientSession(): ClientAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENT_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveClientSession(account: ClientAccount | null) {
  if (typeof window === "undefined") return;
  try {
    if (account) {
      localStorage.setItem(
        STORAGE_KEYS.CLIENT_SESSION,
        JSON.stringify(account),
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.CLIENT_SESSION);
    }
    window.dispatchEvent(new Event("barbercuts_storage_update"));
  } catch (e) {
    console.error("Error saving client session", e);
  }
}

export const EMPTY_SALON: Salon = {
  id: "barber-cuts-cocody",
  name: "Mon Salon Barber Cuts",
  tagline: "Salon de coiffure & barbier de référence",
  description: "Bienvenue sur l'espace de gestion de votre salon.",
  city: "Abidjan",
  neighborhood: "Cocody",
  address: "Rue des Jardins, Cocody",
  phone: "+225 07 00 00 00 00",
  whatsapp: "+225 07 00 00 00 00",
  rating: 4.9,
  reviewsCount: 12,
  isPublished: true,
  coverImage: "/images/barber_marine_salon_1793627544764.jpg",
  openingHours: "Mar - Dim: 08:30 - 20:30",
  features: ["Climatisation", "Wifi gratuit", "Paiement Mobile Money"],
  gallery: [],
  services: [
    {
      id: "srv-default-1",
      name: "Coupe Signature & Dégradé",
      category: "Hommes",
      price: 5000,
      duration: 35,
      description: "Coupe aux ciseaux et tondeuse avec traçage net.",
      isPopular: true,
    },
  ],
  staff: [
    {
      id: "staff-default-1",
      name: "Dominique K.",
      role: "Barbier Master",
      initials: "DK",
      color: "bg-[#202321]",
      specialty: "Dégradé & Barbe",
      status: "active",
      schedule: "Mar - Dim (08:30 - 19:30)",
    },
  ],
};

const DEFAULT_CLIENTS: SalonClient[] = [];
const DEFAULT_SALONS: Salon[] = [EMPTY_SALON];
const DEFAULT_APPOINTMENTS: Appointment[] = [];

export function getStoredSalons(): Salon[] {
  if (typeof window === "undefined") return DEFAULT_SALONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SALONS, JSON.stringify(DEFAULT_SALONS));
      return DEFAULT_SALONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SALONS;
  }
}

export function saveStoredSalons(salons: Salon[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SALONS, JSON.stringify(salons));
    window.dispatchEvent(new Event("barbercuts_storage_update"));
  } catch (e) {
    console.error("Error saving salons", e);
  }
}

export function getStoredAppointments(): Appointment[] {
  if (typeof window === "undefined") return DEFAULT_APPOINTMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (!raw) {
      localStorage.setItem(
        STORAGE_KEYS.APPOINTMENTS,
        JSON.stringify(DEFAULT_APPOINTMENTS),
      );
      return DEFAULT_APPOINTMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_APPOINTMENTS;
  }
}

export function saveStoredAppointments(appointments: Appointment[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEYS.APPOINTMENTS,
      JSON.stringify(appointments),
    );
    window.dispatchEvent(new Event("barbercuts_storage_update"));
  } catch (e) {
    console.error("Error saving appointments", e);
  }
}

export function getStoredClients(): SalonClient[] {
  if (typeof window === "undefined") return DEFAULT_CLIENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!raw) {
      localStorage.setItem(
        STORAGE_KEYS.CLIENTS,
        JSON.stringify(DEFAULT_CLIENTS),
      );
      return DEFAULT_CLIENTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CLIENTS;
  }
}

export function saveStoredClients(clients: SalonClient[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    window.dispatchEvent(new Event("barbercuts_storage_update"));
  } catch (e) {
    console.error("Error saving clients", e);
  }
}

export function getStoredReviews(): SalonReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredReviews(reviews: SalonReview[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    window.dispatchEvent(new Event("barbercuts_storage_update"));
  } catch (e) {
    console.error("Error saving reviews", e);
  }
}

import { useSupabaseSalonStore } from "./supabase-store";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const IS_SUPABASE_CONFIGURED = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("your-"),
);

export function useSalonStore() {
  // Si Supabase est configuré, déléguer au store cloud
  if (IS_SUPABASE_CONFIGURED) {
    return useSupabaseSalonStore();
  }

  const [salons, setSalons] = useState<Salon[]>(DEFAULT_SALONS);
  const [appointments, setAppointments] =
    useState<Appointment[]>(DEFAULT_APPOINTMENTS);
  const [clients, setClients] = useState<SalonClient[]>(DEFAULT_CLIENTS);
  const [reviews, setReviews] = useState<SalonReview[]>([]);
  const [clientAccounts, setClientAccounts] = useState<ClientAccount[]>([]);
  const [clientAccount, setClientAccount] = useState<ClientAccount | null>(
    null,
  );
  const [subscriptions, setSubscriptions] = useState<
    Record<string, SalonSubscription>
  >({});
  const [teamInvitations, setTeamInvitations] = useState<TeamInvitation[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [activeSalonId, setActiveSalonId] =
    useState<string>("barber-cuts-cocody");
  const [isLoaded, setIsLoaded] = useState(false);

  const reloadData = () => {
    const s = getStoredSalons();
    const a = getStoredAppointments();
    const c = getStoredClients();
    const r = getStoredReviews();
    const ca = getStoredClientAccounts();
    const sub = getStoredSubscriptions();
    const oq = getStoredOfflineQueue();
    setSalons(s);
    setAppointments(a);
    setClients(c);
    setReviews(r);
    setClientAccounts(ca);
    setSubscriptions(sub);
    setOfflineQueue(oq);
    const inv = getStoredTeamInvitations();
    setSalons(s);
    setAppointments(a);
    setClients(c);
    setReviews(r);
    setClientAccounts(ca);
    setSubscriptions(sub);
    setTeamInvitations(inv);
    // Restaurer la session client si existante
    const session = getClientSession();
    if (session) setClientAccount(session);
    setIsLoaded(true);
  };

  useEffect(() => {
    reloadData();
    const handleStorage = () => reloadData();
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("barbercuts_storage_update", handleStorage);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("barbercuts_storage_update", handleStorage);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Synchroniser la file d'attente hors-ligne quand la connexion revient
  const syncOfflineQueue = async () => {
    const queue = getStoredOfflineQueue();
    if (queue.length === 0) return;
    const remaining: OfflineAction[] = [];
    for (const action of queue) {
      try {
        switch (action.type) {
          case "book_appointment":
            bookAppointment(action.payload);
            break;
          case "update_status":
            updateAppointmentStatus(action.payload.id, action.payload.status);
            break;
          case "update_payment":
            updateAppointmentPayment(
              action.payload.id,
              action.payload.paymentStatus,
              action.payload.paymentMethod,
            );
            break;
          case "save_client":
            saveClient(action.payload);
            break;
          case "save_review":
            saveReview(action.payload);
            break;
        }
      } catch {
        remaining.push(action);
      }
    }
    setOfflineQueue(remaining);
    saveStoredOfflineQueue(remaining);
  };

  const currentSalon =
    salons.find((s) => s.id === activeSalonId) || salons[0] || EMPTY_SALON;

  // Update active salon
  const updateSalon = (updated: Salon) => {
    const next = salons.map((s) => (s.id === updated.id ? updated : s));
    setSalons(next);
    saveStoredSalons(next);
  };

  // Create an appointment (e.g. from marketplace booking or ERP)
  const bookAppointment = (data: Omit<Appointment, "id" | "createdAt">) => {
    const newAppointment: Appointment = {
      ...data,
      id: "apt-" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const nextApts = [newAppointment, ...appointments];
    setAppointments(nextApts);
    saveStoredAppointments(nextApts);

    // Check if client exists, otherwise create new client automatically
    const existingIndex = clients.findIndex(
      (c) =>
        c.phone === data.clientPhone ||
        c.name.toLowerCase() === data.clientName.toLowerCase(),
    );
    let nextClients = [...clients];
    if (existingIndex >= 0) {
      const existing = nextClients[existingIndex];
      nextClients[existingIndex] = {
        ...existing,
        totalVisits: existing.totalVisits + 1,
        totalSpent: existing.totalSpent + data.servicePrice,
        lastVisit: data.date,
        nextAppointment: `${data.date} à ${data.time}`,
        status: existing.totalVisits >= 5 ? "VIP" : "Régulier",
      };
    } else {
      const newClient: SalonClient = {
        id: "cli-" + Date.now(),
        name: data.clientName,
        phone: data.clientPhone,
        favoriteService: data.serviceName,
        preferredStaff: data.staffName,
        totalVisits: 1,
        totalSpent: data.servicePrice,
        lastVisit: data.date,
        nextAppointment: `${data.date} à ${data.time}`,
        status: "Nouveau",
        source: data.source,
        notes: data.notes,
      };
      nextClients = [newClient, ...nextClients];
    }
    setClients(nextClients);
    saveStoredClients(nextClients);

    return newAppointment;
  };

  // Update appointment status
  const updateAppointmentStatus = (
    id: string,
    status: Appointment["status"],
  ) => {
    const next = appointments.map((apt) =>
      apt.id === id ? { ...apt, status } : apt,
    );
    setAppointments(next);
    saveStoredAppointments(next);
  };

  // Delete appointment
  const deleteAppointment = (id: string) => {
    const next = appointments.filter((apt) => apt.id !== id);
    setAppointments(next);
    saveStoredAppointments(next);
  };

  // Update appointment payment status
  const updateAppointmentPayment = (
    id: string,
    paymentStatus: Appointment["paymentStatus"],
    paymentMethod?: Appointment["paymentMethod"],
  ) => {
    const next = appointments.map((apt) =>
      apt.id === id
        ? {
            ...apt,
            paymentStatus,
            paymentMethod,
            updatedAt: new Date().toISOString(),
          }
        : apt,
    );
    setAppointments(next);
    saveStoredAppointments(next);
  };

  // Add / Edit Client
  const saveClient = (client: SalonClient) => {
    const exists = clients.some((c) => c.id === client.id);
    const next = exists
      ? clients.map((c) => (c.id === client.id ? client : c))
      : [client, ...clients];
    setClients(next);
    saveStoredClients(next);
  };

  // Delete Client
  const deleteClient = (id: string) => {
    const next = clients.filter((c) => c.id !== id);
    setClients(next);
    saveStoredClients(next);
  };

  // Add / Edit Review
  const saveReview = (review: Omit<SalonReview, "id" | "createdAt">) => {
    const newReview: SalonReview = {
      ...review,
      id: "rev-" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const next = [...reviews, newReview];
    setReviews(next);
    saveStoredReviews(next);

    // Mettre à jour la note moyenne et le nombre d'avis du salon
    const salonReviews = next.filter((r) => r.salonId === review.salonId);
    const avgRating =
      salonReviews.reduce((sum, r) => sum + r.rating, 0) / salonReviews.length;
    const targetSalon = salons.find((s) => s.id === review.salonId);
    if (targetSalon) {
      updateSalon({
        ...targetSalon,
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: salonReviews.length,
      });
    }
  };

  // ── Comptes clients ──

  // Enregistrer un nouveau client
  const registerClient = (data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
  }) => {
    const existing = clientAccounts.find(
      (a) => a.phone === data.phone || a.email === data.email,
    );
    if (existing) {
      throw new Error("Un compte existe déjà avec ce téléphone ou cet email.");
    }
    const newAccount: ClientAccount = {
      id: "client-" + Date.now(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      password: data.password, // En production, jamais en clair
      totalVisits: 0,
      totalSpent: 0,
      status: "Nouveau",
      source: "marketplace",
      createdAt: new Date().toISOString(),
    };
    const next = [...clientAccounts, newAccount];
    setClientAccounts(next);
    saveStoredClientAccounts(next);
    setClientAccount(newAccount);
    saveClientSession(newAccount);
    return newAccount;
  };

  // Connecter un client existant
  const loginClient = (phoneOrEmail: string, password: string) => {
    const account = clientAccounts.find(
      (a) =>
        (a.phone === phoneOrEmail || a.email === phoneOrEmail) &&
        a.password === password,
    );
    if (!account) {
      throw new Error("Identifiants incorrects.");
    }
    setClientAccount(account);
    saveClientSession(account);
    return account;
  };

  // Déconnecter le client
  const logoutClient = () => {
    setClientAccount(null);
    saveClientSession(null);
  };

  // ── Abonnements ──
  const getSubscription = (salonId: string): SalonSubscription | null => {
    return subscriptions[salonId] || null;
  };

  const setSubscription = (salonId: string, sub: SalonSubscription) => {
    const next = { ...subscriptions, [salonId]: sub };
    setSubscriptions(next);
    saveStoredSubscriptions(next);
  };

  const upgradeToPro = (
    salonId: string,
    paymentMethod: "wave" | "orange_money" | "card",
  ) => {
    const now = new Date();
    const nextPayment = new Date(now);
    nextPayment.setMonth(nextPayment.getMonth() + 1);

    const sub: SalonSubscription = {
      plan: "pro",
      status: "active",
      priceFcfa: 35000,
      paymentMethod,
      billingCycleStart: now.toISOString(),
      billingCycleEnd: nextPayment.toISOString(),
      lastPaymentAt: now.toISOString(),
      nextPaymentAt: nextPayment.toISOString(),
    };
    setSubscription(salonId, sub);

    // Mettre à jour le salon avec l'abonnement
    const targetSalon = salons.find((s) => s.id === salonId);
    if (targetSalon) {
      updateSalon({ ...targetSalon, subscription: sub });
    }
    return sub;
  };

  const startFreeTrial = (salonId: string) => {
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14);

    const sub: SalonSubscription = {
      plan: "pro",
      status: "trial",
      priceFcfa: 35000,
      trialEndsAt: trialEnd.toISOString(),
      billingCycleStart: now.toISOString(),
      billingCycleEnd: trialEnd.toISOString(),
    };
    setSubscription(salonId, sub);

    const targetSalon = salons.find((s) => s.id === salonId);
    if (targetSalon) {
      updateSalon({ ...targetSalon, subscription: sub });
    }
    return sub;
  };

  const cancelSubscription = (salonId: string) => {
    const sub = subscriptions[salonId];
    if (!sub) return;
    const next: SalonSubscription = { ...sub, status: "cancelled" };
    setSubscription(salonId, next);
    return next;
  };

  // ── Invitations d'équipe ──
  const inviteTeamMember = (data: {
    salonId: string;
    email: string;
    role: StaffRole;
    invitedBy: string;
  }) => {
    const existing = teamInvitations.find(
      (inv) =>
        inv.salonId === data.salonId &&
        inv.email === data.email &&
        inv.status === "pending",
    );
    if (existing) {
      throw new Error("Une invitation en attente existe déjà pour cet email.");
    }

    const invitation: TeamInvitation = {
      id: "inv-" + Date.now(),
      salonId: data.salonId,
      email: data.email,
      role: data.role,
      status: "pending",
      invitedBy: data.invitedBy,
      invitedAt: new Date().toISOString(),
    };
    const next = [...teamInvitations, invitation];
    setTeamInvitations(next);
    saveStoredTeamInvitations(next);
    return invitation;
  };

  const respondToInvitation = (
    invitationId: string,
    response: "accepted" | "declined",
  ) => {
    const next = teamInvitations.map((inv) =>
      inv.id === invitationId
        ? { ...inv, status: response, respondedAt: new Date().toISOString() }
        : inv,
    );
    setTeamInvitations(next);
    saveStoredTeamInvitations(next);

    // Si accepté, ajouter le collaborateur au staff du salon
    if (response === "accepted") {
      const inv = teamInvitations.find((i) => i.id === invitationId);
      if (inv) {
        const targetSalon = salons.find((s) => s.id === inv.salonId);
        if (targetSalon) {
          const roleMap: Record<StaffRole, string> = {
            admin: "Gérant / Admin",
            coiffeur: "Coiffeur / Barbier",
            receptionniste: "Réceptionniste",
          };
          const permissionMap: Record<StaffRole, StaffPermissions> = {
            admin: {
              canEditPrices: true,
              canViewReports: true,
              canManageClients: true,
              canManageStaff: true,
              canPublishVitrine: true,
            },
            coiffeur: {
              canEditPrices: false,
              canViewReports: false,
              canManageClients: true,
              canManageStaff: false,
              canPublishVitrine: false,
            },
            receptionniste: {
              canEditPrices: false,
              canViewReports: false,
              canManageClients: true,
              canManageStaff: false,
              canPublishVitrine: false,
            },
          };
          const newStaff: StaffMember = {
            id: "staff-" + Date.now(),
            name: inv.email.split("@")[0], // Nom temporaire basé sur l'email
            role: roleMap[inv.role],
            initials: inv.email.split("@")[0].slice(0, 2).toUpperCase(),
            color: "bg-[#586b83]",
            specialty: "",
            phone: "",
            status: "active",
            schedule: "Mar - Dim (08:30 - 18:30)",
          };
          const exists = targetSalon.staff.some((s) => s.id === newStaff.id);
          if (!exists) {
            updateSalon({
              ...targetSalon,
              staff: [...targetSalon.staff, newStaff],
            });
          }
        }
      }
    }
  };

  // Add / Edit Staff member in current salon
  const saveStaffMember = (staff: StaffMember) => {
    const exists = currentSalon.staff.some((s) => s.id === staff.id);
    const nextStaff = exists
      ? currentSalon.staff.map((s) => (s.id === staff.id ? staff : s))
      : [...currentSalon.staff, staff];
    updateSalon({
      ...currentSalon,
      staff: nextStaff,
    });
  };

  // Delete staff member
  const deleteStaffMember = (id: string) => {
    const nextStaff = currentSalon.staff.filter((s) => s.id !== id);
    updateSalon({
      ...currentSalon,
      staff: nextStaff,
    });
  };

  // Reset to default sample data
  const resetDefaults = () => {
    saveStoredSalons(DEFAULT_SALONS);
    saveStoredAppointments(DEFAULT_APPOINTMENTS);
    saveStoredClients(DEFAULT_CLIENTS);
    setSalons(DEFAULT_SALONS);
    setAppointments(DEFAULT_APPOINTMENTS);
    setClients(DEFAULT_CLIENTS);
  };

  // Create a new salon (localStorage fallback)
  const createSalon = async (
    ownerId: string,
    data: Partial<Salon>,
  ): Promise<Salon | null> => {
    const newSalon: Salon = {
      id: "salon-" + Date.now(),
      name: data.name || "Mon Salon Barber Cuts",
      tagline: data.tagline || "",
      description: data.description || "",
      city: data.city || "Abidjan",
      neighborhood: data.neighborhood || "",
      address: data.address || "",
      phone: data.phone || "",
      whatsapp: data.whatsapp || "",
      rating: 0,
      reviewsCount: 0,
      isPublished: false,
      coverImage: data.coverImage || "/images/placeholder-logo.png",
      openingHours: data.openingHours || "Mar - Dim: 08:30 - 20:30",
      rccm: data.rccm,
      currency: "FCFA",
      smsRemindersEnabled: true,
      whatsappConfirmationEnabled: true,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined,
      features: [],
      gallery: [],
      // Utiliser les services fournis dans data ou le service par défaut si aucun n'est fourni
      services:
        data.services && data.services.length > 0
          ? data.services.map((s, i) => ({
              id: `srv-${Date.now()}-${i}`,
              name: s.name,
              category: "Hommes" as const, // Catégorie par défaut
              price: Number(s.price) || 0,
              duration: Number(s.duration) || 45,
              description: "",
            }))
          : [
              {
                id: "srv-" + Date.now(),
                name: "Coupe signature & Dégradé américain",
                category: "Hommes",
                price: 8000,
                duration: 45,
                description:
                  "Shampoing purifiant, dégradé aux ciseaux et tondeuse, traçage net au rasoir et coiffage.",
                isPopular: true,
              },
            ],
      staff: [],
    };

    const next = [newSalon, ...salons];
    setSalons(next);
    saveStoredSalons(next);
    setActiveSalonId(newSalon.id);
    localStorage.setItem("barbercuts_active_salon_id_v1", newSalon.id);
    return newSalon;
  };

  return {
    salons,
    currentSalon,
    activeSalonId,
    setActiveSalonId,
    appointments,
    clients,
    clientAccounts,
    clientAccount,
    subscriptions,
    teamInvitations,
    offlineQueue,
    isOnline,
    reviews,
    isLoaded,
    updateSalon,
    createSalon,
    bookAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    updateAppointmentPayment,
    saveClient,
    deleteClient,
    saveReview,
    registerClient,
    loginClient,
    logoutClient,
    getSubscription,
    setSubscription,
    upgradeToPro,
    startFreeTrial,
    cancelSubscription,
    inviteTeamMember,
    respondToInvitation,
    syncOfflineQueue,
    saveStaffMember,
    deleteStaffMember,
    resetDefaults,
  };
}
