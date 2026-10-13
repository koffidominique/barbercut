import React from 'react';
import { STATS } from '../data/mockData';
import {
  ShieldCheck,
  Zap,
  Award,
  CheckCircle2
} from 'lucide-react';

export const SocialProof: React.FC = () => {
  return (
    <section className="relative py-16 dark:border-slate-800 border-y border-slate-200 dark:bg-slate-900/30 bg-white backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Header line - Barre de confiance */}
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-widest dark:text-slate-400 text-slate-600 font-semibold">
            Déjà digitalisé : une boulangerie-pâtisserie à Abidjan qui pilote maintenant son activité en temps réel.
          </p>
        </div>

        {/* Sectors cibles badges */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {["Boulangeries", "Pharmacies", "Cliniques", "Transport", "Distribution", "BTP", "Agrobusiness", "Écoles privées"].map((secteur, idx) => (
            <span
              key={idx}
              className="px-4 py-2 rounded-full dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 text-xs font-semibold dark:text-slate-300 text-slate-700 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-300"
            >
              {secteur}
            </span>
          ))}
          <span className="text-xs dark:text-slate-500 text-slate-500 font-medium">— des entreprises ivoiriennes qui ont franchi le pas.</span>
        </div>

        {/* Key Metrics Grid */}
        <div className="pt-6 grid grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl dark:bg-slate-800 bg-white dark:border-slate-700 border border-slate-200 hover:border-blue-500/20 transition-all flex flex-col justify-between space-y-2 shadow-sm"
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 font-['Space_Grotesk']">
                {stat.value}
              </div>
              <div className="space-y-1">
                <div className="text-xs sm:text-sm font-semibold dark:text-white text-slate-900 leading-snug">
                  {stat.label}
                </div>
                <div className="text-[11px] dark:text-slate-500 text-slate-500">
                  {stat.subtext}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Official Certifications & Compliance Banner */}
        <div className="p-4 rounded-xl dark:bg-slate-800/50 bg-blue-500/10 dark:border-slate-700 border border-blue-500/20 flex flex-wrap items-center justify-around gap-4 text-xs dark:text-slate-300 text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Passerelle Certifiée Wave & Orange Money CI</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Protection des données conforme ARTCI</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Code Source 100% Cédé & Garanti 6 Mois</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Optimisé pour la connectivité Ouest-Africaine</span>
          </div>
        </div>

      </div>
    </section>
  );
};