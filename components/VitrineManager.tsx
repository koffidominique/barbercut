'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Camera,
  Plus,
  Trash2,
  Check,
  Eye,
  Store,
  MapPin,
  Clock,
  Phone,
  Tag,
  Scissors,
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal,
  FileText,
  Upload,
  AlertCircle,
} from 'lucide-react'
import { Salon, ShowcasePhoto, SalonService } from '@/lib/store'
import { staggerContainer, staggerItem, fadeInUp } from '@/components/ui/motion'

interface VitrineManagerProps {
  salon: Salon
  onUpdateSalon: (updated: Salon) => void
  onViewMarketplace: () => void
}

const PRESET_GALLERY_IMAGES = [
  {
    url: '/images/barber_showcase_fade_1793627544114.jpg',
    title: 'Dégradé américain & Barbe taillée',
    desc: 'Dégradé à blanc progressif, traçage au rasoir coupe-chou avec serviette chaude.',
    tags: ['Dégradé', 'Barbe', 'Lame', 'Homme'],
  },
  {
    url: '/images/salon_showcase_braids_1793627544312.jpg',
    title: 'Tresses déesses royales & Motifs',
    desc: 'Art du tressage d’exception avec finitions dorées et soin du cuir chevelu.',
    tags: ['Tresses', 'Dames', 'Afro-Chic', 'Soins'],
  },
  {
    url: '/images/barber_marine_salon_1793627544764.jpg',
    title: 'Lounge barbier vintage & Cuir',
    desc: 'Fauteuils club, atmosphère feutrée et soins pour les gentlemen exigeants.',
    tags: ['Salon', 'VIP', 'Confort', 'Prestige'],
  },
  {
    url: '/images/marketplace_hero_lifestyle_1793627543863.jpg',
    title: 'Postes de coiffure & Cadre lumineux',
    desc: 'Espace spacieux, climatisé et équipé des dernières technologies de barbier.',
    tags: ['Ambiance', 'Cadre', 'Cocody'],
  },
]

