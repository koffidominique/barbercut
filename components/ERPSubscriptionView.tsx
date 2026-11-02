'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  WalletCards,
  CreditCard,
  Smartphone,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Download,
} from 'lucide-react'
import { Salon, SalonSubscription } from '@/lib/store'
import { useSalonStore } from '@/lib/store'
import { staggerContainer, staggerItem, fadeInUp } from '@/components/ui/motion'

interface ERPSubscriptionViewProps {
  salon: Salon
}

export function ERPSubscriptionView({ salon }: ERPSubscriptionViewProps) {
  const { getSubscription, upgradeToPro, startFreeTrial, cancelSubscription } = useSalonStore()
  const subscription = getSubscription(salon.id)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'orange_money' | 'card'>('wave')
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const isPro = subscription?.plan === 'pro' && subscription.status === 'active'
  const isTrial = subscription?.status === 'trial'
  const trialEndsAt = subscription?.trialEndsAt ? new Date(subscription.trialEndsAt) : null
  const daysLeft = trialEndsAt ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

  const formatFcfa = (n: number) => n.toLocaleString('fr-FR')

  const handleUpgrade = () => {
    setShowPaymentModal(true)
    setPaymentSuccess(false)
  }

  const handleStartTrial = () => {
    startFreeTrial(salon.id)
  }

  const handleCancel = () => {
    if (confirm('Êtes-vous sûr de vouloir annuler votre abonnement Pro ?')) {
      cancelSubscription(salon.id)
    }
  }

  const handleProcessPayment = () => {
    setPaymentProcessing(true)
    setTimeout(() => {
      setPaymentProcessing(false)
      setPaymentSuccess(true)
      upgradeToPro(salon.id, paymentMethod)
      setShowPaymentModal(false)
    }, 1500)
  }

  const priceText = subscription?.priceFcfa || 35000

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#202321]">Abonnement & Facturation</h2>
          <p className="text-xs text-[#747873]">
            Gérez votre plan d’abonnement pour {salon.name}. Accédez à des fonctionnalités avancées avec le plan Pro.
          </p>
        </div>
      </div>

      {/* Carte d'abonnement actuelle */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className={`rounded-3xl border border-[#e8e4dc] bg-white p-8 shadow-sm ${isPro || isTrial ? 'border-[#4d7c3b] bg-[#f0f9ec]' : ''}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#202321] text-[#f4c58d]">
              <WalletCards size={20} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#202321]">
                Votre abonnement actuel
              </h3>
              <p className="text-xs text-[#747873]">
                {isPro ? 'Plan Pro actif' : isTrial ? 'Essai gratuit en cours' : 'Plan Gratuit'}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold ${
              isPro || isTrial ? 'bg-[#ebf4e6] text-[#4d7c3b]' : 'bg-[#edeae3] text-[#747873]'
            }`}
          >
            {isPro ? '● Actif' : isTrial ? '○ Essai' : '○ Gratuit'}
          </span>
        </div>

        {!isPro && !isTrial ? (
          <div className="space-y-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-serif text-[32px] font-bold tracking-tight text-[#202321]">
                {formatFcfa(priceText)} /mois
              </span>
              <span className="text-xs text-[#747873]">FCFA</span>
            </div>
            <p className="text-xs text-[#747873]">
              Accès illimité à toutes les fonctionnalités : analytics avancés, multi-salons, invitations d’équipe, exports illimités.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleStartTrial}
                className="rounded-xl border border-[#e8e4dc] bg-white px-4 py-3 text-xs font-bold text-[#202321] hover:bg-[#f5f3ec] transition"
              >
                <Clock size={14} className="mr-2 text-[#bd664a]" />
                Essai gratuit 14 jours
              </button>
              <button
                onClick={handleUpgrade}
                className="rounded-xl bg-[#202321] px-4 py-3 text-xs font-bold text-white hover:bg-[#383d39] transition shadow-sm"
              >
                Souscrire Pro <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : isTrial ? (
          <div className="space-y-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-serif text-[32px] font-bold tracking-tight text-[#202321]">
                Gratuit pendant l’essai
              </span>
              <span className="text-xs text-[#747873]">Puis {formatFcfa(priceText)} /mois</span>
            </div>
            <div
              className={`px-3 py-2 rounded-lg text-center text-xs font-bold ${
                daysLeft <= 3 ? 'bg-[#fdeae8] text-[#c45347]' : 'bg-[#ebf4e6] text-[#4d7c3b]'
              }`}
            >
              ⏳ Il reste {daysLeft} jour{daysLeft > 1 ? 's' : ''} avant la fin de l’essai
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleUpgrade}
                disabled={daysLeft <= 0}
                className={`rounded-xl px-4 py-3 text-xs font-bold text-white transition shadow-sm ${
                  daysLeft <= 0
                    ? 'bg-[#a5a59f] cursor-not-allowed'
                    : 'bg-[#202321] hover:bg-[#383d39]'
                }`}
              >
                Passer en Pro maintenant
              </button>
              <button
                onClick={handleCancel}
                className="rounded-xl border border-[#e8e4dc] bg-white px-4 py-3 text-xs font-bold text-[#bd664a] hover:bg-[#fbf3ee] transition"
              >
                Annuler l’essai
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-serif text-[32px] font-bold tracking-tight text-[#202321]">
                {formatFcfa(priceText)} /mois
              </span>
              <span className="text-xs text-[#747873]">FCFA</span>
            </div>
            <p className="text-xs text-[#747873]">
              Abonnement actif • Prochain paiement le{' '}
              <span className="font-semibold text-[#202321]">
                {subscription?.nextPaymentAt ? new Date(subscription.nextPaymentAt).toLocaleDateString('fr-FR') : '—'}
              </span>
            </p>
            <div className="grid gap-3">
              <button
                onClick={handleCancel}
                className="rounded-xl border border-[#e8e4dc] bg-white px-4 py-3 text-xs font-bold text-[#bd664a] hover:bg-[#fbf3ee] transition"
              >
                <AlertCircle size={14} className="mr-2" />
                Annuler l’abonnement
              </button>
            </div>
            <div className="rounded-lg bg-[#f5f3ec] p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#a5a59f]">Avantages Pro inclus</h4>
              <ul className="mt-2 space-y-2 text-xs text-[#747873]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#4d7c3b]" />
                  Analytics avancés (CA comparatif N vs N-1)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#4d7c3b]" />
                  Top prestations et taux de no-show par équipe
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#4d7c3b]" />
                  Invitations d’équipe avec permissions granulaires
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#4d7c3b]" />
                  Export CSV illimité des rapports financiers
                </li>
              </ul>
            </div>
          </div>
        )}
      </motion.div>

      {/* Historique des factures */}
      <section className="rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#202321]">Historique des factures</h3>
            <p className="text-xs text-[#747873]">Toutes vos factures et paiements</p>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-[#bd664a] hover:underline">
            <Download size={14} /> Exporter l’historique
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e8e4dc] text-[#747873]">
                <th className="pb-3 font-semibold">Facture</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Plan</th>
                <th className="pb-3 font-semibold">Montant</th>
                <th className="pb-3 font-semibold">Statut</th>
                <th className="pb-3 font-semibold">Méthode</th>
              </tr>
            </thead>
            <tbody>
              {(subscription ? [
                {
                  id: 'FAC-' + subscription.billingCycleStart?.slice(0, 7).replace('-', '/'),
                  date: subscription.billingCycleStart || new Date().toISOString(),
                  plan: subscription.plan === 'pro' ? 'Pro' : 'Gratuit',
                  amount: subscription.priceFcfa,
                  status: subscription.status === 'active' ? 'Payé' : subscription.status === 'trial' ? 'Essai' : 'Impayé',
                  method: subscription.paymentMethod || '—',
                },
              ] : [
                {
                  id: 'FAC-000',
                  date: new Date().toISOString(),
                  plan: 'Gratuit',
                  amount: 0,
                  status: 'Gratuit',
                  method: '—',
                },
              ]).map((invoice, i) => (
                <tr
                  key={i}
                  className="border-b border-[#f0ece5] hover:bg-[#fbfaf7] transition"
                >
                  <td className="py-3 text-[#202321] font-semibold">{invoice.id}</td>
                  <td className="py-3 text-[#747873]">
                    {new Date(invoice.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 text-[#747873]">{invoice.plan}</td>
                  <td className="py-3 text-[#202321] font-semibold">
                    {invoice.amount === 0 ? 'Gratuit' : formatFcfa(invoice.amount)} FCFA
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        invoice.status === 'Payé'
                          ? 'bg-[#ebf4e6] text-[#4d7c3b]'
                          : invoice.status === 'Essai'
                            ? 'bg-[#fbf3ee] text-[#bd664a]'
                            : 'bg-[#fdeae8] text-[#c45347]'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 text-[#747873]">
                    {invoice.method === 'wave' ? 'Wave' : invoice.method === 'orange_money' ? 'Orange Money' : invoice.method === 'card' ? 'Carte bancaire' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPaymentModal(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative z-10 w-full max-w-md rounded-3xl border border-[#e8e4dc] bg-[#fbfaf7] p-6 shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fbf3ee] text-[#bd664a]">
                <Smartphone size={32} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#202321]">Paiement Mobile Money</h3>
              <p className="text-xs text-[#747873] mt-2">
                Souscription au plan Pro — {formatFcfa(priceText)} FCFA/mois
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold text-[#747873]">
                  Méthode de paiement
                </label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {['wave', 'orange_money', 'card'].map((method) => {
                    const labels: Record<string, { label: string; color: string }> = {
                      wave: { label: 'Wave', color: 'text-[#4d7c3b]' },
                      orange_money: { label: 'Orange Money', color: 'text-[#c45347]' },
                      card: { label: 'Carte bancaire', color: 'text-[#43648f]' },
                    }
                    const isSelected = paymentMethod === method
                    return (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method as any)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition ${
                          isSelected
                            ? `border-[#bd664a] bg-[#fbf3ee]`
                            : 'border-[#e8e4dc] bg-white hover:border-[#cfcbc2]'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                            isSelected
                              ? labels[method].color.replace('text', 'bg').replace(/\[([^\]]+)\]/, (m, c) => `/${c}20`)
                              : 'bg-[#edeae3]'
                          }`}
                        >
                          <span className={labels[method].color}>
                            {method === 'wave' ? '📱' : method === 'orange_money' ? '🍊' : '💳'}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold">{labels[method].label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="bg-[#f5f3ec] rounded-xl p-4">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-[#747873]">Montant</span>
                  <span className="text-xs font-semibold text-[#202321]">{formatFcfa(priceText)} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-[#747873]">TVA (inclus)</span>
                  <span className="text-xs text-[#747873]">Inclus</span>
                </div>
              </div>

              <button
                onClick={handleProcessPayment}
                disabled={paymentProcessing}
                className={`w-full rounded-xl py-3 text-xs font-bold transition ${
                  paymentProcessing
                    ? 'bg-[#a5a59f] cursor-not-allowed'
                    : 'bg-[#202321] text-white hover:bg-[#383d39] shadow-sm'
                }`}
              >
                {paymentProcessing ? 'Paiement en cours...' : 'Confirmer le paiement'}
              </button>
            </div>

            {paymentSuccess && (
              <div className="mt-4 rounded-xl border border-[#d8f0dc] bg-[#f0f9ec] p-4 text-center">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-[#4d7c3b]" />
                <h4 className="font-bold text-[#202321] text-sm">Paiement confirmé !</h4>
                <p className="text-xs text-[#747873] mt-1">
                  Votre abonnement Pro est maintenant activé.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
