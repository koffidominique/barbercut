'use client'

import { notFound, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { useSalonStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem, fadeInUp } from '@/components/ui/motion'

interface ClientSalonPageProps {
  salonId: string
}

export default function ClientSalonPage({ salonId }: ClientSalonPageProps) {
  const router = useRouter()
  const { salons, reviews, saveReview } = useSalonStore()
  const salon = salons.find((s) => s.id === salonId)

  if (!salon || !salon.isPublished) {
    notFound()
  }

  const [submittingReview, setSubmittingReview] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const salonReviews = reviews.filter((r) => r.salonId === salon.id)

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (userRating < 1) {
      alert('Veuillez sélectionner une note entre 1 et 5 étoiles.')
      return
    }
    if (!reviewComment.trim()) {
      alert('Veuillez écrire un commentaire.')
      return
    }
    setSubmittingReview(true)
    saveReview({
      salonId: salon.id,
      clientName: 'Client Marketplace',
      rating: userRating,
      comment: reviewComment.trim(),
      date: new Date().toISOString().split('T')[0],
      source: 'marketplace',
    })
    setReviewSuccess(true)
    setSubmittingReview(false)
    setUserRating(0)
    setReviewComment('')
  }

  const renderStars = (rating: number, size: number = 20) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={`${
            i <= rating
              ? 'text-[#f4c58d] fill-[#f4c58d]'
              : 'text-[#d8d4ca] fill-[#d8d4ca]'
          }`}
        />
      ))}
    </div>
  )

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#202321]">
      {/* Header avec cover image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={salon.coverImage}
            alt={salon.name}
            className="h-[400px] w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-5 sm:px-10 py-6">
          <nav className="flex items-center gap-2 text-xs text-[#e4ac77] mb-6">
            <a href="/" className="hover:underline">
              Accueil
            </a>
            <span>/</span>
            <a href="/marketplace" className="hover:underline">
              Marketplace
            </a>
            <span>/</span>
            <span>{salon.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-xl bg-white/90 px-3 py-1 text-[11px] font-bold text-[#202321] backdrop-blur-md shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#3c782d]" /> Partenaire Vérifié ERP
                </span>
                <span className="flex items-center gap-1 rounded-xl bg-[#202321]/80 px-2.5 py-1 text-[11px] font-bold text-[#f4c58d] backdrop-blur-md">
                  {renderStars(Math.round(salon.rating), 13)}
                  <span className="ml-1">{salon.rating} ({salon.reviewsCount})</span>
                </span>
              </div>
              <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {salon.name}
              </h1>
              <p className="mt-1 text-xs text-[#d3d8d3]">{salon.tagline}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-[#e4ac77] font-semibold">
                <span>📍 {salon.neighborhood}, {salon.city}</span>
                <span>·</span>
                <span>{salon.openingHours}</span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <a
                href={`https://wa.me/${salon.whatsapp.replace('+', '')}?text=Bonjour%20${salon.name}%2C%20je%20souhaite%20prendre%20un%20rendez-vous`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-[#25d366] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#20bd5e] transition whitespace-nowrap shrink-0"
              >
                <span>💬 WhatsApp</span>
                <span>Contacter</span>
              </a>
              <button
                className="flex items-center gap-2 rounded-xl bg-[#202321] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#383d39] transition whitespace-nowrap shrink-0"
              >
                <span>Réserver</span>
                <span>en ligne</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <div className="mx-auto max-w-[1400px] px-5 sm:px-10 py-12">
        {/* Présentation & Caractéristiques */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#202321] mb-4">
                À propos de {salon.name}
              </h2>
              <p className="text-[#747873] leading-relaxed text-sm mb-6">
                {salon.description}
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-[#bd664a] font-bold">📞</span>
                  <div>
                    <p className="text-xs font-bold text-[#202321]">Téléphone</p>
                    <a href={`tel:${salon.phone}`} className="text-sm text-[#bd664a] hover:underline">
                      {salon.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#bd664a] font-bold">💬</span>
                  <div>
                    <p className="text-xs font-bold text-[#202321]">WhatsApp</p>
                    <a href={`https://wa.me/${salon.whatsapp.replace('+', '')}`} className="text-sm text-[#bd664a] hover:underline">
                      {salon.whatsapp}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#bd664a] font-bold">📍</span>
                  <div>
                    <p className="text-xs font-bold text-[#202321]">Adresse</p>
                    <p className="text-sm text-[#747873]">{salon.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#a5a59f]">
                Caractéristiques
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {salon.features.map((feat) => (
                  <span key={feat} className="rounded-lg bg-[#f5f3ec] px-3 py-1.5 text-[11px] font-medium text-[#5c615a] border border-[#ede9e2]">
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Prestations & Tarifs */}
        <section id="prestations" className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#202321]">
                Prestations & Tarifs
              </h2>
              <p className="text-xs text-[#747873]">Réservez directement en ligne</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {salon.services.map((srv) => (
              <div
                key={srv.id}
                className="rounded-3xl border border-[#e8e4dc] bg-white p-6 hover:border-[#cfcbc2] hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#bd664a]">
                      {srv.category}
                    </span>
                    <h4 className="mt-0.5 font-serif text-base font-bold text-[#202321]">
                      {srv.name}
                    </h4>
                    <p className="mt-2 text-xs text-[#737871] leading-relaxed">
                      {srv.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-xl font-bold text-[#bd664a]">
                      {srv.price.toLocaleString('fr-FR')} FCFA
                    </div>
                    <div className="text-[10px] text-[#8c9089] mt-1">{srv.duration} min</div>
                  </div>
                </div>
                <button
                  onClick={() => {}}
                  className="mt-4 w-full rounded-xl bg-[#202321] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#383d39] transition"
                >
                  Réserver cette prestation
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Avis Clients */}
        <section id="avis" className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#202321]">
                Avis Clients
              </h2>
              <p className="text-xs text-[#747873]">
                {salon.reviewsCount} avis certifiés
              </p>
            </div>
          </div>

          {reviewSuccess ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="rounded-2xl border border-[#d8f0dc] bg-[#f0f9ec] p-5 mb-6 text-sm text-[#3c782d]"
            >
              <span className="font-bold">Merci !</span> Votre avis a été publié avec succès.
            </motion.div>
          ) : null}

          {/* Formulaire de dépôt d'avis */}
          <div className="rounded-3xl border border-[#e8e4dc] bg-white p-6 mb-8">
            <h3 className="font-serif text-xl font-bold text-[#202321] mb-4">
              Laissez votre avis
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#444a43] mb-2">
                  Votre note
                </label>
                <div className="flex items-center gap-1" role="radiogroup" aria-label="Note">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      aria-pressed={userRating >= star}
                      className={`text-2xl transition-transform ${
                        userRating >= star ? 'text-[#f4c58d] fill-[#f4c58d]' : 'text-[#d8d4ca] fill-[#d8d4ca] hover:text-[#f4c58d] hover:fill-[#f4c58d]'
                      }`}
                    >
                      <Star size={24} />
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[10px] text-[#8c9089]">
                  {userRating > 0 ? `${userRating} étoile${userRating > 1 ? 's' : ''}` : 'Sélectionnez une note'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#444a43] mb-2">
                  Votre commentaire
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Racontez votre expérience : qualité de l'accueil, résultat de la coupe, ambiance..."
                  rows={3}
                  className="w-full rounded-xl border border-[#e6e2da] bg-[#fdfcf9] px-3 py-2 text-sm outline-none focus:border-[#bd664a]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview || userRating < 1 || !reviewComment.trim()}
                className="w-full rounded-xl bg-[#202321] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#383d39] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? 'Envoi...' : 'Publier mon avis'}
              </button>
            </form>
          </div>

          {/* Liste des avis publiés */}
          <div className="grid gap-6">
            {salonReviews.length === 0 ? (
              <div className="rounded-3xl border border-[#e8e4dc] bg-white p-6">
                <p className="text-sm text-[#747873] italic">
                  Aucun avis publié pour le moment. Soyez le premier à laisser votre avis après votre visite !
                </p>
              </div>
            ) : (
              salonReviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial="hidden"
                  animate="visible"
                  variants={staggerItem}
                  className="rounded-3xl border border-[#e8e4dc] bg-white p-6"
                >
                  <div className="flex justify-between mb-2">
                    <div>
                      <span className="text-xs font-bold text-[#202321]">{review.clientName}</span>
                      <span className="ml-2 text-[10px] text-[#8c9089]">
                        {review.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={14}
                          className={`${
                            i <= review.rating
                              ? 'text-[#f4c58d] fill-[#f4c58d]'
                              : 'text-[#d8d4ca] fill-[#d8d4ca]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[#555a53] leading-relaxed">
                    {review.comment}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Galerie Photo */}
        <section id="galerie" className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-bold text-[#202321]">
              Galerie & Réalisations
            </h2>
            <p className="text-xs text-[#747873]">{salon.gallery.length} photos publiées</p>
          </div>

          <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {salon.gallery.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#202321] group"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-3">
                  <span className="text-[10px] font-bold text-white leading-tight line-clamp-1">
                    {photo.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
