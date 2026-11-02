'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useSalonStore } from '@/lib/store'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { createSalon } = useSalonStore()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isSupabaseConfigured) {
      // Mode local / démo : rediriger directement vers l'onboarding pour créer son salon
      router.push('/onboarding')
      router.refresh()
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setLoading(true)

    const supabase = createClient()

    const { error: authError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (authError) {
      setLoading(false)
      setError(authError.message)
      return
    }

    // Si l'utilisateur est créé mais pas encore confirmé (email confirmation)
    if (data.user && !data.user.confirmed_at) {
      setLoading(false)
      router.push('/login')
      return
    }

    // Rediriger vers l'onboarding pour créer le salon manuellement
    if (data.user) {
      setLoading(false)
      router.push('/onboarding')
      router.refresh()
      return
    }

    setLoading(false)
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center">
      <div className="rounded-3xl border border-[#e8e4dc] bg-white p-8 sm:p-12 w-full max-w-md shadow-sm">
        <div className="text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#202321] text-[#f4c58d] font-serif text-xl font-bold mx-auto mb-4">
            B
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#202321]">Créer un compte</h1>
          <p className="mt-1 text-xs text-[#747873]">
            Rejoignez Barber Cuts ERP et pilotez votre salon
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold text-[#444a43]">
              Nom complet
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9da099]" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aminata Kouassi"
                required
                className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] pl-9 pr-3 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-[#444a43]">
              Adresse email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9da099]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@monsalon.com"
                required
                className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] pl-9 pr-3 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="mb-0 block text-xs font-bold text-[#444a43]">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-[#bd664a] font-semibold hover:underline"
              >
                {showPassword ? 'Masquer' : 'Voir'}
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9da099]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] pl-9 pr-3 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-[#444a43]">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9da099]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-[#e5e2db] bg-[#fcfbf9] pl-9 pr-3 py-2.5 text-xs text-[#202321] outline-none focus:border-[#bd664a]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#202321] px-5 py-3 text-xs font-bold text-white hover:bg-[#383d39] disabled:opacity-50 transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 2 5.373 2 12h5.82z"></path>
                </svg>
                Création...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Créer mon compte <ArrowRight size={14} />
              </span>
            )}
          </button>

          <p className="mt-6 text-center text-xs text-[#747873]">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-[#bd664a] font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}