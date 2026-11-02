'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  WalletCards,
  CalendarDays,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react'
import { Salon, Appointment, StaffMember } from '@/lib/store'
import { staggerContainer, staggerItem, fadeInUp } from '@/components/ui/motion'

interface ERPAnalyticsViewProps {
  salon: Salon
  appointments: Appointment[]
  staff: StaffMember[]
}

const MONTHS_FR = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
]

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function ERPAnalyticsView({ salon, appointments, staff }: ERPAnalyticsViewProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month')
  const [viewMode, setViewMode] = useState<'overview' | 'services' | 'team' | 'clients'>('overview')

  const salonApts = appointments.filter((a) => a.salonId === salon.id)

  // ── Données du cours (période N) ──
  const currentPeriodData = useMemo(() => {
    const now = new Date()
    const cutoff = new Date(now)
    if (period === 'week') cutoff.setDate(now.getDate() - 7)
    else if (period === 'month') cutoff.setMonth(now.getMonth() - 1)
    else cutoff.setMonth(now.getMonth() - 3)

    return salonApts.filter(
      (a) => new Date(a.createdAt) >= cutoff && a.status !== 'cancelled'
    )
  }, [salonApts, period])

  // ── Données de la période précédente (N-1) ──
  const previousPeriodData = useMemo(() => {
    const now = new Date()
    const currentCutoff = new Date(now)
    if (period === 'week') currentCutoff.setDate(now.getDate() - 7)
    else if (period === 'month') currentCutoff.setMonth(now.getMonth() - 1)
    else currentCutoff.setMonth(now.getMonth() - 3)

    const previousCutoff = new Date(currentCutoff)
    if (period === 'week') previousCutoff.setDate(currentCutoff.getDate() - 7)
    else if (period === 'month') previousCutoff.setMonth(currentCutoff.getMonth() - 1)
    else previousCutoff.setMonth(currentCutoff.getMonth() - 3)

    return salonApts.filter(
      (a) => new Date(a.createdAt) >= previousCutoff && new Date(a.createdAt) < currentCutoff && a.status !== 'cancelled'
    )
  }, [salonApts, period])

  const currentRevenue = currentPeriodData.reduce((sum, a) => sum + (a.servicePrice || 0), 0)
  const previousRevenue = previousPeriodData.reduce((sum, a) => sum + (a.servicePrice || 0), 0)
  const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

  const currentCount = currentPeriodData.length
  const previousCount = previousPeriodData.length
  const countChange = previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0

  // ── CA par jour (7 derniers jours) ──
  const dailyRevenue = useMemo(() => {
    const data: { label: string; revenue: number; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const dayApts = salonApts.filter((a) => {
        const ad = new Date(a.createdAt)
        ad.setHours(0, 0, 0, 0)
        return ad.getTime() === d.getTime() && a.status !== 'cancelled'
      })
      data.push({
        label: DAYS_FR[d.getDay()],
        revenue: dayApts.reduce((sum, a) => sum + (a.servicePrice || 0), 0),
        count: dayApts.length,
      })
    }
    return data
  }, [salonApts])

  // ── Top prestations par revenu ──
  const topServices = useMemo(() => {
    const svcMap = new Map<string, { name: string; price: number; count: number; revenue: number }>()
    salonApts.forEach((a) => {
      if (a.status === 'cancelled') return
      if (!svcMap.has(a.serviceId)) {
        svcMap.set(a.serviceId, { name: a.serviceName, price: a.servicePrice, count: 0, revenue: 0 })
      }
      const s = svcMap.get(a.serviceId)!
      s.count += 1
      s.revenue += a.servicePrice || 0
    })
    return Array.from(svcMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  }, [salonApts])

  // ── Taux de no-show par collaborateur ──
  const noShowByStaff = useMemo(() => {
    const staffMap = new Map<string, { name: string; total: number; noShow: number }>()
    staff.forEach((s) => {
      staffMap.set(s.id, { name: s.name, total: 0, noShow: 0 })
    })
    salonApts.forEach((a) => {
      if (!staffMap.has(a.staffName)) {
        staffMap.set(a.staffName, { name: a.staffName, total: 0, noShow: 0 })
      }
      const s = staffMap.get(a.staffName)!
      s.total += 1
      if (a.status === 'cancelled') s.noShow += 1
    })
    return Array.from(staffMap.values())
      .filter((s) => s.total > 0)
      .map((s) => ({
        name: s.name,
        total: s.total,
        noShow: s.noShow,
        rate: s.total > 0 ? Math.round((s.noShow / s.total) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
  }, [salonApts, staff])

  // ── Churn client (clients qui ne reviennent pas) ──
  const clientVisitCounts = useMemo(() => {
    const counts = new Map<string, number>()
    salonApts.forEach((a) => {
      counts.set(a.clientPhone, (counts.get(a.clientPhone) || 0) + 1)
    })
    return counts
  }, [salonApts])

  const oneTimeClients = Array.from(clientVisitCounts.values()).filter((c) => c === 1).length
  const totalClients = clientVisitCounts.size
  const churnRate = totalClients > 0 ? Math.round((oneTimeClients / totalClients) * 100) : 0

  const formatFcfa = (n: number) => n.toLocaleString('fr-FR')

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#202321]">Analytics Avancés</h2>
          <p className="text-xs text-[#747873]">
            Analyse des performances de {salon.name} — Période : {period === 'week' ? '7 jours' : period === 'month' ? '30 jours' : '90 jours'}
          </p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                period === p
                  ? 'bg-[#202321] text-white shadow-sm'
                  : 'bg-white border border-[#e8e4dc] text-[#747873] hover:text-[#202321]'
              }`}
            >
              {p === 'week' ? '7 jours' : p === 'month' ? '30 jours' : '90 jours'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs comparatifs N vs N-1 */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatCardCompare
          icon={<WalletCards size={18} />}
          label="Chiffre d’affaires"
          current={formatFcfa(currentRevenue)}
          previous={formatFcfa(previousRevenue)}
          change={revenueChange}
          unit="FCFA"
        />
        <StatCardCompare
          icon={<CalendarDays size={18} />}
          label="Rendez-vous"
          current={currentCount.toString()}
          previous={previousCount.toString()}
          change={countChange}
          unit="RDV"
        />
        <StatCardCompare
          icon={<Users size={18} />}
          label="Clients uniques"
          current={totalClients.toString()}
          previous={previousPeriodData.length > 0 ? new Set(previousPeriodData.map((a) => a.clientPhone)).size.toString() : '0'}
          change={0}
          unit="clients"
        />
        <StatCardCompare
          icon={<Clock size={18} />}
          label="Taux de churn"
          current={`${churnRate}%`}
          previous="—"
          change={0}
          unit=""
          isWarning={churnRate > 30}
        />
      </motion.div>

      {/* Graphique CA par jour */}
      <section className="rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#202321]">CA par jour (7j glissants)</h3>
            <p className="text-xs text-[#747873]">Revenu généré par jour</p>
          </div>
        </div>
        <DailyRevenueChart data={dailyRevenue} />
      </section>

      {/* Grille : Top prestations & No-show par équipe */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top prestations */}
        <section className="rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="font-serif text-lg font-bold text-[#202321]">Top prestations par revenu</h3>
            <p className="text-xs text-[#747873]">Les prestations les plus rentables</p>
          </div>
          <div className="space-y-3">
            {topServices.map((svc, i) => (
              <div key={svc.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-[#fbf3ee] text-[#bd664a]' : 'bg-[#f5f3ec] text-[#747873]'
                  }`}>
                    #{i + 1}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#202321]">{svc.name}</div>
                    <div className="text-[10px] text-[#8c9089]">{svc.count} réservations</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif font-bold text-[#202321]">{formatFcfa(svc.revenue)}</div>
                  <div className="text-[10px] text-[#8c9089]">FCFA</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* No-show par collaborateur */}
        <section className="rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="font-serif text-lg font-bold text-[#202321]">Taux de no-show par collaborateur</h3>
            <p className="text-xs text-[#747873]">RDV annulés / total RDV</p>
          </div>
          <div className="space-y-3">
            {noShowByStaff.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#edeae3] text-[#747873]">
                    {s.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#202321]">{s.name}</div>
                    <div className="text-[10px] text-[#8c9089]">{s.noShow} / {s.total} annulés</div>
                  </div>
                </div>
                <div className="w-24">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        s.rate > 50 ? 'bg-[#c45347]' : s.rate > 25 ? 'bg-[#d4a373]' : 'bg-[#4d7c3b]'
                      }`}
                      style={{ width: `${Math.min(s.rate, 100)}%` }}
                    />
                    <span className={`text-[10px] font-bold ${
                      s.rate > 50 ? 'text-[#c45347]' : s.rate > 25 ? 'text-[#b4843c]' : 'text-[#4d7c3b]'
                    }`}>
                      {s.rate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {noShowByStaff.length === 0 && (
              <div className="text-center py-8 text-xs text-[#8c9089]">
                Aucune donnée de no-show disponible
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Insight Churn */}
      <section className="rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#202321]">Fidélisation client (Churn)</h3>
            <p className="text-xs text-[#747873]">Clients qui ne reviennent pas après leur première visite</p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-[10px] font-bold ${
              churnRate > 30 ? 'bg-[#fdeae8] text-[#c45347]' : 'bg-[#ebf4e6] text-[#4d7c3b]'
            }`}
          >
            {churnRate}% de churn
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-[#f5f3ec] p-4 text-center">
            <div className="text-2xl font-serif font-bold text-[#202321]">{totalClients}</div>
            <div className="text-[10px] text-[#747873]">Clients uniques</div>
          </div>
          <div className="rounded-2xl bg-[#fbf3ee] p-4 text-center">
            <div className="text-2xl font-serif font-bold text-[#202321]">{oneTimeClients}</div>
            <div className="text-[10px] text-[#747873]">Visite unique</div>
          </div>
          <div className="rounded-2xl bg-[#f0f9ec] p-4 text-center">
            <div className="text-2xl font-serif font-bold text-[#202321]">
              {totalClients - oneTimeClients}
            </div>
            <div className="text-[10px] text-[#747873]">Clients récurrents</div>
          </div>
        </div>
        {churnRate > 30 && (
          <div className="mt-4 rounded-lg border border-[#fdeae8] bg-[#fdf3f2] p-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-[#c45347] shrink-0 mt-0.5" />
              <div className="text-xs text-[#747873]">
                <strong>Attention :</strong> votre taux de churn est élevé.{' '}
                <span className="text-[#bd664a] font-semibold">
                  Pensez à proposer des offres de fidélité ou des rappels WhatsApp.
                </span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function StatCardCompare({
  icon,
  label,
  current,
  previous,
  change,
  unit,
  isWarning = false,
}: {
  icon: React.ReactNode
  label: string
  current: string
  previous: string
  change: number
  unit: string
  isWarning?: boolean
}) {
  const isPositive = change >= 0
  const trendIcon = isPositive ? <TrendingUp size={14} className="text-[#4d7c3b]" /> : <TrendingDown size={14} className="text-[#c45347]" />

  return (
    <div className="rounded-3xl border border-[#e8e4dc] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3eee7] text-[#bd664a]">
          {icon}
        </div>
        <span className={`text-[10px] font-bold ${
          isWarning ? 'text-[#c45347]' : isPositive ? 'text-[#4d7c3b]' : 'text-[#c45347]'
        }`}>
          {change >= 0 ? '+' : ''}{change.toFixed(0)}% vs N-1
        </span>
      </div>
      <p className="text-xs text-[#92958f]">{label}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-serif text-[22px] font-bold tracking-tight text-[#202321]">{current}</span>
        <span className="text-[10px] font-semibold text-[#92958f]">{unit}</span>
      </div>
      <div className="mt-2 flex items-center gap-1">
        {trendIcon}
        <span className={`text-[10px] font-bold ${isPositive ? 'text-[#4d7c3b]' : 'text-[#c45347]'}`}>
          {previous} → {current}
        </span>
      </div>
    </div>
  )
}

function DailyRevenueChart({ data }: { data: { label: string; revenue: number; count: number }[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  const barHeight = (d: number) => (d / maxRevenue) * 100

  return (
    <div className="h-48 w-full flex items-end gap-2 px-2 py-4">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-2 w-full">
          <div
            className="w-full bg-[#f5f3ec] rounded-t-lg rounded-b-full overflow-hidden relative"
            style={{ height: `${barHeight(d.revenue)}%` }}
          >
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `100%` }}
              className="absolute inset-0 bg-[#bd664a] transition-all duration-500"
            />
            {d.revenue > 0 && (
              <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#202321]">
                {formatFcfa(d.revenue)}
              </div>
            )}
          </div>
          <span className="text-[10px] text-[#8c9089]">{d.label}</span>
          <span className="text-[10px] text-[#747873]">{d.count} RDV</span>
        </div>
      ))}
    </div>
  )
}

function formatFcfa(n: number) {
  return n.toLocaleString('fr-FR')
}
