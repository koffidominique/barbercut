"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { PostgrestResponse, RealtimeChannel } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Supabase n'est utilisable que si les variables d'environnement sont renseignées. */
export const IS_CONFIGURED = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("your-"),
);

/**
 * L'API REST de Supabase est mal typée côté SDK : `error` est déclaré comme
 * pouvant valoir `void`, ce qui oblige chaque appelant à faire `if (error) throw error`
 * puis à ré-assigner des variables (`let error: any`). Ce helper normalise le
 * résultat en une promise qui lève directement l'erreur, et dont le générique
 * porte le type de `data`.
 */
export function unwrap<T>(
  promise: PromiseLike<{ data: T | null; error: unknown }>,
): Promise<T> {
  return Promise.resolve(promise).then(({ data, error }) => {
    if (error) throw error;
    return data as T;
  });
}

/** Variante pour les requêtes `.select()` paginables dont on veut la réponse complète. */
export function unwrapResponse<T>(
  promise: PromiseLike<PostgrestResponse<T>>,
): Promise<PostgrestResponse<T>> {
  return Promise.resolve(promise).then((res) => {
    if (res.error) throw res.error;
    return res;
  });
}

/**
 * Crée le client navigateur, ou retourne `null` si Supabase n'est pas configuré.
 * Les hooks du store traitent ensuite `null` comme « mode dégradé » (no-op).
 */
export function createSupabaseBrowserClient() {
  if (!IS_CONFIGURED || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/** Tables surveillées par l'abonnement temps réel du store. */
export const REALTIME_TABLES = [
  "salons",
  "appointments",
  "salon_clients",
  "salon_services",
  "salon_staff",
  "showcase_photos",
  // P2 — persistance base des collections autrefois locales.
  "salon_reviews",
  "salon_subscriptions",
  "team_invitations",
] as const;

/**
 * S'abonne aux changements postgres de toutes les tables suivies via un canal
 * unique, et déclenche `onChange` à chaque événement. Retourne le canal afin
 * que l'appelant puisse le détruire (cleanup d'effet).
 */
export function subscribeToContentChanges(
  supabase: NonNullable<ReturnType<typeof createSupabaseBrowserClient>>,
  onChange: () => void,
): RealtimeChannel {
  const channel = supabase.channel("barbercuts-content-changes");
  REALTIME_TABLES.forEach((table) => {
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table },
      onChange,
    );
  });
  channel.subscribe();
  return channel;
}

/** Un identifiant déjà enregistré en base est un UUID ; sinon c'est un identifiant local. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isPersistedId = (id: string) => UUID_RE.test(id);

/** Signature JSON servant à détecter les écritures réellement modificatives. */
export const signature = (value: unknown) => JSON.stringify(value);

/** Clés de préfixe des signatures stockées dans le store. */
export const SIGNATURE_PREFIX = {
  service: "service:",
  photo: "photo:",
} as const;
