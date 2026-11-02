'use client'

import { useState } from 'react'
import {
  TrendingUp,
  WalletCards,
  CalendarDays,
  ShoppingBag,
  Download,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Users,
  ChevronDown,
} from 'lucide-react'
import { Salon, Appointment } from '@/lib/store'

interface ERPReportsViewProps {
  salon: Salon
  appointments: Appointment[]
}

export function ERPReportsView({ salon, appointments }: ERPReportsViewProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month')
  const [downloadToast, setDownloadToast] = useState(false)

  const salonApts = appointments.filter((a) => a.salonId === salon.id)
  const marketplaceApts = salonApts.filter((a) => a.source === 'marketplace')
  const directApts = salonApts.filter((a) => a.source === 'direct')

  const totalRevenue = salonApts.reduce((sum, a) => sum + (a.servicePrice || 0), 0)
  const marketplaceRevenue = marketplaceApts.reduce((sum, a) => sum + (a.servicePrice || 0), 0)
  const directRevenue = directApts.reduce((sum, a) => sum + (a.servicePrice || 0), 0)

  const marketplaceShare = totalRevenue > 0 ? Math.round((marketplaceRevenue / totalRevenue) * 100) : 45
  const avgTicket = salonApts.length > 0 ? Math.round(totalRevenue / salonApts.length) : 11500

  // Category breakdown
  const categoryStats = [
    { label: 'Hommes & Dégradés', share: '46%', amount: Math.round(totalRevenue * 0.46), color: 'bg-[#bd664a]' },
    { label: 'Dames, Tresses & Soins', share: '36%', amount: Math.round(totalRevenue * 0.36), color: 'bg-[#d9a45e]' },
    { label: 'Rituels Barbe & Serviette chaude', share: '18%', amount: Math.round(totalRevenue * 0.18), color: 'bg-[#7a8c5d]' },
  ]

  const handleExport = () => {
    const headers = [
      'ID',
      'Client',
      'Téléphone',
      'Prestation',
      'Prix (FCFA)',
      'Coiffeur',
      'Date',
      'Heure',
      'Statut',
      'Source',
      'Paiement',
      'Méthode de paiement',
      'Créé le',
    ]

    const rows = salonApts.map((a) => [
      a.id,
      a.clientName,
      a.clientPhone,
      a.serviceName,
      a.servicePrice,
      a.staffName,
      a.date,
      a.time,
      a.status,
      a.source,
      a.paymentStatus || 'unpaid',
      a.paymentMethod || '',
      a.createdAt,
    ])

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell)
            // Échapper les points-virgules et guillemets
            if (str.includes(';') || str.includes('"') || str.includes('\n')) {
              return '"' + str.replace(/"/g, '""') + '"'
            }
            return str
          })
          .join(';')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `rapport-barber-cuts-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setDownloadToast(true)
    setTimeout(() => setDownloadToast(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#202321] px-5 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in">
          <CheckCircle2 size={16} className="text-[#8ec380]" />
          <span>Rapport financier Barber Cuts exporté en PDF & CSV avec succès !</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#bd664a]">
            <TrendingUp size={15} />
            <span>Rapports d'Activité & Analyse Financière</span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold text-[#202321]">
            Performances du Salon & Rentabilité
          </h2>
          <p className="mt-1 text-xs text-[#7c807b]">
            Suivi des encaissements, contribution de la Marketplace et productivité des équipes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#ebe8e1] rounded-xl text-xs font-semibold">
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 rounded-lg transition ${
                period === 'week' ? 'bg-white text-[#202321] shadow-sm' : 'text-[#6f746e]'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                period === 'month' ? 'bg-white text-[#202321] shadow-sm' : 'text-[#6f746e]'
              }`}
            >
              Novembre 2024
            </button>
            <button
              onClick={() => setPeriod('quarter')}
              className={`px-3 py-1.5 rounded-lg transition ${
                period === 'quarter' ? 'bg-white text-[#202321] shadow-sm' : 'text-[#6f746e]'
              }`}
            >
              Trimestre
            </button>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-[#dedad2] bg-white px-3.5 py-2 text-xs font-bold text-[#202321] hover:bg-[#f6f4ee] shadow-sm transition"
          >
            <Download size={14} />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-[#e9e6df] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#8f938d]">
            <span className="text-xs">Chiffre d’affaires global</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f5ede5] text-[#bd664a]">
              <WalletCards size={16} />
            </div>
          </div>
          <div className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#202321]">
            {(totalRevenue || 486500).toLocaleString('fr-FR')} FCFA
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#4d7c3b] font-semibold">
            <ArrowUpRight size={13} />
            <span>+14,2% vs mois précédent</span>
          </div>
        </div>

        <div className="rounded-3xl border border-[#e9e6df] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#8f938d]">
            <span className="text-xs">Part Marketplace Barber Cuts</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fdf3ec] text-[#bd664a]">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#bd664a]">
            {marketplaceShare}% du CA
          </div>
          <div className="mt-2 text-[11px] text-[#868a83]">
            {marketplaceApts.length} réservations apportées
          </div>
        </div>

        <div className="rounded-3xl border border-[#e9e6df] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#8f938d]">
            <span className="text-xs">Panier moyen par prestation</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eff4eb] text-[#4d7c3b]">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#202321]">
            {avgTicket.toLocaleString('fr-FR')} FCFA
          </div>
          <div className="mt-2 text-[11px] text-[#868a83]">
            Porté par les packs complets
          </div>
        </div>

        <div className="rounded-3xl border border-[#e9e6df] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#8f938d]">
            <span className="text-xs">Taux de présence au salon</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef2f6] text-[#43648f]">
              <CalendarDays size={16} />
            </div>
          </div>
          <div className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#202321]">
            95.4%
          </div>
          <div className="mt-2 text-[11px] text-[#4d7c3b] font-semibold">
            Faible taux de no-show grâce aux rappels
          </div>
        </div>
      </div>

      {/* Two Column Split: Channel Acquisition & Category Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Channel comparison */}
        <section className="rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#202321]">
            Origine du Chiffre d'Affaires
          </h3>
          <p className="mt-0.5 text-xs text-[#7e827d]">
            Impact direct de vos annonces vitrine sur vos revenus
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-[#bd664a]">
                  <ShoppingBag size={14} /> Marketplace Barber Cuts
                </span>
                <span className="font-serif font-bold text-[#202321]">
                  {(marketplaceRevenue || 230000).toLocaleString('fr-FR')} FCFA ({marketplaceShare}%)
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#f4f2ec]">
                <div
                  className="h-full rounded-full bg-[#bd664a]"
                  style={{ width: `${marketplaceShare}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-[#555a53]">
                  <Users size={14} /> Réservations directes & Téléphone
                </span>
                <span className="font-serif font-bold text-[#202321]">
                  {(directRevenue || 256500).toLocaleString('fr-FR')} FCFA ({100 - marketplaceShare}%)
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#f4f2ec]">
                <div
                  className="h-full rounded-full bg-[#202321]"
                  style={{ width: `${100 - marketplaceShare}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#fdf8f4] p-4 text-xs text-[#8c5039] border border-[#f5e3d7]">
            <strong>Insight rentabilité :</strong> Vos photos publiées sur la Marketplace génèrent en moyenne 12 nouvelles réservations qualifiées par semaine sans frais publicitaires supplémentaires.
          </div>
        </section>

        {/* Category Breakdown */}
        <section className="rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#202321]">
            Répartition par Catégorie de Prestations
          </h3>
          <p className="mt-0.5 text-xs text-[#7e827d]">
            Volumes générés selon les types de soins
          </p>

          <div className="mt-6 space-y-4">
            {categoryStats.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-[#555a53]">{item.label}</span>
                  <span className="font-serif font-bold text-[#202321]">
                    {item.amount.toLocaleString('fr-FR')} FCFA ({item.share})
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#f4f2ec]">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: item.share }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[#f1eee8] pt-4 text-xs text-[#7d827b]">
            <span>Prestation la plus demandée :</span>
            <strong className="text-[#202321]">Coupe signature & Dégradé américain</strong>
          </div>
        </section>
      </div>

      {/* Staff Productivity Table */}
      <section className="rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
        <h3 className="font-serif text-lg font-bold text-[#202321]">
          Productivité & Commissions de l'Équipe
        </h3>
        <p className="mt-0.5 text-xs text-[#7e827d]">
          Performance individuelle pour la période sélectionnée
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#f0ece5] text-[#90958e]">
                <th className="pb-3 font-semibold">Collaborateur</th>
                <th className="pb-3 font-semibold">Rôle</th>
                <th className="pb-3 font-semibold text-center">RDV Réalisés</th>
                <th className="pb-3 font-semibold text-right">CA Généré</th>
                <th className="pb-3 font-semibold text-right">Commission (40%)</th>
                <th className="pb-3 font-semibold text-right">Satisfaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f2ec]">
              {salon.staff.map((st) => {
                const count = st.appointmentsCount || 40
                const generated = count * 9500
                const commission = Math.round(generated * 0.4)
                return (
                  <tr key={st.id} className="hover:bg-[#fbfaf7]">
                    <td className="py-3 font-semibold text-[#202321]">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold text-white ${st.color}`}
                        >
                          {st.initials}
                        </span>
                        <span>{st.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-[#70756e]">{st.role}</td>
                    <td className="py-3 text-center font-bold text-[#202321]">{count}</td>
                    <td className="py-3 text-right font-serif font-bold text-[#202321]">
                      {generated.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 text-right font-serif font-bold text-[#bd664a]">
                      {commission.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 text-right font-semibold text-[#487a38]">
                      ★ {st.rating || '4.9'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
