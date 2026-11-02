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
} from 'lucide-react'
import { Salon, StaffMember } from '@/lib/store'
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

export function ERPTeamView({ salon, onSaveStaff, onDeleteStaff }: ERPTeamViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [phone, setPhone] = useState('')
  const [schedule, setSchedule] = useState('Mar - Dim (08:30 - 18:30)')
  const [color, setColor] = useState('bg-[#586b83]')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const openAddModal = () => {
    setEditingStaff(null)
    setName('')
    setRole('Barbier Visagiste')
    setSpecialty('Dégradés américains, barbe et contours')
    setPhone('+225 07 00 00 00 00')
    setSchedule('Mar - Dim (08:30 - 18:30)')
    setColor(COLOR_PRESETS[salon.staff.length % COLOR_PRESETS.length])
    setIsModalOpen(true)
  }

  const openEditModal = (st: StaffMember) => {
    setEditingStaff(st)
    setName(st.name)
    setRole(st.role)
    setSpecialty(st.specialty || '')
    setPhone(st.phone || '')
    setSchedule(st.schedule || 'Mar - Dim (08:30 - 18:30)')
    setColor(st.color)
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

    if (editingStaff) {
      const updated: StaffMember = {
        ...editingStaff,
        name: name.trim(),
        role: role.trim(),
        specialty: specialty.trim(),
        phone: phone.trim(),
        schedule: schedule.trim(),
        color,
        initials,
      }
      onSaveStaff(updated)
      showToast('Fiche collaborateur mise à jour !')
    } else {
      const newStaff: StaffMember = {
        id: 'st-' + Date.now(),
        name: name.trim(),
        role: role.trim(),
        specialty: specialty.trim(),
        phone: phone.trim(),
        schedule: schedule.trim(),
        color,
        initials,
        rating: 4.9,
        reviewsCount: 12,
        appointmentsCount: 0,
        status: 'active',
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

  const totalTeam = salon.staff.length
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
            Gérez les plannings, les spécialités et les créneaux proposés aux clients sur la Marketplace.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-[#202321] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#383d39] transition w-fit"
        >
          <Plus size={15} />
          <span>Ajouter un membre</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e9e6df] bg-white p-4">
          <span className="text-[11px] text-[#92958f]">Collaborateurs actifs</span>
          <div className="mt-1 font-serif text-2xl font-bold text-[#202321]">{totalTeam}</div>
          <p className="mt-1 text-[10px] text-[#79906f]">Assignables aux rendez-vous</p>
        </div>

        <div className="rounded-2xl border border-[#e9e6df] bg-white p-4">
          <span className="text-[11px] text-[#92958f]">Note moyenne de satisfaction</span>
          <div className="mt-1 font-serif text-2xl font-bold text-[#bd664a]">4.9 / 5</div>
          <p className="mt-1 text-[10px] text-[#92958f]">Évaluations certifiées clients</p>
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
        {salon.staff.map((member) => (
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
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-[#f1eee8] pt-4">
              <span className="text-[11px] font-semibold text-[#487a38] flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#487a38]" /> Actif au salon
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
        ))}
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
                  Titre / Poste *
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Ex: Maître Barbier, Coiffeuse Experte"
                  required
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
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
    </div>
  )
}
