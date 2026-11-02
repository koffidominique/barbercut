"use client";

import { useCallback } from "react";
import type {
  Appointment,
  ClientAccount,
  OfflineAction,
  Salon,
  SalonClient,
  SalonDraft,
  SalonReview,
  SalonSubscription,
  StaffMember,
  TeamInvitation,
} from "@/lib/types";
import { EMPTY_SALON, toCoordinate } from "@/lib/types";
import { saveStoredActiveSalonId } from "@/lib/storage";
import { IS_CONFIGURED, unwrap } from "@/lib/supabase-client";
import {
  appointmentInsertPayload,
  clientColumnsPayload,
  mapClientRow,
  salonUpdatePayload,
  servicePayload,
  staffColumnsPayload,
} from "@/lib/supabase-mappers";
import { useSalonData } from "@/lib/use-salon-data";
import { syncSalonPhotos, syncSalonServices } from "@/lib/supabase-sync";

/** Note affichée par défaut pour un membre d'équipe sans historique. */
const DEFAULT_STAFF_RATING = 4.9;

/** Colonnes communes à l'insertion d'un salon dans la table `salons`. */
const SALON_INSERT_DEFAULTS = {
  rating: 0,
  reviews_count: 0,
  is_published: false,
  currency: "FCFA",
  sms_reminders_enabled: true,
  whatsapp_confirmation_enabled: true,
} as const;

/**
 * Store salon propulsé par Supabase.
 * Même interface que useSalonStore (lib/store.ts) pour une migration transparente.
 * La lecture et le temps réel vivent dans `use-salon-data.ts`, l'alignement des
 * collections enfants dans `supabase-sync.ts`, les conversions snake/camel dans
 * `supabase-mappers.ts`. Ce fichier ne contient que les opérations d'écriture.
 */
