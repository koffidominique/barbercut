'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useNotifications, type Notification } from '@/lib/notifications'
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
  X,
  Store,
  Eye,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Scissors,
} from 'lucide-react'
import { useSalonStore, Appointment } from '@/lib/store'
import { VitrineManager } from '@/components/VitrineManager'
import { staggerContainer, staggerItem, fadeInUp } from '@/components/ui/motion'
import { ERPAppointmentsView } from '@/components/ERPAppointmentsView'
import { ERPClientsView } from '@/components/ERPClientsView'
import { ERPServicesView } from '@/components/ERPServicesView'
import { ERPTeamView } from '@/components/ERPTeamView'

// Chargement paresseux des composants lourds (D3 chart, analytics, modales)
const WeeklyRevenueChart = dynamic(
  () => import('@/components/WeeklyRevenueChart').then((mod) => ({ default: mod.WeeklyRevenueChart })),
  {
    loading: () => (
      <div className="h-64 bg-[#f5f3ec] rounded-3xl flex items-center justify-center animate-pulse">
        <span className="text-xs text-[#8c9089]">Chargement du graphique...</span>
      </div>
    ),
    ssr: false,
  }
) as React.ComponentType<{}>

const ERPReportsView = dynamic(
  () => import('@/components/ERPReportsView').then((mod) => ({ default: mod.ERPReportsView })),
  {
    loading: () => (
      <div className="h-64 bg-[#f5f3ec] rounded-3xl flex items-center justify-center animate-pulse">
        <span className="text-xs text-[#8c9089]">Chargement des rapports...</span>
      </div>
    ),
    ssr: false,
  }
) as React.ComponentType<{ salon: import('@/lib/store').Salon; appointments: Appointment[] }>

const ERPAnalyticsView = dynamic(
  () => import('@/components/ERPAnalyticsView').then((mod) => ({ default: mod.ERPAnalyticsView })),
  {
    loading: () => (
      <div className="h-96 bg-[#f5f3ec] rounded-3xl flex items-center justify-center animate-pulse">
        <span className="text-xs text-[#8c9089]">Chargement des analytics...</span>
      </div>
    ),
    ssr: false,
  }
) as React.ComponentType<{ salon: import('@/lib/store').Salon; appointments: Appointment[]; staff: import('@/lib/store').StaffMember[] }>

const ERPSubscriptionView = dynamic(
  () => import('@/components/ERPSubscriptionView').then((mod) => ({ default: mod.ERPSubscriptionView })),
  {
    loading: () => (
      <div className="h-96 bg-[#f5f3ec] rounded-3xl flex items-center justify-center animate-pulse">
        <span className="text-xs text-[#8c9089]">Chargement de l'abonnement...</span>
      </div>
    ),
    ssr: false,
  }
) as React.ComponentType<{ salon: import('@/lib/store').Salon }>

const MarketplaceView = dynamic(
  () => import('@/components/MarketplaceView').then((mod) => ({ default: mod.MarketplaceView })),
  {
    loading: () => (
      <div className="min-h-[400px] bg-[#f5f3ec] rounded-3xl flex items-center justify-center animate-pulse">
        <span className="text-xs text-[#8c9089]">Chargement de la marketplace...</span>
      </div>
    ),
    ssr: false,
  }
) as React.ComponentType<{ salons: import('@/lib/store').Salon[]; onBookAppointment: (data: Omit<Appointment, 'id' | 'createdAt'>) => Appointment; onSwitchToErp: () => void }>
import { ERPSettingsView } from '@/components/ERPSettingsView'

