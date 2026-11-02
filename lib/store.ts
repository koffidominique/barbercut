'use client'

import { useState, useEffect } from 'react'

export interface ShowcasePhoto {
  id: string
  url: string
  title: string
  description: string
  tags: string[]
  isCover?: boolean
}

export interface SalonService {
  id: string
  name: string
  category: 'Hommes' | 'Dames' | 'Soins & Barbe' | 'Enfants'
  price: number // in FCFA
  duration: number // in minutes
  description: string
  isPopular?: boolean
}

export interface StaffMember {
  id: string
  name: string
  role: string
  initials: string
  color: string
  specialty?: string
  phone?: string
  rating?: number
  reviewsCount?: number
  appointmentsCount?: number
  status?: 'active' | 'leave'
  schedule?: string
}

export interface SalonClient {
  id: string
  name: string
  phone: string
  email?: string
  favoriteService: string
  preferredStaff: string
  totalVisits: number
  totalSpent: number // in FCFA
  lastVisit: string
  nextAppointment?: string
  status: 'VIP' | 'Régulier' | 'Nouveau'
  source: 'marketplace' | 'direct'
  notes?: string
}

export interface Salon {
  id: string
  name: string
  tagline: string
  description: string
  city: string
  neighborhood: string
  address: string
  phone: string
  whatsapp: string
  rating: number
  reviewsCount: number
  isPublished: boolean
  coverImage: string
  gallery: ShowcasePhoto[]
  features: string[]
  services: SalonService[]
  staff: StaffMember[]
  openingHours: string
  rccm?: string
  currency?: string
  smsRemindersEnabled?: boolean
  whatsappConfirmationEnabled?: boolean
  latitude?: number
  longitude?: number
  subscription?: SalonSubscription
}

export type StaffRole = 'admin' | 'coiffeur' | 'receptionniste'

export interface StaffPermissions {
  canEditPrices: boolean
  canViewReports: boolean
  canManageClients: boolean
  canManageStaff: boolean
  canPublishVitrine: boolean
}

export interface SalonSubscription {
  plan: 'gratuit' | 'pro'
  status: 'active' | 'trial' | 'expired' | 'cancelled'
  trialEndsAt?: string // ISO date
  billingCycleStart?: string
  billingCycleEnd?: string
  priceFcfa: number // 0 gratuit / 35000 pro
  paymentMethod?: 'cash' | 'wave' | 'orange_money' | 'card'
  lastPaymentAt?: string
  nextPaymentAt?: string
}

export interface TeamInvitation {
  id: string
  salonId: string
  email: string
  role: StaffRole
  status: 'pending' | 'accepted' | 'declined'
  invitedBy: string
  invitedAt: string
  respondedAt?: string
}

export interface SalonReview {
  id: string
  salonId: string
  clientName: string
  clientPhone?: string
  rating: number // 1-5
  comment: string
  date: string
  createdAt: string
  source: 'marketplace' | 'direct'
}

export interface Appointment {
  id: string
  salonId: string
  clientName: string
  clientPhone: string
  clientEmail?: string
  serviceId: string
  serviceName: string
  servicePrice: number
  staffName: string
  date: string // e.g. "2026-11-02"
  time: string // e.g. "14:30"
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  source: 'marketplace' | 'direct'
  notes?: string
  createdAt: string
  paymentStatus?: 'unpaid' | 'partial' | 'paid'
  paymentMethod?: 'cash' | 'wave' | 'orange_money' | 'card'
}

export interface ClientAccount {
  id: string
  name: string
  phone: string
  email?: string
  password?: string // En production, jamais en clair
  totalVisits: number
  totalSpent: number
  status: 'VIP' | 'Régulier' | 'Nouveau'
  source: 'marketplace' | 'direct'
  createdAt: string
}

const STORAGE_KEYS = {
  SALONS: 'barbercuts_salons_v1',
  APPOINTMENTS: 'barbercuts_appointments_v1',
  CLIENTS: 'barbercuts_clients_v1',
  REVIEWS: 'barbercuts_reviews_v1',
  CLIENT_ACCOUNTS: 'barbercuts_client_accounts_v1',
  ACTIVE_SALON_ID: 'barbercuts_active_salon_id_v1',
  CLIENT_SESSION: 'barbercuts_client_session_v1',
  SUBSCRIPTIONS: 'barbercuts_subscriptions_v1',
  TEAM_INVITATIONS: 'barbercuts_team_invitations_v1',
}

export function getStoredSubscriptions(): Record<string, SalonSubscription> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function saveStoredSubscriptions(data: Record<string, SalonSubscription>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(data))
    window.dispatchEvent(new Event('barbercuts_storage_update'))
  } catch (e) {
    console.error('Error saving subscriptions', e)
  }
}

