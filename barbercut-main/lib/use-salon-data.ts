"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Appointment,
  Salon,
  SalonClient,
  SalonReview,
  SalonService,
  SalonSubscription,
  ShowcasePhoto,
  StaffMember,
  TeamInvitation,
} from "@/lib/types";
import { getStoredActiveSalonId, saveStoredActiveSalonId } from "@/lib/storage";
import {
  IS_CONFIGURED,
  REALTIME_TABLES,
  SIGNATURE_PREFIX,
  createSupabaseBrowserClient,
  signature,
  subscribeToContentChanges,
} from "@/lib/supabase-client";
import {
  mapAppointmentRow,
  mapClientRow,
  mapPhotoRow,
  mapReviewRow,
  mapSalonRow,
  mapServiceRow,
  mapStaffRow,
  mapSubscriptionRow,
  mapTeamInvitationRow,
  photoPayload,
  servicePayload,
} from "@/lib/supabase-mappers";

export type SupabaseClient = NonNullable<
  ReturnType<typeof createSupabaseBrowserClient>
>;

/** Lignes PostgREST groupées par `salon_id`. */
function groupBySalon<T extends { salon_id: string }>(rows: T[] | null) {
  const grouped: Record<string, T[]> = {};
  (rows || []).forEach((row) => {
    if (!grouped[row.salon_id]) grouped[row.salon_id] = [];
    grouped[row.salon_id].push(row);
  });
  return grouped;
}

