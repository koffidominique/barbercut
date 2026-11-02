'use client'

import { useState } from 'react'
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  Scissors,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  MapPin,
} from 'lucide-react'
import { Salon, SalonService, Appointment } from '@/lib/store'

interface BookingModalProps {
  salon: Salon
  preselectedService?: SalonService | null
  isOpen: boolean
  onClose: () => void
  onBookSuccess: (appointment: Appointment) => void
  onSwitchToErp?: () => void
}

const TIME_SLOTS = [
  '09:00', '09:45', '10:30', '11:15', '12:00',
  '14:00', '14:45', '15:30', '16:15', '17:00', '18:00', '19:00'
]

export function BookingModal({
  salon,
  preselectedService,
  isOpen,
  onClose,
  onBookSuccess,
  onSwitchToErp,
}: BookingModalProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedService ? preselectedService.id : salon.services[0]?.id || ''
  )
  const [selectedStaff, setSelectedStaff] = useState<string>(
    salon.staff[0]?.name || 'Premier disponible'
  )
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-02')
  const [selectedTime, setSelectedTime] = useState<string>('14:00')
  const [clientName, setClientName] = useState<string>('')
  const [clientPhone, setClientPhone] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null)

  if (!isOpen) return null

  const activeService = salon.services.find((s) => s.id === selectedServiceId) || salon.services[0]

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim()) {
      setErrorMsg('Veuillez renseigner votre nom complet.')
      return
    }
    if (!clientPhone.trim()) {
      setErrorMsg('Veuillez renseigner votre numéro de téléphone ou WhatsApp.')
      return
    }

    const newApt: Omit<Appointment, 'id' | 'createdAt'> = {
      salonId: salon.id,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      serviceId: activeService.id,
      serviceName: activeService.name,
      servicePrice: activeService.price,
      staffName: selectedStaff,
      date: selectedDate,
      time: selectedTime,
      status: 'confirmed',
      source: 'marketplace',
      notes: notes.trim() || undefined,
    }

    // Call store handler
    const created: Appointment = {
      ...newApt,
      id: 'apt-' + Date.now(),
      createdAt: new Date().toISOString(),
    }
    onBookSuccess(created)
    setConfirmedBooking(created)
  }

  const resetAndClose = () => {
    setConfirmedBooking(null)
    setClientName('')
    setClientPhone('')
    setNotes('')
    setErrorMsg('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={resetAndClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#dedad2] bg-[#fbfaf7] p-6 shadow-2xl sm:p-8">
        <button
          onClick={resetAndClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#7c807b] hover:bg-[#eae7e0] transition-colors"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>

        {confirmedBooking ? (
          /* Confirmation Success State */
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf4e6] text-[#4d7c3b]">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#202321]">
              Rendez-vous confirmé avec succès !
            </h3>
            <p className="mt-2 text-sm text-[#747873]">
              Votre réservation a été transmise instantanément au salon{' '}
              <strong className="text-[#202321]">{salon.name}</strong>.
            </p>

            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-[#e4e1d8] bg-white p-5 text-left text-xs space-y-2.5">
              <div className="flex justify-between border-b border-[#f1eee8] pb-2">
                <span className="text-[#8c9089]">Prestation</span>
                <span className="font-semibold text-[#202321]">{confirmedBooking.serviceName}</span>
              </div>
              <div className="flex justify-between border-b border-[#f1eee8] pb-2">
                <span className="text-[#8c9089]">Date & Heure</span>
                <span className="font-semibold text-[#202321]">
                  {confirmedBooking.date} à {confirmedBooking.time}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#f1eee8] pb-2">
                <span className="text-[#8c9089]">Coiffeur / Spécialiste</span>
                <span className="font-semibold text-[#202321]">{confirmedBooking.staffName}</span>
              </div>
              <div className="flex justify-between border-b border-[#f1eee8] pb-2">
                <span className="text-[#8c9089]">Client</span>
                <span className="font-semibold text-[#202321]">
                  {confirmedBooking.clientName} ({confirmedBooking.clientPhone})
                </span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold text-[#202321]">
                <span>Total à régler sur place</span>
                <span className="text-[#d47b59]">
                  {confirmedBooking.servicePrice.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-[#f2efe8] p-3 text-xs text-[#60655e] flex items-center justify-center gap-2">
              <ShieldCheck size={16} className="text-[#79906f]" />
              <span>Visible instantanément dans le dashboard de l’ERP du salon.</span>
            </div>

            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={resetAndClose}
                className="w-full sm:w-auto rounded-xl border border-[#dedad2] bg-white px-5 py-2.5 text-xs font-semibold text-[#3d423e] hover:bg-[#f6f4ee]"
              >
                Retour à la vitrine
              </button>
              {onSwitchToErp && (
                <button
                  onClick={() => {
                    resetAndClose()
                    onSwitchToErp()
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#202321] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#363a37] transition-colors"
                >
                  Ouvrir l’ERP pour voir le rendez-vous <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#bd664a]">
                <MapPin size={14} />
                <span>{salon.neighborhood}, {salon.city}</span>
              </div>
              <h2 className="mt-1 font-serif text-2xl font-bold text-[#202321]">
                Réserver chez {salon.name}
              </h2>
              <p className="mt-1 text-xs text-[#7c807b]">
                Sélectionnez votre prestation et votre créneau horaire. Confirmation immédiate.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleConfirm} className="space-y-5">
              {/* Service Selection */}
              <div>
                <label className="mb-2 block text-xs font-bold text-[#444a43]">
                  1. Choisir votre prestation
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {salon.services.map((srv) => {
                    const isSelected = srv.id === selectedServiceId
                    return (
                      <button
                        type="button"
                        key={srv.id}
                        onClick={() => setSelectedServiceId(srv.id)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-[#bd664a] bg-[#fbf3ee] shadow-sm'
                            : 'border-[#e8e4dc] bg-white hover:border-[#cfcbc2]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-xs text-[#202321]">{srv.name}</span>
                          <span className="font-serif text-xs font-bold text-[#bd664a] whitespace-nowrap">
                            {srv.price.toLocaleString('fr-FR')} F
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-[#868a83]">
                          Durée : {srv.duration} min · {srv.category}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Staff selection & Date/Time Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Staff member */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-[#444a43]">
                    2. Coiffeur / Barbier souhaité
                  </label>
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="w-full rounded-xl border border-[#e5e2db] bg-white px-3 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                  >
                    <option value="Premier disponible">Premier disponible (recommandé)</option>
                    {salon.staff.map((st) => (
                      <option key={st.id} value={st.name}>
                        {st.name} — {st.role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-[#444a43]">
                    3. Date du rendez-vous
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-xl border border-[#e5e2db] bg-white px-3 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                  >
                    <option value="2026-11-02">Aujourd'hui (Lundi 2 Novembre)</option>
                    <option value="2026-11-03">Demain (Mardi 3 Novembre)</option>
                    <option value="2026-11-04">Mercredi 4 Novembre</option>
                    <option value="2026-11-05">Jeudi 5 Novembre</option>
                    <option value="2026-11-06">Vendredi 6 Novembre</option>
                    <option value="2026-11-07">Samedi 7 Novembre</option>
                  </select>
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="mb-2 block text-xs font-bold text-[#444a43]">
                  4. Heure du créneau
                </label>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = slot === selectedTime
                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`rounded-lg py-2 text-center text-xs font-medium transition ${
                          isSelected
                            ? 'bg-[#202321] text-white font-bold'
                            : 'bg-white border border-[#e4e1d8] text-[#555a53] hover:border-[#bd664a]'
                        }`}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Client Info */}
              <div className="rounded-2xl border border-[#e6e2da] bg-white p-4 space-y-3">
                <span className="block text-xs font-bold text-[#202321]">
                  5. Vos coordonnées pour la confirmation
                </span>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#686d66]">
                      Nom et Prénom *
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9da099]" />
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Ex. Ibrahim Ouattara"
                        className="w-full rounded-xl border border-[#e6e2da] bg-[#fdfcf9] pl-9 pr-3 py-2 text-xs outline-none focus:border-[#bd664a]"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#686d66]">
                      Téléphone ou WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9da099]" />
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="+225 07 00 00 00 00"
                        className="w-full rounded-xl border border-[#e6e2da] bg-[#fdfcf9] pl-9 pr-3 py-2 text-xs outline-none focus:border-[#bd664a]"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#686d66]">
                    Précision ou style souhaité (optionnel)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Dégradé taper bas, traçage soigné, barbe au peigne..."
                    className="w-full rounded-xl border border-[#e6e2da] bg-[#fdfcf9] px-3 py-2 text-xs outline-none focus:border-[#bd664a]"
                  />
                </div>
              </div>

              {/* Total & Submit */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#eeebe4] pt-4">
                <div>
                  <span className="text-[11px] text-[#838780]">Prestation sélectionnée</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-lg font-bold text-[#202321]">
                      {activeService ? activeService.price.toLocaleString('fr-FR') : '0'} FCFA
                    </span>
                    <span className="text-xs text-[#8f928c]">
                      ({activeService?.duration} min) · Paiement sur place
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[#747873] hover:text-[#202321]"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-[#202321] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#383d39] transition-all"
                  >
                    <span>Confirmer le rendez-vous</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
