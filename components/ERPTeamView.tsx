'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Plus,
  Star,
  Calendar,
  Clock,
  Phone,
  CheckCircle2,
  Trash2,
  Edit3,
  X,
  Award,
  Sparkles,
  ShieldCheck,
  Mail,
  UserPlus,
  Clock as ClockIcon,
} from 'lucide-react'
import { Salon, StaffMember, StaffRole, StaffPermissions } from '@/lib/store'
import { useSalonStore } from '@/lib/store'
import { staggerContainer, staggerItem, fadeInUp, modalOverlay, modalContent } from '@/components/ui/motion'

interface ERPTeamViewProps {
  salon: Salon
  onSaveStaff: (staff: StaffMember) => void
  onDeleteStaff: (id: string) => void
}

const COLOR_PRESETS = [
  'bg-[#586b83]',
  'bg-[#d9a45e]',
  'bg-[#7a8c5d]',
  'bg-[#b87968]',
  'bg-[#202321]',
  'bg-[#18392b]',
]

const ROLE_OPTIONS: { value: StaffRole; label: string; description: string; color: string }[] = [
  {
    value: 'admin',
    label: 'Gérant / Admin',
    description: 'Accès complet : prix, rapports, équipe, vitrine',
    color: 'bg-[#202321]',
  },
  {
    value: 'coiffeur',
    label: 'Coiffeur / Barbier',
    description: 'Gère les clients et ses propres RDV',
    color: 'bg-[#586b83]',
  },
  {
    value: 'receptionniste',
    label: 'Réceptionniste',
    description: 'Gère les clients et le planning',
    color: 'bg-[#d9a45e]',
  },
]

