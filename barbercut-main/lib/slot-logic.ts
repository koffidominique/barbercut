/**
 * Logique de créneaux — source unique de vérité pour la réservation.
 *
 * Remplace l'ancienne liste figée de 12 horaires identiques pour tous
 * les salons par une génération basée sur :
 *   - les horaires d'ouverture du salon (champ `openingHours`, format "09:00-19:00") ;
 *   - la durée réelle de la prestation sélectionnée (`SalonService.duration`) ;
 *   - un pas de planification fixe (SLOT_INTERVAL_MINUTES) ;
 *   - une marge minimale avant le début du rendez-vous (réservation anticipée) ;
 *   - les rendez-vous déjà pris pour le même membre du staff (détection de conflit).
 *
 * Fonctions pures, sans dépendance React ni Supabase : testables unitairement.
 */

import type { Appointment, Salon, SalonService } from "./types";

/** Pas de planification entre deux créneaux consécutifs (minutes). */
export const SLOT_INTERVAL_MINUTES = 30;

/** Durée par défaut d'une prestation si `duration` est absente ou invalide (minutes). */
export const DEFAULT_SERVICE_DURATION_MINUTES = 45;

/** Marge minimale entre maintenant et le début d'un créneau (réservation anticipée, minutes). */
export const MIN_LEAD_TIME_MINUTES = 60;

/** Statuts qui bloquent un créneau (un rendez-vous annulé libère son créneau). */
const BLOCKING_STATUSES: ReadonlySet<Appointment["status"]> = new Set([
  "confirmed",
  "pending",
]);

/* ------------------------------------------------------------------ */
/*  Helpers temps                                                      */
/* ------------------------------------------------------------------ */

/** Convertit "HH:MM" en minutes depuis minuit. Retourne null si invalide. */
export function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Convertit des minutes depuis minuit en "HH:MM". */
export function minutesToTime(minutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutes)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Extrait [ouverture, fermeture] en minutes depuis "09:00-19:00". Valeurs par défaut si invalide. */
export function parseOpeningWindow(openingHours: string | undefined): [number, number] {
  const FALLBACK: [number, number] = [
    parseTimeToMinutes("09:00")!,
    parseTimeToMinutes("19:00")!,
  ];
  if (!openingHours) return FALLBACK;
  // Dernier couple "HH:MM - HH:MM" de la chaîne : tolère les préfixes de jours
  // ("Mar - Dim: 08:30 - 20:30") où le tiret relierait sinon deux horaires non bornes.
  const matches = [...openingHours.matchAll(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/g)];
  if (matches.length === 0) return FALLBACK;
  const match = matches[matches.length - 1];
  const open = parseTimeToMinutes(match[1]);
  const close = parseTimeToMinutes(match[2]);
  if (open === null || close === null || close <= open) return FALLBACK;
  return [open, close];
}

/** Date locale "YYYY-MM-DD" (jamais UTC : évite le décalage d'un jour hors Europe/Afrique de l'Ouest). */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Prochaine date de réservation ("aujourd'hui"), calculée en local — remplace la date figée 2026-11-02. */
export function todayDate(): string {
  return toLocalDateString(new Date());
}

/** Les N prochains jours ouvrables de réservation, à partir d'aujourd'hui (local). */
export function upcomingBookingDays(count = 7, now = new Date()): Array<{ value: string; label: string }> {
  const days: Array<{ value: string; label: string }> = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const label = d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    days.push({
      value: toLocalDateString(d),
      label: i === 0 ? `Aujourd'hui (${capitalize(label)})` : capitalize(label),
    });
  }
  return days;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* ------------------------------------------------------------------ */
/*  Conflits                                                           */
/* ------------------------------------------------------------------ */

/** Deux intervalles [début, fin) en minutes se chevauchent-ils ? */
export function intervalsOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && startB < endA;
}

/** Rendez-vous non annulés d'un staff donné, pour une date donnée. */
export function appointmentsForStaffOnDate(
  appointments: readonly Appointment[],
  salonId: string,
  staffName: string,
  date: string,
): Appointment[] {
  return appointments.filter(
    (apt) =>
      apt.salonId === salonId &&
      apt.staffName === staffName &&
      apt.date === date &&
      BLOCKING_STATUSES.has(apt.status),
  );
}

/**
 * Le créneau demandé est-il libre ?
 * Compare la plage [time, time + durée de la prestation) aux plages
 * des rendez-vous existants du même membre du staff ce jour-là.
 */
export function isSlotAvailable(
  appointments: readonly Appointment[],
  salon: Pick<Salon, "id" | "services">,
  staffName: string,
  date: string,
  time: string,
  durationMinutes: number,
): boolean {
  const start = parseTimeToMinutes(time);
  if (start === null) return false;
  const end = start + normalizeDuration(durationMinutes);
  const existing = appointmentsForStaffOnDate(appointments, salon.id, staffName, date);
  return !existing.some((apt) => {
    const exStart = parseTimeToMinutes(apt.time);
    if (exStart === null) return false;
    return intervalsOverlap(start, end, exStart, exStart + aptDuration(apt, salon));
  });
}

/**
 * Durée estimée d'un rendez-vous existant (via le catalogue du salon si possible).
 * À défaut, une réservation « Premier disponible » sans prestation reconnue occupe
 * au minimum un pas de planification — jamais zéro (sinon le créneau ne bloquerait rien).
 */