export default function Page() {
  const {
    salons,
    currentSalon,
    activeSalonId,
    setActiveSalonId,
    appointments,
    clients,
    updateSalon,
    bookAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    updateAppointmentPayment,
    saveClient,
    deleteClient,
    saveStaffMember,
    deleteStaffMember,
  } = useSalonStore()

  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [showToast, setShowToast] = useState<Notification | null>(null)

  // Afficher un toast pour la notification la plus récente non lue
  useEffect(() => {
    const unread = notifications.find((n) => !n.read)
    if (unread && !showToast) {
      setShowToast(unread)
      markAsRead(unread.id)
    }
  }, [notifications, showToast, markAsRead])

  const [activeNav, setActiveNav] = useState<string>('Vue d’ensemble')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)

  // Current salon appointments
  const salonAppointments = appointments.filter((a) => a.salonId === currentSalon.id)
  const marketplaceApts = salonAppointments.filter((a) => a.source === 'marketplace')

  // Calculate live KPI numbers
  const totalRevenue = salonAppointments
    .filter((a) => a.status === 'confirmed' || a.status === 'completed')
    .reduce((sum, a) => sum + (a.servicePrice || 0), 0)

  // If activeNav is 'Marketplace', render full marketplace view
  if (activeNav === 'Marketplace') {
    return (
      <MarketplaceView
        salons={salons}
        onBookAppointment={bookAppointment}
        onSwitchToErp={() => setActiveNav('Vue d’ensemble')}
      />
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#202321] selection:bg-[#c86b4c]/20">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[265px] flex-col border-r border-[#e9e6df] bg-[#fbfaf7] px-5 py-6 transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#202321] text-[#f4c58d]">
              <span className="font-serif text-xl font-bold">B</span>
            </div>
            <div>
              <div className="font-serif text-[18px] font-bold tracking-tight">Barber Cuts</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#92958f]">
                ERP & Marketplace
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Salon switcher */}
        <div className="mb-5 rounded-2xl border border-[#e8e4dc] bg-white p-3">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#a5a59f]">
            Salon sélectionné
          </div>
          <select
            value={activeSalonId}
            onChange={(e) => setActiveSalonId(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#e9e6df] bg-[#fbfaf7] px-2.5 py-1.5 text-xs font-semibold text-[#202321] outline-none"
          >
            {salons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.neighborhood})
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#7a7e78]">
            <span>Vitrine Marketplace</span>
            <span
              className={`font-semibold ${
                currentSalon.isPublished ? 'text-[#48793b]' : 'text-[#bd664a]'
              }`}
            >
              {currentSalon.isPublished ? '● En ligne' : '○ Masquée'}
            </span>
          </div>
        </div>

        <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a5a59f]">
          Espace salon
        </div>
        <nav className="space-y-1">
          <button
            onClick={() => {
              setActiveNav('Vue d’ensemble')
              setMobileOpen(false)
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition ${
              activeNav === 'Vue d’ensemble'
                ? 'bg-[#efe9df] text-[#202321] font-semibold'
                : 'text-[#747873] hover:bg-[#f1efea] hover:text-[#202321]'
            }`}
          >
            <span className="flex items-center gap-3">
              <LayoutDashboard size={17} strokeWidth={1.8} />
              Vue d’ensemble
            </span>
          </button>

          <button
            onClick={() => {
              setActiveNav('Rendez-vous')
              setMobileOpen(false)
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition ${
              activeNav === 'Rendez-vous'
                ? 'bg-[#efe9df] text-[#202321] font-semibold'
                : 'text-[#747873] hover:bg-[#f1efea] hover:text-[#202321]'
            }`}
          >
            <span className="flex items-center gap-3">
              <CalendarDays size={17} strokeWidth={1.8} />
              Rendez-vous
            </span>
            <span className="rounded-md bg-[#d47b59] px-1.5 py-0.5 text-[10px] font-bold text-white">
              {salonAppointments.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveNav('Clients')
              setMobileOpen(false)
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition ${
              activeNav === 'Clients'
                ? 'bg-[#efe9df] text-[#202321] font-semibold'
                : 'text-[#747873] hover:bg-[#f1efea] hover:text-[#202321]'
            }`}
          >
            <span className="flex items-center gap-3">
              <Users size={17} strokeWidth={1.8} />
              Clients
            </span>
            <span className="text-[11px] font-semibold text-[#8c9089]">{clients.length}</span>
          </button>

          <button
            onClick={() => {
              setActiveNav('Prestations')
              setMobileOpen(false)
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition ${
              activeNav === 'Prestations'
                ? 'bg-[#efe9df] text-[#202321] font-semibold'
                : 'text-[#747873] hover:bg-[#f1efea] hover:text-[#202321]'
            }`}
          >
            <span className="flex items-center gap-3">
              <Scissors size={17} strokeWidth={1.8} />
              Prestations
            </span>
            <span className="text-[11px] font-semibold text-[#8c9089]">
              {currentSalon.services.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveNav('Équipe')
              setMobileOpen(false)
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition ${
              activeNav === 'Équipe'
                ? 'bg-[#efe9df] text-[#202321] font-semibold'
                : 'text-[#747873] hover:bg-[#f1efea] hover:text-[#202321]'
            }`}
          >
            <span className="flex items-center gap-3">
              <ClipboardList size={17} strokeWidth={1.8} />
              Équipe
            </span>
            <span className="text-[11px] font-semibold text-[#8c9089]">
              {currentSalon.staff.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveNav('Vitrine boutique')
              setMobileOpen(false)
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition ${
              activeNav === 'Vitrine boutique'
                ? 'bg-[#202321] text-white font-semibold'
                : 'text-[#747873] hover:bg-[#f1efea] hover:text-[#202321]'
            }`}
          >
            <span className="flex items-center gap-3">
              <ShoppingBag size={17} strokeWidth={1.8} />
              Vitrine & Annonces
            </span>
            <span className="h-2 w-2 rounded-full bg-[#d47b59]" />
          </button>
        </nav>

        <div className="mb-2 mt-5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a5a59f]">
          Gestion & Analyses
        </div>
        <nav className="space-y-1">
          <button
            onClick={() => {
              setActiveNav('Rapports')
              setMobileOpen(false)
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition ${
              activeNav === 'Rapports'
                ? 'bg-[#efe9df] text-[#202321] font-semibold'
                : 'text-[#747873] hover:bg-[#f1efea] hover:text-[#202321]'
            }`}
          >
            <span className="flex items-center gap-3">
              <TrendingUp size={17} strokeWidth={1.8} />
              Rapports
            </span>
          </button>

          <button
            onClick={() => {
              setActiveNav('Analytics')
              setMobileOpen(false)
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition ${
              activeNav === 'Analytics'
                ? 'bg-[#efe9df] text-[#202321] font-semibold'
                : 'text-[#747873] hover:bg-[#f1efea] hover:text-[#202321]'
            }`}
          >
            <span className="flex items-center gap-3">
              <TrendingUp size={17} strokeWidth={1.8} />
              Analytics
            </span>
          </button>

          <button
            onClick={() => {
              setActiveNav('Abonnement')
              setMobileOpen(false)
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition ${
              activeNav === 'Abonnement'
                ? 'bg-[#efe9df] text-[#202321] font-semibold'
                : 'text-[#747873] hover:bg-[#f1efea] hover:text-[#202321]'
            }`}
          >
            <span className="flex items-center gap-3">
              <WalletCards size={17} strokeWidth={1.8} />
              Abonnement
            </span>
          </button>

          <button
            onClick={() => {
              setActiveNav('Paramètres')
              setMobileOpen(false)
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition ${
              activeNav === 'Paramètres'
                ? 'bg-[#efe9df] text-[#202321] font-semibold'
                : 'text-[#747873] hover:bg-[#f1efea] hover:text-[#202321]'
            }`}
          >
            <span className="flex items-center gap-3">
              <Settings2 size={17} strokeWidth={1.8} />
              Paramètres
            </span>
          </button>
        </nav>

        <div className="mb-2 mt-5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a5a59f]">
          Canal Public
        </div>
        <nav className="space-y-1">
          <button
            onClick={() => {
              setActiveNav('Marketplace')
              setMobileOpen(false)
            }}
            className="flex w-full items-center justify-between rounded-xl border border-[#ebd8c8] bg-[#fdf5ee] px-3 py-2 text-[13px] font-bold text-[#a45339] hover:bg-[#f9eee3] transition"
          >
            <span className="flex items-center gap-2.5">
              <Eye size={17} />
              Voir la Marketplace
            </span>
            <ExternalLink size={13} />
          </button>
        </nav>

        {/* Footer profile */}
        <div className="mt-auto space-y-1 pt-3">
          <div className="flex items-center gap-3 border-t border-[#ebe8e1] px-2 pt-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8ad89] text-xs font-bold text-[#543b2d]">
              AK
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold">Aminata Kouassi</div>
              <div className="truncate text-[11px] text-[#989b94]">Gérante · Cocody</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Section */}
      <section className="lg:pl-[265px]">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#e9e6df] bg-[#fbfaf7]/85 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>
            <div className="hidden items-center gap-2 text-xs text-[#959891] sm:flex">
              <span>{currentSalon.name}</span>
              <ChevronRight size={14} />
              <span className="font-semibold text-[#424641]">{activeNav}</span>
            </div>
            <h1 className="font-serif text-lg font-bold sm:hidden">{activeNav}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Direct Switcher to Marketplace */}
            <button
              onClick={() => setActiveNav('Marketplace')}
              className="flex items-center gap-2 rounded-xl border border-[#dedad0] bg-white px-3.5 py-2 text-xs font-bold text-[#202321] hover:bg-[#f5f3ec] transition shadow-sm"
            >
              <Eye size={14} className="text-[#bd664a]" />
              <span className="hidden sm:inline">Vitrine publique Marketplace</span>
              <span className="sm:hidden">Vitrine</span>
              <ExternalLink size={12} className="text-[#9ea29b]" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative rounded-xl p-2.5 text-[#6e736d] hover:bg-[#f0eee9]"
                aria-label="Notifications"
              >
                <Bell size={18} strokeWidth={1.8} />
                {marketplaceApts.length > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#d47b59]" />
                )}
              </button>

              {/* Notification dropdown */}
              {notificationOpen && (
                <div className="absolute right-0 top-12 z-30 w-80 rounded-2xl border border-[#e5e1d8] bg-white p-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#f1eee8] pb-2">
                    <span className="font-serif text-xs font-bold text-[#202321]">
                      Réservations Marketplace ({marketplaceApts.length})
                    </span>
                    <button
                      onClick={() => setNotificationOpen(false)}
                      className="text-[11px] text-[#8e928b] hover:text-[#202321]"
                    >
                      Fermer
                    </button>
                  </div>
                  <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                    {marketplaceApts.slice(0, 4).map((apt) => (
                      <div
                        key={apt.id}
                        className="rounded-xl bg-[#faf8f4] p-2.5 text-xs border border-[#f0ece5]"
                      >
                        <div className="font-semibold text-[#202321]">{apt.clientName}</div>
                        <div className="text-[11px] text-[#7a7f78]">
                          {apt.serviceName} · {apt.time}
                        </div>
                        <div className="mt-1 text-[10px] text-[#bd664a] font-bold">
                          Origine : Vitrine Marketplace
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setNotificationOpen(false)
                      setActiveNav('Rendez-vous')
                    }}
                    className="mt-3 w-full rounded-lg bg-[#202321] py-2 text-center text-xs font-bold text-white"
                  >
                    Voir tous les rendez-vous
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10">
          {/* TAB 1: VUE D'ENSEMBLE */}
          {activeNav === 'Vue d’ensemble' && (
            <div className="space-y-6">
              {/* Salutation & Actions */}
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-1 text-sm text-[#92958f]">Mardi 12 novembre 2024</p>
                  <h2 className="font-serif text-[30px] font-bold leading-tight tracking-tight sm:text-[36px]">
                    Bonjour, Aminata<span className="text-[#d47b59]">.</span>
                  </h2>
                  <p className="mt-1.5 text-xs text-[#747873]">
                    Voici l’activité de <strong>{currentSalon.name}</strong> et les performances de votre vitrine.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveNav('Vitrine boutique')}
                    className="flex items-center gap-2 rounded-xl border border-[#dedad0] bg-white px-4 py-3 text-xs font-bold text-[#202321] shadow-sm hover:bg-[#f6f4ee] transition"
                  >
                    <ShoppingBag size={16} className="text-[#bd664a]" />
                    <span>Gérer ma Vitrine & Photos</span>
                  </button>
                  <button
                    onClick={() => setActiveNav('Rendez-vous')}
                    className="flex items-center gap-2 rounded-xl bg-[#202321] px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#363a37] transition"
                  >
                    <Plus size={16} />
                    <span>Nouveau rendez-vous</span>
                  </button>
                </div>
              </div>

              {/* KPI Stat Cards with dynamic values */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
              >
                <motion.div initial="hidden" animate="visible" variants={staggerItem} className="cursor-default">
                  <StatCard
                    icon={<CalendarDays size={18} />}
                    label="Rendez-vous prévus"
                    value={salonAppointments.length.toString()}
                    detail={`${marketplaceApts.length} venus de la Marketplace`}
                    positive
                  />
                </motion.div>
                <motion.div initial="hidden" animate="visible" variants={staggerItem} className="cursor-default">
                  <StatCard
                    icon={<WalletCards size={18} />}
                    label="Chiffre d’affaires estimé"
                    value={totalRevenue.toLocaleString('fr-FR')}
                    suffix="FCFA"
                    detail="Prestations confirmées"
                    positive
                  />
                </motion.div>
                <motion.div initial="hidden" animate="visible" variants={staggerItem} className="cursor-default">
                  <StatCard
                    icon={<ShoppingBag size={18} />}
                    label="Statut Vitrine Publique"
                    value={currentSalon.isPublished ? 'En ligne' : 'Masquée'}
                    detail={`${currentSalon.gallery.length} photos publiées`}
                    positive={currentSalon.isPublished}
                  />
                </motion.div>
                <motion.div initial="hidden" animate="visible" variants={staggerItem} className="cursor-default">
                  <StatCard
                    icon={<Sparkles size={18} />}
                    label="Note Moyenne Marketplace"
                    value={`${currentSalon.rating}/5`}
                    detail={`${currentSalon.reviewsCount} avis certifiés`}
                    positive
                  />
                </motion.div>
              </motion.div>

              {/* D3 Weekly Revenue Chart */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="mt-6"
              >
                <WeeklyRevenueChart />
              </motion.div>

              {/* Main Content Split: Schedule & Vitrine Spotlight */}
              <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
                {/* Daily Appointments Schedule */}
                <section className="rounded-3xl border border-[#e9e6df] bg-white p-5 sm:p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#202321]">
                        Planning des rendez-vous
                      </h3>
                      <p className="mt-0.5 text-xs text-[#92958f]">
                        {salonAppointments.length} réservations enregistrées
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveNav('Rendez-vous')}
                      className="flex items-center gap-1 text-xs font-bold text-[#bd664a] hover:underline"
                    >
                      Tout afficher <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {salonAppointments.slice(0, 5).map((apt) => (
                      <div
                        key={apt.id}
                        className="group flex items-center gap-3 rounded-2xl border border-[#f0ece5] bg-[#fcfbf9] px-3.5 py-3 transition hover:bg-[#f6f4ee]"
                      >
                        <div className="w-12 text-xs font-bold text-[#555a53]">{apt.time}</div>
                        <div className="h-8 w-1 rounded-full bg-[#bd664a]" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-xs font-bold text-[#202321]">
                              {apt.clientName}
                            </span>
                            {apt.source === 'marketplace' && (
                              <span className="rounded bg-[#fdf3ec] px-1.5 py-0.5 text-[9px] font-bold text-[#bd664a]">
                                Marketplace
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#868a83]">
                            {apt.serviceName} · {apt.staffName}
                          </div>
                        </div>
                        <span className="font-serif text-xs font-bold text-[#202321]">
                          {apt.servicePrice.toLocaleString('fr-FR')} F
                        </span>
                        <span
                          className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                            apt.status === 'confirmed'
                              ? 'bg-[#ebf4e6] text-[#427a33]'
                              : 'bg-[#faf0e6] text-[#bd664a]'
                          }`}
                        >
                          {apt.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Vitrine Boutique Spotlight Card */}
                <section className="relative overflow-hidden rounded-3xl bg-[#29342f] p-6 text-white shadow-md flex flex-col justify-between">
                  <img
                    src={currentSalon.coverImage}
                    alt={currentSalon.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-luminosity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18231f] via-[#1e2a24]/90 to-transparent" />

                  <div className="relative z-10">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e2a46d] text-[#29342f]">
                      <ShoppingBag size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e0b48a]">
                      Votre vitrine & Annonces
                    </span>
                    <h3 className="mt-1 font-serif text-2xl font-bold leading-tight">
                      Faites rayonner {currentSalon.name}.
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#d4ded6]">
                      Publiez les images de vos dégradés et coiffures, mettez à jour vos prestations et recevez directement des réservations depuis la Marketplace Barber Cuts.
                    </p>

                    <div className="mt-4 rounded-xl bg-white/10 p-3 text-xs text-[#e4ede6] space-y-1">
                      <div className="flex justify-between">
                        <span>Photos publiées :</span>
                        <strong>{currentSalon.gallery.length} photos</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Prestations au catalogue :</span>
                        <strong>{currentSalon.services.length} services</strong>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
                    <button
                      onClick={() => setActiveNav('Vitrine boutique')}
                      className="rounded-xl bg-[#e4ac77] px-4 py-2.5 text-xs font-bold text-[#29342f] transition hover:bg-[#f1bd88]"
                    >
                      Configurer ma vitrine
                    </button>
                    <button
                      onClick={() => setActiveNav('Marketplace')}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#f4c58d] hover:underline"
                    >
                      <span>Aperçu public</span>
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </section>
              </div>

              {/* Lower split: Recent Activities & Prestations populaires */}
              <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <section className="rounded-3xl border border-[#e9e6df] bg-white p-5 sm:p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#202321]">
                        Activité récente
                      </h3>
                      <p className="text-xs text-[#92958f]">
                        Dernières réservations et mises à jour
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {salonAppointments.slice(0, 3).map((a) => (
                      <div key={a.id} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2ede4] text-xs font-bold text-[#bd664a]">
                          {a.clientName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1 text-xs text-[#6e736d]">
                          <strong>{a.clientName}</strong> a réservé{' '}
                          <strong>{a.serviceName}</strong> (
                          {a.source === 'marketplace' ? 'Via Marketplace' : 'En salon'})
                          <div className="text-[10px] text-[#a5aaa3]">{a.time} · {a.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-[#e9e6df] bg-white p-5 sm:p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#202321]">
                        Prestations au catalogue
                      </h3>
                      <p className="text-xs text-[#92958f]">
                        Tarifs et disponibilités affichés sur l’annonce
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveNav('Prestations')}
                      className="text-xs font-bold text-[#bd664a]"
                    >
                      Gérer le menu
                    </button>
                  </div>
                  <div className="space-y-3">
                    {currentSalon.services.slice(0, 4).map((srv) => (
                      <div
                        key={srv.id}
                        className="flex items-center justify-between rounded-xl bg-[#faf8f4] p-3 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-[#202321]">{srv.name}</div>
                          <div className="text-[10px] text-[#8c9089]">
                            {srv.duration} min · {srv.category}
                          </div>
                        </div>
                        <div className="font-serif font-bold text-[#bd664a]">
                          {srv.price.toLocaleString('fr-FR')} FCFA
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* TAB 2: RENDEZ-VOUS */}
          {activeNav === 'Rendez-vous' && (
            <ERPAppointmentsView
              salon={currentSalon}
              appointments={appointments}
              onUpdateStatus={updateAppointmentStatus}
              onUpdatePayment={updateAppointmentPayment}
              onDeleteAppointment={deleteAppointment}
              onAddAppointment={bookAppointment}
            />
          )}

          {/* TAB 3: CLIENTS */}
          {activeNav === 'Clients' && (
            <ERPClientsView
              salon={currentSalon}
              clients={clients}
              onSaveClient={saveClient}
              onDeleteClient={deleteClient}
            />
          )}

          {/* TAB 4: PRESTATIONS */}
          {activeNav === 'Prestations' && (
            <ERPServicesView
              salon={currentSalon}
              onUpdateSalon={updateSalon}
            />
          )}

          {/* TAB 5: EQUIPE */}
          {activeNav === 'Équipe' && (
            <ERPTeamView
              salon={currentSalon}
              onSaveStaff={saveStaffMember}
              onDeleteStaff={deleteStaffMember}
            />
          )}

          {/* TAB 6: VITRINE BOUTIQUE */}
          {activeNav === 'Vitrine boutique' && (
            <VitrineManager
              salon={currentSalon}
              onUpdateSalon={updateSalon}
              onViewMarketplace={() => setActiveNav('Marketplace')}
            />
          )}

          {/* TAB 7: RAPPORTS */}
          {activeNav === 'Rapports' && (
            <ERPReportsView
              salon={currentSalon}
              appointments={appointments}
            />
          )}

          {/* TAB 8: ANALYTICS AVANCÉS */}
          {activeNav === 'Analytics' && (
            <ERPAnalyticsView
              salon={currentSalon}
              appointments={appointments}
              staff={currentSalon.staff}
            />
          )}

          {/* TAB 9: ABONNEMENT */}
          {activeNav === 'Abonnement' && (
            <ERPSubscriptionView salon={currentSalon} />
          )}

          {/* TAB 10: PARAMETRES */}
          {activeNav === 'Paramètres' && (
            <ERPSettingsView
              salon={currentSalon}
              onUpdateSalon={updateSalon}
            />
          )}
        </div>
      </section>

      {/* Toast Notification */}
      {showToast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#202321] px-5 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200"
          onClick={() => setShowToast(null)}
        >
          <Bell size={16} className="text-[#f4c58d] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[#202321]">{showToast.title}</p>
            <p className="mt-0.5 text-[#747873]">{showToast.message}</p>
          </div>
          {showToast.actionUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowToast(null)
              }}
              className="mt-1.5 font-bold text-xs text-[#bd664a] underline hover:text-[#a45339]"
            >
              {showToast.actionLabel}
            </button>
          )}
        </div>
      )}
    </main>
  )
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  detail,
  positive,
}: {
  icon: React.ReactNode
  label: string
  value: string
  suffix?: string
  detail: string
  positive?: boolean
}) {
  return (
    <div className="rounded-3xl border border-[#e9e6df] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3eee7] text-[#bd664a]">
          {icon}
        </div>
        {positive && <span className="text-[10px] font-bold text-[#688a5b]">Actif</span>}
      </div>
      <p className="text-xs text-[#92958f]">{label}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-serif text-[26px] font-bold tracking-tight text-[#202321]">
          {value}
        </span>
        {suffix && <span className="text-[10px] font-semibold text-[#92958f]">{suffix}</span>}
      </div>
      <p className="mt-1 text-[11px] text-[#92958f]">{detail}</p>
    </div>
  )
}
