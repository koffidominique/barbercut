"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  SalonDraft,
} from "@/lib/store";
import { EMPTY_SALON, toCoordinate } from "@/lib/store";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const IS_CONFIGURED = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("your-"),
);

/** Un identifiant déjà enregistré en base est un UUID ; sinon c'est un identifiant local. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isPersistedId = (id: string) => UUID_RE.test(id);

const signature = (value: unknown) => JSON.stringify(value);

/** Charge utile réellement stockée en base (sert aussi de signature anti-écriture inutile). */
const servicePayload = (service: SalonService) => ({
  name: service.name,
  category: service.category,
  price: service.price,
  duration: service.duration,
  description: service.description || "",
  is_popular: service.isPopular ?? false,
});

const photoPayload = (photo: ShowcasePhoto) => ({
  url: photo.url,
  title: photo.title,
  description: photo.description || "",
  tags: photo.tags || [],
  is_cover: photo.isCover ?? false,
});

const mapServiceRow = (row: any): SalonService => ({
  id: row.id,
  name: row.name,
  category: (row.category || "Hommes") as SalonService["category"],
  price: Number(row.price || 0),
  duration: Number(row.duration || 0),
  description: row.description || "",
  isPopular: row.is_popular ?? false,
});

const mapStaffRow = (row: any): StaffMember => ({
  id: row.id,
  name: row.name,
  role: row.role || "",
  initials: row.initials || "",
  color: row.color || "bg-[#202321]",
  specialty: row.specialty || "",
  phone: row.phone || "",
  rating: Number(row.rating || 0),
  reviewsCount: row.reviews_count || 0,
  appointmentsCount: row.appointments_count || 0,
  status: (row.status as StaffMember["status"]) || "active",
  schedule: row.schedule || "",
});

const mapPhotoRow = (row: any): ShowcasePhoto => ({
  id: row.id,
  url: row.url,
  title: row.title,
  description: row.description || "",
  tags: row.tags || [],
  isCover: row.is_cover ?? false,
});

