"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Appointment,
  Salon,
  SalonClient,
  SalonService,
  ShowcasePhoto,
  StaffMember,
} from "@/lib/types";
import { getStoredActiveSalonId } from "@/lib/storage";
import {
  IS_CONFIGURED,
  SIGNATURE_PREFIX,
  createSupabaseBrowserClient,
  signature,
  subscribeToContentChanges,
} from "@/lib/supabase-client";
import {
  mapAppointmentRow,
  mapClientRow,
  mapPhotoRow,
  mapSalonRow,
  mapServiceRow,
  mapStaffRow,
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
  const [activeSalonId, setActiveSalonId] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Un seul client par montage : une nouvelle instance à chaque rendu relançait
  // l'effet de chargement en boucle (dépendance `supabase` instable).
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  /** Signatures des lignes déjà en base, pour ne pas réécrire des données inchangées. */
  const signaturesRef = useRef<Record<string, string>>({});

  const loadData = useCallback(async () => {
    if (!supabase) return;
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

      if (salonsData) {
        setSalons(
          salonsData.map((s) =>
            mapSalonRow(s, {
              services: (servicesBySalon[s.id] || []).map(mapServiceRow),
              staff: (staffBySalon[s.id] || []).map(mapStaffRow),
              gallery: (photosBySalon[s.id] || []).map(mapPhotoRow),
            }),
          ),
        );
      }

      if (aptsData) {
        setAppointments(aptsData.map(mapAppointmentRow));
      }

      if (clientsData) {
        setClients(clientsData.map(mapClientRow));
      }

      // Définir le salon actif (le premier ou celui stocké précédemment)
      if (salonsData && salonsData.length > 0) {
        const stored = getStoredActiveSalonId();
        const found = salonsData.find((s) => s.id === stored);
        setActiveSalonId(found ? found.id : salonsData[0].id);
      }

      setIsLoaded(true);
    } catch (e) {
      console.error("Erreur chargement Supabase", e);
      setIsLoaded(true);
    }
  }, [supabase]);

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
    activeSalonId,
    setActiveSalonId,
    isLoaded,
    signaturesRef,
    reload: loadData,
  };
}
