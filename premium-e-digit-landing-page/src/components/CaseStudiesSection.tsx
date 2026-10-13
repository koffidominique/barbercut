import React, { useState } from 'react';
import { CASE_STUDIES } from '../data/mockData';
import {
  Building2,
  MapPin,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { CaseStudySpotlightCard } from './ui/card-16';

interface CaseStudiesProps {
  onOpenBriefModalWithData: (data: any) => void;
}

export const CaseStudiesSection: React.FC<CaseStudiesProps> = ({
  onOpenBriefModalWithData
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState(CASE_STUDIES[0].id);

  const activeCase = CASE_STUDIES.find(c => c.id === selectedCaseId) || CASE_STUDIES[0];

  return (
    <section id="cas-clients" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/10 blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-blue-600 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Impact Réel sur le Terrain</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            Des applications web qui transforment{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              l'économie ivoirienne
            </span>
          </h2>

          <p className="text-base sm:text-lg dark:text-slate-400 text-slate-600">
            Découvrez comment nos plateformes sur-mesure résolvent les défis concrets des entreprises à Abidjan et dans les régions de l'intérieur.
          </p>
        </div>

        {/* Case Studies Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 p-1.5 dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border border-slate-200 rounded-2xl max-w-4xl mx-auto">
          {CASE_STUDIES.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedCaseId(item.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${selectedCaseId === item.id
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-slate-700/50 hover:bg-slate-200/50'
                }`}
            >
              <span>{item.title}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${selectedCaseId === item.id ? 'bg-black/30 text-white' : 'dark:bg-slate-700 dark:text-slate-400 bg-slate-200 text-slate-500'
                }`}>
                {item.sector.split('&')[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Active Case Study Spotlight Card - Shadcn Card 16 (Spotlight Hover) */}
        <CaseStudySpotlightCard>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Column: Story details */}
            <div className="lg:col-span-7 space-y-6">

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 font-bold border border-blue-500/20">
                    {activeCase.sector}
                  </span>
                  <span className="flex items-center gap-1 dark:text-slate-500 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{activeCase.location}</span>
                  </span>
                  <span className="flex items-center gap-1 dark:text-slate-500 text-slate-500">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{activeCase.client}</span>
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900">
                  {activeCase.title}
                </h3>

                <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                  {activeCase.description}
                </p>
              </div>

              {/* Challenge vs Solution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider dark:text-slate-300 text-slate-600">
                    Défi Initial
                  </span>
                  <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed">
                    {activeCase.challenge}
                  </p>
                </div>

                <div className="p-4 rounded-xl dark:bg-blue-900/20 bg-blue-50 dark:border-blue-800 border border-blue-200 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    Solution E-DIGIT
                  </span>
                  <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed">
                    {activeCase.solution}
                  </p>
                </div>
              </div>

              {/* Tech Stack Pills */}
              <div className="space-y-2">
                <span className="text-xs font-semibold dark:text-slate-400 text-slate-600">
                  Technologies déployées :
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeCase.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-mono dark:text-slate-400 text-slate-600 dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border border-slate-200 rounded-lg"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => onOpenBriefModalWithData({
                    inspiration: activeCase.title,
                    projectType: activeCase.sector
                  })}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>Créer une application similaire à {activeCase.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Right Column: Measurable Results Display */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl dark:bg-slate-800/50 bg-gradient-to-b from-slate-50 to-white dark:border-slate-700 border border-slate-200 shadow-sm space-y-6">

                <div className="flex items-center justify-between dark:border-slate-700 border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider dark:text-white text-slate-700 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Résultats Mesurables Après Déploiement</span>
                  </span>
                </div>

                <div className="space-y-4">
                  {activeCase.results.map((res, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-4 rounded-xl dark:bg-slate-700/50 bg-slate-100/50 dark:border-slate-600 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs dark:text-slate-500 text-slate-500">{res.label}</div>
                        <div className="text-2xl font-extrabold dark:text-white text-slate-900 font-['Space_Grotesk']">
                          {res.value}
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-xs font-bold text-blue-600 font-mono">
                        {res.change}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl dark:bg-slate-700/50 bg-slate-50 dark:border-slate-600 border border-slate-200 space-y-1.5 text-xs dark:text-slate-400 text-slate-500">
                  <div className="flex items-center gap-1.5 dark:text-white text-slate-900 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Garantie de résultat & SLA Respecté</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Plateforme opérée sans interruption technique, conforme aux exigences de conformité en Côte d'Ivoire.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CaseStudySpotlightCard>

      </div>
    </section >
  );
};