const groupBySalon = <T extends { salon_id: string }>(rows: T[] | null) => {
  const grouped: Record<string, T[]> = {};
  (rows || []).forEach((row) => {
    if (!grouped[row.salon_id]) grouped[row.salon_id] = [];
    grouped[row.salon_id].push(row);
  });
  return grouped;
};

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

  // Un seul client par montage : une nouvelle instance à chaque rendu relançait
  // l'effet de chargement en boucle (dépendance `supabase` instable).
  const supabase = useMemo(
    () => createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!),
    [],
  );
  /** Signatures des lignes déjà en base, pour ne pas réécrire des données inchangées. */
  const signaturesRef = useRef<Record<string, string>>({});

  /* ------------------------------------------------------------------ */
  /*  Chargement initial                                                */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!IS_CONFIGURED) {
      setIsLoaded(true);
      return;
    }

    let contentChannel: any;

    const loadData = async () => {
      try {
        const [
          { data: salonsData, error: salonsError },
          { data: aptsData },
          { data: clientsData },
          { data: servicesData },
          { data: staffData },
          { data: photosData },
        ] = await Promise.all([
          supabase
            .from("salons")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("appointments")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("salon_clients")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("salon_services")
            .select("*")
            .order("created_at", { ascending: true }),
          supabase
            .from("salon_staff")
            .select("*")
            .order("created_at", { ascending: true }),
          supabase
            .from("showcase_photos")
            .select("*")
            .order("created_at", { ascending: true }),
        ]);

        if (salonsError) {
          console.error("Erreur chargement des salons", salonsError);
        }

        const servicesBySalon = groupBySalon(servicesData);
        const staffBySalon = groupBySalon(staffData);
        const photosBySalon = groupBySalon(photosData);

        // Mémorise l'état réellement présent en base : les enregistrements
        // suivants n'écriront que ce qui a changé.
        const nextSignatures: Record<string, string> = {};
        Object.values(servicesBySalon)
          .flat()
          .forEach((row) => {
            const mapped = mapServiceRow(row);
            nextSignatures[`service:${mapped.id}`] = signature(
              servicePayload(mapped),
            );
          });
        Object.values(photosBySalon)
          .flat()
          .forEach((row) => {
            const mapped = mapPhotoRow(row);
            nextSignatures[`photo:${mapped.id}`] = signature(
              photoPayload(mapped),
            );
          });
        signaturesRef.current = { ...signaturesRef.current, ...nextSignatures };

        if (salonsData) {
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
              latitude: toCoordinate(s.latitude),
              longitude: toCoordinate(s.longitude),
              features: Array.isArray(s.features) ? s.features : [],
              gallery: (photosBySalon[s.id] || []).map(mapPhotoRow),
              services: (servicesBySalon[s.id] || []).map(mapServiceRow),
              staff: (staffBySalon[s.id] || []).map(mapStaffRow),
            })),
          );
        }

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

    /* --- Abonnements temps réel (un seul canal pour toutes les tables) --- */
    contentChannel = supabase.channel("barbercuts-content-changes");
    [
      "salons",
      "appointments",
      "salon_clients",
      "salon_services",
      "salon_staff",
      "showcase_photos",
    ].forEach((table) => {
      contentChannel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => loadData(),
      );
    });
    contentChannel.subscribe();

    return () => {
      if (contentChannel) supabase.removeChannel(contentChannel);
    };
  }, [supabase]);

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                           */
  /* ------------------------------------------------------------------ */
  const currentSalon =
    salons.find((s) => s.id === activeSalonId) || salons[0] || EMPTY_SALON;

  /* ------------------------------------------------------------------ */
  /*  Collections du salon (prestations, vitrine)                        */
  /* ------------------------------------------------------------------ */
  /**
   * Aligne la table `salon_services` sur le tableau fourni par l'UI :
   * mise à jour des lignes existantes, insertion des nouvelles,
   * suppression des disparues. Les écritures inchangées sont ignorées
   * grâce aux signatures chargées par `loadData`.
   */
  const syncSalonServices = useCallback(
    async (salonId: string, services: SalonService[]) => {
      if (!IS_CONFIGURED || !salonId) return;
      try {
        const { data: rows, error: readError } = await supabase
          .from("salon_services")
          .select("id, name")
          .eq("salon_id", salonId);
        if (readError) throw readError;

        const stored = (rows || []) as { id: string; name: string }[];
        const keptIds = new Set<string>();

        for (const service of services) {
          const payload = servicePayload(service);
          const isStored =
            isPersistedId(service.id) && stored.some((r) => r.id === service.id);

          if (isStored) {
            keptIds.add(service.id);
            const key = `service:${service.id}`;
            if (signaturesRef.current[key] === signature(payload)) continue;

            const { error } = await supabase
              .from("salon_services")
              .update({ ...payload, updated_at: new Date().toISOString() })
              .eq("id", service.id);
            if (error) throw error;
            signaturesRef.current[key] = signature(payload);
            continue;
          }

          // Identifiant local : éviter de dupliquer une prestation déjà enregistrée
          // avant le prochain rechargement temps réel.
          const duplicate = stored.find((r) => r.name === service.name);
          if (duplicate) {
            keptIds.add(duplicate.id);
            continue;
          }

          const { data: inserted, error } = await supabase
            .from("salon_services")
            .insert({ salon_id: salonId, ...payload })
            .select("id")
            .single();
          if (error) throw error;
          if (inserted?.id) {
            keptIds.add(inserted.id);
            signaturesRef.current[`service:${inserted.id}`] =
              signature(payload);
          }
        }

        // Garde-fou : un tableau vide signifie « pas encore chargé » (ou état
        // initial), on ne supprime donc jamais toute la carte de prestations.
        if (services.length === 0) return;

        const removedIds = stored
          .filter((r) => !keptIds.has(r.id))
          .map((r) => r.id);
        if (removedIds.length > 0) {
          const { error } = await supabase
            .from("salon_services")
            .delete()
            .in("id", removedIds);
          if (error) throw error;
          removedIds.forEach((id) => {
            delete signaturesRef.current[`service:${id}`];
          });
        }
      } catch (e) {
        console.error("Erreur synchronisation des prestations", e);
      }
    },
    [supabase],
  );

  /** Idem pour la galerie vitrine (`showcase_photos`). */
  const syncSalonPhotos = useCallback(
    async (salonId: string, photos: ShowcasePhoto[]) => {
      if (!IS_CONFIGURED || !salonId) return;
      try {
        const { data: rows, error: readError } = await supabase
          .from("showcase_photos")
          .select("id, title")
          .eq("salon_id", salonId);
        if (readError) throw readError;

        const stored = (rows || []) as { id: string; title: string }[];
        const keptIds = new Set<string>();

        for (const photo of photos) {
          const payload = photoPayload(photo);
          const isStored =
            isPersistedId(photo.id) && stored.some((r) => r.id === photo.id);

          if (isStored) {
            keptIds.add(photo.id);
            const key = `photo:${photo.id}`;
            if (signaturesRef.current[key] === signature(payload)) continue;

            const { error } = await supabase
              .from("showcase_photos")
              .update(payload)
              .eq("id", photo.id);
            if (error) throw error;
            signaturesRef.current[key] = signature(payload);
            continue;
          }

          const duplicate = stored.find((r) => r.title === photo.title);
          if (duplicate) {
            keptIds.add(duplicate.id);
            continue;
          }

          const { data: inserted, error } = await supabase
            .from("showcase_photos")
            .insert({ salon_id: salonId, ...payload })
            .select("id")
            .single();
          if (error) throw error;
          if (inserted?.id) {
            keptIds.add(inserted.id);
            signaturesRef.current[`photo:${inserted.id}`] = signature(payload);
          }
        }

        if (photos.length === 0) return;

        const removedIds = stored
          .filter((r) => !keptIds.has(r.id))
          .map((r) => r.id);
        if (removedIds.length > 0) {
          const { error } = await supabase
            .from("showcase_photos")
            .delete()
            .in("id", removedIds);
          if (error) throw error;
          removedIds.forEach((id) => {
            delete signaturesRef.current[`photo:${id}`];
          });
        }
      } catch (e) {
        console.error("Erreur synchronisation de la vitrine", e);
      }
    },
    [supabase],
  );

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

          // Les prestations et la vitrine vivent dans leurs propres tables :
          // sans ces appels, les modifications étaient perdues au rechargement.
          await syncSalonServices(updated.id, updated.services || []);
          await syncSalonPhotos(updated.id, updated.gallery || []);
        } catch (e) {
          console.error("Erreur updateSalon", e);
        }
      })();
    },
    [supabase, syncSalonServices, syncSalonPhotos],
  );

  const createSalon = useCallback(
    async (ownerId: string, data: SalonDraft) => {
      if (!IS_CONFIGURED) return null;
      try {
        // Les formulaires envoient des chaînes : on normalise une seule fois.
        const latitude = toCoordinate(data.latitude);
        const longitude = toCoordinate(data.longitude);

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

        if (latitude !== undefined) basePayload.latitude = latitude;
        if (longitude !== undefined) basePayload.longitude = longitude;

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
          latitude: toCoordinate(newSalon.latitude) ?? latitude,
          longitude: toCoordinate(newSalon.longitude) ?? longitude,
          features: [],
          gallery: [],
          // Utiliser les services fournis dans data ou tableau vide
          services:
            data.services && data.services.length > 0
              ? data.services.map((service, i) => ({
                  id: `srv-${Date.now()}-${i}`,
                  name: service.name,
                  category: service.category || ("Hommes" as const),
                  price: Number(service.price) || 0,
                  duration: Number(service.duration) || 45,
                  description: service.description || "",
                  isPopular: service.isPopular,
                }))
              : [],
          staff: [],
        };

        setSalons((prev) => [salon, ...prev]);
        setActiveSalonId(salon.id);
        localStorage.setItem("barbercuts_active_salon_id_v1", salon.id);

        // Les prestations saisies pendant l'onboarding sont écrites dans
        // `salon_services` : sans cela elles disparaissaient au rechargement.
        if (salon.services.length > 0) {
          const { error: servicesError } = await supabase
            .from("salon_services")
            .insert(
              salon.services.map((service) => ({
                salon_id: salon.id,
                ...servicePayload(service),
              })),
            );
          if (servicesError) {
            console.error("Erreur création des prestations", servicesError);
          }
        }

        return salon;
      } catch (e: any) {
        console.error("Erreur createSalon", e?.message || e, e);
        return null;
      }
    },
    [supabase],
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
    [supabase],
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
    [supabase],
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
    [supabase],
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
    [supabase],
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
          if (!currentSalon?.id) {
            console.error(
              "saveClient: aucun salon actif, le client ne peut pas être rattaché",
            );
            return;
          }
          const { data: newClient, error } = await supabase
            .from("salon_clients")
            .insert({
              salon_id: currentSalon.id,
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
    [supabase, currentSalon],
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
    [supabase],
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
    [supabase, currentSalon],
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
    [supabase],
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
  }, [supabase, activeSalonId]);

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
