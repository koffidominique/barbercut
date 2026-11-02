"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type {
  Salon,
  Appointment,
  SalonClient,
  StaffMember,
  SalonService,
  ShowcasePhoto,
  SalonReview,
  ClientAccount,
  SalonSubscription,
  TeamInvitation,
  OfflineAction,
} from "@/lib/store";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const IS_CONFIGURED = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("your-"),
);

/**
 * Store salon propulsé par Supabase.
 * Même interface que useSalonStore (lib/store.ts) pour une migration transparente.
 * Si Supabase n'est pas configuré, toutes les opérations retournent des tableaux vides
 * et l'application continue de fonctionner en mode dégradé (localStorage dans lib/store.ts).
 */
export function useSupabaseSalonStore() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<SalonClient[]>([]);
  const [activeSalonId, setActiveSalonId] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  const supabase = createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

  /* ------------------------------------------------------------------ */
  /*  Chargement initial                                                */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!IS_CONFIGURED) {
      setIsLoaded(true);
      return;
    }

    let salonChannel: any;
    let aptChannel: any;
    let clientChannel: any;

    const loadData = async () => {
      try {
        const { data: salonsData, error: salonsError } = await supabase
          .from("salons")
          .select("*")
          .order("created_at", { ascending: false });

        if (!salonsError && salonsData) {
          setSalons(
            salonsData.map((s) => ({
              id: s.id,
              name: s.name,
              tagline: s.tagline || "",
              description: s.description || "",
              city: s.city || "",
              neighborhood: s.neighborhood || "",
              address: s.address || "",
              phone: s.phone || "",
              whatsapp: s.whatsapp || "",
              rating: Number(s.rating || 0),
              reviewsCount: s.reviews_count || 0,
              isPublished: s.is_published ?? false,
              coverImage: s.cover_image || "",
              openingHours: s.opening_hours || "",
              rccm: s.rccm || undefined,
              currency: s.currency || "FCFA",
              smsRemindersEnabled: s.sms_reminders_enabled ?? true,
              whatsappConfirmationEnabled:
                s.whatsapp_confirmation_enabled ?? true,
              latitude:
                s.latitude !== null && s.latitude !== undefined
                  ? Number(s.latitude)
                  : undefined,
              longitude:
                s.longitude !== null && s.longitude !== undefined
                  ? Number(s.longitude)
                  : undefined,
              features: (s as any).features || [],
              gallery: [],
              services: [],
              staff: [],
            })),
          );
        }

        const { data: aptsData } = await supabase
          .from("appointments")
          .select("*")
          .order("created_at", { ascending: false });

        if (aptsData) {
          setAppointments(
            aptsData.map((a) => ({
              id: a.id,
              salonId: a.salon_id,
              clientName: a.client_name,
              clientPhone: a.client_phone,
              serviceId: a.service_id || "",
              serviceName: a.service_name,
              servicePrice: a.service_price || 0,
              staffName: a.staff_name || "",
              date: a.date,
              time: a.time,
              status: a.status as Appointment["status"],
              source: a.source as Appointment["source"],
              notes: a.notes || undefined,
              createdAt: a.created_at,
              paymentStatus:
                (a.payment_status as Appointment["paymentStatus"]) || "unpaid",
              paymentMethod:
                (a.payment_method as Appointment["paymentMethod"]) || undefined,
            })),
          );
        }

        const { data: clientsData } = await supabase
          .from("salon_clients")
          .select("*")
          .order("created_at", { ascending: false });

        if (clientsData) {
          setClients(
            clientsData.map((c) => ({
              id: c.id,
              name: c.name,
              phone: c.phone,
              email: c.email || undefined,
              favoriteService: c.favorite_service || "",
              preferredStaff: c.preferred_staff || "",
              totalVisits: c.total_visits || 0,
              totalSpent: c.total_spent || 0,
              lastVisit: c.last_visit || "",
              nextAppointment: c.next_appointment || undefined,
              status: c.status as SalonClient["status"],
              source: c.source as SalonClient["source"],
              notes: c.notes || undefined,
            })),
          );
        }

        // Définir le salon actif (le premier ou celui stocké précédemment)
        if (salonsData && salonsData.length > 0) {
          const stored = localStorage.getItem("barbercuts_active_salon_id_v1");
          const found = salonsData.find((s) => s.id === stored);
          setActiveSalonId(found ? found.id : salonsData[0].id);
        }

        setIsLoaded(true);
      } catch (e) {
        console.error("Erreur chargement Supabase", e);
        setIsLoaded(true);
      }
    };

    loadData();

    /* --- Nettoyer les canaux existants avant d'en créer de nouveaux --- */
    supabase.removeAllChannels();

    /* --- Abonnements temps réel --- */
    if (IS_CONFIGURED) {
      // Créer le canal pour les salons
      salonChannel = supabase.channel("salons-changes");
      salonChannel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "salons" },
        () => loadData(),
      );
      salonChannel.subscribe();

      // Créer le canal pour les rendez-vous
      aptChannel = supabase.channel("appointments-changes");
      aptChannel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => loadData(),
      );
      aptChannel.subscribe();

      // Créer le canal pour les clients
      clientChannel = supabase.channel("clients-changes");
      clientChannel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "salon_clients" },
        () => loadData(),
      );
      clientChannel.subscribe();
    }

    return () => {
      if (salonChannel) supabase.removeChannel(salonChannel);
      if (aptChannel) supabase.removeChannel(aptChannel);
      if (clientChannel) supabase.removeChannel(clientChannel);
    };
  }, [supabase]);

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                           */
  /* ------------------------------------------------------------------ */
  const EMPTY_SALON: Salon = {
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

  const currentSalon =
    salons.find((s) => s.id === activeSalonId) || salons[0] || EMPTY_SALON;

  /* ------------------------------------------------------------------ */
  /*  Salons                                                            */
  /* ------------------------------------------------------------------ */
  const updateSalon = useCallback(
    (updated: Salon) => {
      if (!IS_CONFIGURED) return;
      // Exécuter l'opération asynchrone sans bloquer useCallback
      (async () => {
        // Si l'ID est vide, on ne fait rien : il faut d'abord créer le salon avec createSalon()
        if (!updated.id || updated.id === "") {
          console.warn(
            "Impossible de mettre à jour un salon sans ID : utilisez createSalon() pour créer un nouveau salon",
          );
          return;
        }
        try {
          // Mise à jour d'un salon existant uniquement
          const { error } = await supabase
            .from("salons")
          .update({
            name: updated.name,
            tagline: updated.tagline,
            description: updated.description,
            city: updated.city,
            neighborhood: updated.neighborhood,
            address: updated.address,
            phone: updated.phone,
            whatsapp: updated.whatsapp,
            rating: updated.rating,
            reviews_count: updated.reviewsCount,
            is_published: updated.isPublished,
            cover_image: updated.coverImage,
            opening_hours: updated.openingHours,
            rccm: updated.rccm,
            currency: updated.currency,
            sms_reminders_enabled: updated.smsRemindersEnabled,
            whatsapp_confirmation_enabled:
              updated.whatsappConfirmationEnabled,
            latitude:
              updated.latitude !== undefined && updated.latitude !== null
                ? Number(updated.latitude)
                : null,
            longitude:
              updated.longitude !== undefined && updated.longitude !== null
                ? Number(updated.longitude)
                : null,
            updated_at: new Date().toISOString(),
          })
            .eq("id", updated.id);

          if (error) throw error;
        } catch (e) {
          console.error("Erreur updateSalon", e);
        }
      })();
    },
    [supabase, IS_CONFIGURED],
  );

  const createSalon = useCallback(
    async (ownerId: string, data: Partial<Salon>) => {
      if (!IS_CONFIGURED) return null;
      try {
        const basePayload: any = {
          owner_id: ownerId,
          name: data.name || "Mon Salon Barber Cuts",
          tagline: data.tagline || "",
          description: data.description || "",
          city: data.city || "",
          neighborhood: data.neighborhood || "",
          address: data.address || "",
          phone: data.phone || "",
          whatsapp: data.whatsapp || "",
          rating: 0,
          reviews_count: 0,
          is_published: false,
          cover_image: data.coverImage || "/images/placeholder-logo.png",
          opening_hours: data.openingHours || "Mar - Dim: 08:30 - 20:30",
          rccm: data.rccm,
          currency: "FCFA",
          sms_reminders_enabled: true,
          whatsapp_confirmation_enabled: true,
        };

        if (data.latitude !== undefined && data.latitude !== null && data.latitude !== "") {
          basePayload.latitude = Number(data.latitude);
        }
        if (data.longitude !== undefined && data.longitude !== null && data.longitude !== "") {
          basePayload.longitude = Number(data.longitude);
        }

        let newSalon: any = null;
        let error: any = null;

        const firstAttempt = await supabase
          .from("salons")
          .insert(basePayload)
          .select()
          .single();

        newSalon = firstAttempt.data;
        error = firstAttempt.error;

        if (error) {
          console.warn("createSalon: tentative avec coordonnées échouée, essai sans coordonnées", error?.message);
          const fallbackPayload = { ...basePayload };
          delete fallbackPayload.latitude;
          delete fallbackPayload.longitude;

          const secondAttempt = await supabase
            .from("salons")
            .insert(fallbackPayload)
            .select()
            .single();

          newSalon = secondAttempt.data;
          error = secondAttempt.error;
        }

        if (error) throw error;

        const salon: Salon = {
          id: newSalon.id,
          name: newSalon.name,
          tagline: newSalon.tagline,
          description: newSalon.description,
          city: newSalon.city,
          neighborhood: newSalon.neighborhood,
          address: newSalon.address,
          phone: newSalon.phone,
          whatsapp: newSalon.whatsapp,
          rating: Number(newSalon.rating || 0),
          reviewsCount: newSalon.reviews_count || 0,
          isPublished: newSalon.is_published ?? false,
          coverImage: newSalon.cover_image,
          openingHours: newSalon.opening_hours,
          rccm: newSalon.rccm || undefined,
          currency: newSalon.currency || "FCFA",
          smsRemindersEnabled: newSalon.sms_reminders_enabled ?? true,
          whatsappConfirmationEnabled:
            newSalon.whatsapp_confirmation_enabled ?? true,
          latitude:
            newSalon.latitude !== null && newSalon.latitude !== undefined
              ? Number(newSalon.latitude)
              : data.latitude !== undefined && data.latitude !== null && data.latitude !== ""
                ? Number(data.latitude)
                : undefined,
          longitude:
            newSalon.longitude !== null && newSalon.longitude !== undefined
              ? Number(newSalon.longitude)
              : data.longitude !== undefined && data.longitude !== null && data.longitude !== ""
                ? Number(data.longitude)
                : undefined,
          features: [],
          gallery: [],
          // Utiliser les services fournis dans data ou tableau vide
          services:
            data.services && data.services.length > 0
              ? data.services.map((s, i) => ({
                  id: `srv-${Date.now()}-${i}`,
                  name: s.name,
                  category: "Hommes" as const,
                  price: Number(s.price) || 0,
                  duration: Number(s.duration) || 45,
                  description: "",
                }))
              : [],
          staff: [],
        };

        setSalons((prev) => [salon, ...prev]);
        setActiveSalonId(salon.id);
        localStorage.setItem("barbercuts_active_salon_id_v1", salon.id);

        return salon;
      } catch (e: any) {
        console.error("Erreur createSalon", e?.message || e, e);
        return null;
      }
    },
    [supabase, IS_CONFIGURED],
  );

  /* ------------------------------------------------------------------ */
  /*  Rendez-vous                                                       */
  /* ------------------------------------------------------------------ */
  const bookAppointment = useCallback(
    (data: Omit<Appointment, "id" | "createdAt">): Appointment => {
      const apt: Appointment = {
        ...data,
        id: "apt-" + Date.now(),
        createdAt: new Date().toISOString(),
      };

      // Insertion en arrière-plan dans Supabase (fire-and-forget).
      // L'abonnement temps réel rechargera les données automatiquement.
      if (IS_CONFIGURED) {
        supabase
          .from("appointments")
          .insert({
            salon_id: data.salonId,
            client_name: data.clientName,
            client_phone: data.clientPhone,
            service_id: data.serviceId || null,
            service_name: data.serviceName,
            service_price: data.servicePrice,
            staff_name: data.staffName || null,
            date: data.date,
            time: data.time,
            status: data.status,
            source: data.source,
            notes: data.notes || null,
            payment_status: data.paymentStatus || "unpaid",
            payment_method: data.paymentMethod || null,
          })
          .then(undefined, (e: unknown) =>
            console.error("Erreur bookAppointment", e),
          );
      }

      return apt;
    },
    [supabase, IS_CONFIGURED],
  );

  const updateAppointmentStatus = useCallback(
    async (id: string, status: Appointment["status"]) => {
      if (!IS_CONFIGURED) return;
      try {
        const { error } = await supabase
          .from("appointments")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", id);

        if (error) throw error;
      } catch (e) {
        console.error("Erreur updateAppointmentStatus", e);
      }
    },
    [supabase, IS_CONFIGURED],
  );

  const updateAppointmentPayment = useCallback(
    async (
      id: string,
      paymentStatus: Appointment["paymentStatus"],
      paymentMethod?: Appointment["paymentMethod"],
    ) => {
      if (!IS_CONFIGURED) return;
      try {
        const { error } = await supabase
          .from("appointments")
          .update({
            payment_status: paymentStatus,
            payment_method: paymentMethod || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;
      } catch (e) {
        console.error("Erreur updateAppointmentPayment", e);
      }
    },
    [supabase, IS_CONFIGURED],
  );

  const deleteAppointment = useCallback(
    async (id: string) => {
      if (!IS_CONFIGURED) return;
      try {
        const { error } = await supabase
          .from("appointments")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (e) {
        console.error("Erreur deleteAppointment", e);
      }
    },
    [supabase, IS_CONFIGURED],
  );

  /* ------------------------------------------------------------------ */
  /*  Clients                                                           */
  /* ------------------------------------------------------------------ */
  const saveClient = useCallback(
    async (client: SalonClient) => {
      if (!IS_CONFIGURED) return;
      try {
        if (client.id.startsWith("cli-")) {
          // Nouveau client
          const { data: newClient, error } = await supabase
            .from("salon_clients")
            .insert({
              salon_id: currentSalon?.id || "",
              name: client.name,
              phone: client.phone,
              email: client.email || null,
              favorite_service: client.favoriteService,
              preferred_staff: client.preferredStaff,
              total_visits: client.totalVisits,
              total_spent: client.totalSpent,
              last_visit: client.lastVisit || null,
              next_appointment: client.nextAppointment || null,
              status: client.status,
              source: client.source,
              notes: client.notes || null,
            })
            .select()
            .single();

          if (error) throw error;

          const c: SalonClient = {
            id: newClient.id,
            name: newClient.name,
            phone: newClient.phone,
            email: newClient.email || undefined,
            favoriteService: newClient.favorite_service,
            preferredStaff: newClient.preferred_staff,
            totalVisits: newClient.total_visits || 0,
            totalSpent: newClient.total_spent || 0,
            lastVisit: newClient.last_visit || "",
            nextAppointment: newClient.next_appointment || undefined,
            status: newClient.status as SalonClient["status"],
            source: newClient.source as SalonClient["source"],
            notes: newClient.notes || undefined,
          };
          setClients((prev) => [c, ...prev]);
        } else {
          // Mise à jour
          const { error } = await supabase
            .from("salon_clients")
            .update({
              name: client.name,
              phone: client.phone,
              email: client.email || null,
              favorite_service: client.favoriteService,
              preferred_staff: client.preferredStaff,
              total_visits: client.totalVisits,
              total_spent: client.totalSpent,
              last_visit: client.lastVisit || null,
              next_appointment: client.nextAppointment || null,
              status: client.status,
              source: client.source,
              notes: client.notes || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", client.id);

          if (error) throw error;
        }
      } catch (e) {
        console.error("Erreur saveClient", e);
      }
    },
    [supabase, IS_CONFIGURED, currentSalon?.id],
  );

  const deleteClient = useCallback(
    async (id: string) => {
      if (!IS_CONFIGURED) return;
      try {
        const { error } = await supabase
          .from("salon_clients")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (e) {
        console.error("Erreur deleteClient", e);
      }
    },
    [supabase, IS_CONFIGURED],
  );

  /* ------------------------------------------------------------------ */
  /*  Équipe (staff)                                                    */
  /* ------------------------------------------------------------------ */
  const saveStaffMember = useCallback(
    async (staff: StaffMember) => {
      if (!IS_CONFIGURED || !currentSalon) return;
      try {
        if (staff.id.startsWith("st-")) {
          const { error } = await supabase.from("salon_staff").insert({
            salon_id: currentSalon.id,
            name: staff.name,
            role: staff.role || "",
            specialty: staff.specialty || null,
            phone: staff.phone || null,
            schedule: staff.schedule || null,
            color: staff.color || "bg-[#202321]",
            initials: staff.initials || "",
            rating: staff.rating || 4.9,
            reviews_count: staff.reviewsCount || 0,
            appointments_count: staff.appointmentsCount || 0,
            status: staff.status || "active",
          });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("salon_staff")
            .update({
              name: staff.name,
              role: staff.role,
              specialty: staff.specialty || null,
              phone: staff.phone || null,
              schedule: staff.schedule || null,
              color: staff.color,
              initials: staff.initials,
              rating: staff.rating,
              reviews_count: staff.reviewsCount,
              appointments_count: staff.appointmentsCount,
              status: staff.status,
              updated_at: new Date().toISOString(),
            })
            .eq("id", staff.id);
          if (error) throw error;
        }
      } catch (e) {
        console.error("Erreur saveStaffMember", e);
      }
    },
    [supabase, IS_CONFIGURED, currentSalon],
  );

  const deleteStaffMember = useCallback(
    async (id: string) => {
      if (!IS_CONFIGURED) return;
      try {
        const { error } = await supabase
          .from("salon_staff")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (e) {
        console.error("Erreur deleteStaffMember", e);
      }
    },
    [supabase, IS_CONFIGURED],
  );

  /* ------------------------------------------------------------------ */
  /*  Reset                                                             */
  /* ------------------------------------------------------------------ */
  const resetDefaults = useCallback(async () => {
    if (!IS_CONFIGURED) return;
    // Réinitialisation : supprimer toutes les données du salon actif
    if (activeSalonId) {
      await supabase
        .from("appointments")
        .delete()
        .eq("salon_id", activeSalonId);
      await supabase
        .from("salon_clients")
        .delete()
        .eq("salon_id", activeSalonId);
      await supabase.from("salon_staff").delete().eq("salon_id", activeSalonId);
      await supabase
        .from("salon_services")
        .delete()
        .eq("salon_id", activeSalonId);
      await supabase
        .from("showcase_photos")
        .delete()
        .eq("salon_id", activeSalonId);
    }
    window.location.reload();
  }, [supabase, IS_CONFIGURED, activeSalonId]);

  return {
    salons,
    currentSalon,
    activeSalonId,
    setActiveSalonId,
    appointments,
    clients,
    clientAccounts: [] as ClientAccount[],
    clientAccount: null,
    subscriptions: {} as Record<string, SalonSubscription>,
    teamInvitations: [] as TeamInvitation[],
    offlineQueue: [] as OfflineAction[],
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isLoaded,
    updateSalon,
    createSalon,
    bookAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    updateAppointmentPayment,
    saveClient,
    deleteClient,
    reviews: [] as SalonReview[],
    saveReview: () => {},
    registerClient: () => {
      throw new Error("Non disponible avec Supabase");
    },
    loginClient: () => {
      throw new Error("Non disponible avec Supabase");
    },
    logoutClient: () => {},
    getSubscription: () => null,
    setSubscription: () => {},
    upgradeToPro: () => {
      throw new Error("Non disponible avec Supabase");
    },
    startFreeTrial: () => {
      throw new Error("Non disponible avec Supabase");
    },
    cancelSubscription: () => null,
    inviteTeamMember: () => {
      throw new Error("Non disponible avec Supabase");
    },
    respondToInvitation: () => {},
    syncOfflineQueue: async () => {},
    saveStaffMember,
    deleteStaffMember,
    resetDefaults,
    isSupabaseConfigured: IS_CONFIGURED,
  };
}
