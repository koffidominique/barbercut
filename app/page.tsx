'use client'

import { useState } from 'react'
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from 'lucide-react'

const appointments = [
  { time: '09:00', client: 'Aïcha Kouamé', service: 'Tresses bohème', staff: 'Nadia', color: 'bg-[#d9a45e]' },
  { time: '10:30', client: 'Koffi Yao', service: 'Coupe signature', staff: 'Jules', color: 'bg-[#7a8c5d]' },
  { time: '11:45', client: 'Mariam Koné', service: 'Brushing & soin', staff: 'Nadia', color: 'bg-[#b87968]' },
  { time: '14:00', client: 'Yannick N’Guessan', service: 'Dégradé américain', staff: 'Jules', color: 'bg-[#586b83]' },
]

const navItems = [
  { label: 'Vue d’ensemble', icon: LayoutDashboard },
  { label: 'Rendez-vous', icon: CalendarDays, count: '8' },
  { label: 'Clients', icon: Users },
  { label: 'Prestations', icon: Sparkles },
  { label: 'Équipe', icon: ClipboardList },
]

export default function Page() {
  const [activeNav, setActiveNav] = useState('Vue d’ensemble')
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#202321] selection:bg-[#c86b4c]/20">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[258px] flex-col border-r border-[#e9e6df] bg-[#fbfaf7] px-5 py-6 transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-10 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#202321] text-[#f4c58d]"><span className="font-serif text-xl font-bold">B</span></div>
            <div><div className="font-serif text-[19px] font-bold tracking-tight">Barber Cuts</div><div className="text-[10px] uppercase tracking-[0.2em] text-[#92958f]">Management</div></div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 lg:hidden" aria-label="Fermer le menu"><X size={18} /></button>
        </div>
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a5a59f]">Espace salon</div>
        <nav className="space-y-1">
          {navItems.map(({ label, icon: Icon, count }) => <button key={label} onClick={() => { setActiveNav(label); setMobileOpen(false) }} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-[13px] font-medium transition ${activeNav === label ? 'bg-[#efe9df] text-[#202321]' : 'text-[#747873] hover:bg-[#f1efea] hover:text-[#202321]'}`}><span className="flex items-center gap-3"><Icon size={17} strokeWidth={1.8} />{label}</span>{count && <span className="rounded-md bg-[#d47b59] px-1.5 py-0.5 text-[10px] font-bold text-white">{count}</span>}</button>)}
        </nav>
        <div className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a5a59f]">Développement</div>
        <nav className="space-y-1"><button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-[#747873] hover:bg-[#f1efea]"><ShoppingBag size={17} strokeWidth={1.8} />Vitrine boutique<span className="ml-auto h-2 w-2 rounded-full bg-[#d47b59]" /></button><button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-[#747873] hover:bg-[#f1efea]"><TrendingUp size={17} strokeWidth={1.8} />Rapports</button></nav>
        <div className="mt-auto space-y-1"><button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-[#747873] hover:bg-[#f1efea]"><Settings2 size={17} strokeWidth={1.8} />Paramètres</button><div className="mt-4 flex items-center gap-3 border-t border-[#ebe8e1] px-2 pt-5"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8ad89] text-xs font-bold text-[#543b2d]">AK</div><div className="min-w-0"><div className="truncate text-[12px] font-semibold">Aminata Kouassi</div><div className="truncate text-[11px] text-[#989b94]">Administratrice</div></div><ChevronDown size={15} className="ml-auto text-[#a3a59f]" /></div></div>
      </aside>

      <section className="lg:pl-[258px]">
        <header className="flex h-[76px] items-center justify-between border-b border-[#e9e6df] bg-[#fbfaf7]/80 px-5 backdrop-blur-sm sm:px-8">
          <div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 lg:hidden" aria-label="Ouvrir le menu"><Menu size={20} /></button><div className="hidden items-center gap-2 text-xs text-[#959891] sm:flex"><span>Barber Cuts</span><ChevronRight size={14} /><span className="font-medium text-[#424641]">Vue d’ensemble</span></div><h1 className="font-serif text-xl font-bold sm:hidden">Vue d’ensemble</h1></div>
          <div className="flex items-center gap-2 sm:gap-4"><button className="hidden items-center gap-2 rounded-xl border border-[#e6e3dc] bg-white px-3 py-2 text-xs text-[#8b8e88] sm:flex"><Search size={15} />Rechercher</button><button className="relative rounded-xl p-2.5 text-[#6e736d] hover:bg-[#f0eee9]" aria-label="Notifications"><Bell size={18} strokeWidth={1.8} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#d47b59]" /></button><button className="hidden rounded-xl p-2.5 text-[#6e736d] hover:bg-[#f0eee9] sm:block" aria-label="Aide"><CircleHelp size={18} strokeWidth={1.8} /></button></div>
        </header>

        <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-1 text-sm text-[#92958f]">Mardi 12 novembre 2024</p><h2 className="font-serif text-[32px] font-bold leading-tight tracking-tight sm:text-[38px]">Bonjour, Aminata<span className="text-[#d47b59]">.</span></h2><p className="mt-2 text-sm text-[#747873]">Voici ce qui se passe dans votre salon aujourd’hui.</p></div><button className="flex w-fit items-center gap-2 rounded-xl bg-[#202321] px-4 py-3 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(32,35,33,0.12)] transition hover:bg-[#363a37]"><Plus size={17} />Nouveau rendez-vous</button></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard icon={<CalendarDays size={18} />} label="Rendez-vous aujourd’hui" value="24" detail="+12% vs. mardi dernier" positive /><StatCard icon={<WalletCards size={18} />} label="Chiffre d’affaires" value="486 500" suffix="FCFA" detail="+8,4% cette semaine" positive /><StatCard icon={<Users size={18} />} label="Nouveaux clients" value="12" detail="Ce mois-ci" /><StatCard icon={<Clock3 size={18} />} label="Taux de présence" value="94%" detail="Excellent niveau" positive /></div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
            <section className="rounded-2xl border border-[#e9e6df] bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="font-serif text-xl font-bold">Planning du jour</h3><p className="mt-1 text-xs text-[#92958f]">Mardi 12 novembre · 24 rendez-vous</p></div><button className="flex items-center gap-1 text-xs font-semibold text-[#bd664a]">Voir le planning <ChevronRight size={14} /></button></div><div className="mb-5 flex gap-1 overflow-x-auto border-b border-[#efede8] pb-3">{['Lun 11','Mar 12','Mer 13','Jeu 14','Ven 15'].map((day, i) => <button key={day} className={`min-w-[76px] rounded-lg px-3 py-2 text-xs ${i === 1 ? 'bg-[#202321] font-semibold text-white' : 'text-[#92958f] hover:bg-[#f6f4ef]'}`}>{day}</button>)}</div><div className="space-y-1">{appointments.map((item) => <div key={item.time} className="group flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-[#faf8f4]"><div className="w-12 text-xs font-semibold text-[#6f746e]">{item.time}</div><div className={`h-9 w-1 rounded-full ${item.color}`} /><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{item.client}</div><div className="mt-0.5 text-xs text-[#969991]">{item.service} · {item.staff}</div></div><span className="hidden rounded-md bg-[#f3f5ee] px-2 py-1 text-[10px] font-semibold text-[#74805f] sm:inline">Confirmé</span><MoreHorizontal size={17} className="text-[#b0b2ac]" /></div>)}</div></section>
            <section className="relative overflow-hidden rounded-2xl bg-[#29342f] p-6 text-white sm:p-7"><div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#18231f]/80 to-transparent" /><img src="/barber-shop-hero.png" alt="Intérieur du salon Barber Cuts" className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity" /><div className="relative flex h-full min-h-[265px] flex-col justify-between"><div><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e2a46d] text-[#29342f]"><ShoppingBag size={19} /></div><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#d9b58f]">Votre vitrine boutique</p><h3 className="max-w-[250px] font-serif text-2xl font-bold leading-tight">Faites rayonner votre salon.</h3><p className="mt-3 max-w-[270px] text-xs leading-relaxed text-[#d2d9d3]">Présentez vos prestations et recevez des réservations depuis la marketplace Barber Cuts.</p></div><div className="relative mt-6 flex items-center justify-between"><button className="rounded-xl bg-[#e4ac77] px-4 py-2.5 text-xs font-bold text-[#29342f] transition hover:bg-[#f1bd88]">Configurer ma vitrine</button><span className="text-[11px] text-[#b8c6bd]">Non publiée</span></div></div></section>
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <section className="rounded-2xl border border-[#e9e6df] bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="font-serif text-xl font-bold">Activité récente</h3><p className="mt-1 text-xs text-[#92958f]">Les dernières actions de votre équipe</p></div><button className="text-xs font-semibold text-[#bd664a]">Tout voir</button></div><div className="space-y-4"><Activity initials="AK" color="bg-[#e0b294]" text={<><strong>Sarah Yao</strong> a réservé <strong>Coupe signature</strong></>} time="Il y a 12 min" /><Activity initials="JM" color="bg-[#a7bd9b]" text={<><strong>Jules M.</strong> a terminé une prestation</>} time="Il y a 35 min" /><Activity initials="NK" color="bg-[#c6a8c5]" text={<><strong>Nadia K.</strong> a ajouté une nouvelle prestation</>} time="Il y a 1 h" /></div></section>
            <section className="rounded-2xl border border-[#e9e6df] bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="font-serif text-xl font-bold">Prestations populaires</h3><p className="mt-1 text-xs text-[#92958f]">Répartition ce mois-ci</p></div><button className="flex items-center gap-1 text-xs font-semibold text-[#747873]">Novembre <ChevronDown size={13} /></button></div><div className="space-y-4"><Bar label="Coupe signature" value="78%" width="78%" color="bg-[#d47b59]" /><Bar label="Tresses & locks" value="64%" width="64%" color="bg-[#d7a15b]" /><Bar label="Brushing & soins" value="48%" width="48%" color="bg-[#7b9472]" /><Bar label="Services enfants" value="32%" width="32%" color="bg-[#7d91a7]" /></div></section>
          </div>
        </div>
      </section>
    </main>
  )
}

function StatCard({ icon, label, value, suffix, detail, positive }: { icon: React.ReactNode; label: string; value: string; suffix?: string; detail: string; positive?: boolean }) { return <div className="rounded-2xl border border-[#e9e6df] bg-white p-5"><div className="mb-4 flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3eee7] text-[#bd664a]">{icon}</div>{positive && <span className="text-[10px] font-bold text-[#79906f]">↗ 12%</span>}</div><p className="text-xs text-[#92958f]">{label}</p><div className="mt-1 flex items-baseline gap-1.5"><span className="font-serif text-[27px] font-bold tracking-tight">{value}</span>{suffix && <span className="text-[10px] font-semibold text-[#92958f]">{suffix}</span>}</div><p className="mt-1 text-[11px] text-[#92958f]">{detail}</p></div> }
function Activity({ initials, color, text, time }: { initials: string; color: string; text: React.ReactNode; time: string }) { return <div className="flex items-center gap-3"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-[#334039] ${color}`}>{initials}</div><div className="min-w-0 flex-1 text-xs text-[#737770]">{text}<div className="mt-0.5 text-[10px] text-[#aaaCa6]">{time}</div></div><ChevronRight size={15} className="text-[#b4b6b0]" /></div> }
function Bar({ label, value, width, color }: { label: string; value: string; width: string; color: string }) { return <div><div className="mb-2 flex justify-between text-xs"><span className="font-medium text-[#626760]">{label}</span><span className="font-semibold text-[#92958f]">{value}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#f0eee9]"><div className={`h-full rounded-full ${color}`} style={{ width }} /></div></div> }
