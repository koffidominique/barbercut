'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Calendar,
  User,
  Phone,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Mail,
  Smartphone,
  UserPlus,
} from 'lucide-react'
import { Salon, SalonService, Appointment, useSalonStore } from '@/lib/store'
import { useNotifications } from '@/lib/notifications'
import { modalOverlay } from '@/components/ui/motion'

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

const STEP_LABELS = [
  'Votre prestation',
  'Date & créneau',
  'Confirmation',
]

export function BookingModal({
  salon,
  preselectedService,
  isOpen,
  onClose,
  onBookSuccess,
  onSwitchToErp,
}: BookingModalProps) {
  const { bookAppointment, clientAccount, registerClient, loginClient, logoutClient } = useSalonStore()
  const { addNotification } = useNotifications()
  const [step, setStep] = useState(0)
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedService ? preselectedService.id : salon.services[0]?.id || ''
  )
  const [selectedStaff, setSelectedStaff] = useState<string>(
    salon.staff[0]?.name || 'Premier disponible'
  )
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-02')
  const [selectedTime, setSelectedTime] = useState<string>('14:00')
  const [clientName, setClientName] = useState<string>(clientAccount?.name || '')
  const [clientPhone, setClientPhone] = useState<string>(clientAccount?.phone || '')
  const [clientEmail, setClientEmail] = useState<string>(clientAccount?.email || '')
  const [notes, setNotes] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authError, setAuthError] = useState<string>('')
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null)
  const [confirmationSent, setConfirmationSent] = useState<{ type: 'email' | 'sms'; to: string } | null>(null)

  const activeService = salon.services.find((s) => s.id === selectedServiceId) || salon.services[0]

  const goToStep = (next: number) => {
    setErrorMsg('')
    setStep(next)
  }

  const handleLogin = () => {
    try {
      loginClient(clientPhone, 'demo-password')
      setAuthError('')
      setShowAuth(false)
      setClientName(clientAccount?.name || '')
      setClientPhone(clientAccount?.phone || '')
      setClientEmail(clientAccount?.email || '')
    } catch (e: any) {
      setAuthError(e.message || 'Erreur de connexion')
    }
  }

  const handleRegister = () => {
    if (!clientName.trim() || !clientPhone.trim()) {
      setAuthError('Veuillez renseigner votre nom et téléphone.')
      return
    }
    try {
      registerClient({
        name: clientName.trim(),
        phone: clientPhone.trim(),
        email: clientEmail.trim() || undefined,
        password: 'demo-password',
      })
      setAuthError('')
      setShowAuth(false)
      setClientName(clientAccount?.name || '')
      setClientPhone(clientAccount?.phone || '')
      setClientEmail(clientAccount?.email || '')
    } catch (e: any) {
      setAuthError(e.message || 'Erreur d\'inscription')
    }
  }

  const handleConfirm = () => {
    if (!clientName.trim()) {
      setErrorMsg('Veuillez renseigner votre nom complet.')
      return
    }
    if (!clientPhone.trim()) {
      setErrorMsg('Veuillez renseigner votre numéro de téléphone ou WhatsApp.')
      return
    }

    if (!activeService) {
      setErrorMsg('Ce salon n’a pas encore publié de prestation. Réessayez plus tard.')
      return
    }

    setSubmitting(true)

    const newApt: Omit<Appointment, 'id' | 'createdAt'> = {
      salonId: salon.id,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim() || undefined,
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

    const created: Appointment = bookAppointment(newApt)
    setConfirmedBooking(created)
    setSubmitting(false)
    setStep(2)

    setConfirmationSent({
      type: clientEmail ? 'email' : 'sms',
      to: clientEmail || clientPhone,
    })

    addNotification({
      type: 'appointment',
      title: 'Nouveau rendez-vous Marketplace',
      message: `${clientName.trim()} a réservé ${activeService.name} pour le ${selectedDate} à ${selectedTime}.`,
      actionUrl: '/',
      actionLabel: 'Voir dans l\'ERP',
    })
  }

  const resetAndClose = () => {
    setConfirmedBooking(null)
    setClientName('')
    setClientPhone('')
    setClientEmail('')
    setNotes('')
    setErrorMsg('')
    setSubmitting(false)
    setStep(0)
    setShowAuth(false)
    setAuthMode('login')
    setAuthError('')
    setConfirmationSent(null)
    setSelectedServiceId(preselectedService ? preselectedService.id : salon.services[0]?.id || '')
    setSelectedStaff(salon.staff[0]?.name || 'Premier disponible')
    setSelectedDate('2026-11-02')
    setSelectedTime('14:00')
    onClose()
  }

  const progress = ((step + 1) / STEP_LABELS.length) * 100

  if (!isOpen) return null

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={modalOverlay}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={resetAndClose}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#dedad2] bg-[#fbfaf7] p-6 shadow-2xl sm:p-8"
      >
        <button
          onClick={resetAndClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#7c807b] hover:bg-[#eae7e0] transition-colors"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>

        {/* AUTH MODE */}
        {showAuth ? (
          <div className="py-6 text-center">
            <h2 className="font-serif text-2xl font-bold text-[#202321] mb-2">
              {authMode === 'login' ? 'Connexion client' : 'Créer un compte client'}
            </h2>
            <p className="text-xs text-[#747873] mb-6">
              {authMode === 'login'
                ? 'Déjà inscrit ? Connectez-vous pour pré-remplir vos coordonnées.'
                : 'Nouveau client ? Créez un compte pour gérer vos rendez-vous.'
              }
            </p>

            {authError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {authError}
              </div>
            )}

            <div className="rounded-2xl border border-[#e6e2da] bg-white p-4 space-y-3">
              {!clientAccount && (
                <>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#686d66]">
                      Nom et Prénom
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex. Ibrahim Ouattara"
                      className="w-full rounded-xl border border-[#e6e2da] bg-[#fdfcf9] px-3 py-2 text-xs outline-none focus:border-[#bd664a]"
                      disabled={authMode === 'login'}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#686d66]">
                      Téléphone ou Email *
                    </label>
                    <input
                      type="text"
                      value={authMode === 'login' ? clientPhone : clientEmail}
                      onChange={(e) => {
                        if (authMode === 'login') setClientPhone(e.target.value)
                        else setClientEmail(e.target.value)
                      }}
                      placeholder={authMode === 'login' ? '+225 07 00 00 00 00' : 'email@example.com'}
                      className="w-full rounded-xl border border-[#e6e2da] bg-[#fdfcf9] px-3 py-2 text-xs outline-none focus:border-[#bd664a]"
                    />
                  </div>
                  {authMode === 'register' && (
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[#686d66]">
                        Mot de passe (démo)
                      </label>
                      <input
                        type="password"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="Mot de passe"
                        className="w-full rounded-xl border border-[#e6e2da] bg-[#fdfcf9] px-3 py-2 text-xs outline-none focus:border-[#bd664a]"
                      />
                    </div>
                  )}
                  <button
                    onClick={authMode === 'login' ? handleLogin : handleRegister}
                    className="w-full rounded-xl bg-[#202321] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#383d39] transition"
                  >
                    {authMode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                  </button>
                </>
              )}
              {clientAccount && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-xs mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#3c782d]" />
                    <span className="text-[#3c782d] font-semibold">Connecté : {clientAccount.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      logoutClient()
                      setShowAuth(false)
                    }}
                    className="w-full rounded-xl border border-[#e6e2da] bg-white px-4 py-2.5 text-xs font-bold text-[#bd664a] hover:bg-[#fbf3ee] transition"
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setShowAuth(false)}
                className="text-xs text-[#747873] hover:text-[#202321] underline"
              >
                Réserver en tant qu'invité
              </button>
              {!clientAccount && (
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-xs text-[#bd664a] font-semibold hover:underline"
                >
                  {authMode === 'login' ? 'Créer un compte' : 'Déjà un compte ? Connectez-vous'}
                </button>
              )}
            </div>
          </div>
        ) : (
          confirmedBooking && step === 2 ? (
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
                  <span className="text-[#8c9089]">Date &amp; Heure</span>
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

              {confirmationSent && (
                <div className="mt-6 rounded-xl border border-[#d8f0dc] bg-[#f0f9ec] p-4">
                  <div className="flex items-start gap-3">
                    {confirmationSent.type === 'email' ? (
                      <Mail size={20} className="text-[#3c782d] shrink-0 mt-0.5" />
                    ) : (
                      <Smartphone size={20} className="text-[#3c782d] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold text-[#202321] text-sm">Confirmation envoyée !</p>
                      <p className="text-xs text-[#555a53]">
                        Un {confirmationSent.type === 'email' ? 'email' : 'SMS'} de confirmation a été envoyé à{' '}
                        <span className="font-semibold text-[#bd664a]">{confirmationSent.to}</span>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                  Flow de réservation en 3 étapes — confirmation immédiate
                </p>
              </div>

              {!clientAccount && (
                <div className="mb-6 flex items-center justify-between rounded-xl border border-[#e8e4dc] bg-white p-3">
                  <div className="flex items-center gap-2 text-xs text-[#747873]">
                    <UserPlus size={14} className="text-[#bd664a]" />
                    <span>Vous avez un compte client ?</span>
                  </div>
                  <button
                    onClick={() => setShowAuth(true)}
                    className="text-xs font-bold text-[#bd664a] hover:underline"
                  >
                    Se connecter / Créer un compte
                  </button>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2">
                  {STEP_LABELS.map((label, i) => {
                    const isActive = i === step
                    const isCompleted = i < step
                    return (
                      <div key={label} className="flex flex-col items-center gap-1 relative z-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted
                            ? 'bg-[#202321] text-white border border-[#202321]'
                            : isActive
                              ? 'bg-[#bd664a] text-white border border-[#bd664a]'
                              : 'bg-white border border-[#e8e4dc] text-[#8c9089]'
                        }`}>
                          {isCompleted ? <CheckCircle2 size={10} /> : i + 1}
                        </div>
                        <span className={`text-[10px] font-medium text-center w-16 ${
                          isCompleted || isActive ? 'text-[#202321]' : 'text-[#8c9089]'
                        }`}>{label}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-2 h-1 bg-[#e8e4dc] rounded-full overflow-hidden">
                  <div className="h-full bg-[#bd664a] transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              {step === 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="mb-6">
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
                            className={`rounded-xl border p-4 text-left transition-all ${
                              isSelected
                                ? 'border-[#bd664a] bg-[#fbf3ee] shadow-sm'
                                : 'border-[#e8e4dc] bg-white hover:border-[#cfcbc2]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-semibold text-xs text-[#202321]">{srv.name}</span>
                                <p className="mt-1 text-[11px] text-[#737871] leading-relaxed">
                                  {srv.description}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="font-serif text-xs font-bold text-[#bd664a] block">
                                  {srv.price.toLocaleString('fr-FR')} F
                                </span>
                                <span className="text-[10px] text-[#868a83]">
                                  {srv.duration} min · {srv.category}
                                </span>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => goToStep(1)}
                      disabled={!activeService}
                      className="flex items-center gap-2 rounded-xl bg-[#202321] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#383d39] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="lg:col-span-2">
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

                    <div>
                      <label className="mb-2 block text-xs font-bold text-[#444a43]">
                        Date du rendez-vous
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

                    <div>
                      <label className="mb-2 block text-xs font-bold text-[#444a43]">
                        Heure du créneau
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
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => goToStep(0)}
                      className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[#747873] hover:text-[#202321]"
                    >
                      ← Retour
                    </button>
                    <button
                      onClick={() => goToStep(2)}
                      className="flex items-center gap-2 rounded-xl bg-[#202321] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#383d39] transition-all"
                    >
                      Suivant <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && !confirmedBooking && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="mb-6">
                    <label className="mb-2 block text-xs font-bold text-[#444a43]">
                      3. Vos coordonnées pour la confirmation
                    </label>
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
                        Email (optionnel — pour recevoir la confirmation)
                      </label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9da099]" />
                        <input
                          type="email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full rounded-xl border border-[#e6e2da] bg-[#fdfcf9] pl-9 pr-3 py-2 text-xs outline-none focus:border-[#bd664a]"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
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

                  <div className="rounded-2xl border border-[#e6e2da] bg-white p-4 space-y-3">
                    <span className="block text-xs font-bold text-[#202321]">Récapitulatif</span>
                    <div className="flex justify-between border-b border-[#f1eee8] pb-2">
                      <span className="text-[#8c9089]">Prestation</span>
                      <span className="font-semibold text-[#202321]">{activeService?.name ?? '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#f1eee8] pb-2">
                      <span className="text-[#8c9089]">Coiffeur</span>
                      <span className="font-semibold text-[#202321]">{selectedStaff}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#f1eee8] pb-2">
                      <span className="text-[#8c9089]">Date &amp; Heure</span>
                      <span className="font-semibold text-[#202321]">
                        {selectedDate} à {selectedTime}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 text-sm font-bold text-[#202321]">
                      <span>Total à régler sur place</span>
                      <span className="text-[#d47b59]">
                        {(activeService?.price ?? 0).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => goToStep(1)}
                      className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[#747873] hover:text-[#202321]"
                    >
                      ← Retour
                    </button>
                    <button
                      onClick={handleConfirm}
                      type="button"
                      disabled={submitting || !clientName.trim() || !clientPhone.trim()}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#202321] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#383d39] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Enregistrement...' : 'Confirmer le rendez-vous'}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )
        )}
      </motion.div>
    </motion.div>
  )
}