export function VitrineManager({
  salon,
  onUpdateSalon,
  onViewMarketplace,
}: VitrineManagerProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'info' | 'services' | 'preview'>('photos')
  const [saveToast, setSaveToast] = useState(false)

  // New photo modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [newPhotoTitle, setNewPhotoTitle] = useState('')
  const [newPhotoDesc, setNewPhotoDesc] = useState('')
  const [newPhotoTags, setNewPhotoTags] = useState('Dégradé, Barbe')
  const [newPhotoIsCover, setNewPhotoIsCover] = useState(false)

  // New service modal state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [newServiceName, setNewServiceName] = useState('')
  const [newServiceCategory, setNewServiceCategory] = useState<SalonService['category']>('Hommes')
  const [newServicePrice, setNewServicePrice] = useState('8000')
  const [newServiceDuration, setNewServiceDuration] = useState('45')
  const [newServiceDesc, setNewServiceDesc] = useState('')

  const triggerToast = () => {
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 3000)
  }

  // Toggle publication status
  const handleTogglePublish = () => {
    const updated = { ...salon, isPublished: !salon.isPublished }
    onUpdateSalon(updated)
    triggerToast()
  }

  // Add a new showcase photo
  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPhotoUrl.trim() || !newPhotoTitle.trim()) return

    const photo: ShowcasePhoto = {
      id: 'photo-' + Date.now(),
      url: newPhotoUrl.trim(),
      title: newPhotoTitle.trim(),
      description: newPhotoDesc.trim() || 'Réalisation exclusive par nos maîtres artisans.',
      tags: newPhotoTags.split(',').map((t) => t.trim()).filter(Boolean),
      isCover: newPhotoIsCover,
    }

    let updatedGallery = [photo, ...salon.gallery]
    let coverImage = salon.coverImage
    if (newPhotoIsCover) {
      updatedGallery = updatedGallery.map((p) => ({
        ...p,
        isCover: p.id === photo.id,
      }))
      coverImage = photo.url
    }

    onUpdateSalon({
      ...salon,
      gallery: updatedGallery,
      coverImage,
    })

    // Reset
    setNewPhotoUrl('')
    setNewPhotoTitle('')
    setNewPhotoDesc('')
    setNewPhotoTags('Dégradé, Barbe')
    setNewPhotoIsCover(false)
    setIsPhotoModalOpen(false)
    triggerToast()
  }

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewPhotoUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  // Delete a showcase photo
  const handleDeletePhoto = (photoId: string) => {
    const nextGallery = salon.gallery.filter((p) => p.id !== photoId)
    onUpdateSalon({
      ...salon,
      gallery: nextGallery,
    })
    triggerToast()
  }

  // Set photo as cover
  const handleSetCoverPhoto = (photo: ShowcasePhoto) => {
    const nextGallery = salon.gallery.map((p) => ({
      ...p,
      isCover: p.id === photo.id,
    }))
    onUpdateSalon({
      ...salon,
      coverImage: photo.url,
      gallery: nextGallery,
    })
    triggerToast()
  }

  // Add new service
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newServiceName.trim()) return

    const srv: SalonService = {
      id: 'srv-' + Date.now(),
      name: newServiceName.trim(),
      category: newServiceCategory,
      price: parseInt(newServicePrice, 10) || 5000,
      duration: parseInt(newServiceDuration, 10) || 45,
      description: newServiceDesc.trim() || 'Prestation professionnelle réalisée par nos coiffeurs experts.',
      isPopular: true,
    }

    onUpdateSalon({
      ...salon,
      services: [srv, ...salon.services],
    })

    setNewServiceName('')
    setNewServiceDesc('')
    setIsServiceModalOpen(false)
    triggerToast()
  }

  // Delete service
  const handleDeleteService = (serviceId: string) => {
    onUpdateSalon({
      ...salon,
      services: salon.services.filter((s) => s.id !== serviceId),
    })
    triggerToast()
  }

  // Toggle feature item
  const handleToggleFeature = (featureName: string) => {
    const exists = salon.features.includes(featureName)
    const nextFeatures = exists
      ? salon.features.filter((f) => f !== featureName)
      : [...salon.features, featureName]
    onUpdateSalon({
      ...salon,
      features: nextFeatures,
    })
    triggerToast()
  }

  return (
    <div className="space-y-6">
      {/* Save / Sync Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#202321] px-5 py-3.5 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-[#96be8c]" />
          <span>Vitrine mise à jour et synchronisée avec la Marketplace en direct !</span>
        </div>
      )}

      {/* Header Banner & Status */}
      <div className="rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#bd664a]">
              <Store size={15} />
              <span>Gestion Vitrine & Annonces Publicitaires</span>
            </div>
            <h2 className="mt-1 font-serif text-2xl font-bold text-[#202321] sm:text-3xl">
              Votre Vitrine sur la Marketplace Barber Cuts
            </h2>
            <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[#747873]">
              Publiez les photos de vos coupes, soignez vos descriptions et proposez vos prestations.
              Chaque mise à jour apparaît en temps réel sur la vitrine publique pour attirer des clients et générer des réservations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Online / Offline switch */}
            <div className="flex items-center gap-3 rounded-2xl border border-[#ebe7e0] bg-[#faf8f4] px-4 py-2.5">
              <span className="text-xs font-medium text-[#646862]">Statut annonce :</span>
              <button
                onClick={handleTogglePublish}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  salon.isPublished
                    ? 'bg-[#eaf4e6] text-[#3d6e2e] border border-[#d2e8cb]'
                    : 'bg-[#f4ebe6] text-[#a04e33] border border-[#edd7ce]'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    salon.isPublished ? 'bg-[#4d9138]' : 'bg-[#bd664a]'
                  }`}
                />
                {salon.isPublished ? 'En ligne sur la marketplace' : 'Masquée / Brouillon'}
              </button>
            </div>

            {/* Direct Link to Marketplace */}
            <button
              onClick={onViewMarketplace}
              className="flex items-center gap-2 rounded-xl bg-[#202321] px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#383d39] transition"
            >
              <Eye size={15} />
              <span>Voir la vitrine publique</span>
              <ExternalLink size={13} className="text-[#e2a46d]" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-[#f0ece5] pt-4">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'photos'
                ? 'bg-[#202321] text-white'
                : 'text-[#6e736d] hover:bg-[#f4f2ec] hover:text-[#202321]'
            }`}
          >
            <Camera size={15} />
            <span>Galerie & Photos d’annonces ({salon.gallery.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'info'
                ? 'bg-[#202321] text-white'
                : 'text-[#6e736d] hover:bg-[#f4f2ec] hover:text-[#202321]'
            }`}
          >
            <FileText size={15} />
            <span>Fiche Salon & Caractéristiques</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'services'
                ? 'bg-[#202321] text-white'
                : 'text-[#6e736d] hover:bg-[#f4f2ec] hover:text-[#202321]'
            }`}
          >
            <Scissors size={15} />
            <span>Catalogue Prestations & Tarifs ({salon.services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'preview'
                ? 'bg-[#202321] text-white'
                : 'text-[#6e736d] hover:bg-[#f4f2ec] hover:text-[#202321]'
            }`}
          >
            <Eye size={15} />
            <span>Aperçu en direct (Marketplace Card)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PHOTOS & SHOWCASES */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#202321]">
                Photos publiées comme annonces publicitaires
              </h3>
              <p className="text-xs text-[#7e827d]">
                Ces visuels sont présentés aux clients dans la vitrine. Ajoutez des descriptions détaillées et les points forts de vos coupes.
              </p>
            </div>
            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#bd664a] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#aa573e] transition"
            >
              <Plus size={15} />
              <span>Publier une nouvelle photo</span>
            </button>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {salon.gallery.map((photo) => {
              const isCurrentCover = salon.coverImage === photo.url || photo.isCover
              return (
                <motion.div
                  key={photo.id}
                  initial="hidden"
                  animate="visible"
                  variants={staggerItem}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#e8e4dc] bg-white cursor-default"
                >
                  {/* Photo container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#202321]">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    {isCurrentCover && (
                      <span className="absolute top-3 left-3 rounded-lg bg-[#202321]/90 px-2.5 py-1 text-[10px] font-bold text-[#f4c58d] backdrop-blur-sm">
                        Photo de couverture
                      </span>
                    )}
                  </div>

                  {/* Photo details */}
                  <div className="flex flex-1 flex-col p-4">
                    <h4 className="font-serif text-sm font-bold text-[#202321]">{photo.title}</h4>
                    <p className="mt-1 text-xs text-[#737871] line-clamp-2">{photo.description}</p>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {photo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-[#f4f2ec] px-2 py-0.5 text-[10px] font-medium text-[#5f645d]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#f1eee8]">
                      {!isCurrentCover ? (
                        <button
                          onClick={() => handleSetCoverPhoto(photo)}
                          className="text-[11px] font-semibold text-[#bd664a] hover:underline"
                        >
                          Définir comme couverture
                        </button>
                      ) : (
                        <span className="text-[11px] font-medium text-[#79906f] flex items-center gap-1">
                          <Check size={13} /> Couverture active
                        </span>
                      )}
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="rounded-lg p-1.5 text-[#a8aca5] hover:bg-red-50 hover:text-red-600 transition"
                        aria-label="Supprimer la photo"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      )}

      {/* TAB 2: SALON INFO & ATTRIBUTES */}
      {activeTab === 'info' && (
        <div className="rounded-3xl border border-[#e8e4dc] bg-white p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#202321]">
              Informations & Identité de votre boutique
            </h3>
            <p className="text-xs text-[#7c807b]">
              Ces informations sont affichées sur l’annonce de votre salon sur la Marketplace.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#4e534d]">Nom du Salon</label>
              <input
                type="text"
                value={salon.name}
                onChange={(e) => onUpdateSalon({ ...salon, name: e.target.value })}
                className="w-full rounded-xl border border-[#e6e2da] bg-[#fcfbf9] px-4 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#4e534d]">Slogan publicitaire</label>
              <input
                type="text"
                value={salon.tagline}
                onChange={(e) => onUpdateSalon({ ...salon, tagline: e.target.value })}
                className="w-full rounded-xl border border-[#e6e2da] bg-[#fcfbf9] px-4 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#4e534d]">Commune / Quartier</label>
              <input
                type="text"
                value={salon.neighborhood}
                onChange={(e) => onUpdateSalon({ ...salon, neighborhood: e.target.value })}
                className="w-full rounded-xl border border-[#e6e2da] bg-[#fcfbf9] px-4 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#4e534d]">Ville</label>
              <input
                type="text"
                value={salon.city}
                onChange={(e) => onUpdateSalon({ ...salon, city: e.target.value })}
                className="w-full rounded-xl border border-[#e6e2da] bg-[#fcfbf9] px-4 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#4e534d]">Téléphone professionnel</label>
              <input
                type="text"
                value={salon.phone}
                onChange={(e) => onUpdateSalon({ ...salon, phone: e.target.value })}
                className="w-full rounded-xl border border-[#e6e2da] bg-[#fcfbf9] px-4 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#4e534d]">WhatsApp client</label>
              <input
                type="text"
                value={salon.whatsapp}
                onChange={(e) => onUpdateSalon({ ...salon, whatsapp: e.target.value })}
                className="w-full rounded-xl border border-[#e6e2da] bg-[#fcfbf9] px-4 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#4e534d]">
              Adresse physique & Repères d'accès
            </label>
            <input
              type="text"
              value={salon.address}
              onChange={(e) => onUpdateSalon({ ...salon, address: e.target.value })}
              className="w-full rounded-xl border border-[#e6e2da] bg-[#fcfbf9] px-4 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#4e534d]">
              Présentation & Description publique de la boutique
            </label>
            <textarea
              rows={3}
              value={salon.description}
              onChange={(e) => onUpdateSalon({ ...salon, description: e.target.value })}
              className="w-full rounded-xl border border-[#e6e2da] bg-[#fcfbf9] px-4 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
            />
          </div>

          {/* Features selection */}
          <div className="border-t border-[#f1eee8] pt-5">
            <label className="mb-3 block text-xs font-bold text-[#4e534d]">
              Points forts & Caractéristiques de la boutique (Affichés en vitrine)
            </label>
            <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
              {[
                'Salon climatisé haut standing',
                'Boissons fraîches & café offerts',
                'Wi-Fi haut débit',
                'Paiements Wave & Orange Money acceptés',
                'Fauteuils barbier vintage confort',
                'Espace détente VIP',
                'Accessible sans rendez-vous',
                'Parking privé sécurisé',
                'Produits de soin bio & huiles naturelles',
              ].map((feat) => {
                const checked = salon.features.includes(feat)
                return (
                  <button
                    type="button"
                    key={feat}
                    onClick={() => handleToggleFeature(feat)}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                      checked
                        ? 'border-[#bd664a] bg-[#fcf4ed] text-[#202321]'
                        : 'border-[#e8e4dc] bg-white text-[#747873] hover:border-[#cfcbc2]'
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md text-[10px] ${
                        checked ? 'bg-[#bd664a] text-white' : 'border border-[#cfcbc2] bg-white'
                      }`}
                    >
                      {checked && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span className="text-xs font-medium">{feat}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SERVICES & PRICING */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#202321]">
                Catalogue des prestations & Tarifs de l'annonce
              </h3>
              <p className="text-xs text-[#7e827d]">
                Les clients de la marketplace peuvent réserver ces prestations directement en ligne.
              </p>
            </div>
            <button
              onClick={() => setIsServiceModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#202321] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#383d39] transition"
            >
              <Plus size={15} />
              <span>Ajouter une prestation</span>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {salon.services.map((srv) => (
              <div
                key={srv.id}
                className="flex flex-col justify-between rounded-2xl border border-[#e8e4dc] bg-white p-5 transition hover:border-[#cfcbc2]"
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
                  <p className="mt-2 text-xs leading-relaxed text-[#747873]">{srv.description}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#f1eee8] pt-3">
                  <span className="text-[11px] text-[#79906f] font-semibold">
                    {srv.isPopular ? '★ En vedette dans l’annonce' : 'Au catalogue'}
                  </span>
                  <button
                    onClick={() => handleDeleteService(srv.id)}
                    className="rounded-lg p-1 text-[#a8aca5] hover:bg-red-50 hover:text-red-600 transition"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#202321]">
                Aperçu en direct de votre annonce sur la Marketplace
              </h3>
              <p className="text-xs text-[#7e827d]">
                Voici la façon dont votre salon et vos photos sont mis en avant pour les visiteurs.
              </p>
            </div>
            <button
              onClick={onViewMarketplace}
              className="flex items-center gap-1.5 text-xs font-bold text-[#bd664a] hover:underline"
            >
              Voir en pleine page sur la marketplace <ExternalLink size={14} />
            </button>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-[#e4e1d8] bg-white shadow-lg">
            {/* Cover image */}
            <div className="relative aspect-[16/9] w-full bg-[#202321]">
              <img
                src={salon.coverImage}
                alt={salon.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="flex items-center gap-2 text-xs text-[#f4c58d]">
                  <MapPin size={14} />
                  <span>{salon.neighborhood}, {salon.city}</span>
                  <span>·</span>
                  <span>★ {salon.rating} ({salon.reviewsCount} avis)</span>
                </div>
                <h3 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">{salon.name}</h3>
                <p className="mt-1 max-w-xl text-xs text-[#d6dad5]">{salon.tagline}</p>
              </div>
            </div>

            {/* Gallery thumbnails */}
            <div className="p-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#91958f]">
                Photos & Réalisations ({salon.gallery.length})
              </span>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {salon.gallery.slice(0, 3).map((item) => (
                  <div key={item.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#202321]">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2.5">
                      <span className="text-[11px] font-semibold text-white leading-tight line-clamp-1">
                        {item.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Services teaser */}
              <div className="mt-6 border-t border-[#f0ece5] pt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#91958f]">
                  Prestations vedettes & Réservation
                </span>
                <div className="mt-3 space-y-2">
                  {salon.services.slice(0, 3).map((srv) => (
                    <div
                      key={srv.id}
                      className="flex items-center justify-between rounded-xl bg-[#faf8f4] px-4 py-2.5"
                    >
                      <div>
                        <div className="text-xs font-semibold text-[#202321]">{srv.name}</div>
                        <div className="text-[11px] text-[#868a83]">{srv.duration} min · {srv.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-xs font-bold text-[#bd664a]">
                          {srv.price.toLocaleString('fr-FR')} FCFA
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SHOWCASE PHOTO */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsPhotoModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#dedad2] bg-[#fbfaf7] p-6 shadow-2xl sm:p-8">
            <h3 className="font-serif text-xl font-bold text-[#202321]">
              Publier une photo dans votre vitrine
            </h3>
            <p className="mt-1 text-xs text-[#7c807b]">
              Mettez en valeur les coupes de vos barbiers, votre salon ou vos coiffures dames.
            </p>

            <form onSubmit={handleAddPhoto} className="mt-6 space-y-4">
              {/* Presets or custom file */}
              <div>
                <label className="mb-2 block text-xs font-bold text-[#444a43]">
                  1. Sélectionner une photo haute définition ou importer un fichier
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PRESET_GALLERY_IMAGES.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setNewPhotoUrl(preset.url)
                        setNewPhotoTitle(preset.title)
                        setNewPhotoDesc(preset.desc)
                        setNewPhotoTags(preset.tags.join(', '))
                      }}
                      className={`group relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition ${
                        newPhotoUrl === preset.url
                          ? 'border-[#bd664a] ring-2 ring-[#bd664a]/20'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center">
                        <span className="text-[10px] font-bold text-white">{preset.tags[0]}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#cfcbc2] bg-white px-4 py-2.5 text-xs font-semibold text-[#5d635c] hover:bg-[#f6f4ee]">
                    <Upload size={14} />
                    <span>Importer depuis votre appareil</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">
                  2. Titre de la réalisation ou de l’annonce *
                </label>
                <input
                  type="text"
                  value={newPhotoTitle}
                  onChange={(e) => setNewPhotoTitle(e.target.value)}
                  placeholder="Ex: Dégradé taper à blanc & Traçage millimétré"
                  required
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">
                  3. Description & Spécificités de la photo
                </label>
                <textarea
                  rows={2}
                  value={newPhotoDesc}
                  onChange={(e) => setNewPhotoDesc(e.target.value)}
                  placeholder="Ex: Réalisé à la tondeuse de précision et finition lame. Soin à la serviette chaude inclus."
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">
                  4. Mots-clés / Caractéristiques (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={newPhotoTags}
                  onChange={(e) => setNewPhotoTags(e.target.value)}
                  placeholder="Ex: Dégradé, Barbe, Lame, Soin, Homme"
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              {/* Cover toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newPhotoIsCover}
                  onChange={(e) => setNewPhotoIsCover(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#bd664a]"
                />
                <span className="text-xs font-semibold text-[#444a43]">
                  Définir également comme photo de couverture principale
                </span>
              </label>

              {/* Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#eeebe4] pt-4">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[#747873] hover:text-[#202321]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newPhotoUrl || !newPhotoTitle}
                  className="rounded-xl bg-[#202321] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#383d39] disabled:opacity-50"
                >
                  Publier sur ma vitrine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SERVICE */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsServiceModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-[#dedad2] bg-[#fbfaf7] p-6 shadow-2xl sm:p-8">
            <h3 className="font-serif text-xl font-bold text-[#202321]">
              Ajouter une nouvelle prestation
            </h3>
            <p className="mt-1 text-xs text-[#7c807b]">
              Cette prestation pourra être directement réservée depuis la marketplace.
            </p>

            <form onSubmit={handleAddService} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">Nom de la prestation *</label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Ex: Tresses sénégalaises & Soin vapeur"
                  required
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#444a43]">Catégorie</label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-[#e5e2db] bg-white px-3 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
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
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    placeholder="8000"
                    required
                    className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">Durée estimée (minutes)</label>
                <input
                  type="number"
                  value={newServiceDuration}
                  onChange={(e) => setNewServiceDuration(e.target.value)}
                  placeholder="45"
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#444a43]">Description pour le client</label>
                <textarea
                  rows={2}
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  placeholder="Détaillez le déroulement, les produits utilisés, serviette chaude..."
                  className="w-full rounded-xl border border-[#e5e2db] bg-white px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#eeebe4] pt-4">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[#747873] hover:text-[#202321]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newServiceName}
                  className="rounded-xl bg-[#202321] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#383d39] disabled:opacity-50"
                >
                  Ajouter au catalogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
