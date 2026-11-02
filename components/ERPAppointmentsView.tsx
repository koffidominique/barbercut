'use client'

import { useState } from 'react'
import {
  CalendarDays,
  Plus,
  Clock,
  User,
  Phone,
  Check,
  X,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Scissors,
  MessageSquare,
} from 'lucide-react'
import { Appointment, Salon, useSalonStore } from '@/lib/store'

interface ERPAppointmentsViewProps {
  salon: Salon
  appointments: Appointment[]
  onUpdateStatus: (id: string, status: Appointment['status']) => void
  onUpdatePayment: (
    id: string,
    paymentStatus: Appointment['paymentStatus'],
    paymentMethod?: Appointment['paymentMethod']
  ) => void
  onDeleteAppointment: (id: string) => void
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Appointment
}

export function ERPAppointmentsView({
  salon,
  appointments,
  onUpdateStatus,
  onUpdatePayment,
  onDeleteAppointment,
  onAddAppointment,
}: ERPAppointmentsViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  // New appointment form state
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [newServiceId, setNewServiceId] = useState(salon.services[0]?.id || '')
  const [newStaffName, setNewStaffName] = useState(salon.staff[0]?.name || 'Jules M.')
  const [newDate, setNewDate] = useState('2026-11-02')
  const [newTime, setNewTime] = useState('15:00')
  const [newNotes, setNewNotes] = useState('')

  // Salons appointments only
  const salonAppointments = appointments.filter((apt) => apt.salonId === salon.id)

  const filtered = salonAppointments.filter((apt) => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus
    const matchesSource = filterSource === 'all' || apt.source === filterSource
    const matchesSearch =
      apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.clientPhone.includes(searchTerm)
    return matchesStatus && matchesSource && matchesSearch
  })

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientName.trim() || !newClientPhone.trim()) return

    const srv = salon.services.find((s) => s.id === newServiceId) || salon.services[0]

    onAddAppointment({
      salonId: salon.id,
      clientName: newClientName.trim(),
      clientPhone: newClientPhone.trim(),
      serviceId: srv.id,
      serviceName: srv.name,
      servicePrice: srv.price,
      staffName: newStaffName,
      date: newDate,
      time: newTime,
      status: 'confirmed',
      source: 'direct',
      notes: newNotes.trim() || undefined,
    })

    setNewClientName('')
    setNewClientPhone('')
    setNewNotes('')
    setIsNewModalOpen(false)
  }

  const marketplaceCount = salonAppointments.filter((a) => a.source === 'marketplace').length

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#bd664a]">
            <CalendarDays size={15} />
            <span>Gestion des Rendez-vous & Réservations</span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold text-[#202321]">
            Planning & Rendez-vous ({salonAppointments.length})
          </h2>
          <p className="mt-1 text-xs text-[#7c807b]">
            Retrouvez tous les rendez-vous pris au salon ou via vos annonces publicitaires sur la Marketplace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-[#fdf3ec] border border-[#f5dece] px-3.5 py-2 text-xs font-semibold text-[#bd664a]">
            <Sparkles size={14} />
            <span>{marketplaceCount} reçus via la Marketplace</span>
          </div>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#202321] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#383d39] transition"
          >
            <Plus size={15} />
            <span>Nouveau rendez-vous</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#ebe8e1] rounded-xl">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterStatus === 'all'
                  ? 'bg-white text-[#202321] shadow-sm'
                  : 'text-[#6f746e] hover:text-[#202321]'
              }`}
            >
              Tous ({salonAppointments.length})
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterStatus === 'confirmed'
                  ? 'bg-white text-[#202321] shadow-sm'
                  : 'text-[#6f746e] hover:text-[#202321]'
              }`}
            >
              Confirmés
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterStatus === 'pending'
                  ? 'bg-white text-[#202321] shadow-sm'
                  : 'text-[#6f746e] hover:text-[#202321]'
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterStatus === 'completed'
                  ? 'bg-white text-[#202321] shadow-sm'
                  : 'text-[#6f746e] hover:text-[#202321]'
              }`}
            >
              Terminés
            </button>
          </div>

          {/* Source filter */}
          <div className="flex items-center gap-1 p-1 bg-[#ebe8e1] rounded-xl">
            <button
              onClick={() => setFilterSource('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterSource === 'all'
                  ? 'bg-[#202321] text-white shadow-sm'
                  : 'text-[#6f746e] hover:text-[#202321]'
              }`}
            >
              Toutes sources
            </button>
            <button
              onClick={() => setFilterSource('marketplace')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterSource === 'marketplace'
                  ? 'bg-[#bd664a] text-white shadow-sm'
                  : 'text-[#6f746e] hover:text-[#202321]'
              }`}
            >
              Marketplace ({marketplaceCount})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9e97]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un client, prestation..."
            className="w-full rounded-xl border border-[#e5e2db] bg-white pl-9 pr-3 py-2 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
          />
        </div>
      </div>

      {/* Appointments List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#d8d4ca] bg-white p-10 text-center">
          <CalendarDays className="mx-auto mb-3 text-[#bd664a]" size={32} />
          <h4 className="font-serif text-base font-bold text-[#202321]">
            Aucun rendez-vous trouvé
          </h4>
          <p className="mt-1 text-xs text-[#8c9089]">
            Aucun rendez-vous ne correspond aux filtres actuels.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((apt) => (
            <div
              key={apt.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#e8e4dc] bg-white p-5 transition hover:border-[#d0ccc3] hover:shadow-sm"
            >
              {/* Left Info: Time, Client, Service */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center rounded-xl bg-[#f4f2ec] px-3.5 py-2.5 text-center min-w-[65px]">
                  <span className="font-serif text-base font-bold text-[#202321]">{apt.time}</span>
                  <span className="text-[10px] text-[#8c9089]">{apt.date}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#202321]">{apt.clientName}</span>
                    {apt.source === 'marketplace' ? (
                      <span className="rounded-md bg-[#fdf3ec] px-2 py-0.5 text-[10px] font-bold text-[#bd664a] border border-[#f7ded0]">
                        Marketplace Barber Cuts
                      </span>
                    ) : (
                      <span className="rounded-md bg-[#f3f5ee] px-2 py-0.5 text-[10px] font-medium text-[#657351]">
                        Direct Salon
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#70756e]">
                    <span className="font-medium text-[#202321]">{apt.serviceName}</span>
                    <span>·</span>
                    <span>Coiffeur : <strong>{apt.staffName}</strong></span>
                    <span>·</span>
                    <span className="font-serif font-bold text-[#bd664a]">
                      {apt.servicePrice.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  {apt.notes && (
                    <div className="mt-2 text-[11px] text-[#868a83] italic">
                      "{apt.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Right Info: Status & Actions */}
              <div className="flex items-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 justify-between sm:justify-end border-[#f1eee8]">
                {/* Phone WhatsApp button */}
                <a
                  href={`tel:${apt.clientPhone}`}
                  className="flex items-center gap-1.5 rounded-lg border border-[#e5e2db] px-2.5 py-1.5 text-xs font-semibold text-[#545952] hover:bg-[#f6f4ee] transition"
                  title="Appeler le client"
                >
                  <Phone size={13} />
                  <span>{apt.clientPhone}</span>
                </a>

                {/* Status selector */}
                <div className="flex items-center gap-1.5">
                  {apt.status === 'pending' && (
                    <button
                      onClick={() => onUpdateStatus(apt.id, 'confirmed')}
                      className="flex items-center gap-1 rounded-lg bg-[#202321] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#3d423e] transition"
                    >
                      <Check size={13} />
                      <span>Confirmer</span>
                    </button>
                  )}

                  {apt.status === 'confirmed' && (
                    <button
                      onClick={() => onUpdateStatus(apt.id, 'completed')}
                      className="flex items-center gap-1 rounded-lg bg-[#ebf3e8] px-2.5 py-1.5 text-xs font-bold text-[#3e742e] border border-[#cfe2c9] hover:bg-[#dfedda] transition"
                    >
                      <CheckCircle2 size={13} />
                      <span>Terminer</span>
                    </button>
                  )}

                  {apt.status === 'completed' && (
                    <span className="rounded-lg bg-[#f0f2eb] px-2.5 py-1.5 text-xs font-semibold text-[#74805f]">
                      Prestation terminée
                    </span>
                  )}

                  {/* Payment selector */}
                  <div className="flex items-center gap-1.5">
                    {apt.paymentStatus === 'unpaid' && (
                      <button
                        onClick={() => onUpdatePayment(apt.id, 'paid')}
                        className="flex items-center gap-1 rounded-lg bg-[#ebf3e8] px-2.5 py-1.5 text-xs font-bold text-[#3e742e] border border-[#cfe2c9] hover:bg-[#dfedda] transition"
                      >
                        <span className="text-[#3e742e]">₣</span>
                        <span>Payé</span>
                      </button>
                    )}
                    {apt.paymentStatus === 'paid' && (
                      <span className="rounded-lg bg-[#f0f2eb] px-2.5 py-1.5 text-xs font-semibold text-[#3e742e]">
                        Payé ({apt.paymentMethod || '-'})
                      </span>
                    )}
                    {apt.paymentStatus === 'partial' && (
                      <span className="rounded-lg bg-[#fdf3ec] px-2.5 py-1.5 text-xs font-semibold text-[#bd664a]">
                        Partiel
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteAppointment(apt.id)}
                    className="rounded-lg p-1.5 text-[#a8aca5] hover:bg-red-50 hover:text-red-600 transition"
                    title="Supprimer ou annuler"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEW APPOINTMENT MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsNewModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-[#dedad2] bg-[#fbfaf7] p-6 shadow-2xl sm:p-8">
            <h3 className="font-serif text-xl font-bold text-[#202321]">
              Nouveau rendez-vous en salon
            </h3>
            <p className="mt-1 text-xs text-[#7c807b]">
              Enregistrez un rendez-vous téléphonique ou un client de passage.
            </p>

            <form onSubmit={handleCreateAppointment} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">Nom du client *</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Ex: Jean-Eudes Bamba"
                  required
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">Téléphone du client *</label>
                <input
                  type="tel"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="+225 07 00 00 00 00"
                  required
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#444a43]">Prestation</label>
                  <select
                    value={newServiceId}
                    onChange={(e) => setNewServiceId(e.target.value)}
                    className="w-full rounded-xl border border-[#e5e2db] bg-white px-3 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                  >
                    {salon.services.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name} ({srv.price.toLocaleString('fr-FR')} F)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#444a43]">Coiffeur</label>
                  <select
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="w-full rounded-xl border border-[#e5e2db] bg-white px-3 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                  >
                    {salon.staff.map((st) => (
                      <option key={st.id} value={st.name}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#444a43]">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-xl border border-[#e5e2db] bg-white px-3 py-2 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#444a43]">Heure</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-xl border border-[#e5e2db] bg-white px-3 py-2 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">Note interne</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ex: Client pressé, coupe courte habituelle"
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3 py-2 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#eeebe4] pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[#747873] hover:text-[#202321]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newClientName || !newClientPhone}
                  className="rounded-xl bg-[#202321] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#383d39] disabled:opacity-50"
                >
                  Ajouter au planning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
