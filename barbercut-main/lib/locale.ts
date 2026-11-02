/**
 * Centralisation de la localisation (i18n/l10n).
 *
 * Objectif : supprimer les formats `toLocaleString("fr-FR")` / "FCFA" dupliqués
 * dans ~13 composants et rendre la devise + le fuseau configurables par salon
 * (multi-tenant), sans changer le rendu actuel pour un salon sénégalais standard.
 */

import type { Salon } from "./types";

/* ------------------------------------------------------------------ */
/*  Constantes                                                          */
/* ------------------------------------------------------------------ */

/** Langue par défaut de l'application (français). */
export const DEFAULT_LOCALE = "fr-FR";

/** Fuseau horaire des salons ouest-africains (UTC+1, sans changement d'heure). */
export const DEFAULT_TIME_ZONE = "Africa/Dakar";

/** Devise par défaut si le salon n'en déclare pas. */
export const DEFAULT_CURRENCY = "XOF";

/** Codes ISO acceptés → locale de formatage adaptée. */
const CURRENCY_LOCALES: Record<string, string> = {
  XOF: DEFAULT_LOCALE, // Franc CFA (Afrique de l'Ouest)
  XAF: DEFAULT_LOCALE, // Franc CFA (Afrique centrale)
  EUR: "fr-FR",
  USD: "en-US",
  GBP: "en-GB",
  MAD: "fr-MA",
};

/** Symboles explicites pour les devises dont Intl n'affiche pas un libellé clair. */
const CURRENCY_SYMBOLS: Record<string, string> = {
  XOF: "FCFA",
  XAF: "FCFA",
};

/* ------------------------------------------------------------------ */
/*  Résolution du contexte depuis le salon                              */
/* ------------------------------------------------------------------ */

export interface LocaleContext {
  locale: string;
  /** Code ISO 4217 (ex. "XOF") ou symbole/texte libre hérité (ex. "FCFA"). */
  currency: string;
  timeZone: string;
}

/**
 * Normalise la devise stockée en salon : l'app stockait historiquement le
 * texte "FCFA" ; on le mappe vers le code ISO "XOF" pour Intl.NumberFormat.
 */
function normalizeCurrency(raw?: string | null): string {
  if (!raw) return DEFAULT_CURRENCY;
  const value = raw.trim().toUpperCase();
  if (value === "FCFA" || value === "CFA") return "XOF";
  return value;
}

/** Valide un identifiant de fuseau IANA ; repli sûr sinon. */
function safeTimeZone(tz?: string | null): string {
  if (!tz) return DEFAULT_TIME_ZONE;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: tz });
    return tz;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

type SalonLocaleFields = Pick<Salon, "currency"> & Partial<Pick<Salon, "timezone">>;

/** Construit le contexte de localisation d'un salon (défauts sûrs si absent). */
export function getSalonLocale(salon?: SalonLocaleFields | null): LocaleContext {
  const currency = normalizeCurrency(salon?.currency);
  return {
    locale: CURRENCY_LOCALES[currency] ?? DEFAULT_LOCALE,
    currency,
    timeZone: safeTimeZone(salon?.timezone),
  };
}

/* ------------------------------------------------------------------ */
/*  Formatage nombres / devises                                         */
/* ------------------------------------------------------------------ */

const numberFormatters = new Map<string, Intl.NumberFormat>();

function numberFormatter(locale: string): Intl.NumberFormat {
  let fmt = numberFormatters.get(locale);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale);
    numberFormatters.set(locale, fmt);
  }
  return fmt;
}

/** Nombre formaté dans la locale donnée (remplace `.toLocaleString('fr-FR')`). */
export function formatNumber(value: number, locale: string = DEFAULT_LOCALE): string {
  return numberFormatter(locale).format(value);
}

/**
 * Prix formaté avec la devise du salon : `12 000 FCFA`, `12,50 €`, `$9.99`…
 * Les devises sans symbole Unicode dédié (XOF/XAF) sont rendues avec le
 * libellé custom "FCFA" ; toute autre devise passe par Intl.NumberFormat.
 */
export function formatPrice(value: number, salon?: SalonLocaleFields | null): string {
  const { locale, currency } = getSalonLocale(salon);
  const symbol = CURRENCY_SYMBOLS[currency];
  if (symbol) {
    // Ex. "12 000 FCFA" (espace insécable fine selon la locale).
    return `${formatNumber(value, locale)} ${symbol}`;
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Devise inconnue (texte libre stocké historiquement) : suffixe brut.
    return `${formatNumber(value, locale)} ${currency}`;
  }
}

/* ------------------------------------------------------------------ */
/*  Formatage dates / heures                                            */
/* ------------------------------------------------------------------ */

/** Date longue : "jeudi 5 novembre 2026". */
export function formatDate(date: string | Date, ctx: Partial<LocaleContext> = {}): string {
  const d = typeof date === "string" ? parseLocalDate(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(ctx.locale ?? DEFAULT_LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: ctx.timeZone,
  });
}

/** Date courte : "05/11/2026". */
export function formatShortDate(date: string | Date, ctx: Partial<LocaleContext> = {}): string {
  const d = typeof date === "string" ? parseLocalDate(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(ctx.locale ?? DEFAULT_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: ctx.timeZone,
  });
}

/** Heure : "14:30". */
export function formatTime(date: string | Date, ctx: Partial<LocaleContext> = {}): string {
  const d = typeof date === "string" ? parseLocalDate(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(ctx.locale ?? DEFAULT_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ctx.timeZone,
  });
}

/** Date + heure : "05/11/2026 14:30". */
export function formatDateTime(date: string | Date, ctx: Partial<LocaleContext> = {}): string {
  return `${formatShortDate(date, ctx)} ${formatTime(date, ctx)}`;
}

/**
 * Parse une chaîne de réservation. Les créneaux sont stockés comme
 * "YYYY-MM-DD" (+ heure locale séparée) : on les interprète TOUJOURS dans le
 * fuseau du salon (jamais UTC), ce qui évite tout décalage d'un jour pour les
 * salons hors Europe.
 */
export function parseLocalDate(value: string, timeZone: string = DEFAULT_TIME_ZONE): Date {
  // ISO complète (avec T et Z/offset) : déjà une instantanée, on fait confiance.
  if (/T\d{2}:\d{2}/.test(value)) return new Date(value);
  const withZone = value.length === 10 ? `${value}T00:00` : value; // ajoute l'heure manquante
  // Astuce Intl : formatter la date cible dans le fuseau puis reconstruire.
  const parts = isoParts(new Date(`${withZone}Z`), timeZone);
  return new Date(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00`);
}

function isoParts(date: Date, timeZone: string): Record<string, string> {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const out: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) out[part.type] = part.value;
  return out;
}

/** "Il y a N jours" / "Dans N jours" — remplace les calculs bruts de `ERPSubscriptionView`. */
export function formatRelativeDays(days: number, locale: string = DEFAULT_LOCALE): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  return rtf.format(Math.round(days), "day");
}