export function getStoredTeamInvitations(): TeamInvitation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAM_INVITATIONS)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveStoredTeamInvitations(invitations: TeamInvitation[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.TEAM_INVITATIONS, JSON.stringify(invitations))
    window.dispatchEvent(new Event('barbercuts_storage_update'))
  } catch (e) {
    console.error('Error saving team invitations', e)
  }
}

export function getStoredClientAccounts(): ClientAccount[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENT_ACCOUNTS)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveStoredClientAccounts(accounts: ClientAccount[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENT_ACCOUNTS, JSON.stringify(accounts))
    window.dispatchEvent(new Event('barbercuts_storage_update'))
  } catch (e) {
    console.error('Error saving client accounts', e)
  }
}

export function getClientSession(): ClientAccount | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENT_SESSION)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveClientSession(account: ClientAccount | null) {
  if (typeof window === 'undefined') return
  try {
    if (account) {
      localStorage.setItem(STORAGE_KEYS.CLIENT_SESSION, JSON.stringify(account))
    } else {
      localStorage.removeItem(STORAGE_KEYS.CLIENT_SESSION)
    }
    window.dispatchEvent(new Event('barbercuts_storage_update'))
  } catch (e) {
    console.error('Error saving client session', e)
  }
}

const DEFAULT_CLIENTS: SalonClient[] = [
  {
    id: 'cli-1',
    name: 'Aïcha Kouamé',
    phone: '+225 07 12 34 56 78',
    email: 'aicha.kouame@gmail.com',
    favoriteService: 'Tresses bohème & Coiffure Protectrice',
    preferredStaff: 'Nadia K.',
    totalVisits: 14,
    totalSpent: 185000,
    lastVisit: '2026-10-24',
    nextAppointment: '2026-11-02 à 09:00',
    status: 'VIP',
    source: 'marketplace',
    notes: 'Exigeante sur la propreté des mèches, thé à la menthe sans sucre.',
  },
  {
    id: 'cli-2',
    name: 'Koffi Yao',
    phone: '+225 05 44 22 11 00',
    favoriteService: 'Coupe signature & Dégradé américain',
    preferredStaff: 'Jules M.',
    totalVisits: 8,
    totalSpent: 64000,
    lastVisit: '2026-10-18',
    nextAppointment: '2026-11-02 à 10:30',
    status: 'Régulier',
    source: 'marketplace',
    notes: 'Vient toutes les deux semaines pour rafraîchir les contours.',
  },
  {
    id: 'cli-3',
    name: 'Mariam Koné',
    phone: '+225 01 02 03 04 05',
    email: 'kone.mariam@outlook.com',
    favoriteService: 'Tresses bohème & Coiffure Protectrice',
    preferredStaff: 'Nadia K.',
    totalVisits: 22,
    totalSpent: 290000,
    lastVisit: '2026-10-12',
    nextAppointment: '2026-11-02 à 11:45',
    status: 'VIP',
    source: 'direct',
    notes: 'Préfère les rendez-vous en matinée.',
  },
  {
    id: 'cli-4',
    name: 'Yannick N’Guessan',
    phone: '+225 07 99 88 77 66',
    favoriteService: 'Pack Royal (Coupe + Barbe + Soin visage)',
    preferredStaff: 'Jules M.',
    totalVisits: 2,
    totalSpent: 30000,
    lastVisit: '2026-10-20',
    nextAppointment: '2026-11-02 à 14:00',
    status: 'Nouveau',
    source: 'marketplace',
    notes: 'Attiré par la photo du dégradé sur la Marketplace.',
  },
  {
    id: 'cli-5',
    name: 'Ibrahim Ouattara',
    phone: '+225 07 88 44 22 11',
    favoriteService: 'Coupe signature & Dégradé américain',
    preferredStaff: 'Mamadou T.',
    totalVisits: 9,
    totalSpent: 72000,
    lastVisit: '2026-10-28',
    status: 'Régulier',
    source: 'direct',
    notes: 'Client ponctuel, règle par Wave.',
  },
  {
    id: 'cli-6',
    name: 'Sarah Bamba',
    phone: '+225 05 90 80 70 60',
    email: 'sarah.bamba@ci.org',
    favoriteService: 'Tresses bohème & Coiffure Protectrice',
    preferredStaff: 'Nadia K.',
    totalVisits: 3,
    totalSpent: 54000,
    lastVisit: '2026-10-15',
    status: 'Nouveau',
    source: 'marketplace',
  },
]

