'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Star,
  CheckCircle2,
  Trash2,
  Edit3,
  X,
  ArrowRight,
  TrendingUp,
  MessageCircle,
} from 'lucide-react'
import { SalonClient, Salon, useSalonStore } from '@/lib/store'
import { staggerContainer, staggerItem, fadeInUp } from '@/components/ui/motion'

interface ERPClientsViewProps {
  salon: Salon
  clients: SalonClient[]
  onSaveClient: (client: SalonClient) => void
  onDeleteClient: (id: string) => void
}

export function ERPClientsView({
  salon,
  clients,
  onSaveClient,
  onDeleteClient,
}: ERPClientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  // Modals
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false)
  const [selectedClientDetails, setSelectedClientDetails] = useState<SalonClient | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [favoriteService, setFavoriteService] = useState(salon.services[0]?.name || '')
  const [preferredStaff, setPreferredStaff] = useState(salon.staff[0]?.name || '')
  const [status, setStatus] = useState<SalonClient['status']>('Nouveau')
  const [notes, setNotes] = useState('')

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    const matchesSource = sourceFilter === 'all' || c.source === sourceFilter
    return matchesSearch && matchesStatus && matchesSource
  })

  // KPIs
  const totalClients = clients.length
  const vipCount = clients.filter((c) => c.status === 'VIP').length
  const marketplaceClients = clients.filter((c) => c.source === 'marketplace').length
  const totalRevenueAllClients = clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
  const avgBasket = totalClients > 0 ? Math.round(totalRevenueAllClients / totalClients) : 0

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return

    const newClient: SalonClient = {
      id: 'cli-' + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      favoriteService: favoriteService || salon.services[0]?.name || 'Coupe signature',
      preferredStaff: preferredStaff || salon.staff[0]?.name || 'Jules M.',
      totalVisits: 1,
      totalSpent: 8000,
      lastVisit: new Date().toISOString().split('T')[0],
      status: status,
      source: 'direct',
      notes: notes.trim() || undefined,
    }

    onSaveClient(newClient)
    setName('')
    setPhone('')
    setEmail('')
    setNotes('')
    setIsNewClientModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#bd664a]">
            <Users size={15} />
            <span>Gestion de la Patientèle & Fichier Clients</span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold text-[#202321]">
            Répertoire des Clients ({totalClients})
          </h2>
          <p className="mt-1 text-xs text-[#7c807b]">
            Suivi des visites, fidélité, préférences de coiffure et clients acquis via vos annonces Marketplace.
          </p>
        </div>

        <button
          onClick={() => setIsNewClientModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#202321] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#383d39] transition w-fit"
        >
          <Plus size={15} />
          <span>Nouveau client</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#e9e6df] bg-white p-4">
          <span className="text-[11px] text-[#92958f]">Total clients enregistrés</span>
          <div className="mt-1 font-serif text-2xl font-bold text-[#202321]">{totalClients}</div>
          <p className="mt-1 text-[10px] text-[#79906f]">Fichier salon actif</p>
        </div>

        <div className="rounded-2xl border border-[#e9e6df] bg-white p-4">
          <span className="text-[11px] text-[#92958f]">Clients VIP & Réguliers</span>
          <div className="mt-1 font-serif text-2xl font-bold text-[#bd664a]">{vipCount}</div>
          <p className="mt-1 text-[10px] text-[#92958f]">Visites fréquentes</p>
        </div>

        <div className="rounded-2xl border border-[#e9e6df] bg-white p-4">
          <span className="text-[11px] text-[#92958f]">Acquis via Marketplace</span>
          <div className="mt-1 font-serif text-2xl font-bold text-[#202321]">{marketplaceClients}</div>
          <p className="mt-1 text-[10px] text-[#bd664a]">Grâce à vos annonces vitrine</p>
        </div>

        <div className="rounded-2xl border border-[#e9e6df] bg-white p-4">
          <span className="text-[11px] text-[#92958f]">Dépense moyenne / client</span>
          <div className="mt-1 font-serif text-2xl font-bold text-[#202321]">
            {avgBasket.toLocaleString('fr-FR')} F
          </div>
          <p className="mt-1 text-[10px] text-[#79906f]">Valeur client cumulée</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#ebe8e1] rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                statusFilter === 'all'
                  ? 'bg-white text-[#202321] shadow-sm'
                  : 'text-[#6f746e] hover:text-[#202321]'
              }`}
            >
              Tous ({totalClients})
            </button>
            <button
              onClick={() => setStatusFilter('VIP')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                statusFilter === 'VIP'
                  ? 'bg-white text-[#202321] shadow-sm'
                  : 'text-[#6f746e] hover:text-[#202321]'
              }`}
            >
              VIP
            </button>
            <button
              onClick={() => setStatusFilter('Régulier')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                statusFilter === 'Régulier'
                  ? 'bg-white text-[#202321] shadow-sm'
                  : 'text-[#6f746e] hover:text-[#202321]'
              }`}
            >
              Réguliers
            </button>
            <button
              onClick={() => setStatusFilter('Nouveau')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                statusFilter === 'Nouveau'
                  ? 'bg-white text-[#202321] shadow-sm'
                  : 'text-[#6f746e] hover:text-[#202321]'
              }`}
            >
              Nouveaux
            </button>
          </div>

          {/* Source filter */}
          <div className="flex items-center gap-1 p-1 bg-[#ebe8e1] rounded-xl">
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                sourceFilter === 'all'
                  ? 'bg-[#202321] text-white shadow-sm'
                  : 'text-[#6f746e] hover:text-[#202321]'
              }`}
            >
              Toutes sources
            </button>
            <button
              onClick={() => setSourceFilter('marketplace')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                sourceFilter === 'marketplace'
                  ? 'bg-[#bd664a] text-white shadow-sm'
                  : 'text-[#6f746e] hover:text-[#202321]'
              }`}
            >
              Marketplace ({marketplaceClients})
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9e97]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher nom, téléphone..."
            className="w-full rounded-xl border border-[#e5e2db] bg-white pl-9 pr-3 py-2 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
          />
        </div>
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="rounded-3xl border border-dashed border-[#d8d4ca] bg-white p-12 text-center"
        >
          <Users className="mx-auto mb-3 text-[#bd664a]" size={32} />
          <h4 className="font-serif text-base font-bold text-[#202321]">Aucun client trouvé</h4>
          <p className="mt-1 text-xs text-[#8c9089]">
            Modifiez votre recherche ou ajoutez un nouveau client.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {filteredClients.map((client) => {
            const isVip = client.status === 'VIP'
            return (
              <motion.div
                key={client.id}
                initial="hidden"
                animate="visible"
                variants={staggerItem}
                className="flex flex-col justify-between rounded-3xl border border-[#e8e4dc] bg-white p-5 cursor-default"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#202321] text-xs font-bold text-[#f4c58d]">
                        {client.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-bold text-[#202321]">
                          {client.name}
                        </h4>
                        <div className="text-[11px] text-[#747873]">{client.phone}</div>
                      </div>
                    </div>

                    <span
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                        isVip
                          ? 'bg-[#fdf3ec] text-[#bd664a] border border-[#f5dece]'
                          : client.status === 'Régulier'
                          ? 'bg-[#ebf4e6] text-[#427a33]'
                          : 'bg-[#f1f3ed] text-[#6b7365]'
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>

                  {/* Prestation préférée & détails */}
                  <div className="mt-4 rounded-xl bg-[#faf8f4] p-3 text-xs space-y-1.5 border border-[#f3efe8]">
                    <div className="flex justify-between">
                      <span className="text-[#898e85]">Prestation fétiche :</span>
                      <strong className="text-[#202321] text-right truncate max-w-[170px]">
                        {client.favoriteService}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#898e85]">Coiffeur favori :</span>
                      <strong className="text-[#202321]">{client.preferredStaff}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#898e85]">Visites totales :</span>
                      <strong className="text-[#202321]">{client.totalVisits} rendez-vous</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#898e85]">Dépenses cumulées :</span>
                      <strong className="font-serif font-bold text-[#bd664a]">
                        {client.totalSpent.toLocaleString('fr-FR')} FCFA
                      </strong>
                    </div>
                  </div>

                  {client.nextAppointment && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#427a33] font-semibold">
                      <Calendar size={13} />
                      <span>Prochain RDV : {client.nextAppointment}</span>
                    </div>
                  )}

                  {client.notes && (
                    <p className="mt-2 text-[11px] italic text-[#8c9088] line-clamp-2">
                      « {client.notes} »
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#f1eee8] pt-3">
                  <span className="text-[10px] text-[#9ca098]">
                    {client.source === 'marketplace' ? 'Via Marketplace' : 'Client direct'}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${client.phone}`}
                      className="rounded-lg p-1.5 text-[#5f645d] hover:bg-[#f3f0ea] transition"
                      title="Appeler"
                    >
                      <Phone size={14} />
                    </a>
                    <button
                      onClick={() => setSelectedClientDetails(client)}
                      className="rounded-lg bg-[#202321] px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#393d3a] transition"
                    >
                      Détails
                    </button>
                    <button
                      onClick={() => onDeleteClient(client.id)}
                      className="rounded-lg p-1 text-[#a8aca5] hover:bg-red-50 hover:text-red-600 transition"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* MODAL: NOUVEAU CLIENT */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsNewClientModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-[#dedad2] bg-[#fbfaf7] p-6 shadow-2xl sm:p-8">
            <h3 className="font-serif text-xl font-bold text-[#202321]">
              Ajouter une nouvelle fiche client
            </h3>
            <p className="mt-1 text-xs text-[#7c807b]">
              Enregistrez un client dans votre base de données ERP Barber Cuts.
            </p>

            <form onSubmit={handleCreateClient} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">Nom et Prénom *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Christian Vangah"
                  required
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">Téléphone ou WhatsApp *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+225 07 00 00 00 00"
                  required
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">Email (optionnel)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@domaine.com"
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#444a43]">Statut client</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-[#e5e2db] bg-white px-3 py-2 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                  >
                    <option value="Nouveau">Nouveau</option>
                    <option value="Régulier">Régulier</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#444a43]">Coiffeur habituel</label>
                  <select
                    value={preferredStaff}
                    onChange={(e) => setPreferredStaff(e.target.value)}
                    className="w-full rounded-xl border border-[#e5e2db] bg-white px-3 py-2 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                  >
                    {salon.staff.map((st) => (
                      <option key={st.id} value={st.name}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">Prestation habituelle</label>
                <select
                  value={favoriteService}
                  onChange={(e) => setFavoriteService(e.target.value)}
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3 py-2 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                >
                  {salon.services.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.price.toLocaleString('fr-FR')} F)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">Notes et préférences</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Peau sensible, serviette tiède, thé vert..."
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#eeebe4] pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[#747873] hover:text-[#202321]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!name || !phone}
                  className="rounded-xl bg-[#202321] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#383d39] disabled:opacity-50"
                >
                  Enregistrer le client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAILS CLIENT */}
      {selectedClientDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedClientDetails(null)}
          />
          <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-[#dedad2] bg-[#fbfaf7] p-6 shadow-2xl sm:p-8">
            <button
              onClick={() => setSelectedClientDetails(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-[#7c807b] hover:bg-[#eae7e0]"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-[#eeebe4] pb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#202321] font-serif text-lg font-bold text-[#f4c58d]">
                {selectedClientDetails.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#202321]">
                  {selectedClientDetails.name}
                </h3>
                <span className="text-xs text-[#747873]">Client {selectedClientDetails.status}</span>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white p-3 border border-[#e8e4dc]">
                  <span className="text-[#8c9089] block">Téléphone</span>
                  <a
                    href={`tel:${selectedClientDetails.phone}`}
                    className="font-bold text-[#202321] hover:underline"
                  >
                    {selectedClientDetails.phone}
                  </a>
                </div>
                <div className="rounded-xl bg-white p-3 border border-[#e8e4dc]">
                  <span className="text-[#8c9089] block">Total dépensé</span>
                  <strong className="font-serif text-base text-[#bd664a]">
                    {selectedClientDetails.totalSpent.toLocaleString('fr-FR')} FCFA
                  </strong>
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 border border-[#e8e4dc] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#8c9089]">Prestation habituelle</span>
                  <strong>{selectedClientDetails.favoriteService}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c9089]">Coiffeur assigné</span>
                  <strong>{selectedClientDetails.preferredStaff}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c9089]">Nombre total de visites</span>
                  <strong>{selectedClientDetails.totalVisits} rendez-vous</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c9089]">Origine d'inscription</span>
                  <strong>
                    {selectedClientDetails.source === 'marketplace'
                      ? 'Marketplace Barber Cuts'
                      : 'Direct au salon'}
                  </strong>
                </div>
              </div>

              {selectedClientDetails.notes && (
                <div className="rounded-xl bg-[#faf8f4] p-3 border border-[#e8e4dc]">
                  <span className="text-[#8c9089] block font-semibold">Notes & Préférences</span>
                  <p className="mt-1 text-[#545952]">{selectedClientDetails.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedClientDetails(null)}
                className="rounded-xl bg-[#202321] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#393d3a]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
