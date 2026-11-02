"use client";

import type { SalonService, ShowcasePhoto } from "@/lib/types";
import {
  IS_CONFIGURED,
  SIGNATURE_PREFIX,
  isPersistedId,
  signature,
  unwrap,
} from "@/lib/supabase-client";
import {
  photoPayload,
  servicePayload,
} from "@/lib/supabase-mappers";
import type { SupabaseClient } from "@/lib/use-salon-data";

/** Ligne minimale retournée par les requêtes d'alignement (id + champ de dédup). */
type SyncRow = { id: string; [column: string]: unknown };

interface CollectionSyncConfig<TModel, TName extends string> {
  /** Nom de la table PostgREST. */
  table: string;
  /** Colonne lue en plus de `id` pour la détection de doublons. */
  duplicateColumn: TName;
  /** Préfixe des clés de signature (`service:` / `photo:`). */
  prefix: (typeof SIGNATURE_PREFIX)[keyof typeof SIGNATURE_PREFIX];
  /** Payload stocké en base à partir du modèle applicatif. */
  toPayload: (model: TModel) => Record<string, unknown>;
  /** Champ « titre/nom » côté modèle, pour comparer aux lignes existantes. */
  modelDuplicateKey: (model: TModel) => string;
  /** Identifiant du modèle. */
  modelId: (model: TModel) => string;
}

/**
 * Aligne une table enfant du salon sur le tableau fourni par l'UI :
 * mise à jour des lignes existantes, insertion des nouvelles,
 * suppression des disparues. Les écritures inchangées sont ignorées
 * grâce aux signatures chargées par le rechargement temps réel.
 *
 * Facteur commun de `syncSalonServices` et `syncSalonPhotos`, qui n'étaient
 * que des copies quasi conformes l'une de l'autre.
 */
async function syncCollection<TModel, TName extends string>(
  supabase: SupabaseClient,
  salonId: string,
  items: TModel[],
  config: CollectionSyncConfig<TModel, TName>,
  signaturesRef: React.MutableRefObject<Record<string, string>>,
): Promise<void> {
  if (!IS_CONFIGURED || !salonId) return;

  const { prefix, table, duplicateColumn } = config;

  try {
    const rows = await unwrap<TRow[]>(
      supabase
        .from(table)
        .select(`id, ${duplicateColumn}`)
        .eq("salon_id", salonId),
    );

    const stored = rows || [];
    const keptIds = new Set<string>();

    for (const item of items) {
      const payload = config.toPayload(item);
      const id = config.modelId(item);
      const isStored = isPersistedId(id) && stored.some((r) => r.id === id);

      if (isStored) {
        keptIds.add(id);
        const key = `${prefix}${id}`;
        // Écriture uniquement si le contenu a réellement changé.
        if (signaturesRef.current[key] === signature(payload)) continue;

        await unwrap(
          supabase
            .from(table)
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq("id", id),
        );
        signaturesRef.current[key] = signature(payload);
        continue;
      }

      // Identifiant local : éviter de dupliquer un enregistrement déjà écrit
      // avant le prochain rechargement temps réel.
      const duplicate = stored.find(
        (r) => String(r[duplicateColumn]) === config.modelDuplicateKey(item),
      );
      if (duplicate) {
        keptIds.add(duplicate.id);
        continue;
      }

      const inserted = await unwrap<{ id: string } | null>(
        supabase
          .from(table)
          .insert({ salon_id: salonId, ...payload })
          .select("id")
          .single(),
      );
      if (inserted?.id) {
        keptIds.add(inserted.id);
        signaturesRef.current[`${prefix}${inserted.id}`] = signature(payload);
      }
    }

    // Garde-fou : un tableau vide signifie « pas encore chargé » (ou état
    // initial), on ne supprime donc jamais toute la collection.
    if (items.length === 0) return;

    const removedIds = stored
      .filter((r) => !keptIds.has(r.id))
      .map((r) => r.id);
    if (removedIds.length > 0) {
      await unwrap(supabase.from(table).delete().in("id", removedIds));
      removedIds.forEach((id) => {
        delete signaturesRef.current[`${prefix}${id}`];
      });
    }
  } catch (e) {
    console.error(`Erreur synchronisation de \`${table}\``, e);
  }
}

/** Synchronise la table `salon_services` avec la carte de prestations du salon. */
export function syncSalonServices(
  supabase: SupabaseClient,
  salonId: string,
  services: SalonService[],
  signaturesRef: React.MutableRefObject<Record<string, string>>,
) {
  return syncCollection<SalonService, SyncRow>(
    supabase,
    salonId,
    services,
    {
      table: "salon_services",
      duplicateColumn: "name",
      prefix: SIGNATURE_PREFIX.service,
      toPayload: servicePayload,
      modelId: (s) => s.id,
      modelDuplicateKey: (s) => s.name,
    },
    signaturesRef,
  );
}

/** Synchronise la table `showcase_photos` avec la galerie vitrine du salon. */
export function syncSalonPhotos(
  supabase: SupabaseClient,
  salonId: string,
  photos: ShowcasePhoto[],
  signaturesRef: React.MutableRefObject<Record<string, string>>,
) {
  return syncCollection<ShowcasePhoto, SyncRow>(
    supabase,
    salonId,
    photos,
    {
      table: "showcase_photos",
      duplicateColumn: "title",
      prefix: SIGNATURE_PREFIX.photo,
      toPayload: photoPayload,
      modelId: (p) => p.id,
      modelDuplicateKey: (p) => p.title,
    },
    signaturesRef,
  );
}
