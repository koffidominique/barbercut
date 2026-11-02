'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, MapPin, Phone, Clock, Image as ImageIcon, ArrowRight, ArrowLeft, Check, Upload, Scissors } from 'lucide-react'
import { useSalonStore } from '@/lib/store'
import { createClient } from '@/lib/supabase'

export default function OnboardingPage() {
  const router = useRouter()
  const { createSalon } = useSalonStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [logo, setLogo] = useState<string>('')
  const [services, setServices] = useState([{ name: '', price: '', duration: '' }])

  // Formulaire salon
  const [salonData, setSalonData] = useState({
    name: '',
    tagline: '',
    description: '',
    city: 'Abidjan',
    neighborhood: '',
    address: '',
    phone: '',
    whatsapp: '',
    openingHours: 'Mar - Dim: 08:30 - 20:30',
    latitude: '',
    longitude: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSalonData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (max 2Mo)')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const totalSteps = 5
  const progress = (step / totalSteps) * 100

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleComplete = async () => {
    setLoading(true)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const isConfigured = Boolean(
      supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl.startsWith('http') &&
      !supabaseUrl.includes('placeholder') &&
      !supabaseUrl.includes('your-')
    )

    let userId = 'owner-local-demo'

    if (isConfigured) {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('Vous devez être connecté pour créer un salon')
        router.push('/login')
        setLoading(false)
        return
      }

      userId = user.id

      // S'assurer que le profil utilisateur existe dans public.users (requis par la FK salons_owner_id_fkey)
      const { error: userProfileError } = await supabase
        .from('users')
        .upsert(
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
            role: 'owner',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )

      if (userProfileError) {
        console.error('Erreur création/mise à jour du profil utilisateur', userProfileError)
      }
    }

    try {
      const { latitude, longitude, ...restSalonData } = salonData
      const salon = await createSalon(userId, {
        ...restSalonData,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        coverImage: logo || '/images/placeholder-logo.png',
        services: services
          .filter(s => s.name.trim() !== '' && s.price.trim() !== '')
          .map((s, idx) => ({
            id: `srv-ob-${Date.now()}-${idx}`,
            name: s.name.trim(),
            category: 'Hommes' as const,
            price: Number(s.price) || 0,
            duration: Number(s.duration) || 45,
            description: '',
          })),
      })

      if (!salon) {
        throw new Error('Création du salon échouée')
      }

      router.push('/')
      router.refresh()
    } catch (e) {
      console.error('Erreur création salon', e)
      alert('Erreur lors de la création du salon. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const addService = () => {
    setServices([...services, { name: '', price: '', duration: '' }])
  }

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index))
  }

  const updateService = (index: number, field: string, value: string) => {
    const newServices = [...services]
    newServices[index] = { ...newServices[index], [field]: value }
    setServices(newServices)
  }

  const canProceed = () => {
    switch (step) {
      case 1: return salonData.name.trim() !== ''
      case 2: return salonData.address.trim() !== '' && salonData.neighborhood.trim() !== ''
      case 3: return salonData.phone.trim() !== ''
      case 4: return services.some(s => s.name.trim() !== '' && s.price.trim() !== '') // Au moins un service valide
      default: return true
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      {/* Barre de progression */}
      <div className="bg-white border-b border-[#e8e4dc]">
        <div className="max-w-3xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#202321] text-[#f4c58d] font-serif text-sm font-bold flex items-center justify-center">B</div>
              <span className="text-xs font-bold text-[#4e534d]">Barber Cuts</span>
            </div>
            <span className="text-xs text-[#747873]">Étape {step} sur {totalSteps}</span>
          </div>
          <div className="w-full h-1.5 bg-[#f0efea] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#202321] transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-12">
        {/* Étape 1 : Informations basiques */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-[#202321] flex items-center justify-center mx-auto mb-4">
                <Store className="text-[#f4c58d]" size={28} />
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#202321] mb-2">Nom de votre salon</h1>
              <p className="text-sm text-[#747873]">Commencez par donner un nom à votre établissement</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#e8e4dc] p-8 shadow-sm">
              {/* Upload logo */}
              <div className="mb-8">
                <label className="mb-3 block text-xs font-bold text-[#4e534d]">Logo de votre salon</label>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[#e5e2db] bg-[#fcfbf9] overflow-hidden">
                    {logo ? (
                      <img src={logo} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <Store size={36} className="text-[#92958f]" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#202321] px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#383d39] transition w-fit">
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      <Upload size={14} />
                      Choisir un logo
                    </label>
                    <span className="text-[10px] text-[#8c9089]">Formats acceptés : JPG, PNG, SVG • Taille max : 2Mo</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold text-[#4e534d]">Nom du salon *</label>
                  <input
                    type="text"
                    name="name"
                    value={salonData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Barber Shop Cocody"
                    className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-4 py-3 text-sm text-[#202321] outline-none focus:border-[#202321] transition"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold text-[#4e534d]">Slogan (optionnel)</label>
                  <input
                    type="text"
                    name="tagline"
                    value={salonData.tagline}
                    onChange={handleInputChange}
                    placeholder="Le meilleur salon de coiffure de la ville"
                    className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-4 py-3 text-sm text-[#202321] outline-none focus:border-[#202321] transition"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold text-[#4e534d]">Description (optionnel)</label>
                  <textarea
                    name="description"
                    value={salonData.description}
                    onChange={handleInputChange}
                    placeholder="Décrivez votre salon, vos services..."
                    rows={3}
                    className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-4 py-3 text-sm text-[#202321] outline-none focus:border-[#202321] transition resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Étape 2 : Localisation */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-[#202321] flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-[#f4c58d]" size={28} />
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#202321] mb-2">Localisation</h1>
              <p className="text-sm text-[#747873]">Où se situe votre établissement ?</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#e8e4dc] p-8 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold text-[#4e534d]">Ville *</label>
                  <select
                    name="city"
                    value={salonData.city}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-4 py-3 text-sm text-[#202321] outline-none focus:border-[#202321] transition"
                  >
                    <option value="Abidjan">Abidjan</option>
                    <option value="Yamoussoukro">Yamoussoukro</option>
                    <option value="Bouaké">Bouaké</option>
                    <option value="Koumassi">Koumassi</option>
                    <option value="Marcory">Marcory</option>
                    <option value="Plateau">Plateau</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold text-[#4e534d]">Quartier *</label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={salonData.neighborhood}
                    onChange={handleInputChange}
                    placeholder="Ex: Cocody, 2 Plateaux"
                    className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-4 py-3 text-sm text-[#202321] outline-none focus:border-[#202321] transition"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold text-[#4e534d]">Adresse complète *</label>
                  <textarea
                    name="address"
                    value={salonData.address}
                    onChange={handleInputChange}
                    placeholder="123 Rue des Coiffeurs, Cocody"
                    rows={2}
                    className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-4 py-3 text-sm text-[#202321] outline-none focus:border-[#202321] transition resize-none"
                  />
                </div>

                {/* Bouton de géolocalisation */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-[#4e534d]">Coordonnées GPS</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setSalonData(prev => ({
                              ...prev,
                              latitude: position.coords.latitude.toString(),
                              longitude: position.coords.longitude.toString()
                            }))
                            alert(`Localisation récupérée !\nLatitude: ${position.coords.latitude}\nLongitude: ${position.coords.longitude}`)
                          },
                          (error) => {
                            console.error('Erreur de géolocalisation:', error)
                            alert('Impossible de récupérer votre position. Veuillez vérifier vos paramètres de localisation.')
                          }
                        )
                      } else {
                        alert('La géolocalisation n\'est pas supportée par votre navigateur.')
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e5e2db] bg-[#fcfbf9] px-4 py-3 text-sm font-bold text-[#4e534d] hover:border-[#202321] hover:text-[#202321] transition"
                  >
                    <MapPin size={16} />
                    Utiliser ma position actuelle
                  </button>

                  {/* Affichage des coordonnées si récupérées */}
                  {salonData.latitude && salonData.longitude && (
                    <div className="mt-3 p-3 bg-[#f0f9ee] rounded-xl border border-[#9dd190]">
                      <p className="text-xs text-[#48793b] font-medium">
                        ✅ Coordonnées enregistrées :
                      </p>
                      <p className="text-xs text-[#48793b] mt-1">
                        Lat: {salonData.latitude} | Long: {salonData.longitude}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Étape 3 : Contact */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-[#202321] flex items-center justify-center mx-auto mb-4">
                <Phone className="text-[#f4c58d]" size={28} />
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#202321] mb-2">Coordonnées</h1>
              <p className="text-sm text-[#747873]">Vos clients doivent pouvoir vous joindre</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#e8e4dc] p-8 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold text-[#4e534d]">Téléphone principal *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={salonData.phone}
                    onChange={handleInputChange}
                    placeholder="+225 07 00 00 0000"
                    className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-4 py-3 text-sm text-[#202321] outline-none focus:border-[#202321] transition"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold text-[#4e534d]">WhatsApp (optionnel)</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={salonData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="+225 07 00 00 0000"
                    className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-4 py-3 text-sm text-[#202321] outline-none focus:border-[#202321] transition"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold text-[#4e534d]">Horaires d'ouverture</label>
                  <input
                    type="text"
                    name="openingHours"
                    value={salonData.openingHours}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-4 py-3 text-sm text-[#202321] outline-none focus:border-[#202321] transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Étape 4 : Activités & Services */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-[#202321] flex items-center justify-center mx-auto mb-4">
                <Scissors className="text-[#f4c58d]" size={28} />
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#202321] mb-2">Vos activités</h1>
              <p className="text-sm text-[#747873]">Listez les services que vous proposez</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#e8e4dc] p-8 shadow-sm">
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="p-4 bg-[#fcfbf9] rounded-xl border border-[#e5e2db]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#4e534d]">Service {index + 1}</span>
                      {services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold text-[#4e534d]">Nom du service *</label>
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => updateService(index, 'name', e.target.value)}
                          placeholder="Coupe homme"
                          className="w-full rounded-lg border border-[#e5e2db] bg-white px-3 py-2 text-xs text-[#202321] outline-none focus:border-[#202321] transition"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold text-[#4e534d]">Prix (FCFA) *</label>
                        <input
                          type="text"
                          value={service.price}
                          onChange={(e) => updateService(index, 'price', e.target.value)}
                          placeholder="8000"
                          className="w-full rounded-lg border border-[#e5e2db] bg-white px-3 py-2 text-xs text-[#202321] outline-none focus:border-[#202321] transition"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold text-[#4e534d]">Durée (min)</label>
                        <input
                          type="text"
                          value={service.duration}
                          onChange={(e) => updateService(index, 'duration', e.target.value)}
                          placeholder="45"
                          className="w-full rounded-lg border border-[#e5e2db] bg-white px-3 py-2 text-xs text-[#202321] outline-none focus:border-[#202321] transition"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addService}
                  className="w-full py-3 border-2 border-dashed border-[#e5e2db] rounded-xl text-xs font-bold text-[#747873] hover:border-[#202321] hover:text-[#202321] transition"
                >
                  + Ajouter un service
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Étape 5 : Validation */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-[#48793b] flex items-center justify-center mx-auto mb-4">
                <Check className="text-white" size={28} />
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#202321] mb-2">C'est presque terminé !</h1>
              <p className="text-sm text-[#747873]">Vérifiez les informations de votre salon</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#e8e4dc] p-8 shadow-sm">
              <div className="space-y-6">
                {/* Récapitulatif */}
                <div className="flex items-start gap-4 pb-6 border-b border-[#e5e2db]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#e5e2db] bg-[#fcfbf9] overflow-hidden shrink-0">
                    {logo ? (
                      <img src={logo} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <Store size={24} className="text-[#92958f]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#202321]">{salonData.name || 'Mon salon'}</h3>
                    <p className="text-xs text-[#747873]">{salonData.tagline}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#a5a59f] block mb-1">Adresse</span>
                    <p className="text-[#4e534d]">{salonData.address}, {salonData.neighborhood}, {salonData.city}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#a5a59f] block mb-1">Contact</span>
                    <p className="text-[#4e534d]">{salonData.phone}</p>
                    {salonData.whatsapp && <p className="text-[#4e534d]">WhatsApp: {salonData.whatsapp}</p>}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#a5a59f] block mb-1">Horaires</span>
                    <p className="text-[#4e534d]">{salonData.openingHours}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#a5a59f] block mb-1">Services proposés</span>
                    {services.filter(s => s.name.trim() !== '').map((s, i) => (
                      <p key={i} className="text-[#4e534d]">{s.name} - {s.price} FCFA</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Boutons de navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 rounded-xl border border-[#e5e2db] bg-white px-6 py-3 text-xs font-bold text-[#4e534d] hover:bg-[#fcfbf9] transition"
            >
              <ArrowLeft size={14} />
              Précédent
            </button>
          ) : <div />}

          {step < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold transition ${canProceed()
                ? 'bg-[#202321] text-white hover:bg-[#383d39]'
                : 'bg-[#e5e2db] text-[#92958f] cursor-not-allowed'
                }`}
            >
              Suivant
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#48793b] px-8 py-3 text-xs font-bold text-white hover:bg-[#5a964a] transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 2 5.373 2 12h5.82z"></path>
                  </svg>
                  Création...
                </>
              ) : (
                <>
                  Terminer
                  <Check size={14} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}