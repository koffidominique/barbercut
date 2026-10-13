import React from 'react';
import { SERVICES } from '../data/mockData';
import {
  LayoutGrid,
  CreditCard,
  ShoppingBag,
  Layers,
  Smartphone,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CardSoftDemo } from '@/components/ui/card-08';

interface ServicesSectionProps {
  onSelectServiceForQuote: (serviceTitle: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectServiceForQuote
}) => {
  const getIcon = (name: string) => {
    // Toutes les icônes utilisent la couleur bleue conforme à la palette
    switch (name) {
      case 'LayoutGrid': return <LayoutGrid className="w-6 h-6 text-blue-600" />;
      case 'CreditCard': return <CreditCard className="w-6 h-6 text-blue-600" />;
      case 'ShoppingBag': return <ShoppingBag className="w-6 h-6 text-blue-600" />;
      case 'Layers': return <Layers className="w-6 h-6 text-blue-600" />;
      case 'Smartphone': return <Smartphone className="w-6 h-6 text-blue-600" />;
      case 'RefreshCw': return <RefreshCw className="w-6 h-6 text-blue-600" />;
      default: return <Sparkles className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <section id="services" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Ambient background blur (conforme à la palette bleue) */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-blue-600 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ce que je construis pour vous</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            Ce que je construis pour votre entreprise{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              ivoirienne
            </span>
          </h2>

          <p className="text-base sm:text-lg dark:text-slate-400 text-slate-600 leading-relaxed">
            Je conçois et développe l'outil digital qui correspond exactement à votre façon de travailler. Pas de logiciel générique. Pas de fonctions inutiles. Juste ce dont vous avez besoin pour piloter, décider et grandir.
          </p>
        </div>

        {/* Services Grid with shadcn CardSoftDemo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service) => (
            <CardSoftDemo
              key={service.id}
              icon={getIcon(service.iconName)}
              badge={service.badge}
              title={service.title}
              subtitle={service.subtitle}
              description={service.description}
              features={service.features}
              metrics={service.metrics}
              technologies={service.technologies}
              onSelectService={() => onSelectServiceForQuote(service.title)}
            />
          ))}
        </div>

        {/* Local Advantage Callout */}
        <div className="p-8 rounded-2xl dark:bg-slate-800/50 bg-gradient-to-r from-blue-50 via-white to-blue-50 dark:border-slate-700 border border-slate-200 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl font-bold dark:text-white text-slate-900">
              Vous avez un cahier des charges spécifique ou un projet atypique ?
            </h4>
            <p className="text-sm dark:text-slate-400 text-slate-600 max-w-2xl">
              Nos ingénieurs et architectes logiciels à Abidjan étudient gratuitement votre besoin sous 24h avec une estimation détaillée.
            </p>
          </div>
          <button
            onClick={() => onSelectServiceForQuote('Projet Sur-Mesure / R&D')}
            className="shrink-0 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <span>Planifier un cadrage technique</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};