const DEFAULT_SALONS: Salon[] = [
  {
    id: 'barber-cuts-cocody',
    name: 'Barber Cuts Cocody',
    tagline: 'L’art du dégradé moderne et du soin capillaire d’exception',
    description: 'Salon premium au cœur de Cocody Angré. Notre équipe de barbiers et coiffeurs visagistes vous accueille dans un cadre moderne et climatisé avec fauteuils ergonomiques et service sur mesure.',
    city: 'Abidjan',
    neighborhood: 'Cocody Angré',
    address: 'Boulevard Latrille, face station Total, Cocody Angré',
    phone: '+225 07 48 92 11 30',
    whatsapp: '+225 07 48 92 11 30',
    rating: 4.9,
    reviewsCount: 142,
    isPublished: true,
    coverImage: '/images/marketplace_hero_lifestyle_1793627543863.jpg',
    openingHours: 'Mar - Dim: 08:30 - 20:30',
    rccm: 'CI-ABJ-2023-B-1428',
    currency: 'FCFA',
    smsRemindersEnabled: true,
    whatsappConfirmationEnabled: true,
    latitude: 5.3601,
    longitude: -4.0083,
    features: [
      'Salon climatisé haut standing',
      'Boissons fraîches & café offerts',
      'Wi-Fi haut débit',
      'Paiements Wave & Orange Money acceptés',
      'Fauteuils barbier vintage confort',
      'Espace détente VIP',
    ],
    gallery: [
      {
        id: 'p-1',
        url: '/images/barber_showcase_fade_1793627544114.jpg',
        title: 'Dégradé américain à blanc & Barbe taillée',
        description: 'Finitions nettes à la lame japonaise, serviette chaude et huile tonifiante au bois de santal.',
        tags: ['Dégradé', 'Barbe', 'Finitions rasoir', 'Homme'],
        isCover: true,
      },
      {
        id: 'p-2',
        url: '/images/salon_showcase_braids_1793627544312.jpg',
        title: 'Tresses déesses & Soin fortifiant du cuir chevelu',
        description: 'Tressage d’art avec motifs géométriques et ornementations dorées. Hydratation en profondeur.',
        tags: ['Tresses', 'Dames', 'Soins afro', 'Goddess'],
      },
      {
        id: 'p-3',
        url: '/images/marketplace_hero_lifestyle_1793627543863.jpg',
        title: 'Espace principal & Postes de coiffure stylisés',
        description: 'Miroirs rétro-éclairés, éclairage tamisé chaleureux et ambiance musicale afro-soul.',
        tags: ['Salon', 'Cadre', 'Ambiance', 'Cocody'],
      },
    ],
    services: [
      {
        id: 'srv-1',
        name: 'Coupe signature & Dégradé américain',
        category: 'Hommes',
        price: 8000,
        duration: 45,
        description: 'Shampoing purifiant, dégradé aux ciseaux et tondeuse, traçage net au rasoir et coiffage.',
        isPopular: true,
      },
      {
        id: 'srv-2',
        name: 'Taille & Rituel Barbe Complète',
        category: 'Soins & Barbe',
        price: 6000,
        duration: 35,
        description: 'Sculpture de la barbe, serviette chaude infusée eucalyptus, traçage au coupe-chou et sérum nourrissant.',
        isPopular: true,
      },
      {
        id: 'srv-3',
        name: 'Tresses bohème & Coiffure Protectrice',
        category: 'Dames',
        price: 18000,
        duration: 90,
        description: 'Nettoyage cuir chevelu, pose de mèches premium et finitions soyeuses longue tenue.',
        isPopular: true,
      },
      {
        id: 'srv-4',
        name: 'Pack Royal (Coupe + Barbe + Soin visage)',
        category: 'Hommes',
        price: 15000,
        duration: 75,
        description: 'L’expérience ultime : coupe sur mesure, barbe sculptée, gommage noir et masque rafraîchissant.',
        isPopular: true,
      },
      {
        id: 'srv-5',
        name: 'Coupe Junior (Moins de 12 ans)',
        category: 'Enfants',
        price: 4500,
        duration: 30,
        description: 'Coupe soignée avec douceur et patience, traçage adapté et motif discret sur demande.',
      },
    ],
    staff: [
      {
        id: 'st-1',
        name: 'Jules M.',
        role: 'Maître Barbier & Coloriste',
        initials: 'JM',
        color: 'bg-[#586b83]',
        specialty: 'Dégradés américains, taille de barbe, traçage coupe-chou',
        phone: '+225 07 44 11 22 33',
        rating: 4.9,
        reviewsCount: 84,
        appointmentsCount: 48,
        status: 'active',
        schedule: 'Mar - Dim (08:30 - 18:30)',
      },
      {
        id: 'st-2',
        name: 'Nadia K.',
        role: 'Styliste Coiffeuse Afro-Chic',
        initials: 'NK',
        color: 'bg-[#d9a45e]',
        specialty: 'Tresses déesses, nattes sénégalaises, soins capillaires profonds',
        phone: '+225 05 55 88 99 00',
        rating: 5.0,
        reviewsCount: 96,
        appointmentsCount: 54,
        status: 'active',
        schedule: 'Mar - Sam (09:00 - 19:30)',
      },
      {
        id: 'st-3',
        name: 'Mamadou T.',
        role: 'Expert Dégradé & Barbe',
        initials: 'MT',
        color: 'bg-[#7a8c5d]',
        specialty: 'Taper fade, tribals/designs, taille de barbe au peigne',
        phone: '+225 01 22 33 44 55',
        rating: 4.8,
        reviewsCount: 62,
        appointmentsCount: 39,
        status: 'active',
        schedule: 'Mer - Dim (10:00 - 20:30)',
      },
    ],
  },
  {
    id: 'le-barbier-marin',
    name: 'Anchor & Crown — Le Barbier Marin',
    tagline: 'Lounge marin haut de gamme pour gentlemen & marins au long cours',
    description: 'Inspiré par les salons maritimes des grands capitaines. Fauteuils en cuir émeraude patiné, boiseries d’acajou, rasage traditionnel à l’ancienne et cocktails de bienvenue face à la lagune.',
    city: 'Abidjan',
    neighborhood: 'Marcory Zone 4',
    address: 'Rue du 7 Décembre, près du Cercle Nautique, Zone 4',
    phone: '+225 05 77 14 20 88',
    whatsapp: '+225 05 77 14 20 88',
    rating: 4.95,
    reviewsCount: 98,
    isPublished: true,
    coverImage: '/images/barber_marine_salon_1793627544764.jpg',
    openingHours: 'Lun - Sam: 09:00 - 21:00',
    rccm: 'CI-ABJ-2022-B-9912',
    currency: 'FCFA',
    smsRemindersEnabled: true,
    whatsappConfirmationEnabled: true,
    latitude: 5.3026,
    longitude: -3.9838,
    features: [
      'Ambiance club maritime feutré',
      'Cocktail ou whisky offert',
      'Rasage au coupe-chou traditionnel',
      'Cires & baumes marins importés',
      'Parking privé sécurisé',
    ],
    gallery: [
      {
        id: 'p-m1',
        url: '/images/barber_marine_salon_1793627544764.jpg',
        title: 'Le Grand Salon Maritime',
        description: 'Fauteuils en cuir vert bouteille, instruments nautiques et comptoir en chêne massif.',
        tags: ['Maritime', 'Luxe', 'Barbier', 'Vintage'],
        isCover: true,
      },
      {
        id: 'p-m2',
        url: '/images/barber_showcase_fade_1793627544114.jpg',
        title: 'Coupe Officier & Barbe Taillée',
        description: 'Précision millimétrée adaptée aux profils exigeants.',
        tags: ['Officier', 'Barbe', 'Prestige'],
      },
    ],
    services: [
      {
        id: 'srv-m1',
        name: 'Le Rasage du Capitaine',
        category: 'Soins & Barbe',
        price: 10000,
        duration: 45,
        description: '3 passages de serviette chaude parfumée aux embruns, mousse blaireau à l’ancienne et coupe-chou.',
        isPopular: true,
      },
      {
        id: 'srv-m2',
        name: 'Coupe Gentleman & Coiffage Pommade',
        category: 'Hommes',
        price: 12000,
        duration: 50,
        description: 'Consultation morphologique, coupe ciseau / tondeuse et coiffage aux cires mates haut de gamme.',
        isPopular: true,
      },
      {
        id: 'srv-m3',
        name: 'Rituel Marin Intégral',
        category: 'Hommes',
        price: 22000,
        duration: 80,
        description: 'Coupe prestige, rasage du capitaine, massage crânien aux huiles essentielles et verre de bienvenue.',
        isPopular: true,
      },
    ],
    staff: [
      {
        id: 'st-m1',
        name: 'Capitaine Alex',
        role: 'Barbier Maître Artisan',
        initials: 'CA',
        color: 'bg-[#18392b]',
        specialty: 'Rasage à l’ancienne, taille barbe d’apparat',
        rating: 5.0,
        reviewsCount: 78,
        appointmentsCount: 42,
        status: 'active',
        schedule: 'Lun - Sam (09:00 - 19:00)',
      },
      {
        id: 'st-m2',
        name: 'Yves-Alain',
        role: 'Visagiste & Rasage Lame',
        initials: 'YA',
        color: 'bg-[#6b583f]',
        specialty: 'Coupe gentleman, soins capillaires aux huiles marines',
        rating: 4.9,
        reviewsCount: 44,
        appointmentsCount: 36,
        status: 'active',
        schedule: 'Mar - Dim (10:00 - 21:00)',
      },
    ],
  },
]