export function useSupabaseSalonStore() {
  const data = useSalonData();
  const { supabase, salons, setSalons, clients, setClients } = data;

  /* ------------------------------------------------------------------ */
  /*  Salons                                                            */
  /* ------------------------------------------------------------------ */
  const currentSalon =
    salons.find((s) => s.id === data.activeSalonId) || salons[0] || EMPTY_SALON;

  const updateSalon = useCallback(
    (updated: Salon) => {
      if (!IS_CONFIGURED || !supabase) return;
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
          await unwrap(
            supabase
              .from("salons")
              .update(salonUpdatePayload(updated))
              .eq("id", updated.id),
          );

          // Les prestations et la vitrine vivent dans leurs propres tables :
          // sans ces appels, les modifications étaient perdues au rechargement.
          await syncSalonServices(supabase, updated.id, updated.services || [], data.signaturesRef);
          await syncSalonPhotos(supabase, updated.id, updated.gallery || [], data.signaturesRef);
        } catch (e) {
          console.error("Erreur updateSalon", e);
        }
      })();
    },
    [supabase, data.signaturesRef],
  );

  const createSalon = useCallback(
    async (ownerId: string, draft: SalonDraft): Promise<Salon | null> => {
      if (!IS_CONFIGURED || !supabase) return null;
      try {
        // Les formulaires envoient des chaînes : on normalise une seule fois.
        const latitude = toCoordinate(draft.latitude);
        const longitude = toCoordinate(draft.longitude);

        const basePayload = {
          owner_id: ownerId,
          name: draft.name || "Mon Salon Barber Cuts",
          tagline: draft.tagline || "",
          description: draft.description || "",
          city: draft.city || "",
          neighborhood: draft.neighborhood || "",
          address: draft.address || "",
          phone: draft.phone || "",
          whatsapp: draft.whatsapp || "",
          cover_image: draft.coverImage || "/images/placeholder-logo.png",
          opening_hours: draft.openingHours || "Mar - Dim: 08:30 - 20:30",
          rccm: draft.rccm,
          ...SALON_INSERT_DEFAULTS,
          ...(latitude !== undefined && { latitude }),
          ...(longitude !== undefined && { longitude }),
        };

        // Repli si la base ne connaît pas encore les colonnes GPS
        // (migration 20240102 non appliquée) : réessayer sans coordonnées.
        let row: any;
        try {
          row = await unwrap<any>(
            supabase.from("salons").insert(basePayload).select().single(),
          );
        } catch (firstError) {
          console.warn(
            "createSalon: tentative avec coordonnées échouée, essai sans coordonnées",
            firstError,
          );
          const { latitude: _lat, longitude: _lng, ...withoutCoords } =
            basePayload;
          row = await unwrap<any>(
            supabase.from("salons").insert(withoutCoords).select().single(),
          );
        }

        // Les prestations saisies pendant l'onboarding sont écrites dans
        // `salon_services` : sans cela elles disparaissaient au rechargement.
        const services = (draft.services || []).map((service, i) => ({
          id: `srv-${Date.now()}-${i}`,
          name: service.name,
          category: service.category || ("Hommes" as const),
          price: Number(service.price) || 0,
          duration: Number(service.duration) || 45,
          description: service.description || "",
          isPopular: service.isPopular,
        }));
        if (services.length > 0) {
          try {
            await unwrap(
              supabase
                .from("salon_services")
                .insert(
                  services.map((service) => ({
                    salon_id: row.id,
                    ...servicePayload(service),
                  })),
                ),
            );
          } catch (e) {
            console.error("Erreur création des prestations", e);
          }
        }

        const salon: Salon = {
          ...mapSalonFromRow(row),
          latitude: toCoordinate(row.latitude) ?? latitude,
          longitude: toCoordinate(row.longitude) ?? longitude,
          services,
        };

        setSalons((prev) => [salon, ...prev]);
        data.setActiveSalonId(salon.id);
        saveStoredActiveSalonId(salon.id);

        return salon;
      } catch (e) {
        console.error("Erreur createSalon", e);
        return null;
      }
    },
    [supabase, setSalons, data],
  );

  /* ------------------------------------------------------------------ */
  /*  Rendez-vous                                                       */
  /* ------------------------------------------------------------------ */
  const bookAppointment = useCallback(
    (appointmentData: Omit<Appointment, "id" | "createdAt">): Appointment => {
      const apt: Appointment = {
        ...appointmentData,
        id: "apt-" + Date.now(),
        createdAt: new Date().toISOString(),
      };

      // Insertion en arrière-plan dans Supabase (fire-and-forget).
      // L'abonnement temps réel rechargera les données automatiquement.
      if (IS_CONFIGURED && supabase) {
        unwrap(
          supabase.from("appointments").insert(
            appointmentInsertPayload(appointmentData),
          ),
        ).catch((e) => console.error("Erreur bookAppointment", e));
      }

      return apt;
    },
    [supabase],
  );

  const updateAppointmentStatus = useCallback(
    async (id: string, status: Appointment["status"]) => {
      if (!IS_CONFIGURED || !supabase) return;
      try {
        await unwrap(
          supabase
            .from("appointments")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", id),
        );
      } catch (e) {
        console.error("Erreur updateAppointmentStatus", e);
      }
    },
    [supabase],
  );

  const updateAppointmentPayment = useCallback(
    async (
      id: string,
      paymentStatus: Appointment["paymentStatus"],
      paymentMethod?: Appointment["paymentMethod"],
    ) => {
      if (!IS_CONFIGURED || !supabase) return;
      try {
        await unwrap(
          supabase
            .from("appointments")
            .update({
              payment_status: paymentStatus,
              payment_method: paymentMethod || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", id),
        );
      } catch (e) {
        console.error("Erreur updateAppointmentPayment", e);
      }
    },
    [supabase],
  );

  const deleteAppointment = useCallback(
    async (id: string) => {
      if (!IS_CONFIGURED || !supabase) return;
      try {
        await unwrap(supabase.from("appointments").delete().eq("id", id));
      } catch (e) {
        console.error("Erreur deleteAppointment", e);
      }
    },
    [supabase],
  );

  /* ------------------------------------------------------------------ */
  /*  Clients                                                           */
  /* ------------------------------------------------------------------ */
  /** Préfixe attribué localement aux clients non encore enregistrés en base. */
  const LOCAL_CLIENT_ID_PREFIX = "cli-";

  const saveClient = useCallback(
    async (client: SalonClient) => {
      if (!IS_CONFIGURED || !supabase) return;
      try {
        if (client.id.startsWith(LOCAL_CLIENT_ID_PREFIX)) {
          // Nouveau client
          if (!currentSalon?.id) {
            console.error(
              "saveClient: aucun salon actif, le client ne peut pas être rattaché",
            );
            return;
          }
          const row = await unwrap<any>(
            supabase
              .from("salon_clients")
              .insert({ salon_id: currentSalon.id, ...clientColumnsPayload(client) })
              .select()
              .single(),
          );
          setClients((prev) => [mapClientRow(row), ...prev]);
        } else {
          await unwrap(
            supabase
              .from("salon_clients")
              .update({
                ...clientColumnsPayload(client),
                updated_at: new Date().toISOString(),
              })
              .eq("id", client.id),
          );
        }
      } catch (e) {
        console.error("Erreur saveClient", e);
      }
    },
    [supabase, currentSalon, setClients],
  );

  const deleteClient = useCallback(
    async (id: string) => {
      if (!IS_CONFIGURED || !supabase) return;
      try {
        await unwrap(supabase.from("salon_clients").delete().eq("id", id));
      } catch (e) {
        console.error("Erreur deleteClient", e);
      }
    },
    [supabase],
  );

  /* ------------------------------------------------------------------ */
  /*  Équipe (staff)                                                    */
  /* ------------------------------------------------------------------ */
  /** Préfixe attribué localement aux membres non encore enregistrés en base. */
  const LOCAL_STAFF_ID_PREFIX = "st-";

  const saveStaffMember = useCallback(
    async (staff: StaffMember) => {
      if (!IS_CONFIGURED || !supabase || !currentSalon) return;
      try {
        const columns = staffColumnsPayload(staff);
        if (staff.id.startsWith(LOCAL_STAFF_ID_PREFIX)) {
          await unwrap(
            supabase
              .from("salon_staff")
              .insert({
                salon_id: currentSalon.id,
                ...columns,
                // Un nouveau membre sans note hérite de la valeur d'affichage par défaut.
                rating: columns.rating ?? DEFAULT_STAFF_RATING,
              }),
          );
        } else {
          await unwrap(
            supabase
              .from("salon_staff")
              .update({ ...columns, updated_at: new Date().toISOString() })
              .eq("id", staff.id),
          );
        }
      } catch (e) {
        console.error("Erreur saveStaffMember", e);
      }
    },
    [supabase, currentSalon],
  );

  const deleteStaffMember = useCallback(
    async (id: string) => {
      if (!IS_CONFIGURED || !supabase) return;
      try {
        await unwrap(supabase.from("salon_staff").delete().eq("id", id));
      } catch (e) {
        console.error("Erreur deleteStaffMember", e);
      }
    },
    [supabase],
  );

  /* ------------------------------------------------------------------ */
  /*  Reset                                                             */
  /* ------------------------------------------------------------------ */
  const resetDefaults = useCallback(async () => {
    if (!IS_CONFIGURED || !supabase) return;
    // Réinitialisation : supprimer toutes les données du salon actif
    if (data.activeSalonId) {
      for (const table of [
        "appointments",
        "salon_clients",
        "salon_staff",
        "salon_services",
        "showcase_photos",
      ]) {
        await unwrap(
          supabase.from(table).delete().eq("salon_id", data.activeSalonId),
        ).catch((e) =>
          console.error(`Erreur suppression \`${table}\``, e),
        );
      }
    }
    window.location.reload();
  }, [supabase, data.activeSalonId]);

  return {
    salons,
    currentSalon,
    activeSalonId: data.activeSalonId,
    setActiveSalonId: data.setActiveSalonId,
    appointments: data.appointments,
    clients,
    // Fonctionnalités réservées au mode local (non disponibles via Supabase).
    clientAccounts: [] as ClientAccount[],
    clientAccount: null,
    subscriptions: {} as Record<string, SalonSubscription>,
    teamInvitations: [] as TeamInvitation[],
    offlineQueue: [] as OfflineAction[],
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isLoaded: data.isLoaded,
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

/** Ligne `salons` fraîchement insérée -> modèle Salon (collections vides). */
function mapSalonFromRow(row: any): Salon {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    city: row.city,
    neighborhood: row.neighborhood,
    address: row.address,
    phone: row.phone,
    whatsapp: row.whatsapp,
    rating: Number(row.rating || 0),
    reviewsCount: row.reviews_count || 0,
    isPublished: row.is_published ?? false,
    coverImage: row.cover_image,
    openingHours: row.opening_hours,
    rccm: row.rccm || undefined,
    currency: row.currency || "FCFA",
    smsRemindersEnabled: row.sms_reminders_enabled ?? true,
    whatsappConfirmationEnabled: row.whatsapp_confirmation_enabled ?? true,
    latitude: toCoordinate(row.latitude),
    longitude: toCoordinate(row.longitude),
    features: [],
    gallery: [],
    services: [],
    staff: [],
  };
}
