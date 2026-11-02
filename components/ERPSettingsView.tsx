'use client'

import { useState } from 'react'
import {
  Settings2,
  Clock,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Store,
  DollarSign,
  Phone,
  MessageSquare,
  CreditCard,
  Save,
} from 'lucide-react'
import { Salon } from '@/lib/store'

interface ERPSettingsViewProps {
  salon: Salon
  onUpdateSalon: (updated: Salon) => void
}

const DAYS = [
  { day: 'Lundi', defaultOpen: false, hours: 'Fermé' },
  { day: 'Mardi', defaultOpen: true, hours: '08:30 - 20:30' },
  { day: 'Mercredi', defaultOpen: true, hours: '08:30 - 20:30' },
  { day: 'Jeudi', defaultOpen: true, hours: '08:30 - 20:30' },
  { day: 'Vendredi', defaultOpen: true, hours: '08:30 - 21:00' },
  { day: 'Samedi', defaultOpen: true, hours: '08:00 - 21:30' },
  { day: 'Dimanche', defaultOpen: true, hours: '09:00 - 18:00' },
]

export function ERPSettingsView({ salon, onUpdateSalon }: ERPSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'reminders' | 'billing'>('general')
  const [saveToast, setSaveToast] = useState(false)

  // Form values
  const [name, setName] = useState(salon.name)
  const [tagline, setTagline] = useState(salon.tagline)
  const [phone, setPhone] = useState(salon.phone)
  const [whatsapp, setWhatsapp] = useState(salon.whatsapp)
  const [address, setAddress] = useState(salon.address)
  const [neighborhood, setNeighborhood] = useState(salon.neighborhood)
  const [city, setCity] = useState(salon.city)
  const [rccm, setRccm] = useState(salon.rccm || 'CI-ABJ-2023-B-1428')
  const [openingHours, setOpeningHours] = useState(salon.openingHours)
  const [smsEnabled, setSmsEnabled] = useState(salon.smsRemindersEnabled ?? true)
  const [whatsappEnabled, setWhatsappEnabled] = useState(salon.whatsappConfirmationEnabled ?? true)
  const [logo, setLogo] = useState(salon.logo || '')

  // Logo upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérification de la taille (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert("Le fichier est trop volumineux. Taille maximale : 2Mo")
      return
    }

    // Vérification du type de fichier
    if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
      alert("Format de fichier non supporté. Formats acceptés : JPG, PNG, SVG")
      return
    }

    // Création d'une URL temporaire pour la prévisualisation
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setLogo(base64)
    }
    reader.readAsDataURL(file)
  }

  const safeUpdateSalon = (updatedSalon: Salon) => {
    if (!salon.id) {
      alert("Veuillez d'abord créer un salon avant de modifier ses paramètres");
      return;
    }
    onUpdateSalon(updatedSalon);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    safeUpdateSalon({
      ...salon,
      name,
      tagline,
      phone,
      whatsapp,
      address,
      neighborhood,
      city,
      rccm,
      openingHours,
      smsRemindersEnabled: smsEnabled,
      whatsappConfirmationEnabled: whatsappEnabled,
      logo,
    })
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#202321] px-5 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in">
          <CheckCircle2 size={16} className="text-[#8ec380]" />
          <span>Paramètres du salon enregistrés avec succès !</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#bd664a]">
            <Settings2 size={15} />
            <span>Configuration & Préférences de l'Établissement</span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold text-[#202321]">
            Paramètres du Salon
          </h2>
          <p className="mt-1 text-xs text-[#7c807b]">
            Gérez les coordonnées légales, les plages d'ouverture et les rappels automatiques envoyés aux clients.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-[#202321] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#383d39] transition w-fit"
        >
          <Save size={15} />
          <span>Enregistrer les modifications</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#e9e6df] pb-3">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${activeTab === 'general'
            ? 'bg-[#202321] text-white'
            : 'text-[#6c716a] hover:bg-[#ebe7e0] hover:text-[#202321]'
            }`}
        >
          <Store size={14} />
          <span>Informations Générales</span>
        </button>

        <button
          onClick={() => setActiveTab('hours')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${activeTab === 'hours'
            ? 'bg-[#202321] text-white'
            : 'text-[#6c716a] hover:bg-[#ebe7e0] hover:text-[#202321]'
            }`}
        >
          <Clock size={14} />
          <span>Horaires & Calendrier</span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${activeTab === 'reminders'
            ? 'bg-[#202321] text-white'
            : 'text-[#6c716a] hover:bg-[#ebe7e0] hover:text-[#202321]'
            }`}
        >
          <Bell size={14} />
          <span>Rappels SMS & WhatsApp</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${activeTab === 'billing'
            ? 'bg-[#202321] text-white'
            : 'text-[#6c716a] hover:bg-[#ebe7e0] hover:text-[#202321]'
            }`}
        >
          <CreditCard size={14} />
          <span>Abonnement & Facturation</span>
        </button>
      </div>

      {/* TAB 1: GENERAL */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="rounded-3xl border border-[#e8e4dc] bg-white p-6 sm:p-8 space-y-6">
          {/* Logo Upload Section */}
          <div className="col-span-2 mb-4">
            <label className="mb-2 block text-xs font-bold text-[#4e534d]">Logo de l'établissement</label>
            <div className="flex flex-wrap items-center gap-4">
              {/* Logo Preview */}
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#e5e2db] bg-[#fcfbf9] overflow-hidden">
                {logo ? (
                  <img src={logo} alt="Logo du salon" className="h-full w-full object-cover" />
                ) : (
                  <Store size={32} className="text-[#92958f]" />
                )}
              </div>
              {/* Upload Controls */}
              <div className="flex flex-col gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#202321] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#383d39] transition w-fit">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  Choisir un logo
                </label>
                <span className="text-[10px] text-[#8c9089]">
                  Formats acceptés : JPG, PNG, SVG • Taille max : 2Mo
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#4e534d]">Nom officiel du salon</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#4e534d]">Slogan ou descriptif court</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#4e534d]">Numéro RCCM / Registre</label>
              <input
                type="text"
                value={rccm}
                onChange={(e) => setRccm(e.target.value)}
                className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#4e534d]">Devise de facturation</label>
              <input
                type="text"
                value="Franc CFA (FCFA / XOF)"
                disabled
                className="w-full rounded-xl border border-[#e5e2db] bg-[#f5f3ec] px-3.5 py-2.5 text-xs text-[#6e726c]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#4e534d]">Téléphone de contact</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#4e534d]">Ligne WhatsApp professionnelle</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#4e534d]">Commune / Quartier</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#4e534d]">Ville</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-[#4e534d]">Adresse physique détaillée</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-[#f1eee8]">
            <button
              type="submit"
              className="rounded-xl bg-[#202321] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#383d39]"
            >
              Enregistrer les coordonnées
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: HOURS */}
      {activeTab === 'hours' && (
        <div className="rounded-3xl border border-[#e8e4dc] bg-white p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#202321]">
              Plages horaires & Jours d’ouverture
            </h3>
            <p className="text-xs text-[#7c807b]">
              Ces horaires déterminent les créneaux disponibles pour les clients sur la Marketplace.
            </p>
          </div>

          <div className="divide-y divide-[#f2eee8]">
            {DAYS.map((d) => (
              <div key={d.day} className="flex items-center justify-between py-3.5 text-xs">
                <span className="font-bold text-[#202321] w-28">{d.day}</span>
                <span className="text-[#646a62]">{d.hours}</span>
                <span className="rounded-md bg-[#ebf4e6] px-2 py-0.5 text-[10px] font-bold text-[#3c722d]">
                  {d.defaultOpen ? 'Ouvert au public' : 'Jour de repos'}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#f1eee8] pt-4">
            <label className="mb-1 block text-xs font-bold text-[#4e534d]">
              Texte résumé affiché sur la vitrine
            </label>
            <input
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-3.5 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
            />
          </div>
        </div>
      )}

      {/* TAB 3: REMINDERS & AUTOMATIONS */}
      {activeTab === 'reminders' && (
        <div className="rounded-3xl border border-[#e8e4dc] bg-white p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#202321]">
              Rappels automatiques & Notifications
            </h3>
            <p className="text-xs text-[#7c807b]">
              Réduisez les rendez-vous manqués grâce aux confirmations instantanées par message.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-[#e9e5dc] p-4 bg-[#faf8f4]">
              <div>
                <h4 className="font-serif text-sm font-bold text-[#202321]">
                  Confirmation instantanée WhatsApp & SMS
                </h4>
                <p className="mt-1 text-xs text-[#727770]">
                  Envoyer un message de confirmation automatique dès qu'un client réserve depuis la Marketplace Barber Cuts.
                </p>
              </div>
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                className="h-5 w-5 rounded accent-[#bd664a] mt-1"
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl border border-[#e9e5dc] p-4 bg-[#faf8f4]">
              <div>
                <h4 className="font-serif text-sm font-bold text-[#202321]">
                  Rappel SMS 2 heures avant le rendez-vous
                </h4>
                <p className="mt-1 text-xs text-[#727770]">
                  Rappelle au client son créneau horaire, le coiffeur assigné et l'itinéraire d'accès au salon.
                </p>
              </div>
              <input
                type="checkbox"
                checked={smsEnabled}
                onChange={(e) => setSmsEnabled(e.target.checked)}
                className="h-5 w-5 rounded accent-[#bd664a] mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BILLING & PLAN */}
      {activeTab === 'billing' && (
        <div className="rounded-3xl border border-[#e8e4dc] bg-white p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#202321]">
                Abonnement Barber Cuts ERP & Marketplace
              </h3>
              <p className="text-xs text-[#7c807b]">
                Votre licence professionnelle pour la gestion de salon et la présence marketplace.
              </p>
            </div>
            <span className="rounded-xl bg-[#ebf4e6] border border-[#d3e8cb] px-3 py-1 text-xs font-bold text-[#3d702d]">
              ● Formule Active
            </span>
          </div>

          <div className="rounded-2xl bg-[#202321] p-6 text-white space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#e4ac77]">
              Offre Premium Salon
            </span>
            <div className="font-serif text-2xl font-bold">
              Barber Cuts Pro — 35 000 FCFA / mois
            </div>
            <p className="text-xs text-[#d2d9d3]">
              Accès illimité à l’ERP, gestion multi-coiffeurs, catalogue de prestations et vitrine publicitaire mise en avant sur la Marketplace.
            </p>
            <div className="pt-2 text-[11px] text-[#9ca59e]">
              Prochain prélèvement automatique : 1er Décembre 2024 via Wave Business.
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#f1eee8] pt-4 text-xs text-[#7a8078]">
            <span>Moyens de paiement associés : Wave Business (+225 07 48 92 11 30)</span>
            <button className="font-bold text-[#bd664a] hover:underline">
              Gérer la facturation
            </button>
          </div>
        </div>
      )}
    </div>
  )
}