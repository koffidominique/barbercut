'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search,
  MapPin,
  Star,
  Clock,
  Sparkles,
  Phone,
  Scissors,
  CheckCircle2,
  Calendar,
  X,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Layers,
  Store,
  SlidersHorizontal,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { Salon, ShowcasePhoto, SalonService, Appointment } from '@/lib/store'
import { BookingModal } from '@/components/BookingModal'
import { staggerContainer, staggerItem, fadeInUp } from '@/components/ui/motion'

const MarketplaceMap = dynamic(
  () => import('@/components/MarketplaceMap').then((mod) => ({ default: mod.MarketplaceMap })),
  {
    ssr: false,
    loading: () => <div className="h-[500px] flex items-center justify-center text-[#8c9089]">Chargement de la carte...</div>,
  }
) as React.ComponentType<{ salons: Salon[]; onSelectSalon?: (salonId: string) => void }>

interface MarketplaceViewProps {
  salons: Salon[]
  onBookAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Appointment
  onSwitchToErp: () => void
}

export function MarketplaceView({
  salons,
  onBookAppointment,
  onSwitchToErp,
}: MarketplaceViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Tous')
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [sortBy, setSortBy] = useState<'mieuxNote' | 'moinsCher' | 'plusProche' | 'nouveautes'>('mieuxNote')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  // Booking modal state
  const [bookingSalon, setBookingSalon] = useState<Salon | null>(null)
  const [bookingService, setBookingService] = useState<SalonService | null>(null)

  // Lightbox photo state
  const [lightboxPhoto, setLightboxPhoto] = useState<{ photo: ShowcasePhoto; salon: Salon } | null>(null)

  // Success alert
  const [recentlyBooked, setRecentlyBooked] = useState<Appointment | null>(null)

  const publishedSalons = salons.filter((s) => s.isPublished)

  // Filtering
  const filteredSalons = publishedSalons.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.services.some((srv) => srv.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesNeighborhood =
      selectedNeighborhood === 'Tous' ||
      s.neighborhood.toLowerCase().includes(selectedNeighborhood.toLowerCase())

    const matchesCategory =
      selectedCategory === 'Tous' ||
      s.services.some((srv) => {
        if (selectedCategory === 'Hommes & Barbe') return srv.category === 'Hommes' || srv.category === 'Soins & Barbe'
        if (selectedCategory === 'Dames & Tresses') return srv.category === 'Dames'
        if (selectedCategory === 'Enfants') return srv.category === 'Enfants'
        return true
      })

    return matchesSearch && matchesNeighborhood && matchesCategory
  })

  const neighborhoods = ['Tous', 'Cocody', 'Marcory', 'Plateau', 'Deux Plateaux']
  const categories = ['Tous', 'Hommes & Barbe', 'Dames & Tresses', 'Enfants']

  // Tri appliqué après le filtrage
  const sortedSalons = [...filteredSalons].sort((a, b) => {
    if (sortBy === 'mieuxNote') return b.rating - a.rating
    if (sortBy === 'moinsCher') {
      const priceA = Math.min(...a.services.map((s) => s.price))
      const priceB = Math.min(...b.services.map((s) => s.price))
      return priceA - priceB
    }
    if (sortBy === 'plusProche') {
      // Tri par quartier (ordre de proximité approximatif, Plateaux/Cocody en premier)
      const order: Record<string, number> = { 'Plateau': 1, 'Cocody Angré': 2, 'Cocody': 3, 'Deux Plateaux': 4, 'Marcory': 5 }
      return (order[a.neighborhood] || 99) - (order[b.neighborhood] || 99)
    }
    if (sortBy === 'nouveautes') {
      // Par défaut les salons déjà triés par ordre d'affichage (les plus récents en premier)
      return 0
    }
    return 0
  })

  const handleOpenBooking = (salon: Salon, service?: SalonService) => {
    setBookingSalon(salon)
    setBookingService(service || null)
  }

  const handleBookingSuccess = (newApt: Appointment) => {
    onBookAppointment(newApt)
    setRecentlyBooked(newApt)
    setTimeout(() => setRecentlyBooked(null), 8000)
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#202321]">
      {/* Top Bar following Top Bar Contract (3 zones, 1-line wordmark, nav links, 1 action) */}
      <header className="sticky top-0 z-40 border-b border-[#e9e6df] bg-[#fbfaf7]/90 px-5 backdrop-blur-md sm:px-10">
        <div className="mx-auto flex h-[74px] max-w-[1400px] items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a href="#" className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#202321] font-serif text-xl font-bold text-[#f4c58d]">
              B
            </span>
            <span>
              <span className="font-serif text-[18px] font-bold tracking-tight text-[#202321]">
                Barber Cuts
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#92958f] ml-1.5">
                Marketplace
              </span>
            </span>
          </a>

          {/* Zone 2: 4 single-line text links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#666a64]">
            <a href="#salons" className="whitespace-nowrap shrink-0 hover:text-[#202321] transition">
              Vitrines des Salons
            </a>
            <a href="#galerie" className="whitespace-nowrap shrink-0 hover:text-[#202321] transition">
              Réalisations & Styles
            </a>
            <a href="#avantages" className="whitespace-nowrap shrink-0 hover:text-[#202321] transition">
              Réservation en direct
            </a>
            <a href="#rejoindre" className="whitespace-nowrap shrink-0 hover:text-[#202321] transition">
              Espace Professionnels
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onSwitchToErp}
              className="flex items-center gap-2 rounded-xl bg-[#202321] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#393d3a] transition whitespace-nowrap shrink-0"
            >
              <Store size={15} className="text-[#f4c58d]" />
              <span>Accéder à l'ERP Salon</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Success Toast when booking completes */}
      {recentlyBooked && (
        <div className="fixed top-20 right-5 z-50 max-w-md rounded-2xl border border-[#cbe1c3] bg-[#f2f8ef] p-4 text-xs shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-[#437d36] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#202321]">Rendez-vous envoyé au salon !</p>
              <p className="mt-0.5 text-[#5f695c]">
                {recentlyBooked.clientName} pour {recentlyBooked.serviceName} à {recentlyBooked.time}.
                Il est synchronisé en direct dans le dashboard ERP du salon.
              </p>
              <button
                onClick={onSwitchToErp}
                className="mt-2 font-bold text-[#2a5b21] underline hover:text-[#183913]"
              >
                Vérifier dans l'ERP Salon →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#e8e4dc] bg-[#222c27] text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/marketplace_hero_lifestyle_1793627543863.jpg"
            alt="Salons de coiffure d'exception"
            className="h-full w-full object-cover opacity-20 mix-blend-luminosity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#17211d] via-[#1b2520]/90 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-5 py-16 sm:px-10 lg:py-20">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e5aa72]">
              Marketplace & Vitrines Officielles
            </span>
            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight tracking-tight sm:text-5xl text-wrap-balance">
              Trouvez votre barbier ou salon d’exception en Côte d’Ivoire.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[#d0d6d1]">
              Découvrez les annonces et réalisations publiées en direct par les salons membres de l’ERP Barber Cuts.
              Explorez les photos haute définition, consultez les tarifs en FCFA et réservez votre créneau en 3 clics.
            </p>

            {/* Quick search input */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-2 rounded-2xl bg-white/10 p-2 backdrop-blur-md border border-white/15">
              <div className="flex flex-1 items-center gap-2.5 px-3 py-2 text-white w-full">
                <Search size={18} className="text-[#e2a46d]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un salon, dégradé, tresses, barbe..."
                  className="w-full bg-transparent text-xs text-white placeholder-white/60 outline-none"
                />
              </div>
              <button
                onClick={() => {}}
                className="w-full sm:w-auto rounded-xl bg-[#e4ac77] px-6 py-3 text-xs font-bold text-[#202321] transition hover:bg-[#f3bf8d]"
              >
                Explorer les vitrines
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Showcase Section */}
      <section id="salons" className="mx-auto max-w-[1400px] px-5 py-12 sm:px-10">
        {/* Filters Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between border-b border-[#e9e6df] pb-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#202321] sm:text-3xl">
              Vitrines & Annonces des Salons Partenaires
            </h2>
            <p className="mt-1 text-xs text-[#7c807b]">
              {sortedSalons.length} salon{sortedSalons.length > 1 ? 's' : ''} enregistré{sortedSalons.length > 1 ? 's' : ''} dans l’ERP avec vitrine active
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Vue liste / carte */}
            <div className="flex items-center gap-1.5 p-1 bg-[#edeae3] rounded-xl">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7069] px-2 py-1.5">
                Vue
              </label>
              {[
                { id: 'list', label: 'Liste', icon: 'layers' },
                { id: 'map', label: 'Carte', icon: 'map-pin' },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setViewMode(o.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    viewMode === o.id
                      ? 'bg-[#202321] text-white shadow-sm'
                      : 'text-[#6b7069] hover:text-[#202321]'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            {/* Tri */}
            <div className="flex items-center gap-1.5 p-1 bg-[#edeae3] rounded-xl">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7069] px-2 py-1.5">
                Trier par
              </label>
              {[
                { id: 'mieuxNote', label: 'Mieux noté' },
                { id: 'moinsCher', label: 'Moins cher' },
                { id: 'plusProche', label: 'Plus proche' },
                { id: 'nouveautes', label: 'Nouveautés' },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSortBy(o.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    sortBy === o.id
                      ? 'bg-[#202321] text-white shadow-sm'
                      : 'text-[#6b7069] hover:text-[#202321]'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            {/* Neighborhood filter */}
            <div className="flex items-center gap-1.5 p-1 bg-[#edeae3] rounded-xl">
              {neighborhoods.map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedNeighborhood(n)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    selectedNeighborhood === n
                      ? 'bg-white text-[#202321] shadow-sm'
                      : 'text-[#6b7069] hover:text-[#202321]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1.5 p-1 bg-[#edeae3] rounded-xl">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    selectedCategory === c
                      ? 'bg-[#202321] text-white shadow-sm'
                      : 'text-[#6b7069] hover:text-[#202321]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Salons Showcase Grid */}
        {viewMode === 'map' ? (
          <div className="mt-8">
            <MarketplaceMap
              salons={sortedSalons}
              onSelectSalon={(salonId) => {
                const salon = sortedSalons.find((s) => s.id === salonId)
                if (salon) {
                  setViewMode('list')
                  // Le salon sera mis en surbrillance via le scroll ou l'ouverture du modal
                }
              }}
            />
          </div>
        ) : (
          sortedSalons.length === 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="rounded-3xl border border-dashed border-[#d8d4ca] bg-white p-12 text-center"
            >
              <Store className="mx-auto mb-3 text-[#bd664a]" size={36} />
              <h3 className="font-serif text-lg font-bold text-[#202321]">Aucun salon trouvé</h3>
              <p className="mt-1 text-xs text-[#8c9089]">
                Essayez de modifier votre recherche ou vos filtres de quartier.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid gap-8 lg:grid-cols-2"
            >
              {sortedSalons.map((salon) => (
                <motion.div
                  key={salon.id}
                  initial="hidden"
                  animate="visible"
                  variants={staggerItem}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-[#e8e4dc] bg-white cursor-default"
                >
                  {/* Salon Cover & Hero Strip */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#202321]">
                    <img
                      src={salon.coverImage}
                      alt={salon.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="flex items-center gap-1 rounded-xl bg-white/90 px-3 py-1 text-[11px] font-bold text-[#202321] backdrop-blur-md shadow-sm">
                        <ShieldCheck size={14} className="text-[#3c782d]" />
                        Partenaire Vérifié ERP
                      </span>
                      <span className="flex items-center gap-1 rounded-xl bg-[#202321]/80 px-2.5 py-1 text-[11px] font-bold text-[#f4c58d] backdrop-blur-md">
                        <Star size={13} fill="#f4c58d" />
                        {salon.rating} ({salon.reviewsCount})
                      </span>
                    </div>

                    {/* Bottom title & location */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-1.5 text-xs text-[#e6b98e] font-semibold">
                        <MapPin size={13} />
                        <span>{salon.neighborhood}, {salon.city}</span>
                        <span>·</span>
                        <span>{salon.openingHours}</span>
                      </div>
                      <Link href={`/salon/${salon.id}`} className="hover:underline">
                        <h3 className="mt-1 font-serif text-2xl font-bold tracking-tight text-white">
                          {salon.name}
                        </h3>
                      </Link>
                      <p className="mt-1 text-xs text-[#d3d8d3] line-clamp-1">{salon.tagline}</p>
                    </div>
                  </div>

                  {/* Salon Content & Showcase Photos */}
                  <div className="flex flex-1 flex-col p-6 space-y-5">
                    {/* Photo Gallery Showcase (Clickable thumbnails with descriptions) */}
                    <div>
                      <div className="mb-2.5 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#91958f]">
                          Photos & Réalisations publiées ({salon.gallery.length})
                        </span>
                        <span className="text-[11px] text-[#bd664a] font-semibold">
                          Cliquez pour agrandir
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2.5">
                        {salon.gallery.map((photo) => (
                          <button
                            type="button"
                            key={photo.id}
                            onClick={() => setLightboxPhoto({ photo, salon })}
                            className="group/thumb relative aspect-[4/3] overflow-hidden rounded-xl bg-[#202321] text-left transition hover:ring-2 hover:ring-[#bd664a]"
                          >
                            <img
                              src={photo.url}
                              alt={photo.title}
                              className="h-full w-full object-cover transition duration-300 group-hover/thumb:scale-110"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2 text-white">
                              <span className="text-[10px] font-bold leading-tight line-clamp-1">
                                {photo.title}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Features & Amenities */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#91958f] block mb-2">
                        Équipements & Confort
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {salon.features.slice(0, 4).map((feat) => (
                          <span
                            key={feat}
                            className="rounded-lg bg-[#f5f3ec] px-2.5 py-1 text-[11px] font-medium text-[#5c615a]"
                          >
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Highlighted Services List with direct booking */}
                    <div className="border-t border-[#f0ece5] pt-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#91958f] block mb-2.5">
                        Prestations & Tarifs directs
                      </span>
                      <div className="space-y-2">
                        {salon.services.slice(0, 3).map((srv) => (
                          <div
                            key={srv.id}
                            className="flex items-center justify-between rounded-xl border border-[#ede9e2] bg-[#fdfcf9] px-3.5 py-2.5 transition hover:border-[#bd664a]"
                          >
                            <div>
                              <div className="text-xs font-semibold text-[#202321]">{srv.name}</div>
                              <div className="text-[11px] text-[#868a83]">
                                {srv.duration} min · {srv.category}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-serif text-xs font-bold text-[#bd664a]">
                                {srv.price.toLocaleString('fr-FR')} F
                              </span>
                              <button
                                onClick={() => handleOpenBooking(salon, srv)}
                                className="rounded-lg bg-[#202321] px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#3d423e] transition"
                              >
                                Réserver
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Main Action Bar */}
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#f0ece5]">
                      <div className="text-xs text-[#7d827b]">
                        <span className="font-semibold text-[#202321]">{salon.staff.length}</span> barbiers/coiffeurs disponibles
                      </div>

                      <button
                        onClick={() => handleOpenBooking(salon)}
                        className="flex items-center gap-2 rounded-xl bg-[#bd664a] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#a55339] transition"
                      >
                        <Calendar size={14} />
                        <span>Prendre rendez-vous</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )
        )}
      </section>

      {/* Trust & Advantage Section */}
      <section id="avantages" className="border-t border-[#e8e4dc] bg-[#fbfaf7] py-16">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-10">
          <div className="mb-12 text-center max-w-xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#bd664a]">
              L'expérience Barber Cuts
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold text-[#202321]">
              Pourquoi réserver sur la Marketplace ?
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e8e4dc] bg-white p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5ede5] text-[#bd664a]">
                <Sparkles size={20} />
              </div>
              <h3 className="font-serif text-base font-bold text-[#202321]">Vitrines authentiques</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#737871]">
                Toutes les photos sont directement téléversées par les salons depuis leur ERP de gestion. Pas de tromperie, uniquement de vrais dégradés et coiffures.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8e4dc] bg-white p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#ebf3e8] text-[#4d7c3b]">
                <Clock size={20} />
              </div>
              <h3 className="font-serif text-base font-bold text-[#202321]">Zéro attente au salon</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#737871]">
                Votre créneau horaire est réservé immédiatement dans le planning officiel du coiffeur. Votre place est garantie à votre arrivée.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8e4dc] bg-white p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6edf5] text-[#43648f]">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-serif text-base font-bold text-[#202321]">Tarifs transparents en FCFA</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#737871]">
                Les prix sont fixés à l'avance sans mauvaises surprises. Réglez tranquillement sur place en espèces, Wave ou Orange Money.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pro Join Banner */}
      <section id="rejoindre" className="border-t border-[#e8e4dc] bg-[#202321] py-14 text-white">
        <div className="mx-auto flex flex-col md:flex-row items-center justify-between gap-8 max-w-[1400px] px-5 sm:px-10">
          <div className="max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e4ac77]">
              Pour les professionnels de la coiffure
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold">
              Vous êtes gérant d'un salon ou barbier ?
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#c3cac4]">
              Utilisez l’ERP Barber Cuts pour piloter votre salon, vos coiffeurs, et publiez votre propre vitrine publicitaire pour capter de nouveaux clients chaque semaine.
            </p>
          </div>
          <button
            onClick={onSwitchToErp}
            className="flex items-center gap-2 rounded-xl bg-[#e4ac77] px-6 py-3.5 text-xs font-bold text-[#202321] transition hover:bg-[#f1bd88] whitespace-nowrap shrink-0"
          >
            <Store size={16} />
            <span>Ouvrir l’ERP Barber Cuts</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* LIGHTBOX MODAL FOR SHOWCASE PHOTOS */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setLightboxPhoto(null)}
          />
          <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl bg-[#202321] text-white shadow-2xl">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute right-4 top-4 z-20 rounded-full bg-black/50 p-2 text-white hover:bg-black/80 transition"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            <div className="grid md:grid-cols-2">
              <div className="relative aspect-[4/3] md:aspect-auto bg-black">
                <img
                  src={lightboxPhoto.photo.url}
                  alt={lightboxPhoto.photo.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex flex-col justify-between p-6 sm:p-8">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#e4ac77]">
                    <Store size={14} />
                    <span>{lightboxPhoto.salon.name}</span>
                  </div>
                  <h3 className="mt-2 font-serif text-2xl font-bold text-white">
                    {lightboxPhoto.photo.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-[#c5cbc5]">
                    {lightboxPhoto.photo.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {lightboxPhoto.photo.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-[#e4ac77]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-4 text-xs text-[#a4aca4]">
                    <p>📍 {lightboxPhoto.salon.neighborhood}, {lightboxPhoto.salon.address}</p>
                    <p className="mt-1">📞 {lightboxPhoto.salon.phone}</p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-3">
                  <button
                    onClick={() => {
                      const s = lightboxPhoto.salon
                      setLightboxPhoto(null)
                      handleOpenBooking(s)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#bd664a] px-4 py-3 text-xs font-bold text-white hover:bg-[#aa573e] transition"
                  >
                    <Calendar size={15} />
                    <span>Réserver pour cette coupe</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingSalon && (
        <BookingModal
          salon={bookingSalon}
          preselectedService={bookingService}
          isOpen={!!bookingSalon}
          onClose={() => {
            setBookingSalon(null)
            setBookingService(null)
          }}
          onBookSuccess={handleBookingSuccess}
          onSwitchToErp={onSwitchToErp}
        />
      )}
    </div>
  )
}