const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    salonId: 'barber-cuts-cocody',
    clientName: 'Aïcha Kouamé',
    clientPhone: '+225 07 12 34 56 78',
    serviceId: 'srv-3',
    serviceName: 'Tresses bohème & Coiffure Protectrice',
    servicePrice: 18000,
    staffName: 'Nadia K.',
    date: '2026-11-02',
    time: '09:00',
    status: 'confirmed',
    source: 'marketplace',
    notes: 'Première visite via la marketplace Barber Cuts. Souhaite mèches châtain clair.',
    createdAt: '2026-11-02T04:10:00Z',
  },
  {
    id: 'apt-2',
    salonId: 'barber-cuts-cocody',
    clientName: 'Koffi Yao',
    clientPhone: '+225 05 44 22 11 00',
    serviceId: 'srv-1',
    serviceName: 'Coupe signature & Dégradé américain',
    servicePrice: 8000,
    staffName: 'Jules M.',
    date: '2026-11-02',
    time: '10:30',
    status: 'confirmed',
    source: 'marketplace',
    notes: 'A découvert la photo du dégradé sur la vitrine.',
    createdAt: '2026-11-02T04:30:00Z',
  },
  {
    id: 'apt-3',
    salonId: 'barber-cuts-cocody',
    clientName: 'Mariam Koné',
    clientPhone: '+225 01 02 03 04 05',
    serviceId: 'srv-3',
    serviceName: 'Tresses bohème & Coiffure Protectrice',
    servicePrice: 18000,
    staffName: 'Nadia K.',
    date: '2026-11-02',
    time: '11:45',
    status: 'confirmed',
    source: 'direct',
    notes: 'Cliente habituée.',
    createdAt: '2026-11-01T15:20:00Z',
  },
  {
    id: 'apt-4',
    salonId: 'barber-cuts-cocody',
    clientName: 'Yannick N’Guessan',
    clientPhone: '+225 07 99 88 77 66',
    serviceId: 'srv-4',
    serviceName: 'Pack Royal (Coupe + Barbe + Soin visage)',
    servicePrice: 15000,
    staffName: 'Jules M.',
    date: '2026-11-02',
    time: '14:00',
    status: 'pending',
    source: 'marketplace',
    notes: 'Demande spéciale : soin barbe eucalyptus.',
    createdAt: '2026-11-02T05:15:00Z',
  },
]

