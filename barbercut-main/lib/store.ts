"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Appointment,
  ClientAccount,
  OfflineAction,
  Salon,
  SalonClient,
  SalonDraft,
  SalonReview,
  SalonService,
  SalonSubscription,
  StaffMember,
  StaffPermissions,
  StaffRole,
  TeamInvitation,
} from "@/lib/types";
import { EMPTY_SALON, toCoordinate } from "@/lib/types";
import {
  appointmentsStorage,
  clientAccountsStorage,
  clientsStorage,
  getClientSession,
  offlineQueueStorage,
  reviewsStorage,
  saveClientSession,
  saveStoredActiveSalonId,
  salonsStorage,
  subscriptionsStorage,
  teamInvitationsStorage,
} from "@/lib/storage";
import { isSlotAvailable } from "./slot-logic";
import { useSupabaseSalonStore } from "./supabase-store";

// Ré-exports pour compatibilité : les modules existants importent les types via `@/lib/store`.
export type {
  Appointment,
  ShowcasePhoto,
  SalonService,
  StaffMember,
  SalonClient,
  Salon,
  CoordinateInput,
  SalonDraft,
  StaffRole,
  StaffPermissions,
  SalonSubscription,
  TeamInvitation,
  SalonReview,
  ClientAccount,
  OfflineAction,
} from "@/lib/types";
export { EMPTY_SALON, toCoordinate } from "@/lib/types";

/** Identifiant du salon actif par défaut (mode local). */
const DEFAULT_ACTIVE_SALON_ID = "barber-cuts-cocody";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const IS_SUPABASE_CONFIGURED = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("your-"),
);

/** Rôles d'équipe → intitulés affichés dans le staff du salon. */
export const ROLE_LABELS: Record<StaffRole, string> = {
  admin: "Gérant / Admin",
  coiffeur: "Coiffeur / Barbier",
  receptionniste: "Réceptionniste",
};

