'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Scissors,
  Plus,
  Search,
  Sparkles,
  Clock,
  Star,
  Check,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  DollarSign,
  Tag,
} from 'lucide-react'
import { Salon, SalonService } from '@/lib/store'
import { staggerContainer, staggerItem, fadeInUp } from '@/components/ui/motion'

interface ERPServicesViewProps {
  salon: Salon
  onUpdateSalon: (updated: Salon) => void
}

export function ERPServicesView({ salon, onUpdateSalon }: ERPServicesViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<SalonService | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [category, setCategory] = useState<SalonService['category']>('Hommes')
  const [price, setPrice] = useState('8000')
  const [duration, setDuration] = useState('45')
  const [description, setDescription] = useState('')
  const [isPopular, setIsPopular] = useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const categories = ['all', 'Hommes', 'Dames', 'Soins & Barbe', 'Enfants']

  const filteredServices = salon.services.filter((s) => {
    const matchesCat = activeCategory === 'all' || s.category === activeCategory
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCat && matchesSearch
  })

  // KPIs
  const totalCount = salon.services.length
  const totalPrice = salon.services.reduce((sum, s) => sum + s.price, 0)
  const avgPrice = totalCount > 0 ? Math.round(totalPrice / totalCount) : 0
  const popularCount = salon.services.filter((s) => s.isPopular).length

  const openAddModal = () => {
    setEditingService(null)
    setName('')
    setCategory('Hommes')
    setPrice('8000')
    setDuration('45')
    setDescription('')
    setIsPopular(false)
    setIsModalOpen(true)
  }

  const openEditModal = (srv: SalonService) => {
    setEditingService(srv)
    setName(srv.name)
    setCategory(srv.category)
    setPrice(srv.price.toString())
    setDuration(srv.duration.toString())
    setDescription(srv.description)
    setIsPopular(!!srv.isPopular)
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const parsedPrice = parseInt(price, 10) || 5000
    const parsedDuration = parseInt(duration, 10) || 30

    if (editingService) {
      const updatedList = salon.services.map((s) =>
        s.id === editingService.id
          ? {
              ...s,
              name: name.trim(),
              category,
              price: parsedPrice,
              duration: parsedDuration,
              description: description.trim(),
              isPopular,
            }
          : s
      )
      onUpdateSalon({ ...salon, services: updatedList })
      showToast('Prestation modifiée avec succès !')
    } else {
      const newSrv: SalonService = {
        id: 'srv-' + Date.now(),
        name: name.trim(),
        category,
        price: parsedPrice,
        duration: parsedDuration,
        description: description.trim() || 'Prestation sur mesure réalisée au salon.',
        isPopular,
      }
      onUpdateSalon({ ...salon, services: [newSrv, ...salon.services] })
      showToast('Nouvelle prestation ajoutée au catalogue !')
    }

    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    const updatedList = salon.services.filter((s) => s.id !== id)
    onUpdateSalon({ ...salon, services: updatedList })
    showToast('Prestation supprimée.')
  }

  const togglePopular = (srv: SalonService) => {
    const updatedList = salon.services.map((s) =>
      s.id === srv.id ? { ...s, isPopular: !s.isPopular } : s
    )
    onUpdateSalon({ ...salon, services: updatedList })
    showToast(
      !srv.isPopular
        ? 'Prestation mise en vedette dans l’annonce Marketplace !'
        : 'Prestation retirée des vedettes.'
    )
  }

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
            <Scissors size={15} />
            <span>Catalogue Prestations & Tarifs Officiels</span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold text-[#202321]">
            Menu des Prestations ({totalCount})
          </h2>
          <p className="mt-1 text-xs text-[#7c807b]">
            Définissez vos tarifs en FCFA, les durées de coupe et mettez en vedette vos services pour la Marketplace.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-[#202321] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#383d39] transition w-fit"
        >
          <Plus size={15} />
          <span>Ajouter une prestation</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e9e6df] bg-white p-4">
          <span className="text-[11px] text-[#92958f]">Total prestations actives</span>
          <div className="mt-1 font-serif text-2xl font-bold text-[#202321]">{totalCount}</div>
          <p className="mt-1 text-[10px] text-[#79906f]">Disponibles à la réservation</p>
        </div>

        <div className="rounded-2xl border border-[#e9e6df] bg-white p-4">
          <span className="text-[11px] text-[#92958f]">Tarif moyen prestation</span>
          <div className="mt-1 font-serif text-2xl font-bold text-[#bd664a]">
            {avgPrice.toLocaleString('fr-FR')} FCFA
          </div>
          <p className="mt-1 text-[10px] text-[#92958f]">Toutes catégories confondues</p>
        </div>

        <div className="rounded-2xl border border-[#e9e6df] bg-white p-4">
          <span className="text-[11px] text-[#92958f]">En vedette sur la Marketplace</span>
          <div className="mt-1 font-serif text-2xl font-bold text-[#202321]">{popularCount}</div>
          <p className="mt-1 text-[10px] text-[#bd664a]">Affichées en priorité sur votre vitrine</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-[#ebe8e1] rounded-xl overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                activeCategory === c
                  ? 'bg-white text-[#202321] shadow-sm'
                  : 'text-[#6f746e] hover:text-[#202321]'
              }`}
            >
              {c === 'all' ? 'Toutes catégories' : c}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9e97]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une prestation..."
            className="w-full rounded-xl border border-[#e5e2db] bg-white pl-9 pr-3 py-2 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
          />
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="rounded-3xl border border-dashed border-[#d8d4ca] bg-white p-12 text-center"
        >
          <Scissors className="mx-auto mb-3 text-[#bd664a]" size={32} />
          <h4 className="font-serif text-base font-bold text-[#202321]">Aucune prestation trouvée</h4>
          <p className="mt-1 text-xs text-[#8c9089]">
            Modifiez votre filtre ou ajoutez un nouveau soin au menu.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {filteredServices.map((srv) => (
            <motion.div
              key={srv.id}
              initial="hidden"
              animate="visible"
              variants={staggerItem}
              className="flex flex-col justify-between rounded-3xl border border-[#e8e4dc] bg-white p-5 cursor-default"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#bd664a]">
                      {srv.category}
                    </span>
                    <h4 className="mt-0.5 font-serif text-base font-bold text-[#202321]">
                      {srv.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-base font-bold text-[#202321]">
                      {srv.price.toLocaleString('fr-FR')} F
                    </div>
                    <div className="text-[10px] text-[#8c9089]">{srv.duration} min</div>
                  </div>
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-[#737871] line-clamp-3">
                  {srv.description}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#f1eee8] pt-3">
                <button
                  onClick={() => togglePopular(srv)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                    srv.isPopular
                      ? 'bg-[#fdf3ec] text-[#bd664a] border border-[#f5dece]'
                      : 'text-[#8c9089] hover:bg-[#f6f4ee]'
                  }`}
                >
                  <Star size={13} fill={srv.isPopular ? '#bd664a' : 'none'} />
                  <span>{srv.isPopular ? 'En vedette' : 'Standard'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(srv)}
                    className="rounded-lg p-1.5 text-[#6c716a] hover:bg-[#f4f2ec] transition"
                    title="Modifier"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(srv.id)}
                    className="rounded-lg p-1.5 text-[#a8aca5] hover:bg-red-50 hover:text-red-600 transition"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* MODAL: ADD / EDIT SERVICE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-[#dedad2] bg-[#fbfaf7] p-6 shadow-2xl sm:p-8">
            <h3 className="font-serif text-xl font-bold text-[#202321]">
              {editingService ? 'Modifier la prestation' : 'Ajouter une prestation au menu'}
            </h3>
            <p className="mt-1 text-xs text-[#7c807b]">
              Configurez le titre, le tarif en Francs CFA et la durée estimée.
            </p>

            <form onSubmit={handleSave} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">
                  Nom de la prestation *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Tresses déesses & Soin vapeur"
                  required
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#444a43]">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-[#e5e2db] bg-white px-3 py-2 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                  >
                    <option value="Hommes">Hommes</option>
                    <option value="Dames">Dames</option>
                    <option value="Soins & Barbe">Soins & Barbe</option>
                    <option value="Enfants">Enfants</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#444a43]">Prix (FCFA) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#e5e2db] bg-white px-3 py-2 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">
                  Durée estimée (minutes)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="45"
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3 py-2 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">
                  Description pour les clients
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Expliquez le protocole, shampoing inclus, serviette chaude, produits utilisés..."
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#bd664a]"
                />
                <span className="text-xs font-semibold text-[#444a43]">
                  Mettre en vedette dans l’annonce de la Marketplace
                </span>
              </label>

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
                  {editingService ? 'Sauvegarder' : 'Ajouter au catalogue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
