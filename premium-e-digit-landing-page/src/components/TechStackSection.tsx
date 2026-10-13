import React, { useState } from 'react';
import { TECH_STACK } from '../data/mockData';
import {
  Cpu,
  Server,
  Database,
  CreditCard,
  Cloud,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  WifiOff
} from 'lucide-react';

export const TechStackSection: React.FC = () => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  const getCategoryIcon = (index: number) => {
    switch (index) {
      case 0: return <Cpu className="w-5 h-5 text-blue-600" />;
      case 1: return <Server className="w-5 h-5 text-blue-600" />;
      case 2: return <Database className="w-5 h-5 text-blue-600" />;
      case 3: return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 4: return <Cloud className="w-5 h-5 text-blue-600" />;
      default: return <Sparkles className="w-5 h-5 text-blue-600" />;
    }
  };

  const architecturalPillars = [
    {
      title: 'Edge Caching Proche d\'Abidjan',
      desc: 'Distribution de contenu via des serveurs Edge à proximité immédiate pour réduire la latence sous 150ms pour les usagers ivoiriens.',
      icon: Zap
    },
    {
      title: 'Résilience aux Coupures Réseau (PWA)',
      desc: 'Architecture offline-first avec Service Workers. Vos collaborateurs et clients peuvent continuer à saisir des données hors-ligne.',
      icon: WifiOff
    },
    {
      title: 'Webhooks Idempotents Mobile Money',
      desc: 'Tolérance totale aux doublons ou retards d\'événements réseau Wave et Orange Money : aucun paiement ne sera perdu ni validé deux fois.',
      icon: CreditCard
    },
    {
      title: 'Sécurité Bancaire & RGPD / ARTCI',
      desc: 'Chiffrement AES-256 au repos, TLS 1.3 en transit, et conformité stricte avec les exigences légales ivoiriennes sur les données.',
      icon: ShieldCheck
    }
  ];

  return (
    <section id="stack" className="relative py-24 lg:py-32 dark:bg-slate-950 bg-white dark:border-slate-800 border-t border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-blue-600 text-xs font-bold tracking-wider uppercase">
            <Cpu className="w-3.5 h-3.5" />
            <span>Excellence Technologique Sans Compromis</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            Une architecture moderne taillée pour les{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              réalités du terrain ivoirien
            </span>
          </h2>

          <p className="text-base sm:text-lg dark:text-slate-400 text-slate-600">
            Zéro templates WordPress préfabriqués ou usines à gaz lentes. Nous écrivons du code TypeScript propre, maintenable et conçu pour supporter des millions de requêtes.
          </p>
        </div>

        {/* Tech Stack Interactive Navigator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Categories Sidebar */}
          <div className="lg:col-span-4 space-y-2">
            {TECH_STACK.map((cat, idx) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setActiveCategoryIndex(idx)}
                className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${activeCategoryIndex === idx
                  ? 'dark:bg-slate-800 bg-slate-50 border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'dark:bg-slate-900 bg-white dark:border-slate-700 border-slate-200 hover:border-blue-500/30 dark:text-slate-400 text-slate-600'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeCategoryIndex === idx ? 'bg-blue-500/10' : 'dark:bg-slate-800 bg-slate-50'
                    }`}>
                    {getCategoryIcon(idx)}
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${activeCategoryIndex === idx ? 'dark:text-white text-slate-900' : 'dark:text-slate-300 text-slate-700'}`}>
                      {cat.category}
                    </div>
                    <div className="text-[11px] dark:text-slate-500 text-slate-500">
                      {cat.items.length} technologies maîtresses
                    </div>
                  </div>
                </div>
                {activeCategoryIndex === idx && (
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                )}
              </button>
            ))}
          </div>

          {/* Active Category Display */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl dark:bg-slate-900 bg-white dark:border-slate-700 border border-slate-200 backdrop-blur-xl space-y-6 shadow-sm">
            <div className="flex items-center justify-between dark:border-slate-800 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  {getCategoryIcon(activeCategoryIndex)}
                </div>
                <div>
                  <h3 className="text-xl font-bold dark:text-white text-slate-900">
                    {TECH_STACK[activeCategoryIndex].category}
                  </h3>
                  <p className="text-xs dark:text-slate-500 text-slate-500">
                    Outils et protocoles de niveau ingénierie mondiale
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-600 font-mono">
                100% Maîtrisé
              </span>
            </div>

            {/* Grid of technologies in active category */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {TECH_STACK[activeCategoryIndex].items.map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 hover:border-blue-500/30 transition-all flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-xs font-mono font-bold dark:text-slate-300 text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 text-xs dark:text-slate-500 text-slate-500 space-y-1">
              <span className="font-semibold dark:text-white text-slate-900">Pourquoi ce choix ?</span>
              <p className="text-[11px] leading-relaxed">
                Ces technologies garantissent des performances maximales même en cas de mauvaise connectivité 3G à Abidjan et une transition sans douleur lors de la montée en charge.
              </p>
            </div>
          </div>

        </div>

        {/* 4 Architectural Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {architecturalPillars.map((pillar, pIdx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pIdx}
                className="p-6 rounded-2xl dark:bg-slate-900 bg-white dark:border-slate-700 border border-slate-200 hover:border-blue-500/20 transition-all space-y-3 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold dark:text-white text-slate-900">
                  {pillar.title}
                </h4>
                <p className="text-xs dark:text-slate-400 text-slate-500 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};