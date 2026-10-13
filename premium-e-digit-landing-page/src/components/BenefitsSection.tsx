import React from 'react';
import {
  ShieldCheck,
  MapPin,
  Code2,
  Zap,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const BenefitsSection: React.FC = () => {
  const comparisonRows = [
    {
      feature: 'Code Source & Propriété Intellectuelle',
      edigit: '100% Cédé au client dès la livraison (Dépôt Git & DB)',
      others: 'Fréquemment séquestré ou avec abonnement captif'
    },
    {
      feature: 'Présence Physique à Abidjan',
      edigit: 'Bureaux à Cocody / Plateau, RDV en personne possibles',
      others: 'Prestataires offshore introuvables en cas de litige'
    },
    {
      feature: 'Intégration Paiements Locaux (Wave / MoMo)',
      edigit: 'Webhooks idempotents natifs et réconciliation auto',
      others: 'Plugins génériques instables causant des pertes financières'
    },
    {
      feature: 'Délais de Livraison & Sprints',
      edigit: 'Engagements contractuels fermes (MVP en 3-4 semaines)',
      others: 'Retards chroniques de 6 mois à 1 an fréquents'
    },
    {
      feature: 'Support & Garantie Post-Livraison',
      edigit: '3 à 6 mois de garantie inclus avec astreinte réactive < 2h',
      others: 'Support payant ou inexistant après la mise en ligne'
    }
  ];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-blue-600 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>La Rigueur Ingénierie E-DIGIT</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            Pourquoi les entreprises ivoiriennes{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              nous confient leurs projets critiques
            </span>
          </h2>

          <p className="text-base sm:text-lg dark:text-slate-400 text-slate-600">
            En Côte d'Ivoire, les échecs de projets informatiques sont souvent dus au manque de méthodologie et à la distance. Voici comment nous sécurisons votre investissement.
          </p>
        </div>

        {/* 6 Key Strengths Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          <div className="p-7 rounded-2xl dark:bg-slate-800 bg-white dark:border-slate-700 border border-slate-200 space-y-4 hover:border-blue-500/30 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold dark:text-white text-slate-900">Ancrage Local à Abidjan</h3>
            <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed">
              Nous connaissons le tissu économique ivoirien, la géographie des communes d'Abidjan, les usages des consommateurs et les spécificités des opérateurs de télécoms locaux.
            </p>
          </div>

          <div className="p-7 rounded-2xl dark:bg-slate-800 bg-white dark:border-slate-700 border border-slate-200 space-y-4 hover:border-blue-500/30 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold dark:text-white text-slate-900">Code Source 100% Cédé</h3>
            <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed">
              Vous êtes 100% maître de votre actif numérique. Dépôt GitHub privé transféré, documentation d'architecture détaillée et liberté d'internaliser quand vous le souhaitez.
            </p>
          </div>

          <div className="p-7 rounded-2xl dark:bg-slate-800 bg-white dark:border-slate-700 border border-slate-200 space-y-4 hover:border-blue-500/30 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold dark:text-white text-slate-900">Sprints Agiles de 7 Jours</h3>
            <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed">
              Chaque semaine, vous assistez à une démonstration en direct des fonctionnalités développées. Aucun effet tunnel : vous gardez le contrôle total sur l'évolution.
            </p>
          </div>

          <div className="p-7 rounded-2xl dark:bg-slate-800 bg-white dark:border-slate-700 border border-slate-200 space-y-4 hover:border-blue-500/30 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold dark:text-white text-slate-900">Vitesse Éclair & SEO</h3>
            <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed">
              Nos applications obtiennent un score supérieur à 95/100 sur Google Lighthouse, garantissant un référencement naturel optimal et une navigation fluide sur smartphone.
            </p>
          </div>

          <div className="p-7 rounded-2xl dark:bg-slate-800 bg-white dark:border-slate-700 border border-slate-200 space-y-4 hover:border-blue-500/30 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold dark:text-white text-slate-900">Sécurité & Conformité ARTCI</h3>
            <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed">
              Chiffrement des mots de passe, protection contre les attaques CSRF, injections SQL, et stricte conformité avec la réglementation ivoirienne de protection des données.
            </p>
          </div>

          <div className="p-7 rounded-2xl dark:bg-slate-800 bg-white dark:border-slate-700 border border-slate-200 space-y-4 hover:border-blue-500/30 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold dark:text-white text-slate-900">Support & Réactivité Directe</h3>
            <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed">
              Un interlocuteur technique senior dédié joignable directement par WhatsApp, téléphone ou en rendez-vous physique à Abidjan.
            </p>
          </div>

        </div>

        {/* Comparison Table: E-DIGIT vs Others */}
        <div className="rounded-3xl dark:bg-slate-800 bg-white dark:border-slate-700 border border-slate-200 p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between dark:border-slate-700 border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold dark:text-white text-slate-900">
              Tableau comparatif : E-DIGIT vs Agences Traditionnelles & Freelances
            </h3>
            <span className="text-xs text-blue-600 font-mono font-bold hidden sm:inline">
              GARANTIE D'EXCELLENCE
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="dark:border-slate-700 border-b border-slate-200 dark:text-slate-400 text-slate-600">
                  <th className="py-3 px-4 w-1/3">Critère clé</th>
                  <th className="py-3 px-4 w-1/3 text-blue-600 font-bold bg-blue-500/5 rounded-t-xl">
                    Approche E-DIGIT CI 🇨🇮
                  </th>
                  <th className="py-3 px-4 w-1/3 dark:text-slate-400 text-slate-600">
                    Agences classiques / Freelances
                  </th>
                </tr>
              </thead>
              <tbody className="dark:divide-slate-700 divide-y divide-slate-100">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="dark:hover:bg-slate-700/50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-semibold dark:text-white text-slate-900">
                      {row.feature}
                    </td>
                    <td className="py-4 px-4 dark:text-slate-300 text-slate-700 bg-blue-500/5 font-medium">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{row.edigit}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 dark:text-slate-500 text-slate-500">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 dark:text-slate-500 text-slate-400 shrink-0 mt-0.5" />
                        <span>{row.others}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};