/** Droits associés à chaque rôle d'équipe. */
export const ROLE_PERMISSIONS: Record<StaffRole, StaffPermissions> = {
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

/** Prix de l'abonnement Pro (FCFA / mois). */
export const PRO_PRICE_FCFA = 35000;
/** Durée de l'essai gratuit (jours). */
export const TRIAL_DAYS = 14;

/**
 * Store principal de l'application.
 * Supabase si les variables d'environnement sont fournies, sinon localStorage
 * (mode dégradé hors-ligne). L'aiguillage est fait au niveau du module — et non
 * dans le corps d'un hook — afin de respecter les règles des Hooks React.
 */
export const useSalonStore = IS_SUPABASE_CONFIGURED
  ? useSupabaseSalonStore
  : useLocalSalonStore;

/**
 * Implémentation localStorage du store (mode hors-ligne / sans Supabase).
 * Non exportée directement : seul `useSalonStore` doit être consommé.
 */
function useLocalSalonStore() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<SalonClient[]>([]);
  const [reviews, setReviews] = useState<SalonReview[]>([]);
  const [clientAccounts, setClientAccounts] = useState<ClientAccount[]>([]);
  const [clientAccount, setClientAccount] = useState<ClientAccount | null>(null);
  const [subscriptions, setSubscriptions] = useState<
    Record<string, SalonSubscription>
  >({});
  const [teamInvitations, setTeamInvitations] = useState<TeamInvitation[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [activeSalonId, setActiveSalonId] =
    useState<string>(DEFAULT_ACTIVE_SALON_ID);
  const [isLoaded, setIsLoaded] = useState(false);

  /** Relit toutes les collections depuis le localStorage. */
  const reloadData = useCallback(() => {
    setSalons(salonsStorage.load());
    setAppointments(appointmentsStorage.load());
    setClients(clientsStorage.load());
    setReviews(reviewsStorage.load());
    setClientAccounts(clientAccountsStorage.load());
    setSubscriptions(subscriptionsStorage.load());
    setTeamInvitations(teamInvitationsStorage.load());
    setOfflineQueue(offlineQueueStorage.load());
    // Restaurer la session client si existante
    const session = getClientSession<ClientAccount>();
    if (session) setClientAccount(session);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadData]);

  const currentSalon =
    salons.find((s) => s.id === activeSalonId) || salons[0] || EMPTY_SALON;

  /* ── Salons ──────────────────────────────────────────────────────── */

  const updateSalon = (updated: Salon) => {
    setSalons((prev) => {
      const next = prev.map((s) => (s.id === updated.id ? updated : s));
      salonsStorage.save(next);
      return next;
    });
  };

  /** Construit un salon complet à partir d'un brouillon de formulaire. */
  const buildSalonFromDraft = (data: SalonDraft): Salon => {
    const services: SalonService[] =
      data.services && data.services.length > 0
        ? data.services.map((s, i) => ({
            id: `srv-${Date.now()}-${i}`,
            name: s.name,
            category: (s.category ?? "Hommes") as SalonService["category"],
            price: Number(s.price) || 0,
            duration: Number(s.duration) || 45,
            description: s.description ?? "",
            isPopular: s.isPopular,
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
          ];

    return {
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
      latitude: toCoordinate(data.latitude),
      longitude: toCoordinate(data.longitude),
      features: [],
      gallery: [],
      services,
      staff: [],
    };
  };

  // Créer un nouveau salon (fallback localStorage)
  const createSalon = async (
    ownerId: string,
    data: SalonDraft,
  ): Promise<Salon | null> => {
    // `ownerId` n'est pas utilisé en mode localStorage (pas de multi-comptes)
    void ownerId;
    const newSalon = buildSalonFromDraft(data);
    setSalons((prev) => {
      const next = [newSalon, ...prev];
      salonsStorage.save(next);
      return next;
    });
    setActiveSalonId(newSalon.id);
    saveStoredActiveSalonId(newSalon.id);
    return newSalon;
  };

  /* ── Rendez-vous ─────────────────────────────────────────────────── */

  /** Met à jour (ou crée) la fiche client associée à un rendez-vous réservé. */
  const upsertClientFromAppointment = (
    data: Omit<Appointment, "id" | "createdAt">,
  ) => {
    setClients((prev) => {
      const existingIndex = prev.findIndex(
        (c) =>
          c.phone === data.clientPhone ||
          c.name.toLowerCase() === data.clientName.toLowerCase(),
      );
      if (existingIndex >= 0) {
        const next = [...prev];
        const existing = next[existingIndex];
        next[existingIndex] = {
          ...existing,
          totalVisits: existing.totalVisits + 1,
          totalSpent: existing.totalSpent + data.servicePrice,
          lastVisit: data.date,
          nextAppointment: `${data.date} à ${data.time}`,
          status: existing.totalVisits >= 5 ? "VIP" : "Régulier",
        };
        clientsStorage.save(next);
        return next;
      }
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
      const next = [newClient, ...prev];
      clientsStorage.save(next);
      return next;
    });
  };

  // Prendre un rendez-vous (marketplace ou ERP)
  const bookAppointment = (data: Omit<Appointment, "id" | "createdAt">) => {
    // Garde anti double réservation (miroir client de la contrainte RLS SQL) :
    // un créneau [time, time+durée) qui chevauche un RDV actif du même barbier
    // est refusé. Les salons sans staff nommé (files d'attente) sont exemptés.
    if (data.staffName) {
      const salonForCheck = salons.find((salon) => salon.id === data.salonId);
      if (
        salonForCheck &&
        !isSlotAvailable(
          appointments,
          salonForCheck,
          data.staffName,
          data.date,
          data.time,
          salonForCheck.services.find(
            (service) => service.id === data.serviceId || service.name === data.serviceName,
          )?.duration ?? 0,
        )
      ) {
        throw new Error(
          "Ce créneau vient d'être réservé par un autre client. Merci d'en choisir un autre.",
        );
      }
    }
    const newAppointment: Appointment = {
      ...data,
      id: "apt-" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setAppointments((prev) => {
      const next = [newAppointment, ...prev];
      appointmentsStorage.save(next);
      return next;
    });
    // Créer automatiquement la fiche client si inconnue
    upsertClientFromAppointment(data);
    return newAppointment;
  };

  const updateAppointmentStatus = (
    id: string,
    status: Appointment["status"],
  ) => {
    setAppointments((prev) => {
      const next = prev.map((apt) =>
        apt.id === id ? { ...apt, status } : apt,
      );
      appointmentsStorage.save(next);
      return next;
    });
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => {
      const next = prev.filter((apt) => apt.id !== id);
      appointmentsStorage.save(next);
      return next;
    });
  };

  const updateAppointmentPayment = (
    id: string,
    paymentStatus: Appointment["paymentStatus"],
    paymentMethod?: Appointment["paymentMethod"],
  ) => {
    setAppointments((prev) => {
      const next = prev.map((apt) =>
        apt.id === id
          ? {
              ...apt,
              paymentStatus,
              paymentMethod,
              updatedAt: new Date().toISOString(),
            }
          : apt,
      );
      appointmentsStorage.save(next);
      return next;
    });
  };

  /* ── Clients ─────────────────────────────────────────────────────── */

  const saveClient = (client: SalonClient) => {
    setClients((prev) => {
      const exists = prev.some((c) => c.id === client.id);
      const next = exists
        ? prev.map((c) => (c.id === client.id ? client : c))
        : [client, ...prev];
      clientsStorage.save(next);
      return next;
    });
  };

  const deleteClient = (id: string) => {
    setClients((prev) => {
      const next = prev.filter((c) => c.id !== id);
      clientsStorage.save(next);
      return next;
    });
  };

  /* ── Avis clients ────────────────────────────────────────────────── */

  const saveReview = (review: Omit<SalonReview, "id" | "createdAt">) => {
    const newReview: SalonReview = {
      ...review,
      id: "rev-" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => {
      const next = [...prev, newReview];
      reviewsStorage.save(next);
      // Recalculer la note moyenne et le nombre d'avis du salon
      const salonReviews = next.filter((r) => r.salonId === review.salonId);
      const avgRating =
        salonReviews.reduce((sum, r) => sum + r.rating, 0) /
        salonReviews.length;
      setSalons((prevSalons) => {
        const targetSalon = prevSalons.find((s) => s.id === review.salonId);
        if (!targetSalon) return prevSalons;
        const updatedSalons = prevSalons.map((s) =>
          s.id === review.salonId
            ? {
                ...s,
                rating: Math.round(avgRating * 10) / 10,
                reviewsCount: salonReviews.length,
              }
            : s,
        );
        salonsStorage.save(updatedSalons);
        return updatedSalons;
      });
      return next;
    });
  };

  /* ── Comptes clients ─────────────────────────────────────────────── */

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
    setClientAccounts((prev) => {
      const next = [...prev, newAccount];
      clientAccountsStorage.save(next);
      return next;
    });
    setClientAccount(newAccount);
    saveClientSession(newAccount);
    return newAccount;
  };

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

  const logoutClient = () => {
    setClientAccount(null);
    saveClientSession<ClientAccount>(null);
  };

  /* ── Abonnements ─────────────────────────────────────────────────── */

  const setSubscription = (salonId: string, sub: SalonSubscription) => {
    setSubscriptions((prev) => {
      const next = { ...prev, [salonId]: sub };
      subscriptionsStorage.save(next);
      return next;
    });
  };

  const getSubscription = (salonId: string): SalonSubscription | null =>
    subscriptions[salonId] || null;

  /** Attache l'abonnement au salon correspondant, s'il existe. */
  const attachSubscriptionToSalon = (
    salonId: string,
    sub: SalonSubscription,
  ) => {
    const targetSalon = salons.find((s) => s.id === salonId);
    if (targetSalon) updateSalon({ ...targetSalon, subscription: sub });
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
      priceFcfa: PRO_PRICE_FCFA,
      paymentMethod,
      billingCycleStart: now.toISOString(),
      billingCycleEnd: nextPayment.toISOString(),
      lastPaymentAt: now.toISOString(),
      nextPaymentAt: nextPayment.toISOString(),
    };
    setSubscription(salonId, sub);
    attachSubscriptionToSalon(salonId, sub);
    return sub;
  };

  const startFreeTrial = (salonId: string) => {
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

    const sub: SalonSubscription = {
      plan: "pro",
      status: "trial",
      priceFcfa: PRO_PRICE_FCFA,
      trialEndsAt: trialEnd.toISOString(),
      billingCycleStart: now.toISOString(),
      billingCycleEnd: trialEnd.toISOString(),
    };
    setSubscription(salonId, sub);
    attachSubscriptionToSalon(salonId, sub);
    return sub;
  };

  const cancelSubscription = (salonId: string) => {
    const sub = subscriptions[salonId];
    if (!sub) return;
    const next: SalonSubscription = { ...sub, status: "cancelled" };
    setSubscription(salonId, next);
    return next;
  };

  /* ── Invitations d'équipe ────────────────────────────────────────── */

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
    setTeamInvitations((prev) => {
      const next = [...prev, invitation];
      teamInvitationsStorage.save(next);
      return next;
    });
    return invitation;
  };

  /** Construit une fiche staff à partir d'une invitation acceptée. */
  const staffFromInvitation = (invitation: TeamInvitation): StaffMember => {
    const handle = invitation.email.split("@")[0];
    return {
      id: "staff-" + Date.now(),
      name: handle, // Nom temporaire basé sur l'email
      role: ROLE_LABELS[invitation.role],
      initials: handle.slice(0, 2).toUpperCase(),
      color: "bg-[#586b83]",
      specialty: "",
      phone: "",
      status: "active",
      schedule: "Mar - Dim (08:30 - 18:30)",
    };
  };

  const respondToInvitation = (
    invitationId: string,
    response: "accepted" | "declined",
  ) => {
    setTeamInvitations((prev) => {
      const next = prev.map((inv) =>
        inv.id === invitationId
          ? { ...inv, status: response, respondedAt: new Date().toISOString() }
          : inv,
      );
      teamInvitationsStorage.save(next);
      return next;
    });

    // Si accepté, ajouter le collaborateur au staff du salon
    if (response === "accepted") {
      const inv = teamInvitations.find((i) => i.id === invitationId);
      if (!inv) return;
      const targetSalon = salons.find((s) => s.id === inv.salonId);
      if (!targetSalon) return;
      const newStaff = staffFromInvitation(inv);
      if (!targetSalon.staff.some((s) => s.id === newStaff.id)) {
        updateSalon({
          ...targetSalon,
          staff: [...targetSalon.staff, newStaff],
        });
      }
    }
  };

  /* ── Staff du salon courant ──────────────────────────────────────── */

  const updateCurrentSalonStaff = (
    transform: (staff: StaffMember[]) => StaffMember[],
  ) => {
    if (!currentSalon.id) return;
    updateSalon({ ...currentSalon, staff: transform(currentSalon.staff) });
  };

  const saveStaffMember = (staff: StaffMember) => {
    updateCurrentSalonStaff((prev) =>
      prev.some((s) => s.id === staff.id)
        ? prev.map((s) => (s.id === staff.id ? staff : s))
        : [...prev, staff],
    );
  };

  const deleteStaffMember = (id: string) => {
    updateCurrentSalonStaff((prev) => prev.filter((s) => s.id !== id));
  };

  /* ── File d'attente hors-ligne ───────────────────────────────────── */

  /** Rejoue les actions mises en attente pendant une coupure réseau. */
  const syncOfflineQueue = () => {
    const queue = offlineQueueStorage.load();
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
    offlineQueueStorage.save(remaining);
  };

  /* ── Réinitialisation ────────────────────────────────────────────── */

  const resetDefaults = () => {
    salonsStorage.save([]);
    appointmentsStorage.save([]);
    clientsStorage.save([]);
    setSalons([]);
    setAppointments([]);
    setClients([]);
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
