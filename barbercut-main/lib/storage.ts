/**
 * Persistance localStorage du mode hors-ligne.
 * Toutes les collections suivent le même gabarit (lecture JSON tolérante,
 * écriture + événement de synchronisation inter-composants) : une seule
 * fabrique remplace les ~20 fonctions get/save dupliquées.
 */

import type {
  Appointment,
  ClientAccount,
  OfflineAction,
  Salon,
  SalonClient,
  SalonReview,
  SalonSubscription,
  TeamInvitation,
} from "@/lib/types";

/** Clés de stockage, versionnées pour permettre une migration future. */
export const STORAGE_KEYS = {
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

/** Événement interne diffusé après chaque écriture, pour re-synchroniser les hooks. */
const STORAGE_UPDATE_EVENT = "barbercuts_storage_update";

const isBrowser = () => typeof window !== "undefined";

/**
 * Fabrique d'accès typés pour une collection du localStorage.
 * - la lecture retourne `fallback` si la clé est absente ou corrompue ;
 * - si `seedFallback` est vrai, la valeur de repli est réécrite en storage
 *   (comportement historique des collections « seedables ») ;
 * - chaque écriture diffuse `STORAGE_UPDATE_EVENT` pour notifier les autres
 *   instances du store (multi-onglets, composants multiples).
 */
function makeStore<T>(key: string, fallback: T, seedFallback = false) {
  return {
    load(): T {
      if (!isBrowser()) return fallback;
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) {
          if (seedFallback) localStorage.setItem(key, JSON.stringify(fallback));
          return fallback;
        }
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    },
    save(value: T) {
      if (!isBrowser()) return;
      try {
        localStorage.setItem(key, JSON.stringify(value));
        window.dispatchEvent(new Event(STORAGE_UPDATE_EVENT));
      } catch (e) {
        console.error(`Error saving ${key}`, e);
      }
    },
  };
}

// Plus de données seed codées en dur — l'application charge depuis Supabase ;
// ces collections ne servent qu'au mode dégradé localStorage.
export const salonsStorage = makeStore<Salon[]>(STORAGE_KEYS.SALONS, [], true);
export const appointmentsStorage = makeStore<Appointment[]>(
  STORAGE_KEYS.APPOINTMENTS,
  [],
  true,
);
export const clientsStorage = makeStore<SalonClient[]>(
  STORAGE_KEYS.CLIENTS,
  [],
  true,
);
export const reviewsStorage = makeStore<SalonReview[]>(
  STORAGE_KEYS.REVIEWS,
  [],
);
export const clientAccountsStorage = makeStore<ClientAccount[]>(
  STORAGE_KEYS.CLIENT_ACCOUNTS,
  [],
);
export const subscriptionsStorage = makeStore<
  Record<string, SalonSubscription>
>(STORAGE_KEYS.SUBSCRIPTIONS, {});
export const teamInvitationsStorage = makeStore<TeamInvitation[]>(
  STORAGE_KEYS.TEAM_INVITATIONS,
  [],
);
export const offlineQueueStorage = makeStore<OfflineAction[]>(
  STORAGE_KEYS.OFFLINE_QUEUE,
  [],
);

/** Identifiant du salon actif (utilisé aussi par le store Supabase). */
export function getStoredActiveSalonId(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_SALON_ID);
}

export function saveStoredActiveSalonId(id: string) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_SALON_ID, id);
}

/** Session client (null = déconnecté). */
export function getClientSession<T>(): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENT_SESSION);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveClientSession<T>(account: T | null) {
  if (!isBrowser()) return;
  try {
    if (account) {
      localStorage.setItem(STORAGE_KEYS.CLIENT_SESSION, JSON.stringify(account));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CLIENT_SESSION);
    }
    window.dispatchEvent(new Event(STORAGE_UPDATE_EVENT));
  } catch (e) {
    console.error("Error saving client session", e);
  }
}