export function getStoredSalons(): Salon[] {
  if (typeof window === 'undefined') return DEFAULT_SALONS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALONS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SALONS, JSON.stringify(DEFAULT_SALONS))
      return DEFAULT_SALONS
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_SALONS
  }
}

export function saveStoredSalons(salons: Salon[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.SALONS, JSON.stringify(salons))
    window.dispatchEvent(new Event('barbercuts_storage_update'))
  } catch (e) {
    console.error('Error saving salons', e)
  }
}

export function getStoredAppointments(): Appointment[] {
  if (typeof window === 'undefined') return DEFAULT_APPOINTMENTS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(DEFAULT_APPOINTMENTS))
      return DEFAULT_APPOINTMENTS
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_APPOINTMENTS
  }
}

export function saveStoredAppointments(appointments: Appointment[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments))
    window.dispatchEvent(new Event('barbercuts_storage_update'))
  } catch (e) {
    console.error('Error saving appointments', e)
  }
}

export function getStoredClients(): SalonClient[] {
  if (typeof window === 'undefined') return DEFAULT_CLIENTS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(DEFAULT_CLIENTS))
      return DEFAULT_CLIENTS
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_CLIENTS
  }
}

export function saveStoredClients(clients: SalonClient[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients))
    window.dispatchEvent(new Event('barbercuts_storage_update'))
  } catch (e) {
    console.error('Error saving clients', e)
  }
}

export function getStoredReviews(): SalonReview[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveStoredReviews(reviews: SalonReview[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews))
    window.dispatchEvent(new Event('barbercuts_storage_update'))
  } catch (e) {
    console.error('Error saving reviews', e)
  }
}

import { useSupabaseSalonStore } from './supabase-store'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const IS_SUPABASE_CONFIGURED = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-')
)

