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
}

export interface Appointment {
  id: string
  salonId: string
  clientName: string
  clientPhone: string
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

const STORAGE_KEYS = {
  SALONS: 'barbercuts_salons_v1',
  APPOINTMENTS: 'barbercuts_appointments_v1',
  CLIENTS: 'barbercuts_clients_v1',
  ACTIVE_SALON_ID: 'barbercuts_active_salon_id_v1',
}

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
  const [activeSalonId, setActiveSalonId] = useState<string>('barber-cuts-cocody')
  const [isLoaded, setIsLoaded] = useState(false)

  const reloadData = () => {
    const s = getStoredSalons()
    const a = getStoredAppointments()
    const c = getStoredClients()
    setSalons(s)
    setAppointments(a)
    setClients(c)
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
    isLoaded,
    updateSalon,
    createSalon,
    bookAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    updateAppointmentPayment,
    saveClient,
    deleteClient,
    saveStaffMember,
    deleteStaffMember,
    resetDefaults,
  }
}
