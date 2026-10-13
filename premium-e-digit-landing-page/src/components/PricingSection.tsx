import React from 'react';
import { PRICING_PLANS } from '../data/mockData';
import { Currency } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Check,
  Sparkles,
  ArrowRight,
  Clock,
  CreditCard
} from 'lucide-react';
import { Pricing3DCard } from './ui/card-17';

interface PricingSectionProps {
  currency: Currency;
  onToggleCurrency: (curr: Currency) => void;
  onSelectPlan: (planName: string, price: number) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  currency,
  onToggleCurrency,
  onSelectPlan
}) => {
  return (
    <section id="tarifs" className="relative py-24 lg:py-32 dark:bg-slate-950 bg-white dark:border-slate-800 border-t border-slate-200 overflow-hidden">
      {/* Background orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[170px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-blue-600 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tarification Claire & Prévisible</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            Investissez dans une application web{' '}
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent">
              qui génère un vrai ROI
            </span>
          </h2>

          <p className="text-base sm:text-lg dark:text-slate-400 text-slate-600">
            Des forfaits transparents, sans frais cachés ni mauvaises surprises. Code source 100% à vous, hébergement optimisé et accompagnement d'élite.
          </p>

          {/* Currency Toggle inside Section */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <span className="text-xs font-semibold dark:text-slate-400 text-slate-500">Afficher les tarifs en :</span>
            <div className="inline-flex p-1 rounded-xl dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => onToggleCurrency('FCFA')}
                className={`px-4 py-1.5 rounded-lg transition-all ${currency === 'FCFA'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow'
                  : 'dark:text-slate-400 text-slate-500 hover:dark:text-white hover:text-slate-900'
                  }`}
              >
                Franc CFA (XOF)
              </button>
              <button
                type="button"
                onClick={() => onToggleCurrency('EUR')}
                className={`px-4 py-1.5 rounded-lg transition-all ${currency === 'EUR'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow'
                  : 'dark:text-slate-400 text-slate-500 hover:dark:text-white hover:text-slate-900'
                  }`}
              >
                Euros (€)
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid - Shadcn Card 17 (3D Hover) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PRICING_PLANS.map((plan) => {
            return (
              <Pricing3DCard key={plan.id} popular={plan.popular}>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg">
                    Recommandé par nos clients CI
                  </div>
                )}

                <div className="space-y-6">
                  {/* Plan Header */}
                  <div>
                    <h3 className="text-2xl font-extrabold dark:text-white text-slate-900">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-blue-600/80 mt-1 font-medium min-h-[32px]">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold dark:text-white text-slate-900 font-['Space_Grotesk']">
                        {formatCurrency(plan.priceFCFA, currency)}
                      </span>
                      <span className="text-xs dark:text-slate-500 text-slate-500">HT</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs dark:text-slate-400 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Livraison estimée : <strong className="dark:text-white text-slate-900">{plan.deliveryTime}</strong></span>
                    </div>
                  </div>

                  <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed dark:border-slate-700 border-t border-slate-100 pt-4">
                    {plan.description}
                  </p>

                  {/* Features list */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider dark:text-slate-400 text-slate-500">
                      Inclus dans ce forfait :
                    </span>
                    <ul className="space-y-2.5">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs dark:text-slate-300 text-slate-700">
                          <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="pt-8 space-y-3">
                  <div className="text-[11px] dark:text-slate-500 text-slate-500 italic">
                    Idéal pour : {plan.idealFor}
                  </div>
                  <button
                    onClick={() => onSelectPlan(plan.name, plan.priceFCFA)}
                    className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 text-white shadow-blue-500/25'
                      : 'dark:bg-slate-700 bg-slate-800 hover:dark:bg-slate-600 hover:bg-slate-700 text-white border dark:border-slate-600 border-white/10'
                      }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </Pricing3DCard>
            );
          })}
        </div>

        {/* Payment Terms & Milestone Guarantee */}
        <div className="p-8 rounded-3xl dark:bg-slate-900 bg-white dark:border-slate-700 border border-slate-200 backdrop-blur-xl shadow-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
                <CreditCard className="w-4 h-4" />
                <span>Modalités de Règlement Claires & Sécurisées</span>
              </div>
              <h4 className="text-xl font-bold dark:text-white text-slate-900">
                Échelonnement 40% / 30% / 30% à la performance
              </h4>
              <p className="text-xs dark:text-slate-400 text-slate-600 max-w-xl">
                Vous ne payez le solde que lorsque votre application web est pleinement opérationnelle et validée par vos soins à Abidjan.
              </p>
            </div>

            {/* Steps Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
              <div className="p-4 rounded-xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-100 space-y-1 text-center">
                <div className="text-lg font-extrabold text-blue-600">40%</div>
                <div className="text-xs font-bold dark:text-white text-slate-900">Démarrage</div>
                <div className="text-[10px] dark:text-slate-500 text-slate-500">Cadrage & Design UI/UX</div>
              </div>

              <div className="p-4 rounded-xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-100 space-y-1 text-center">
                <div className="text-lg font-extrabold text-blue-400">30%</div>
                <div className="text-xs font-bold dark:text-white text-slate-900">Recette Bêta</div>
                <div className="text-[10px] dark:text-slate-500 text-slate-500">Validation fonctionnelle</div>
              </div>

              <div className="p-4 rounded-xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-100 space-y-1 text-center">
                <div className="text-lg font-extrabold text-blue-600">30%</div>
                <div className="text-xs font-bold dark:text-white text-slate-900">Livraison Finale</div>
                <div className="text-[10px] dark:text-slate-500 text-slate-500">Mise en ligne & Dépôt Git</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};