export interface SalonDataState {
  supabase: SupabaseClient | null;
  salons: Salon[];
  setSalons: React.Dispatch<React.SetStateAction<Salon[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  clients: SalonClient[];
  setClients: React.Dispatch<React.SetStateAction<SalonClient[]>>;
  /** Avis du salon actif (P2 : persistés en base, plus en localStorage). */
  reviews: SalonReview[];
  /** Abonnement du salon actif (P2 : upserté dans `salon_subscriptions`). */
  subscription: SalonSubscription | null;
  /** Invitations émises par le salon actif (P2 : table `team_invitations`). */
  teamInvitations: TeamInvitation[];
  activeSalonId: string;
  setActiveSalonId: (id: string) => void;
  isLoaded: boolean;
  /** Signatures des lignes déjà en base — évite les écritures inchangées. */
  signaturesRef: React.MutableRefObject<Record<string, string>>;
  /** Relit toutes les collections depuis Supabase (temps réel / après écriture). */
  reload: () => void;
}

/**
 * Chargement initial et synchronisation temps réel des données du store
 * Supabase. Séparé du hook principal pour que celui-ci ne contienne plus
 * que les opérations d'écriture.
 */
export function useSalonData(): SalonDataState {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<SalonClient[]>([]);
  const [reviews, setReviews] = useState<SalonReview[]>([]);
  const [subscription, setSubscription] = useState<SalonSubscription | null>(null);
  const [teamInvitations, setTeamInvitations] = useState<TeamInvitation[]>([]);
  const [activeSalonId, setActiveSalonIdRaw] = useState<string>("");

  /** Changer de salon actif = changer de périmètre multi-tenant : on persiste
   *  le choix et on relit les données du nouveau salon. */
  const setActiveSalonId = useCallback((id: string) => {
    setActiveSalonIdRaw(id);
    saveStoredActiveSalonId(id);
  }, []);
  const [isLoaded, setIsLoaded] = useState(false);

  // Un seul client par montage : une nouvelle instance à chaque rendu relançait
  // l'effet de chargement en boucle (dépendance `supabase` instable).
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  /** Signatures des lignes déjà en base, pour ne pas réécrire des données inchangées. */
  const signaturesRef = useRef<Record<string, string>>({});

  const loadData = useCallback(async () => {
    if (!supabase) return;
    try {
      // Multi-tenant : le périmètre de travail est le salon actif.
      // Sans lui, on ne charge rien — les requêtes non filtrées retournaient
      // autrefois toutes les lignes visibles pour la session, y compris celles
      // d'autres salons en cas de mauvaise configuration RLS.
      const scopedSalonId = activeSalonId || getStoredActiveSalonId();
      if (!scopedSalonId) {
        setSalons([]);
        setAppointments([]);
        setClients([]);
        setReviews([]);
        setSubscription(null);
        setTeamInvitations([]);
        setIsLoaded(true);
        return;
      }

      const [
        { data: salonsData, error: salonsError },
        { data: aptsData },
        { data: clientsData },
        { data: servicesData },
        { data: staffData },
        { data: photosData },
        { data: reviewsData },
        { data: subscriptionData },
        { data: invitationsData },
      ] = await Promise.all([
        supabase
          .from("salons")
          .select("*")
          .eq("id", scopedSalonId)
          .maybeSingle(),
        supabase
          .from("appointments")
          .select("*")
          .eq("salon_id", scopedSalonId)
          .order("created_at", { ascending: false }),
        supabase
          .from("salon_clients")
          .select("*")
          .eq("salon_id", scopedSalonId)
          .order("created_at", { ascending: false }),
        supabase
          .from("salon_services")
          .select("*")
          .eq("salon_id", scopedSalonId)
          .order("created_at", { ascending: true }),
        supabase
          .from("salon_staff")
          .select("*")
          .eq("salon_id", scopedSalonId)
          .order("created_at", { ascending: true }),
        supabase
          .from("showcase_photos")
          .select("*")
          .eq("salon_id", scopedSalonId)
          .order("created_at", { ascending: true }),
        // P2 — collections jadis confinées au localStorage.
        supabase
          .from("salon_reviews")
          .select("*")
          .eq("salon_id", scopedSalonId)
          .order("created_at", { ascending: false }),
        supabase
          .from("salon_subscriptions")
          .select("*")
          .eq("salon_id", scopedSalonId)
          .maybeSingle(),
        supabase
          .from("team_invitations")
          .select("*")
          .eq("salon_id", scopedSalonId)
          .order("created_at", { ascending: false }),
      ]);

      if (salonsError) {
        console.error("Erreur chargement des salons", salonsError);
      }

      // Le salon demandé est invisible (supprimé, non publié, ou RLS) :
      // on retombe sur un salon possédé par la session, sinon aucun.
      let resolvedSalonRow: any = salonsData ?? null;
      if (!resolvedSalonRow) {
        const { data: fallback } = await supabase
          .from("salons")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        resolvedSalonRow = fallback ?? null;
        if (fallback) setActiveSalonId(fallback.id);
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
          nextSignatures[`${SIGNATURE_PREFIX.service}${mapped.id}`] = signature(
            servicePayload(mapped),
          );
        });
      Object.values(photosBySalon)
        .flat()
        .forEach((row) => {
          const mapped = mapPhotoRow(row);
          nextSignatures[`${SIGNATURE_PREFIX.photo}${mapped.id}`] = signature(
            photoPayload(mapped),
          );
        });
      signaturesRef.current = { ...signaturesRef.current, ...nextSignatures };

      if (resolvedSalonRow) {
        const scopedId = resolvedSalonRow.id;
        setSalons([
          mapSalonRow(resolvedSalonRow, {
            services: (servicesBySalon[scopedId] || []).map(mapServiceRow),
            staff: (staffBySalon[scopedId] || []).map(mapStaffRow),
            gallery: (photosBySalon[scopedId] || []).map(mapPhotoRow),
          }),
        ]);
        // Le salon résolu peut différer du salon demandé (repli) : on aligne
        // le périmètre multi-tenant sur la réalité de la base.
        if (scopedId !== activeSalonId) setActiveSalonId(scopedId);
      } else {
        setSalons([]);
      }

      if (aptsData) {
        setAppointments(aptsData.map(mapAppointmentRow));
      }

      if (clientsData) {
        setClients(clientsData.map(mapClientRow));
      }

      // P2 — les tables peuvent être absentes tant que la migration
      // 20240104 n'est pas appliquée : on dégrade silencieusement vers
      // des collections vides plutôt que de casser le chargement global.
      setReviews((reviewsData || []).map(mapReviewRow));
      setSubscription(subscriptionData ? mapSubscriptionRow(subscriptionData) : null);
      setTeamInvitations((invitationsData || []).map(mapTeamInvitationRow));

      setIsLoaded(true);
    } catch (e) {
      console.error("Erreur chargement Supabase", e);
      setIsLoaded(true);
    }
  }, [supabase, activeSalonId]);

  useEffect(() => {
    if (!IS_CONFIGURED || !supabase) {
      setIsLoaded(true);
      return;
    }

    loadData();

    // Abonnement temps réel : un seul canal pour toutes les tables.
    const channel = subscribeToContentChanges(supabase, loadData);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, loadData]);

  return {
    supabase,
    salons,
    setSalons,
    appointments,
    setAppointments,
    clients,
    setClients,
    reviews,
    subscription,
    teamInvitations,
    activeSalonId,
    setActiveSalonId,
    isLoaded,
    signaturesRef,
    reload: loadData,
  };
}
