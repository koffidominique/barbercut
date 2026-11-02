'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSalonStore } from '@/lib/store'
import { Appointment, Salon, ClientAccount } from '@/lib/store'
import {
  Clock,
  CheckCircle2,
  X,
  Phone,
  MapPin,
  Mail,
  UserPlus,
  Calendar,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer, staggerItem } from '@/components/ui/motion'

export default function ClientAppointmentsPage() {
  const { appointments, salons, clientAccount, logoutClient, updateAppointmentStatus } = useSalonStore()
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  if (!clientAccount) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] text-[#202321] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f3e8e4] text-[#bd664a]">
            <UserPlus size={32} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#202321] mb-2">
            Compte client requis
          </h1>
          <p className="text-[#747873] mb-6">
            Veuillez vous connecter ou créer un compte pour consulter vos rendez-vous.
          </p>
          <button
            onClick={logoutClient}
            className="rounded-xl bg-[#202321] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#383d39] transition"
          >
            Se connecter / Créer un compte
          </button>
        </div>
      </div>
    )
  }

  // Filtrer les rendez-vous du client connecté (par téléphone)
  const clientAppointments = appointments.filter(
    (apt) => apt.clientPhone === clientAccount.phone
  )

  // Regrouper par statut
  const getStatusLabel = (status: Appointment['status']) => {
    const labels: Record<string, { label: string; color: string }> = {
      confirmed: { label: 'Confirmé', color: 'text-[#4d7c3b]' },
      pending: { label: 'En attente', color: 'text-[#b4843c]' },
      completed: { label: 'Terminé', color: 'text-[#7c807b]' },
      cancelled: { label: 'Annulé', color: 'text-[#c45347]' },
    }
    return labels[status] || labels.confirmed
  }

  const getSalonName = (salonId: string) => {
    const salon = salons.find((s) => s.id === salonId)
    return salon?.name || 'Salon inconnu'
  }

  const handleCancel = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      setCancelingId(id)
      updateAppointmentStatus(id, 'cancelled')
      setTimeout(() => setCancelingId(null), 500)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#202321]">
      {/* Header */}
      <section className="border-b border-[#e8e4dc] bg-white">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-10 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Link href="/" className="text-xs text-[#747873] hover:underline mb-2 block">
                ← Retour à l'accueil
              </Link>
              <h1 className="font-serif text-3xl font-bold text-[#202321]">
                Mes Rendez-vous
              </h1>
              <p className="text-xs text-[#747873] mt-1">
                Bienvenue, {clientAccount.name} • Gérer vos réservations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={logoutClient}
                className="flex items-center gap-2 rounded-xl border border-[#e8e4dc] bg-white px-4 py-2.5 text-xs font-semibold text-[#bd664a] hover:bg-[#fbf3ee] transition"
              >
                <LogOutIcon size={14} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <div className="mx-auto max-w-[1400px] px-5 sm:px-10 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#202321]">
              Vos rendez-vous ({clientAppointments.length})
            </h2>
            <p className="text-xs text-[#747873]">
              Historique et gestion de vos réservations chez Barber Cuts.
            </p>
          </div>
        </div>

        {clientAppointments.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="rounded-3xl border border-dashed border-[#d8d4ca] bg-white p-16 text-center"
          >
            <Clock className="mx-auto mb-4 text-[#bd664a]" size={48} />
            <h3 className="font-serif text-lg font-bold text-[#202321]">
              Aucun rendez-vous pour le moment
            </h3>
            <p className="mt-1 text-xs text-[#8c9089]">
              Prenez votre premier rendez-vous depuis la Marketplace Barber Cuts.
            </p>
            <Link href="/marketplace" className="mt-6 inline-block rounded-xl bg-[#202321] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#383d39] transition">
              Explorer les salons
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid gap-4"
          >
            {clientAppointments.map((apt) => {
              const salon = salons.find((s) => s.id === apt.salonId)
              const status = getStatusLabel(apt.status)
              const canCancel = apt.status === 'confirmed' || apt.status === 'pending'

              return (
                <motion.div
                  key={apt.id}
                  initial="hidden"
                  animate="visible"
                  variants={staggerItem}
                  className="rounded-3xl border border-[#e8e4dc] bg-white p-6 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-base font-bold text-[#202321]">
                          {getSalonName(apt.salonId)}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${status.color}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-[#555a53]">
                        {apt.serviceName} • {apt.staffName}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-[#747873]">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          <span>{apt.date} à {apt.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} />
                          <span>{salon?.neighborhood || ''}, {salon?.city || ''}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={14} />
                          <span>{salon?.phone || ''}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-serif text-lg font-bold text-[#202321]">
                        {apt.servicePrice.toLocaleString('fr-FR')} FCFA
                      </div>
                      <div className="text-[10px] text-[#8c9089] mt-1">
                        Paiement sur place
                      </div>

                      {canCancel && (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          disabled={cancelingId === apt.id}
                          className="mt-3 w-full rounded-xl border border-[#f5c2c0] bg-[#fbf3f2] px-3 py-2 text-xs font-semibold text-[#c45347] hover:bg-[#fdeae8] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancelingId === apt.id ? 'Annulation...' : 'Annuler le rendez-vous'}
                        </button>
                      )}
                    </div>
                  </div>

                  {apt.notes && (
                    <div className="mt-4 pt-4 border-t border-[#f0ece5]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#91958f] block mb-1">
                        Notes
                      </span>
                      <p className="text-sm text-[#555a53] italic">{apt.notes}</p>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </main>
  )
}

function LogOutIcon({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
