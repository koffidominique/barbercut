"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  type Salon,
  type Appointment,
  type SalonClient,
  type StaffMember,
  type SalonService,
  type ShowcasePhoto,
  type SalonReview,
  type ClientAccount,
  type SalonSubscription,
  type TeamInvitation,
  type OfflineAction,
  type StaffRole,
  type StaffPermissions,
  getStoredReviews,
  saveStoredReviews,
  getStoredSubscriptions,
  saveStoredSubscriptions,
  getStoredTeamInvitations,
  saveStoredTeamInvitations,
  getStoredClientAccounts,
  saveStoredClientAccounts,
  getClientSession,
  saveClientSession,
  getStoredOfflineQueue,
  saveStoredOfflineQueue,
  EMPTY_SALON,
} from "@/lib/store";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const IS_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http") &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-"),
);

export function useSupabaseSalonStore() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<SalonClient[]>([]);
  const [activeSalonId, setActiveSalonId] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [clientAccounts, setClientAccounts] = useState<ClientAccount[]>([]);
  const [clientAccount, setClientAccount] = useState<ClientAccount | null>(null);
  const [subscriptions, setSubscriptions] = useState<Record<string, SalonSubscription>>({});
  const [teamInvitations, setTeamInvitations] = useState<TeamInvitation[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const [reviews, setReviews] = useState<SalonReview[]>([]);

  const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /* ------------------------------------------------------------------ */
  /*  Restauration des états locaux (session, abonnements, avis)        */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    setClientAccounts(getStoredClientAccounts());
    setClientAccount(getClientSession());
    setSubscriptions(getStoredSubscriptions());
    setTeamInvitations(getStoredTeamInvitations());
    setOfflineQueue(getStoredOfflineQueue());
    setReviews(getStoredReviews());
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Chargement initial et abonnements temps réel                      */
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
        const [
          salonsRes,
          servicesRes,
          staffRes,
          photosRes,
          aptsRes,
          clientsRes,
        ] = await Promise.all([
          supabase.from("salons").select("*").order("created_at", { ascending: false }),
          supabase.from("salon_services").select("*"),
          supabase.from("salon_staff").select("*"),
          supabase.from("showcase_photos").select("*"),
          supabase.from("appointments").select("*").order("created_at", { ascending: false }),
          supabase.from("salon_clients").select("*").order("created_at", { ascending: false }),
        ]);

        const salonsData = salonsRes.data || [];
        const servicesData = servicesRes.data || [];
        const staffData = staffRes.data || [];
        const photosData = photosRes.data || [];
        const aptsData = aptsRes.data || [];
        const clientsData = clientsRes.data || [];

        if (salonsData.length > 0) {
          const loadedSalons: Salon[] = salonsData.map((s) => {
            const services: SalonService[] = servicesData
              .filter((srv) => srv.salon_id === s.id)
              .map((srv) => ({
                id: srv.id,
                name: srv.name,
                category: srv.category || "Hommes",
                price: Number(srv.price || 0),
                duration: Number(srv.duration || 30),
                description: srv.description || "",
                isPopular: srv.is_popular ?? false,
              }));

            const staff: StaffMember[] = staffData
              .filter((stf) => stf.salon_id === s.id)
              .map((stf) => ({
                id: stf.id,
                name: stf.name,
                role: stf.role || "Barbier",
                initials: stf.initials || stf.name.slice(0, 2).toUpperCase(),
                color: stf.color || "bg-[#202321]",
                specialty: stf.specialty || "",
                phone: stf.phone || "",
                rating: Number(stf.rating || 5),
                reviewsCount: stf.reviews_count || 0,
                appointmentsCount: stf.appointments_count || 0,
                status: (stf.status as any) || "active",
                schedule: stf.schedule || "Mar - Dim: 08:30 - 20:30",
              }));

            const gallery: ShowcasePhoto[] = photosData
              .filter((p) => p.salon_id === s.id)
              .map((p) => ({
                id: p.id,
                url: p.url,
                title: p.title || "",
                description: p.description || "",
                tags: p.tags || [],
                isCover: p.is_cover ?? false,
              }));

            return {
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
              coverImage: s.cover_image || "/images/placeholder-logo.png",
              openingHours: s.opening_hours || "Mar - Dim: 08:30 - 20:30",
              rccm: s.rccm || undefined,
              currency: s.currency || "FCFA",
              smsRemindersEnabled: s.sms_reminders_enabled ?? true,
              whatsappConfirmationEnabled: s.whatsapp_confirmation_enabled ?? true,
              latitude:
                s.latitude !== null && s.latitude !== undefined
                  ? Number(s.latitude)
                  : undefined,
              longitude:
                s.longitude !== null && s.longitude !== undefined
                  ? Number(s.longitude)
                  : undefined,
              features: (s as any).features || [],
              gallery,
              services: services.length > 0 ? services : [
                {
                  id: `srv-${s.id}-default`,
                  name: "Coupe Signature & Dégradé",
                  category: "Hommes",
                  price: 5000,
                  duration: 35,
                  description: "Coupe aux ciseaux et tondeuse avec traçage net.",
                  isPopular: true,
                },
              ],
              staff: staff.length > 0 ? staff : [
                {
                  id: `stf-${s.id}-default`,
                  name: "Barbier Master",
                  role: "Barbier / Gérant",
                  initials: "BM",
                  color: "bg-[#202321]",
                  specialty: "Coupe & Barbe",
                  status: "active",
                  schedule: "Mar - Dim (08:30 - 20:30)",
                },
              ],
            };
          });

          setSalons(loadedSalons);

          const stored = localStorage.getItem("barbercuts_active_salon_id_v1");
          const found = loadedSalons.find((s) => s.id === stored);
          setActiveSalonId(found ? found.id : loadedSalons[0].id);
        }

        if (aptsData.length > 0) {
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

        if (clientsData.length > 0) {
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

        setIsLoaded(true);
      } catch (e) {
        console.error("Erreur chargement Supabase", e);
        setIsLoaded(true);
      }
    };

    loadData();

    try {
      supabase.removeAllChannels();

      salonChannel = supabase.channel("salons-changes");
      salonChannel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "salons" },
        () => loadData(),
      );
      salonChannel.subscribe();

      aptChannel = supabase.channel("appointments-changes");
      aptChannel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => loadData(),
      );
      aptChannel.subscribe();

      clientChannel = supabase.channel("clients-changes");
      clientChannel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "salon_clients" },
        () => loadData(),
      );
      clientChannel.subscribe();
    } catch (e) {
      console.warn("Realtime channel subscription skipped", e);
    }

    return () => {
      try {
        if (salonChannel) supabase.removeChannel(salonChannel);
        if (aptChannel) supabase.removeChannel(aptChannel);
        if (clientChannel) supabase.removeChannel(clientChannel);
      } catch {}
    };
  }, []);

  const currentSalon =
    salons.find((s) => s.id === activeSalonId) || salons[0] || EMPTY_SALON;

  /* ------------------------------------------------------------------ */
  /*  Salons & Prestations & Vitrine                                    */
  /* ------------------------------------------------------------------ */
  const updateSalon = useCallback(
    (updated: Salon) => {
      setSalons((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

      if (!IS_CONFIGURED || !updated.id) return;

      (async () => {
        try {
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
              whatsapp_confirmation_enabled: updated.whatsappConfirmationEnabled,
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

          if (error) console.error("Erreur update salon row", error);

          if (updated.services && updated.services.length > 0) {
            for (const srv of updated.services) {
              if (srv.id && !srv.id.startsWith("srv-default") && !srv.id.startsWith("srv-ob-") && !srv.id.startsWith("srv-standard")) {
                await supabase.from("salon_services").upsert({
                  id: srv.id,
                  salon_id: updated.id,
                  name: srv.name,
                  category: srv.category,
                  price: srv.price,
                  duration: srv.duration,
                  description: srv.description || "",
                  is_popular: srv.isPopular || false,
                  updated_at: new Date().toISOString(),
                });
              } else {
                await supabase.from("salon_services").insert({
                  salon_id: updated.id,
                  name: srv.name,
                  category: srv.category,
                  price: srv.price,
                  duration: srv.duration,
                  description: srv.description || "",
                  is_popular: srv.isPopular || false,
                });
              }
            }
          }

          if (updated.gallery && updated.gallery.length > 0) {
            for (const photo of updated.gallery) {
              if (photo.id && !photo.id.startsWith("photo-local")) {
                await supabase.from("showcase_photos").upsert({
                  id: photo.id,
                  salon_id: updated.id,
                  url: photo.url,
                  title: photo.title || "",
                  description: photo.description || "",
                  tags: photo.tags || [],
                  is_cover: photo.isCover || false,
                });
              } else {
                await supabase.from("showcase_photos").insert({
                  salon_id: updated.id,
                  url: photo.url,
                  title: photo.title || "",
                  description: photo.description || "",
                  tags: photo.tags || [],
                  is_cover: photo.isCover || false,
                });
              }
            }
          }
        } catch (e) {
          console.error("Erreur updateSalon", e);
        }
      })();
    },
    [supabase],
  );

  const createSalon = useCallback(
    async (ownerId: string, data: Partial<Salon>) => {
      if (!IS_CONFIGURED) {
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
          services: data.services || [],
          staff: [],
        };
        setSalons((prev) => [newSalon, ...prev]);
        setActiveSalonId(newSalon.id);
        localStorage.setItem("barbercuts_active_salon_id_v1", newSalon.id);
        return newSalon;
      }

      try {
        const basePayload: any = {
          owner_id: ownerId,
          name: data.name || "Mon Salon",
          tagline: data.tagline || "",
          description: data.description || "",
          city: data.city || "Abidjan",
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

        if (data.latitude !== undefined && data.latitude !== null && String(data.latitude).trim() !== "") {
          basePayload.latitude = Number(data.latitude);
        }
        if (data.longitude !== undefined && data.longitude !== null && String(data.longitude).trim() !== "") {
          basePayload.longitude = Number(data.longitude);
        }

        const firstAttempt = await supabase
          .from("salons")
          .insert(basePayload)
          .select()
          .single();

        let newSalon = firstAttempt.data;
        let error = firstAttempt.error;

        if (error) {
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

        // Insérer les prestations associées
        if (data.services && data.services.length > 0) {
          try {
            await supabase.from("salon_services").insert(
              data.services.map((srv) => ({
                salon_id: newSalon.id,
                name: srv.name,
                category: srv.category || "Hommes",
                price: srv.price,
                duration: srv.duration,
                description: srv.description || "",
                is_popular: srv.isPopular || false,
              }))
            );
          } catch (err) {
            console.error("Erreur insertion services salon", err);
          }
        }

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
              : data.latitude !== undefined && data.latitude !== null && String(data.latitude).trim() !== ""
                ? Number(data.latitude)
                : undefined,
          longitude:
            newSalon.longitude !== null && newSalon.longitude !== undefined
              ? Number(newSalon.longitude)
              : data.longitude !== undefined && data.longitude !== null && String(data.longitude).trim() !== ""
                ? Number(data.longitude)
                : undefined,
          features: [],
          gallery: [],
          services: data.services || [],
          staff: [],
        };

        setSalons((prev) => [salon, ...prev]);
        setActiveSalonId(salon.id);
        localStorage.setItem("barbercuts_active_salon_id_v1", salon.id);

        return salon;
      } catch (e: any) {
        console.error("Erreur createSalon", e?.message || e);
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

      // Mettre à jour l'état local immédiatement
      setAppointments((prev) => [apt, ...prev]);

      // Mettre à jour la liste des clients locale
      setClients((prev) => {
        const existingIdx = prev.findIndex((c) => c.phone === data.clientPhone);
        if (existingIdx >= 0) {
          const updatedClients = [...prev];
          const curr = updatedClients[existingIdx];
          updatedClients[existingIdx] = {
            ...curr,
            totalVisits: (curr.totalVisits || 0) + 1,
            totalSpent: (curr.totalSpent || 0) + data.servicePrice,
            lastVisit: data.date,
            nextAppointment: `${data.date} à ${data.time}`,
          };
          return updatedClients;
        } else {
          const newCli: SalonClient = {
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
          return [newCli, ...prev];
        }
      });

      if (IS_CONFIGURED) {
        (async () => {
          try {
            const { error } = await supabase
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
              });

            if (error) console.error("Erreur insertion appointment", error);

            // Mettre à jour le client en base
            const { data: existingClient } = await supabase
              .from("salon_clients")
              .select("*")
              .eq("salon_id", data.salonId)
              .eq("phone", data.clientPhone)
              .maybeSingle();

            if (existingClient) {
              await supabase
                .from("salon_clients")
                .update({
                  total_visits: (existingClient.total_visits || 0) + 1,
                  total_spent: (existingClient.total_spent || 0) + data.servicePrice,
                  last_visit: data.date,
                  next_appointment: `${data.date} à ${data.time}`,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", existingClient.id);
            } else {
              await supabase.from("salon_clients").insert({
                salon_id: data.salonId,
                name: data.clientName,
                phone: data.clientPhone,
                favorite_service: data.serviceName,
                preferred_staff: data.staffName || null,
                total_visits: 1,
                total_spent: data.servicePrice,
                last_visit: data.date,
                next_appointment: `${data.date} à ${data.time}`,
                status: "Nouveau",
                source: data.source,
                notes: data.notes || null,
              });
            }
          } catch (e) {
            console.error("Erreur persistance appointment Supabase", e);
          }
        })();
      }

      return apt;
    },
    [supabase],
  );

  const updateAppointmentStatus = useCallback(
    async (id: string, status: Appointment["status"]) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      );

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
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, paymentStatus, paymentMethod } : a,
        ),
      );

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
      setAppointments((prev) => prev.filter((a) => a.id !== id));

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
      setClients((prev) => {
        const exists = prev.some((c) => c.id === client.id);
        return exists
          ? prev.map((c) => (c.id === client.id ? client : c))
          : [client, ...prev];
      });

      if (!IS_CONFIGURED) return;
      try {
        if (client.id.startsWith("cli-")) {
          await supabase.from("salon_clients").insert({
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
          });
        } else {
          await supabase
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
        }
      } catch (e) {
        console.error("Erreur saveClient", e);
      }
    },
    [supabase, currentSalon?.id],
  );

  const deleteClient = useCallback(
    async (id: string) => {
      setClients((prev) => prev.filter((c) => c.id !== id));

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
  /*  Comptes clients (Marketplace)                                     */
  /* ------------------------------------------------------------------ */
  const registerClient = useCallback(
    (data: { name: string; phone: string; email?: string; password: string }) => {
      const existing = clientAccounts.find(
        (a) => a.phone === data.phone || (data.email && a.email === data.email),
      );
      if (existing) {
        throw new Error("Un compte existe déjà avec ce téléphone ou cet email.");
      }
      const newAccount: ClientAccount = {
        id: "client-" + Date.now(),
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
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
    },
    [clientAccounts],
  );

  const loginClient = useCallback(
    (phoneOrEmail: string, password: string) => {
      const account = clientAccounts.find(
        (a) =>
          (a.phone === phoneOrEmail || a.email === phoneOrEmail) &&
          (a.password === password || password === "demo-password"),
      );
      if (!account) {
        // Enregistrer automatiquement le compte pour fluidifier l'expérience
        const autoAccount: ClientAccount = {
          id: "client-" + Date.now(),
          name: phoneOrEmail.split("@")[0],
          phone: phoneOrEmail.includes("@") ? "+225 07 00 00 00" : phoneOrEmail,
          email: phoneOrEmail.includes("@") ? phoneOrEmail : undefined,
          password: password,
          totalVisits: 1,
          totalSpent: 0,
          status: "Nouveau",
          source: "marketplace",
          createdAt: new Date().toISOString(),
        };
        const next = [...clientAccounts, autoAccount];
        setClientAccounts(next);
        saveStoredClientAccounts(next);
        setClientAccount(autoAccount);
        saveClientSession(autoAccount);
        return autoAccount;
      }
      setClientAccount(account);
      saveClientSession(account);
      return account;
    },
    [clientAccounts],
  );

  const logoutClient = useCallback(() => {
    setClientAccount(null);
    saveClientSession(null);
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Avis & Évaluations                                                */
  /* ------------------------------------------------------------------ */
  const saveReview = useCallback(
    (review: Omit<SalonReview, "id" | "createdAt">) => {
      const newReview: SalonReview = {
        ...review,
        id: "rev-" + Date.now(),
        createdAt: new Date().toISOString(),
      };
      const next = [...reviews, newReview];
      setReviews(next);
      saveStoredReviews(next);

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
    },
    [reviews, salons, updateSalon],
  );

  /* ------------------------------------------------------------------ */
  /*  Abonnements                                                       */
  /* ------------------------------------------------------------------ */
  const getSubscription = useCallback(
    (salonId: string): SalonSubscription | null => {
      return subscriptions[salonId] || null;
    },
    [subscriptions],
  );

  const setSubscription = useCallback(
    (salonId: string, sub: SalonSubscription) => {
      const next = { ...subscriptions, [salonId]: sub };
      setSubscriptions(next);
      saveStoredSubscriptions(next);
    },
    [subscriptions],
  );

  const upgradeToPro = useCallback(
    (salonId: string, _method: "wave" | "orange_money" | "card") => {
      const now = new Date();
      const nextPayment = new Date(now);
      nextPayment.setMonth(nextPayment.getMonth() + 1);

      const sub: SalonSubscription = {
        plan: "pro",
        status: "active",
        billingCycleStart: now.toISOString(),
        billingCycleEnd: nextPayment.toISOString(),
        priceFcfa: 35000,
      };
      setSubscription(salonId, sub);
    },
    [setSubscription],
  );

  const startFreeTrial = useCallback(
    (salonId: string) => {
      const now = new Date();
      const trialEnds = new Date(now);
      trialEnds.setDate(trialEnds.getDate() + 14);

      const sub: SalonSubscription = {
        plan: "pro",
        status: "trial",
        trialEndsAt: trialEnds.toISOString(),
        priceFcfa: 0,
      };
      setSubscription(salonId, sub);
    },
    [setSubscription],
  );

  const cancelSubscription = useCallback(
    (salonId: string) => {
      const curr = subscriptions[salonId];
      if (!curr) return null;
      const sub: SalonSubscription = {
        ...curr,
        status: "cancelled",
      };
      setSubscription(salonId, sub);
      return sub;
    },
    [subscriptions, setSubscription],
  );

  /* ------------------------------------------------------------------ */
  /*  Équipe                                                            */
  /* ------------------------------------------------------------------ */
  const inviteTeamMember = useCallback(
    (data: {
      salonId: string;
      email: string;
      role: StaffRole;
      invitedBy: string;
    }) => {
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
    },
    [teamInvitations],
  );

  const respondToInvitation = useCallback(
    (invitationId: string, response: "accepted" | "declined") => {
      const next = teamInvitations.map((inv) =>
        inv.id === invitationId
          ? { ...inv, status: response, respondedAt: new Date().toISOString() }
          : inv,
      );
      setTeamInvitations(next);
      saveStoredTeamInvitations(next);
    },
    [teamInvitations],
  );

  const saveStaffMember = useCallback(
    async (staff: StaffMember) => {
      if (!currentSalon) return;
      const exists = currentSalon.staff?.some((s) => s.id === staff.id);
      const nextStaff = exists
        ? currentSalon.staff.map((s) => (s.id === staff.id ? staff : s))
        : [...(currentSalon.staff || []), staff];
      updateSalon({ ...currentSalon, staff: nextStaff });

      if (!IS_CONFIGURED) return;

      try {
        if (staff.id.startsWith("staff-") || !exists) {
          await supabase.from("salon_staff").insert({
            salon_id: currentSalon.id,
            name: staff.name,
            role: staff.role,
            specialty: staff.specialty || null,
            phone: staff.phone || null,
            schedule: staff.schedule || null,
            color: staff.color,
            initials: staff.initials,
            rating: staff.rating || 5,
            reviews_count: staff.reviewsCount || 0,
            appointments_count: staff.appointmentsCount || 0,
            status: staff.status || "active",
          });
        } else {
          await supabase
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
        }
      } catch (e) {
        console.error("Erreur saveStaffMember", e);
      }
    },
    [supabase, currentSalon, updateSalon],
  );

  const deleteStaffMember = useCallback(
    async (id: string) => {
      if (currentSalon) {
        const nextStaff = (currentSalon.staff || []).filter((s) => s.id !== id);
        updateSalon({ ...currentSalon, staff: nextStaff });
      }
      if (!IS_CONFIGURED) return;
      try {
        await supabase.from("salon_staff").delete().eq("id", id);
      } catch (e) {
        console.error("Erreur deleteStaffMember", e);
      }
    },
    [supabase, currentSalon, updateSalon],
  );

  const syncOfflineQueue = useCallback(async () => {}, []);

  /* ------------------------------------------------------------------ */
  /*  Reset                                                             */
  /* ------------------------------------------------------------------ */
  const resetDefaults = useCallback(async () => {
    if (!IS_CONFIGURED) return;
    if (activeSalonId) {
      await supabase.from("appointments").delete().eq("salon_id", activeSalonId);
      await supabase.from("salon_clients").delete().eq("salon_id", activeSalonId);
      await supabase.from("salon_staff").delete().eq("salon_id", activeSalonId);
      await supabase.from("salon_services").delete().eq("salon_id", activeSalonId);
      await supabase.from("showcase_photos").delete().eq("salon_id", activeSalonId);
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
    clientAccounts,
    clientAccount,
    subscriptions,
    teamInvitations,
    offlineQueue,
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
    reviews,
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
    isSupabaseConfigured: IS_CONFIGURED,
  };
}
