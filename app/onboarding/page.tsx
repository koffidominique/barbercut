'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, CircleHelp, MapPin, Scissors, Store, Users } from 'lucide-react'

const steps = ['Votre salon', 'Vos activités', 'Votre équipe', 'Prêt à démarrer']
const categories = [
  { name: 'Hommes', description: 'Coupes, barbe et soins', icon: 'M' },
  { name: 'Dames', description: 'Coupes, tresses et soins', icon: 'D' },
  { name: 'Enfants', description: 'Prestations adaptées', icon: 'E' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState(['Hommes', 'Dames', 'Enfants'])

  const toggleCategory = (name: string) => {
    setSelected((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  }

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#202321]">
      <header className="flex h-[74px] items-center justify-between border-b border-[#e9e6df] bg-[#fbfaf7] px-5 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#202321] font-serif text-xl font-bold text-[#f4c58d]">B</span>
          <span><span className="block font-serif text-[18px] font-bold leading-none">Barber Cuts</span><span className="text-[9px] uppercase tracking-[0.2em] text-[#92958f]">Management</span></span>
        </Link>
        <button className="flex items-center gap-2 text-xs font-medium text-[#747873]"><CircleHelp size={16} /> Besoin d&apos;aide ?</button>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-74px)] max-w-[1180px] gap-10 px-5 py-8 sm:px-10 lg:grid-cols-[250px_1fr] lg:gap-20 lg:py-14">
        <aside className="lg:pt-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#bd664a]">Bienvenue sur Barber Cuts</p>
          <h1 className="font-serif text-3xl font-bold leading-tight">Installons votre espace salon.</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#7c817b]">Quelques informations pour personnaliser votre expérience de gestion.</p>
          <div className="mt-9 flex gap-2 lg:block lg:space-y-5">
            {steps.map((label, index) => <div key={label} className="flex items-center gap-3">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index < step ? 'bg-[#79906f] text-white' : index === step ? 'bg-[#202321] text-white' : 'border border-[#dedbd4] bg-white text-[#a1a49e]'}`}>{index < step ? <Check size={15} /> : index + 1}</span>
              <span className={`hidden text-xs font-semibold lg:block ${index === step ? 'text-[#202321]' : 'text-[#a1a49e]'}`}>{label}</span>
            </div>)}
          </div>
        </aside>

        <section className="rounded-3xl border border-[#e9e6df] bg-white p-6 shadow-[0_12px_40px_rgba(55,49,39,0.04)] sm:p-10">
          {step === 0 && <StepShell eyebrow="Étape 1 sur 4" title="Parlez-nous de votre salon" description="Ces informations apparaîtront sur votre espace et pourront être modifiées à tout moment.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nom du salon" placeholder="Ex. Barber Cuts Cocody" />
              <Field label="Téléphone professionnel" placeholder="+225 07 00 00 00 00" />
              <Field label="Ville" placeholder="Abidjan" icon={<MapPin size={16} />} />
              <Field label="Commune / quartier" placeholder="Cocody Angré" />
            </div>
            <div className="mt-5"><label className="mb-2 block text-xs font-semibold text-[#555b55]">Décrivez votre salon <span className="font-normal text-[#a1a49e]">(optionnel)</span></label><textarea rows={3} placeholder="Une courte présentation de votre salon..." className="w-full resize-none rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#b1b3ad] focus:border-[#bd664a]" /></div>
          </StepShell>}
          {step === 1 && <StepShell eyebrow="Étape 2 sur 4" title="Quelles prestations proposez-vous ?" description="Sélectionnez les catégories qui correspondent à votre activité. Vous pourrez ajouter vos prestations ensuite.">
            <div className="grid gap-3 sm:grid-cols-3">{categories.map((category) => <button key={category.name} onClick={() => toggleCategory(category.name)} className={`rounded-2xl border p-5 text-left transition ${selected.includes(category.name) ? 'border-[#bd664a] bg-[#fdf4ed]' : 'border-[#e8e5de] bg-white hover:border-[#c9c5bc]'}`}><span className={`mb-8 flex h-11 w-11 items-center justify-center rounded-xl font-serif text-xl font-bold ${selected.includes(category.name) ? 'bg-[#d47b59] text-white' : 'bg-[#f2f0ea] text-[#858a83]'}`}>{category.icon}</span><span className="block text-sm font-bold">{category.name}</span><span className="mt-1 block text-xs text-[#92958f]">{category.description}</span>{selected.includes(category.name) && <span className="mt-4 flex items-center gap-1 text-[10px] font-bold text-[#bd664a]"><Check size={13} /> Sélectionné</span>}</button>)}</div>
            <div className="mt-6 rounded-2xl bg-[#f8f6f1] p-4 text-xs leading-relaxed text-[#777c76]"><Scissors className="mb-2 text-[#bd664a]" size={18} />Vous pourrez ensuite créer votre catalogue avec vos prix en FCFA, durées et photos.</div>
          </StepShell>}
          {step === 2 && <StepShell eyebrow="Étape 3 sur 4" title="Qui travaille avec vous ?" description="Ajoutez les membres de votre équipe maintenant ou passez cette étape pour le faire plus tard."><div className="rounded-2xl border border-dashed border-[#d8d4ca] bg-[#fcfbf9] p-8 text-center"><Users className="mx-auto mb-3 text-[#bd664a]" size={28} /><p className="text-sm font-semibold">Votre équipe sera ajoutée ici</p><p className="mt-1 text-xs text-[#92958f]">Vous pourrez inviter vos coiffeurs et gérer leurs agendas.</p><button className="mt-5 rounded-xl border border-[#dedbd4] bg-white px-4 py-2.5 text-xs font-bold">Ajouter un membre</button></div></StepShell>}
          {step === 3 && <StepShell eyebrow="Tout est prêt" title="Votre espace salon est prêt." description="Barber Cuts va créer votre espace de travail avec les informations renseignées."><div className="rounded-2xl bg-[#29342f] p-7 text-white"><Store className="mb-5 text-[#e4ac77]" size={28} /><p className="font-serif text-2xl font-bold">Bienvenue dans votre nouvelle façon de gérer.</p><p className="mt-2 text-sm leading-relaxed text-[#d2d9d3]">Centralisez vos rendez-vous, votre équipe, vos prestations et votre visibilité en ligne.</p></div></StepShell>}

          <div className="mt-10 flex items-center justify-between border-t border-[#efede8] pt-6"><button onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#747873] disabled:invisible"><ArrowLeft size={15} /> Retour</button><button onClick={() => setStep((current) => Math.min(3, current + 1))} className="flex items-center gap-2 rounded-xl bg-[#202321] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#363a37]">{step === 3 ? 'Accéder à mon espace' : 'Continuer'}<ArrowRight size={15} /></button></div>
        </section>
      </div>
    </main>
  )
}

function StepShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) { return <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#bd664a]">{eyebrow}</p><h2 className="mt-2 font-serif text-3xl font-bold tracking-tight">{title}</h2><p className="mt-2 max-w-[560px] text-sm leading-relaxed text-[#7c817b]">{description}</p><div className="mt-8">{children}</div></div> }
function Field({ label, placeholder, icon }: { label: string; placeholder: string; icon?: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-xs font-semibold text-[#555b55]">{label}</span><span className="relative block">{icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a49e]">{icon}</span>}<input className={`w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] px-4 py-3 text-sm outline-none transition placeholder:text-[#b1b3ad] focus:border-[#bd664a] ${icon ? 'pl-10' : ''}`} placeholder={placeholder} /></span></label> }