export function useSalonStore() {
  // Si Supabase est configuré, déléguer au store cloud
  if (IS_SUPABASE_CONFIGURED) {
    return useSupabaseSalonStore()
  }

  const [salons, setSalons] = useState<Salon[]>(DEFAULT_SALONS)
  const [appointments, setAppointments] = useState<Appointment[]>(DEFAULT_APPOINTMENTS)
  const [clients, setClients] = useState<SalonClient[]>(DEFAULT_CLIENTS)
  const [reviews, setReviews] = useState<SalonReview[]>([])
  const [clientAccounts, setClientAccounts] = useState<ClientAccount[]>([])
  const [clientAccount, setClientAccount] = useState<ClientAccount | null>(null)
  const [subscriptions, setSubscriptions] = useState<Record<string, SalonSubscription>>({})
  const [teamInvitations, setTeamInvitations] = useState<TeamInvitation[]>([])
  const [activeSalonId, setActiveSalonId] = useState<string>('barber-cuts-cocody')
  const [isLoaded, setIsLoaded] = useState(false)

  const reloadData = () => {
    const s = getStoredSalons()
    const a = getStoredAppointments()
    const c = getStoredClients()
    const r = getStoredReviews()
    const ca = getStoredClientAccounts()
    const sub = getStoredSubscriptions()
    const inv = getStoredTeamInvitations()
    setSalons(s)
    setAppointments(a)
    setClients(c)
    setReviews(r)
    setClientAccounts(ca)
    setSubscriptions(sub)
    setTeamInvitations(inv)
    // Restaurer la session client si existante
    const session = getClientSession()
    if (session) setClientAccount(session)
    setIsLoaded(true)
  }

  useEffect(() => {
    reloadData()
    const handleStorage = () => reloadData()
    window.addEventListener('storage', handleStorage)
    window.addEventListener('barbercuts_storage_update', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('barbercuts_storage_update', handleStorage)
    }
  }, [])

  const currentSalon = salons.find((s) => s.id === activeSalonId) || salons[0]

  // Update active salon
  const updateSalon = (updated: Salon) => {
    const next = salons.map((s) => (s.id === updated.id ? updated : s))
    setSalons(next)
    saveStoredSalons(next)
  }

  // Create an appointment (e.g. from marketplace booking or ERP)
  const bookAppointment = (data: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newAppointment: Appointment = {
      ...data,
      id: 'apt-' + Date.now(),
      createdAt: new Date().toISOString(),
    }
    const nextApts = [newAppointment, ...appointments]
    setAppointments(nextApts)
    saveStoredAppointments(nextApts)

    // Check if client exists, otherwise create new client automatically
    const existingIndex = clients.findIndex(
      (c) => c.phone === data.clientPhone || c.name.toLowerCase() === data.clientName.toLowerCase()
    )
    let nextClients = [...clients]
    if (existingIndex >= 0) {
      const existing = nextClients[existingIndex]
      nextClients[existingIndex] = {
        ...existing,
        totalVisits: existing.totalVisits + 1,
        totalSpent: existing.totalSpent + data.servicePrice,
        lastVisit: data.date,
        nextAppointment: `${data.date} à ${data.time}`,
        status: existing.totalVisits >= 5 ? 'VIP' : 'Régulier',
      }
    } else {
      const newClient: SalonClient = {
        id: 'cli-' + Date.now(),
        name: data.clientName,
        phone: data.clientPhone,
        favoriteService: data.serviceName,
        preferredStaff: data.staffName,
        totalVisits: 1,
        totalSpent: data.servicePrice,
        lastVisit: data.date,
        nextAppointment: `${data.date} à ${data.time}`,
        status: 'Nouveau',
        source: data.source,
        notes: data.notes,
      }
      nextClients = [newClient, ...nextClients]
    }
    setClients(nextClients)
    saveStoredClients(nextClients)

    return newAppointment
  }

  // Update appointment status
  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    const next = appointments.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    setAppointments(next)
    saveStoredAppointments(next)
  }

  // Delete appointment
  const deleteAppointment = (id: string) => {
    const next = appointments.filter((apt) => apt.id !== id)
    setAppointments(next)
    saveStoredAppointments(next)
  }

  // Update appointment payment status
  const updateAppointmentPayment = (
    id: string,
    paymentStatus: Appointment['paymentStatus'],
    paymentMethod?: Appointment['paymentMethod']
  ) => {
    const next = appointments.map((apt) =>
      apt.id === id
        ? {
            ...apt,
            paymentStatus,
            paymentMethod,
            updatedAt: new Date().toISOString(),
          }
        : apt
    )
    setAppointments(next)
    saveStoredAppointments(next)
  }

  // Add / Edit Client
  const saveClient = (client: SalonClient) => {
    const exists = clients.some((c) => c.id === client.id)
    const next = exists
      ? clients.map((c) => (c.id === client.id ? client : c))
      : [client, ...clients]
    setClients(next)
    saveStoredClients(next)
  }

  // Delete Client
  const deleteClient = (id: string) => {
    const next = clients.filter((c) => c.id !== id)
    setClients(next)
    saveStoredClients(next)
  }

  // Add / Edit Review
  const saveReview = (review: Omit<SalonReview, 'id' | 'createdAt'>) => {
    const newReview: SalonReview = {
      ...review,
      id: 'rev-' + Date.now(),
      createdAt: new Date().toISOString(),
    }
    const next = [...reviews, newReview]
    setReviews(next)
    saveStoredReviews(next)

    // Mettre à jour la note moyenne et le nombre d'avis du salon
    const salonReviews = next.filter((r) => r.salonId === review.salonId)
    const avgRating = salonReviews.reduce((sum, r) => sum + r.rating, 0) / salonReviews.length
    const targetSalon = salons.find((s) => s.id === review.salonId)
    if (targetSalon) {
      updateSalon({
        ...targetSalon,
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: salonReviews.length,
      })
    }
  }

  // ── Comptes clients ──

  // Enregistrer un nouveau client
  const registerClient = (data: {
    name: string
    phone: string
    email?: string
    password: string
  }) => {
    const existing = clientAccounts.find((a) => a.phone === data.phone || a.email === data.email)
    if (existing) {
      throw new Error('Un compte existe déjà avec ce téléphone ou cet email.')
    }
    const newAccount: ClientAccount = {
      id: 'client-' + Date.now(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      password: data.password, // En production, jamais en clair
      totalVisits: 0,
      totalSpent: 0,
      status: 'Nouveau',
      source: 'marketplace',
      createdAt: new Date().toISOString(),
    }
    const next = [...clientAccounts, newAccount]
    setClientAccounts(next)
    saveStoredClientAccounts(next)
    setClientAccount(newAccount)
    saveClientSession(newAccount)
    return newAccount
  }

  // Connecter un client existant
  const loginClient = (phoneOrEmail: string, password: string) => {
    const account = clientAccounts.find(
      (a) => (a.phone === phoneOrEmail || a.email === phoneOrEmail) && a.password === password
    )
    if (!account) {
      throw new Error('Identifiants incorrects.')
    }
    setClientAccount(account)
    saveClientSession(account)
    return account
  }

  // Déconnecter le client
  const logoutClient = () => {
    setClientAccount(null)
    saveClientSession(null)
  }

  // ── Abonnements ──
  const getSubscription = (salonId: string): SalonSubscription | null => {
    return subscriptions[salonId] || null
  }

  const setSubscription = (salonId: string, sub: SalonSubscription) => {
    const next = { ...subscriptions, [salonId]: sub }
    setSubscriptions(next)
    saveStoredSubscriptions(next)
  }

  const upgradeToPro = (salonId: string, paymentMethod: 'wave' | 'orange_money' | 'card') => {
    const now = new Date()
    const nextPayment = new Date(now)
    nextPayment.setMonth(nextPayment.getMonth() + 1)

    const sub: SalonSubscription = {
      plan: 'pro',
      status: 'active',
      priceFcfa: 35000,
      paymentMethod,
      billingCycleStart: now.toISOString(),
      billingCycleEnd: nextPayment.toISOString(),
      lastPaymentAt: now.toISOString(),
      nextPaymentAt: nextPayment.toISOString(),
    }
    setSubscription(salonId, sub)

    // Mettre à jour le salon avec l'abonnement
    const targetSalon = salons.find((s) => s.id === salonId)
    if (targetSalon) {
      updateSalon({ ...targetSalon, subscription: sub })
    }
    return sub
  }

  const startFreeTrial = (salonId: string) => {
    const now = new Date()
    const trialEnd = new Date(now)
    trialEnd.setDate(trialEnd.getDate() + 14)

    const sub: SalonSubscription = {
      plan: 'pro',
      status: 'trial',
      priceFcfa: 35000,
      trialEndsAt: trialEnd.toISOString(),
      billingCycleStart: now.toISOString(),
      billingCycleEnd: trialEnd.toISOString(),
    }
    setSubscription(salonId, sub)

    const targetSalon = salons.find((s) => s.id === salonId)
    if (targetSalon) {
      updateSalon({ ...targetSalon, subscription: sub })
    }
    return sub
  }

  const cancelSubscription = (salonId: string) => {
    const sub = subscriptions[salonId]
    if (!sub) return
    const next: SalonSubscription = { ...sub, status: 'cancelled' }
    setSubscription(salonId, next)
    return next
  }

  // ── Invitations d'équipe ──
  const inviteTeamMember = (data: {
    salonId: string
    email: string
    role: StaffRole
    invitedBy: string
  }) => {
    const existing = teamInvitations.find(
      (inv) => inv.salonId === data.salonId && inv.email === data.email && inv.status === 'pending'
    )
    if (existing) {
      throw new Error('Une invitation en attente existe déjà pour cet email.')
    }

    const invitation: TeamInvitation = {
      id: 'inv-' + Date.now(),
      salonId: data.salonId,
      email: data.email,
      role: data.role,
      status: 'pending',
      invitedBy: data.invitedBy,
      invitedAt: new Date().toISOString(),
    }
    const next = [...teamInvitations, invitation]
    setTeamInvitations(next)
    saveStoredTeamInvitations(next)
    return invitation
  }

  const respondToInvitation = (invitationId: string, response: 'accepted' | 'declined') => {
    const next = teamInvitations.map((inv) =>
      inv.id === invitationId
        ? { ...inv, status: response, respondedAt: new Date().toISOString() }
        : inv
    )
    setTeamInvitations(next)
    saveStoredTeamInvitations(next)

    // Si accepté, ajouter le collaborateur au staff du salon
    if (response === 'accepted') {
      const inv = teamInvitations.find((i) => i.id === invitationId)
      if (inv) {
        const targetSalon = salons.find((s) => s.id === inv.salonId)
        if (targetSalon) {
          const roleMap: Record<StaffRole, string> = {
            admin: 'Gérant / Admin',
            coiffeur: 'Coiffeur / Barbier',
            receptionniste: 'Réceptionniste',
          }
          const permissionMap: Record<StaffRole, StaffPermissions> = {
            admin: {
              canEditPrices: true,
              canViewReports: true,
              canManageClients: true,
              canManageStaff: true,
              canPublishVitrine: true,
            },
            coiffeur: {
              canEditPrices: false,
              canViewReports: false,
              canManageClients: true,
              canManageStaff: false,
              canPublishVitrine: false,
            },
            receptionniste: {
              canEditPrices: false,
              canViewReports: false,
              canManageClients: true,
              canManageStaff: false,
              canPublishVitrine: false,
            },
          }
          const newStaff: StaffMember = {
            id: 'staff-' + Date.now(),
            name: inv.email.split('@')[0], // Nom temporaire basé sur l'email
            role: roleMap[inv.role],
            initials: inv.email.split('@')[0].slice(0, 2).toUpperCase(),
            color: 'bg-[#586b83]',
            specialty: '',
            phone: '',
            status: 'active',
            schedule: 'Mar - Dim (08:30 - 18:30)',
          }
          const exists = targetSalon.staff.some((s) => s.id === newStaff.id)
          if (!exists) {
            updateSalon({
              ...targetSalon,
              staff: [...targetSalon.staff, newStaff],
            })
          }
        }
      }
    }
  }

  // Add / Edit Staff member in current salon
  const saveStaffMember = (staff: StaffMember) => {
    const exists = currentSalon.staff.some((s) => s.id === staff.id)
    const nextStaff = exists
      ? currentSalon.staff.map((s) => (s.id === staff.id ? staff : s))
      : [...currentSalon.staff, staff]
    updateSalon({
      ...currentSalon,
      staff: nextStaff,
    })
  }

  // Delete staff member
  const deleteStaffMember = (id: string) => {
    const nextStaff = currentSalon.staff.filter((s) => s.id !== id)
    updateSalon({
      ...currentSalon,
      staff: nextStaff,
    })
  }

  // Reset to default sample data
  const resetDefaults = () => {
    saveStoredSalons(DEFAULT_SALONS)
    saveStoredAppointments(DEFAULT_APPOINTMENTS)
    saveStoredClients(DEFAULT_CLIENTS)
    setSalons(DEFAULT_SALONS)
    setAppointments(DEFAULT_APPOINTMENTS)
    setClients(DEFAULT_CLIENTS)
  }

  // Create a new salon (localStorage fallback)
  const createSalon = async (
    ownerId: string,
    data: Partial<Salon>
  ): Promise<Salon | null> => {
    const newSalon: Salon = {
      id: 'salon-' + Date.now(),
      name: data.name || 'Mon Salon Barber Cuts',
      tagline: data.tagline || '',
      description: data.description || '',
      city: data.city || 'Abidjan',
      neighborhood: data.neighborhood || '',
      address: data.address || '',
      phone: data.phone || '',
      whatsapp: data.whatsapp || '',
      rating: 0,
      reviewsCount: 0,
      isPublished: false,
      coverImage: data.coverImage || '/images/placeholder-logo.png',
      openingHours: data.openingHours || 'Mar - Dim: 08:30 - 20:30',
      rccm: data.rccm,
      currency: 'FCFA',
      smsRemindersEnabled: true,
      whatsappConfirmationEnabled: true,
      features: [],
      gallery: [],
      services: [
        {
          id: 'srv-' + Date.now(),
          name: 'Coupe signature & Dégradé américain',
          category: 'Hommes',
          price: 8000,
          duration: 45,
          description: 'Shampoing purifiant, dégradé aux ciseaux et tondeuse, traçage net au rasoir et coiffage.',
          isPopular: true,
        },
      ],
      staff: [],
    }

    const next = [newSalon, ...salons]
    setSalons(next)
    saveStoredSalons(next)
    setActiveSalonId(newSalon.id)
    localStorage.setItem('barbercuts_active_salon_id_v1', newSalon.id)
    return newSalon
  }

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
    reviews,
    isLoaded,
    updateSalon,
    createSalon,
    bookAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    updateAppointmentPayment,
    saveClient,
    deleteClient,
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
    saveStaffMember,
    deleteStaffMember,
    resetDefaults,
  }
}