const DEFAULT_PERMISSIONS: Record<StaffRole, StaffPermissions> = {
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

export function ERPTeamView({ salon, onSaveStaff, onDeleteStaff }: ERPTeamViewProps) {
  const { inviteTeamMember, respondToInvitation } = useSalonStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [role, setRole] = useState<StaffRole>('coiffeur')
  const [specialty, setSpecialty] = useState('')
  const [phone, setPhone] = useState('')
  const [schedule, setSchedule] = useState('Mar - Dim (08:30 - 18:30)')
  const [color, setColor] = useState('bg-[#586b83]')
  const [isOnLeave, setIsOnLeave] = useState(false)

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<StaffRole>('coiffeur')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const openAddModal = () => {
    setEditingStaff(null)
    setName('')
    setRole('coiffeur')
    setSpecialty('')
    setPhone('+225 07 00 00 00 00')
    setSchedule('Mar - Dim (08:30 - 18:30)')
    setColor(COLOR_PRESETS[salon.staff.length % COLOR_PRESETS.length])
    setIsOnLeave(false)
    setIsModalOpen(true)
  }

  const openEditModal = (st: StaffMember) => {
    setEditingStaff(st)
    setName(st.name)
    setRole((st.role?.includes('Gérant') ? 'admin' : st.role?.includes('Réceptionniste') ? 'receptionniste' : 'coiffeur') as StaffRole)
    setSpecialty(st.specialty || '')
    setPhone(st.phone || '')
    setSchedule(st.schedule || 'Mar - Dim (08:30 - 18:30)')
    setColor(st.color)
    setIsOnLeave(st.status === 'leave')
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const initials = name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()

    const roleLabel = ROLE_OPTIONS.find((r) => r.value === role)?.label || role

    if (editingStaff) {
      const updated: StaffMember = {
        ...editingStaff,
        name: name.trim(),
        role: roleLabel,
        specialty: specialty.trim(),
        phone: phone.trim(),
        schedule: schedule.trim(),
        color,
        initials,
        status: isOnLeave ? 'leave' : 'active',
      }
      onSaveStaff(updated)
      showToast('Fiche collaborateur mise à jour !')
    } else {
      const newStaff: StaffMember = {
        id: 'st-' + Date.now(),
        name: name.trim(),
        role: roleLabel,
        specialty: specialty.trim(),
        phone: phone.trim(),
        schedule: schedule.trim(),
        color,
        initials,
        rating: 4.9,
        reviewsCount: 12,
        appointmentsCount: 0,
        status: isOnLeave ? 'leave' : 'active',
      }
      onSaveStaff(newStaff)
      showToast('Nouveau collaborateur ajouté à l’équipe !')
    }

    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (salon.staff.length <= 1) {
      showToast('Votre salon doit comporter au moins un membre d’équipe actif.')
      return
    }
    onDeleteStaff(id)
    showToast('Membre d’équipe retiré.')
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    try {
      inviteTeamMember({
        salonId: salon.id,
        email: inviteEmail.trim(),
        role: inviteRole,
        invitedBy: 'Gerant',
      })
      setInviteEmail('')
      showToast(`Invitation envoyée à ${inviteEmail}`)
      setIsInviteModalOpen(false)
    } catch (e: any) {
      showToast(e.message || 'Erreur lors de l’invitation')
    }
  }

  const totalTeam = salon.staff.length
  const activeTeam = salon.staff.filter((s) => s.status === 'active').length
  const onLeaveTeam = salon.staff.filter((s) => s.status === 'leave').length
  const totalCompleted = salon.staff.reduce((sum, s) => sum + (s.appointmentsCount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#202321] px-5 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in">
          <CheckCircle2 size={16} className="text-[#8ec380]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#bd664a]">
            <Users size={15} />
            <span>Gestion des Barbiers & Coiffeurs de l'Équipe</span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold text-[#202321]">
            Équipe du Salon ({totalTeam})
          </h2>
          <p className="mt-1 text-xs text-[#7c807b]">
            Gérez les plannings, les spécialités, les congés et les permissions de chaque collaborateur.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-[#e8e4dc] bg-white px-4 py-2.5 text-xs font-bold text-[#bd664a] hover:bg-[#fbf3ee] transition w-fit"
          >
            <UserPlus size={15} />
            <span>Inviter un collaborateur</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-xl bg-[#202321] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#383d39] transition w-fit"
          >
            <Plus size={15} />
            <span>Ajouter un membre</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e9e6df] bg-white p-4">
          <span className="text-[11px] text-[#92958f]">Collaborateurs actifs</span>
          <div className="mt-1 font-serif text-2xl font-bold text-[#202321]">{activeTeam}</div>
          <p className="mt-1 text-[10px] text-[#79906f]">Disponibles pour les RDV</p>
        </div>

        <div className="rounded-2xl border border-[#e9e6df] bg-white p-4">
          <span className="text-[11px] text-[#92958f]">En congés / absence</span>
          <div className="mt-1 font-serif text-2xl font-bold text-[#bd664a]">{onLeaveTeam}</div>
          <p className="mt-1 text-[10px] text-[#79906f]">Indisponibles temporairement</p>
        </div>

        <div className="rounded-2xl border border-[#e9e6df] bg-white p-4">
          <span className="text-[11px] text-[#92958f]">Prestations cumulées ce mois</span>
          <div className="mt-1 font-serif text-2xl font-bold text-[#202321]">{totalCompleted || 141}</div>
          <p className="mt-1 text-[10px] text-[#79906f]">Excellente cadence</p>
        </div>
      </div>

      {/* Team Roster Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {salon.staff.map((member) => {
          const isLeave = member.status === 'leave'
          const roleOpt = ROLE_OPTIONS.find(
            (r) => r.label === member.role
          )
          return (
            <motion.div
              key={member.id}
              initial="hidden"
              animate="visible"
              variants={staggerItem}
              className="flex flex-col justify-between rounded-3xl border border-[#e8e4dc] bg-white p-6 cursor-default"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-serif text-sm font-bold text-white ${member.color}`}
                    >
                      {member.initials}
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#202321]">{member.name}</h3>
                      <p className="text-xs font-semibold text-[#bd664a]">{member.role}</p>
                      {isLeave && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#c45347]">
                          <ClockIcon size={12} />
                          En congés
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 rounded-lg bg-[#faf8f4] px-2 py-1 text-xs font-bold text-[#bd664a] border border-[#f0ece5]">
                    <Star size={13} fill="#bd664a" />
                    <span>{member.rating || '4.9'}</span>
                  </div>
                </div>

                {/* Speciality */}
                {member.specialty && (
                  <div className="mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#91958f]">
                      Spécialités & Expertise
                    </span>
                    <p className="mt-1 text-xs text-[#52574f] leading-relaxed">
                      {member.specialty}
                    </p>
                  </div>
                )}

                {/* Schedule and Contact */}
                <div className="mt-4 space-y-2 rounded-2xl bg-[#fcfbf9] p-3 text-xs border border-[#f2eee8]">
                  <div className="flex items-center gap-2 text-[#70756e]">
                    <Clock size={13} className="text-[#bd664a]" />
                    <span>{member.schedule || 'Mar - Dim (08:30 - 18:30)'}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2 text-[#70756e]">
                      <Phone size={13} className="text-[#79906f]" />
                      <a href={`tel:${member.phone}`} className="hover:underline">
                        {member.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[#70756e]">
                    <Award size={13} className="text-[#e2a46d]" />
                    <span>{member.appointmentsCount || 42} prestations réalisées</span>
                  </div>
                </div>

                {/* Permissions badge */}
                {roleOpt && (
                  <div className="mt-3 pt-3 border-t border-[#f0ece5]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#91958f] block mb-1">
                      Permissions
                    </span>
                    <div className="flex gap-1">
                      {[
                        { key: 'canEditPrices', label: 'Prix' },
                        { key: 'canViewReports', label: 'Rapports' },
                        { key: 'canManageClients', label: 'Clients' },
                        { key: 'canManageStaff', label: 'Équipe' },
                        { key: 'canPublishVitrine', label: 'Vitrine' },
                      ].map((p) => (
                        <span
                          key={p.key}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium ${
                            DEFAULT_PERMISSIONS[roleOpt.value as StaffRole][p.key as keyof StaffPermissions]
                              ? 'bg-[#ebf4e6] text-[#4d7c3b]'
                              : 'bg-[#f5f3ec] text-[#a5a59f]'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" />
                          {p.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between border-t border-[#f1eee8] pt-4">
                <span className="text-[11px] font-semibold text-[#487a38] flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${isLeave ? 'bg-[#c45347]' : 'bg-[#487a38]'}`} />
                  {isLeave ? 'En congés' : 'Actif au salon'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(member)}
                    className="rounded-lg p-1.5 text-[#6c716a] hover:bg-[#f4f2ec] transition"
                    title="Modifier"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="rounded-lg p-1.5 text-[#a8aca5] hover:bg-red-50 hover:text-red-600 transition"
                    title="Supprimer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        )}
      </motion.div>

      {/* MODAL: ADD / EDIT STAFF */}
      {isModalOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalOverlay}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-[#dedad2] bg-[#fbfaf7] p-6 shadow-2xl sm:p-8"
          >
            <h3 className="font-serif text-xl font-bold text-[#202321]">
              {editingStaff ? 'Modifier le collaborateur' : 'Ajouter un membre d’équipe'}
            </h3>
            <p className="mt-1 text-xs text-[#7c807b]">
              Ce membre apparaîtra dans les choix de réservation de la Marketplace.
            </p>

            <form onSubmit={handleSave} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">
                  Nom & Prénom *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Franck Koffi"
                  required
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">
                  Rôle dans l’équipe *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffRole)}
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-[#747873]">
                  {ROLE_OPTIONS.find((o) => o.value === role)?.description || ''}
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">
                  Spécialités
                </label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Ex: Dégradé américain, locks, barbe au coupe-chou"
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">
                  Téléphone professionnel
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+225 07 00 00 00 00"
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">
                  Horaires et jours de présence
                </label>
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="Ex: Mar - Dim (09:00 - 19:00)"
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="onLeave"
                  type="checkbox"
                  checked={isOnLeave}
                  onChange={(e) => setIsOnLeave(e.target.checked)}
                  className="rounded border-[#e5e2db] text-[#bd664a] focus:ring-[#bd664a]"
                />
                <label htmlFor="onLeave" className="text-xs font-medium text-[#747873]">
                  En congés / absence (invisible sur la Marketplace)
                </label>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-[#444a43]">
                  Couleur du badge
                </label>
                <div className="flex gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-full ${c} transition ${
                        color === c ? 'ring-2 ring-offset-2 ring-[#bd664a]' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#eeebe4] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[#747873] hover:text-[#202321]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!name}
                  className="rounded-xl bg-[#202321] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#383d39] disabled:opacity-50"
                >
                  {editingStaff ? 'Sauvegarder' : 'Ajouter à l’équipe'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* MODAL: INVITE COLLABORATOR */}
      {isInviteModalOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalOverlay}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsInviteModalOpen(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            className="relative z-10 w-full max-w-md rounded-3xl border border-[#dedad2] bg-[#fbfaf7] p-6 shadow-2xl sm:p-8"
          >
            <h3 className="font-serif text-xl font-bold text-[#202321]">Inviter un collaborateur</h3>
            <p className="mt-1 text-xs text-[#7c807b]">
              Envoyez une invitation par email. Le collaborateur pourra rejoindre votre équipe avec un rôle défini.
            </p>

            <form onSubmit={handleInvite} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">
                  Email du collaborateur *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  required
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">
                  Rôle proposé *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as StaffRole)}
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-[#747873]">
                  {ROLE_OPTIONS.find((o) => o.value === inviteRole)?.description || ''}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#eeebe4] pt-4">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[#747873] hover:text-[#202321]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!inviteEmail}
                  className="rounded-xl bg-[#202321] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#383d39] disabled:opacity-50"
                >
                  Envoyer l’invitation
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
