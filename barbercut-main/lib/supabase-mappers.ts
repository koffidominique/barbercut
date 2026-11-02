/**
 * Mappers purs entre les lignes PostgREST (snake_case) et les modèles
 * applicatifs TypeScript (camelCase) définis dans lib/types.ts.
 * Sans dépendance React : testables isolément.
 */
import type {
  Appointment,
  Salon,
  SalonClient,
  SalonService,
  ShowcasePhoto,
  StaffMember,
} from "@/lib/types";
import { toCoordinate } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Modèles -> payload base de données                                */
/* ------------------------------------------------------------------ */

/** Charge utile réellement stockée en base d'une prestation. */
export function servicePayload(service: SalonService) {
  return {
    name: service.name,
    category: service.category,
    price: service.price,
    duration: service.duration,
    description: service.description || "",
    is_popular: service.isPopular ?? false,
  };
}

/** Charge utile réellement stockée en base d'une photo de vitrine. */
export function photoPayload(photo: ShowcasePhoto) {
  return {
    url: photo.url,
    title: photo.title,
    description: photo.description || "",
    tags: photo.tags || [],
    is_cover: photo.isCover ?? false,
  };
}

/** Ligne `salons` -> modèle Salon, collections enfants fournies par l'appelant. */
export function mapSalonRow(
  row: any,
  collections: {
    services?: SalonService[];
    staff?: StaffMember[];
    gallery?: ShowcasePhoto[];
  } = {},
): Salon {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || "",
    description: row.description || "",
    city: row.city || "",
    neighborhood: row.neighborhood || "",
    address: row.address || "",
    phone: row.phone || "",
    whatsapp: row.whatsapp || "",
    rating: Number(row.rating || 0),
    reviewsCount: row.reviews_count || 0,
    isPublished: row.is_published ?? false,
    coverImage: row.cover_image || "",
    openingHours: row.opening_hours || "",
    rccm: row.rccm || undefined,
    currency: row.currency || "FCFA",
    smsRemindersEnabled: row.sms_reminders_enabled ?? true,
    whatsappConfirmationEnabled: row.whatsapp_confirmation_enabled ?? true,
    latitude: toCoordinate(row.latitude),
    longitude: toCoordinate(row.longitude),
    features: Array.isArray(row.features) ? row.features : [],
    gallery: collections.gallery,
    services: collections.services,
    staff: collections.staff,
  };
}

/** Modèle Salon -> colonnes update de la table `salons`. */
export function salonUpdatePayload(salon: Salon) {
  return {
    name: salon.name,
    tagline: salon.tagline,
    description: salon.description,
    city: salon.city,
    neighborhood: salon.neighborhood,
    address: salon.address,
    phone: salon.phone,
    whatsapp: salon.whatsapp,
    rating: salon.rating,
    reviews_count: salon.reviewsCount,
    is_published: salon.isPublished,
    cover_image: salon.coverImage,
    opening_hours: salon.openingHours,
    rccm: salon.rccm,
    currency: salon.currency,
    sms_reminders_enabled: salon.smsRemindersEnabled,
    whatsapp_confirmation_enabled: salon.whatsappConfirmationEnabled,
    latitude:
      salon.latitude !== undefined && salon.latitude !== null
        ? Number(salon.latitude)
        : null,
    longitude:
      salon.longitude !== undefined && salon.longitude !== null
        ? Number(salon.longitude)
        : null,
    updated_at: new Date().toISOString(),
  };
}

/** Ligne `salon_services` -> modèle SalonService. */
export function mapServiceRow(row: any): SalonService {
  return {
    id: row.id,
    name: row.name,
    category: (row.category || "Hommes") as SalonService["category"],
    price: Number(row.price || 0),
    duration: Number(row.duration || 0),
    description: row.description || "",
    isPopular: row.is_popular ?? false,
  };
}

/** Ligne `salon_staff` -> modèle StaffMember. */
export function mapStaffRow(row: any): StaffMember {
  return {
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
  };
}

/** Ligne `showcase_photos` -> modèle ShowcasePhoto. */
export function mapPhotoRow(row: any): ShowcasePhoto {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    description: row.description || "",
    tags: row.tags || [],
    isCover: row.is_cover ?? false,
  };
}

/** Ligne `appointments` -> modèle Appointment. */
export function mapAppointmentRow(row: any): Appointment {
  return {
    id: row.id,
    salonId: row.salon_id,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    serviceId: row.service_id || "",
    serviceName: row.service_name,
    servicePrice: row.service_price || 0,
    staffName: row.staff_name || "",
    date: row.date,
    time: row.time,
    status: row.status as Appointment["status"],
    source: row.source as Appointment["source"],
    notes: row.notes || undefined,
    createdAt: row.created_at,
    paymentStatus:
      (row.payment_status as Appointment["paymentStatus"]) || "unpaid",
    paymentMethod:
      (row.payment_method as Appointment["paymentMethod"]) || undefined,
  };
}

/** Modèle Appointment -> colonnes insert de la table `appointments`. */
export function appointmentInsertPayload(
  data: Omit<Appointment, "id" | "createdAt">,
) {
  return {
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
  };
}

/** Ligne `salon_clients` -> modèle SalonClient. */
export function mapClientRow(row: any): SalonClient {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || undefined,
    favoriteService: row.favorite_service || "",
    preferredStaff: row.preferred_staff || "",
    totalVisits: row.total_visits || 0,
    totalSpent: row.total_spent || 0,
    lastVisit: row.last_visit || "",
    nextAppointment: row.next_appointment || undefined,
    status: row.status as SalonClient["status"],
    source: row.source as SalonClient["source"],
    notes: row.notes || undefined,
  };
}

/** Modèle SalonClient -> colonnes communes insert/update de `salon_clients`. */
export function clientColumnsPayload(client: SalonClient) {
  return {
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
  };
}

/** Modèle StaffMember -> colonnes communes insert/update de `salon_staff`. */
export function staffColumnsPayload(staff: StaffMember) {
  return {
    name: staff.name,
    role: staff.role || "",
    specialty: staff.specialty || null,
    phone: staff.phone || null,
    schedule: staff.schedule || null,
    color: staff.color || "bg-[#202321]",
    initials: staff.initials || "",
    rating: staff.rating,
    reviews_count: staff.reviewsCount,
    appointments_count: staff.appointmentsCount,
    status: staff.status || "active",
  };
}
