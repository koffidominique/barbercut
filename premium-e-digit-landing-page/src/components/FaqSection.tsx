import React, { useState } from 'react';
import { FAQS } from '../data/mockData';
import {
  HelpCircle,
  Search,
  MessageSquare,
  ArrowRight,
  PackageIcon,
  HeadsetIcon,
  Shield,
  Clock
} from 'lucide-react';
import AccordionMediaContentDemo from './ui/accordion-13';

interface FaqSectionProps {
  onOpenBriefModal: () => void;
}

// Map des icônes par catégorie pour l'accordéon shadcn
const categoryIcons: Record<string, React.ReactNode> = {
  'Général': <HeadsetIcon />,
  'Finances & Délais': <Clock />,
  'Technique & Mobile Money': <PackageIcon />,
  'Propriété & Sécurité': <Shield />
};

export const FaqSection: React.FC<FaqSectionProps> = ({
  onOpenBriefModal
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Tout');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Tout', 'Général', 'Finances & Délais', 'Technique & Mobile Money', 'Propriété & Sécurité'];

  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = activeCategory === 'Tout' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Transformer les FAQs en format compatible avec l'accordéon shadcn
  const accordionItems = filteredFaqs.map(faq => ({
    icon: categoryIcons[faq.category] || <MessageSquare />,
    title: faq.question,
    content: faq.answer,
    category: faq.category
  }));

  return (
    <section id="faq" className="relative py-24 lg:py-32 dark:bg-slate-950 bg-white dark:border-slate-800 border-t border-slate-200 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-blue-600 text-xs font-bold tracking-wider uppercase">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Questions Fréquentes</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            Tout ce que vous devez savoir avant de{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              lancer votre projet
            </span>
          </h2>

          <p className="text-base sm:text-lg dark:text-slate-400 text-slate-600">
            Propriété du code, paiements Wave, délais, rendez-vous à Abidjan : nous répondons à vos interrogations sans détours.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-3.5 w-5 h-5 dark:text-slate-400 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une question (Wave, code source, délais, contrat...)"
              className="w-full pl-12 pr-4 py-3 rounded-2xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 dark:text-white text-slate-900 dark:placeholder-slate-400 placeholder-slate-500 text-sm focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeCategory === cat
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'dark:bg-slate-800 bg-slate-100 dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:border-slate-700 border border-slate-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion List - Shadcn Accordion 13 */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center dark:text-slate-400 text-slate-500 dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 rounded-2xl">
              Aucune réponse ne correspond à votre recherche. Posez-nous votre question directement !
            </div>
          ) : (
            <div className="dark:bg-slate-900 bg-white dark:border-slate-700 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <AccordionMediaContentDemo items={accordionItems} />
            </div>
          )}
        </div>

        {/* Contact Bottom Callout */}
        <div className="p-6 sm:p-8 rounded-2xl dark:from-slate-800/50 dark:via-slate-900/50 dark:to-slate-800/50 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:border-slate-700 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
          <div className="space-y-1">
            <h4 className="text-base font-bold dark:text-white text-slate-900">
              Vous avez une question spécifique sur votre secteur d'activité ?
            </h4>
            <p className="text-xs dark:text-slate-400 text-slate-600">
              Nos consultants tech à Abidjan vous répondent sous 15 minutes par WhatsApp ou par téléphone.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/2250700000000?text=Bonjour%20E-DIGIT,%20j'ai%20une%20question%20sur%20mon%20projet%20web"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp CI</span>
            </a>
            <button
              onClick={onOpenBriefModal}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 transition flex items-center gap-2"
            >
              <span>Poser ma question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};