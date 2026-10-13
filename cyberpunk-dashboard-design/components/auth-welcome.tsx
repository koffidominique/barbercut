"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

const particles = Array.from({ length: 32 }, (_, index) => ({
  left: `${(index * 31) % 100}%`,
  top: `${(index * 47) % 100}%`,
  delay: `${(index % 8) * 0.35}s`,
  duration: `${4 + (index % 5)}s`,
}))

export function AuthWelcome({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const seen = window.sessionStorage.getItem("havenix-welcome-seen") === "true"
    setVisible(!seen)
    setReady(true)
  }, [])

  function continueToAuth() {
    window.sessionStorage.setItem("havenix-welcome-seen", "true")
    setVisible(false)
  }

  if (!ready || !visible) return <>{children}</>

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#10131c] px-6 py-12 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(109,72,130,0.3),transparent_36%),linear-gradient(135deg,#111622_0%,#24182e_55%,#0d1119_100%)]" />
      <div className="absolute inset-0 opacity-70" aria-hidden="true">
        {particles.map((particle, index) => <span key={index} className="auth-particle" style={{ left: particle.left, top: particle.top, animationDelay: particle.delay, animationDuration: particle.duration }} />)}
      </div>
      <section className="relative z-10 flex max-w-2xl flex-col items-center text-center">
        <div className="mb-8 flex size-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl font-bold shadow-2xl backdrop-blur">h</div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.42em] text-violet-200">Havenix PMS</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Bienvenue dans votre espace hôtelier</h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-white/65 sm:text-lg">Centralisez vos réservations, vos équipes et vos revenus dans une expérience claire, élégante et pensée pour l&apos;excellence opérationnelle.</p>
        <Button onClick={continueToAuth} className="mt-10 h-12 rounded-full bg-white px-8 text-sm font-semibold text-[#21172b] shadow-xl hover:bg-violet-100">Commencer l&apos;expérience</Button>
        <p className="mt-5 text-xs text-white/35">Un espace simple pour des séjours exceptionnels.</p>
      </section>
    </main>
  )
}

export function WelcomeAuthScreen({ children }: { children: React.ReactNode }) {
  return <AuthWelcome>{children}</AuthWelcome>
}

/* The particle positions are deterministic so the welcome animation stays lightweight. */