function aptDuration(apt: Appointment, salon: Pick<Salon, "services"> & Partial<Salon>): number {
  const service = salon.services?.find((s) => s.id === apt.serviceId || s.name === apt.serviceName);
  return service ? Math.max(SLOT_INTERVAL_MINUTES, normalizeDuration(service.duration)) : SLOT_INTERVAL_MINUTES;
}

function normalizeDuration(duration: number | undefined): number {
  if (typeof duration !== "number" || !Number.isFinite(duration) || duration <= 0) {
    return DEFAULT_SERVICE_DURATION_MINUTES;
  }
  return Math.round(duration);
}

/* ------------------------------------------------------------------ */
/*  Génération des créneaux                                            */
/* ------------------------------------------------------------------ */

export interface SlotInfo {
  /** Heure "HH:MM". */
  time: string;
  /** Créneau réservable (dans les horaires, assez long pour la prestation, sans conflit, marge respectée). */
  available: boolean;
  /** Motif d'indisponibilité, affiché en priorité sur les autres raisons. */
  reason?: "conflict" | "outside_hours" | "too_late" | "past";
}

/**
 * Génère la grille de créneaux pour un salon, une date, un staff et une
 * prestation donnés. Pure fonction : ne dépend que des données passées en paramètre.
 */
export function generateDaySlots(params: {
  salon: Salon;
  service: Pick<SalonService, "duration"> | undefined;
  staffName: string;
  date: string;
  appointments: readonly Appointment[];
  /** Référence temporelle injectable pour les tests. */
  now?: Date;
}): SlotInfo[] {
  const { salon, service, staffName, date, appointments } = params;
  const now = params.now ?? new Date();

  const [open, close] = parseOpeningWindow(salon.openingHours);
  const duration = normalizeDuration(service?.duration);
  const booked = appointmentsForStaffOnDate(appointments, salon.id, staffName, date);

  const slots: SlotInfo[] = [];
  for (let start = open; start + duration <= close; start += SLOT_INTERVAL_MINUTES) {
    const end = start + duration;
    const conflict = booked.some((apt) => {
      const exStart = parseTimeToMinutes(apt.time);
      if (exStart === null) return false;
      return intervalsOverlap(start, end, exStart, exStart + aptDuration(apt, salon));
    });

    let reason: SlotInfo["reason"];
    if (conflict) {
      reason = "conflict";
    } else if (isSameDay(now, date) && start < minutesOfDay(now) + MIN_LEAD_TIME_MINUTES) {
      reason = "past";
    }

    slots.push({ time: minutesToTime(start), available: !reason, reason });
  }

  return slots;
}

/** La date "YYYY-MM-DD" correspond-elle au jour local de `now` ? */
function isSameDay(now: Date, date: string): boolean {
  return toLocalDateString(now) === date;
}

/** Minutes depuis minuit locales de `now`. */
function minutesOfDay(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

/* ------------------------------------------------------------------ */
/*  API haute niveau utilisée par l'UI de réservation                   */
/* ------------------------------------------------------------------ */

/** Créneaux réservables uniquement (grille filtrée sur `available`). */
export function getAvailableSlots(params: Parameters<typeof generateDaySlots>[0]): string[] {
  return generateDaySlots(params)
    .filter((slot) => slot.available)
    .map((slot) => slot.time);
}

/** Staff proposé dans le menu de réservation : chaque membre + option libre. */
export interface BookingStaffOption {
  name: string;
  label: string;
  /** Nombre de créneaux libres aujourd'hui (aide à la recommandation). */
  freeToday: number;
}

/**
 * Résout la liste de staff pour un salon : les membres réels triés par
 * disponibilité décroissante du jour demandé, plus l'option virtuelle
 * « Premier disponible » qui sélectionne automatiquement le membre ayant
 * le plus de créneaux libres.
 */
export function buildStaffOptions(params: {
  salon: Salon;
  service: Pick<SalonService, "duration"> | undefined;
  date: string;
  appointments: readonly Appointment[];
  now?: Date;
}): { options: BookingStaffOption[]; firstAvailableName: string } {
  const base = { ...params, staffName: "" };
  const options: BookingStaffOption[] = [];

  for (const member of params.salon.staff) {
    const free = getAvailableSlots({ ...base, staffName: member.name }).length;
    options.push({ name: member.name, label: `${member.name} — ${member.role}`, freeToday: free });
  }
  options.sort((a, b) => b.freeToday - a.freeToday);

  const best = options[0];
  return {
    options,
    firstAvailableName: best ? best.name : FIRST_AVAILABLE_LABEL,
  };
}

/** Libellé de l'option virtuelle « premier barbier libre ». */
export const FIRST_AVAILABLE_LABEL = "Premier disponible";

/**
 * Résumé d'état d'une grille de créneaux — utilisé par l'UI pour les messages
 * (« tout est complet », « journée fermée », etc.).
 */
export function summarizeSlots(slots: readonly SlotInfo[]): {
  total: number;
  free: number;
  allBooked: boolean;
  noSlots: boolean;
} {
  const free = slots.filter((s) => s.available).length;
  return {
    total: slots.length,
    free,
    allBooked: slots.length > 0 && free === 0,
    noSlots: slots.length === 0,
  };
}
