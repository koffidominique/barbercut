"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")
    const form = new FormData(event.currentTarget)
    const email = String(form.get("email"))
    const password = String(form.get("password"))
    const name = String(form.get("name") || "")
    const result = mode === "sign-in"
      ? await authClient.signIn.email({ email, password })
      : await authClient.signUp.email({ email, password, name })
    setPending(false)
    if (result.error) {
      setError("Impossible de valider ces identifiants.")
      return
    }
    router.push(mode === "sign-up" ? "/onboarding" : "/")
    router.refresh()
  }

  const isSignIn = mode === "sign-in"
  return <div className="grid min-h-[680px] w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
    <section className="flex flex-col justify-center px-7 py-10 sm:px-14 lg:px-16">
      <div className="mb-12 flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900"><span className="flex size-8 items-center justify-center rounded-lg bg-[#4d214f] text-sm font-bold text-white">h</span> Havenix.</div>
      <div className="mx-auto w-full max-w-sm"><p className="text-sm text-slate-500">{isSignIn ? "Bienvenue à nouveau" : "Commencez votre espace hôtelier"}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{isSignIn ? "Welcome Back" : "Créer votre compte"}</h1><p className="mt-2 text-sm text-slate-500">{isSignIn ? "Connectez-vous pour gérer votre établissement" : "Configurez votre accès à la plateforme PMS"}</p>
        <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
          {mode === "sign-up" ? <div className="flex flex-col gap-2"><Label htmlFor="name" className="text-xs font-medium text-slate-600">Nom complet</Label><Input id="name" name="name" placeholder="Jean Dupont" className="h-11 rounded-lg border-slate-200 bg-slate-50" required /></div> : null}
          <div className="flex flex-col gap-2"><Label htmlFor="email" className="text-xs font-medium text-slate-600">Adresse email</Label><Input id="email" name="email" type="email" placeholder="vous@exemple.com" className="h-11 rounded-lg border-slate-200 bg-slate-50" required /></div>
          <div className="flex flex-col gap-2"><div className="flex items-center justify-between"><Label htmlFor="password" className="text-xs font-medium text-slate-600">Mot de passe</Label>{isSignIn ? <button type="button" className="text-xs font-medium text-[#4d214f]">Mot de passe oublié ?</button> : null}</div><Input id="password" name="password" type="password" placeholder="••••••••" minLength={8} className="h-11 rounded-lg border-slate-200 bg-slate-50" required /></div>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={pending} className="mt-2 h-11 rounded-lg bg-[#4d214f] font-medium text-white hover:bg-[#3d193f]">{pending ? "Chargement…" : isSignIn ? "Se connecter" : "Créer mon compte"}</Button>
          <p className="text-center text-xs text-slate-500">{isSignIn ? <>Vous n&apos;avez pas encore de compte ? </> : <>Vous avez déjà un compte ? </>}<a href={isSignIn ? "/sign-up" : "/sign-in"} className="font-semibold text-[#4d214f] hover:underline">{isSignIn ? "S'inscrire" : "Se connecter"}</a></p>
        </form>
      </div>
    </section>
    <section className="relative hidden min-h-[680px] overflow-hidden bg-slate-100 lg:block"><img src={isSignIn ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/login-IlDNBTQ5h7Kvd7JpLNLrHxEogTyihH.jpeg" : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/register-h73pThmMNgfcbNNpHKaxiUYGEy7mKb.jpeg"} alt={isSignIn ? "Vue aérienne d'un quartier urbain moderne" : "Architecture contemporaine d'un immeuble résidentiel"} className="absolute inset-0 size-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#253846]/80 via-[#253846]/10 to-transparent" /><div className="absolute right-10 top-10 max-w-xs text-right text-white"><p className="text-sm font-medium">Votre gestion hôtelière, simplifiée.</p><p className="mt-2 text-xs text-white/75">Pilotez les réservations, les équipes et les revenus depuis un seul espace.</p></div><div className="absolute bottom-10 left-10 right-10 text-white"><p className="text-2xl font-semibold tracking-tight">Tout votre établissement.</p><p className="mt-2 text-sm text-white/75">Une plateforme pensée pour les équipes hôtelières.</p></div></section>
  </div>
}
