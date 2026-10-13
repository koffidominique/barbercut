"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, Hotel, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const steps = ["Votre établissement", "Votre rôle", "Votre espace"]

export function OnboardingScreen() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [hotelName, setHotelName] = useState("")
  const [role, setRole] = useState("Direction")

  function next() {
    if (step < steps.length - 1) setStep((current) => current + 1)
    else router.push("/")
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,hsl(187_92%_58%_/_0.14),transparent_28rem),radial-gradient(circle_at_82%_78%,hsl(267_84%_62%_/_0.14),transparent_30rem)]" aria-hidden="true" />
      <div className="onboarding-orbit absolute left-[8%] top-[18%] size-40 rounded-full border border-primary/20" aria-hidden="true" />
      <div className="onboarding-orbit absolute bottom-[12%] right-[8%] size-56 rounded-full border border-accent/20 [animation-delay:1.2s]" aria-hidden="true" />

      <section className="onboarding-card relative z-10 w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border/80 bg-card/85 shadow-2xl backdrop-blur-2xl">
        <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="hidden flex-col justify-between border-r border-border/70 bg-muted/20 p-10 lg:flex">
            <div><div className="flex items-center gap-3 text-sm font-semibold tracking-wide"><span className="flex size-9 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">h</span> Havenix.</div><p className="mt-20 text-xs font-semibold uppercase tracking-[0.28em] text-primary">Bienvenue à bord</p><h1 className="mt-4 max-w-xs text-4xl font-semibold leading-tight tracking-tight">Construisons votre espace hôtelier.</h1><p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">Quelques informations suffisent pour préparer un tableau de bord adapté à votre établissement.</p></div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground"><Sparkles className="text-primary" /> Configuration guidée en moins de 2 minutes</div>
          </aside>

          <div className="p-7 sm:p-10 lg:p-14"><div className="mb-10 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold lg:hidden"><span className="flex size-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">h</span> Havenix.</div><button type="button" onClick={() => router.push("/")} className="text-xs text-muted-foreground transition-colors hover:text-foreground">Passer pour l&apos;instant</button></div>
            <div className="mb-10"><div className="mb-4 flex items-center justify-between text-xs text-muted-foreground"><span>Configuration de votre espace</span><span>{step + 1} / {steps.length}</span></div><div className="flex gap-2">{steps.map((label, index) => <div key={label} className="flex flex-1 flex-col gap-2"><div className={`h-1 rounded-full transition-colors duration-500 ${index <= step ? "bg-primary" : "bg-muted"}`} /><span className={`text-[11px] ${index === step ? "font-medium text-foreground" : "text-muted-foreground"}`}>{label}</span></div>)}</div></div>

            <div key={step} className="onboarding-step"><p className="text-sm font-medium text-primary">Étape {step + 1}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">{step === 0 ? "Parlez-nous de votre établissement" : step === 1 ? "Quel est votre rôle ?" : "Votre espace est prêt"}</h2><p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{step === 0 ? "Nous utiliserons ces informations pour personnaliser votre expérience." : step === 1 ? "Cela nous aide à afficher les bons indicateurs dès votre première connexion." : "Vos opérations, réservations et performances seront réunies dans un seul espace."}</p>
              {step === 0 ? <div className="mt-8 flex flex-col gap-2"><label htmlFor="hotel-name" className="text-sm font-medium">Nom de l&apos;établissement</label><Input id="hotel-name" value={hotelName} onChange={(event) => setHotelName(event.target.value)} placeholder="Ex. Hôtel Havenix" className="h-12 bg-background/70" autoFocus /></div> : null}
              {step === 1 ? <div className="mt-8 grid gap-3 sm:grid-cols-2">{["Direction", "Réception", "Finance", "Opérations"].map((item) => <button key={item} type="button" onClick={() => setRole(item)} className={`rounded-xl border p-4 text-left text-sm transition-all ${role === item ? "border-primary bg-primary/10 text-primary shadow-[0_0_24px_hsl(187_92%_58%_/_0.12)]" : "border-border bg-background/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}><span className="flex items-center justify-between"><span>{item}</span>{role === item ? <Check data-icon="inline-end" /> : null}</span></button>)}</div> : null}
              {step === 2 ? <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5"><div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary"><Hotel /></div><div><p className="font-medium">{hotelName || "Votre établissement"}</p><p className="text-sm text-muted-foreground">Profil {role} · Configuration terminée</p></div></div></div> : null}
              <Button type="button" onClick={next} disabled={step === 0 && !hotelName.trim()} className="mt-9 h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow-[0_0_28px_hsl(187_92%_58%_/_0.18)] hover:bg-primary/90">{step === steps.length - 1 ? "Accéder à mon espace" : "Continuer"}<ArrowRight data-icon="inline-end" /></Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default OnboardingScreen
