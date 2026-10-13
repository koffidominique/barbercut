import React from 'react';
import {
  Sparkles,
  ArrowRight,
  PhoneCall,
  MessageSquare,
  MapPin,
  ShieldCheck,
  Clock,
  Coffee
} from 'lucide-react';

interface CtaSectionProps {
  onOpenBriefModal: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({
  onOpenBriefModal
}) => {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden dark:bg-slate-950 bg-white">
      <div className="absolute inset-0 dark:bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/30 bg-gradient-to-br from-white via-slate-50 to-blue-50/30"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.05),transparent_50%)]"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 dark:bg-slate-900/80 bg-white dark:border-blue-500/40 border-2 border-blue-500/40 shadow-2xl overflow-hidden">

          {/* Subtle grid in background */}
          <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">

            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 dark:bg-blue-500/20 border border-blue-500/30 text-blue-600 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Démarrage Immédiat • Cocody Belle Côte</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold dark:text-white text-slate-900 tracking-tight leading-[1.15]">
              Prêt à dominer votre marché avec une{' '}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent">
                application web sur-mesure ?
              </span>
            </h2>

            {/* Subhead */}
            <p className="text-base sm:text-lg dark:text-slate-400 text-slate-600 leading-relaxed font-normal">
              Ne laissez pas vos concurrents prendre l'avantage numérique. Rencontrez-moi à Cocody Belle Côte pour cadrer votre projet dès cette semaine.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={onOpenBriefModal}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-xl shadow-blue-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 cursor-pointer group"
              >
                <Sparkles className="w-5 h-5 text-blue-200" />
                <span>Demander mon Devis Détaillé</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="https://wa.me/2250700000000?text=Bonjour%20E-DIGIT,%20je%20souhaite%20planifier%20un%20caf%C3%A9%20technique%20%C3%A0%20Cocody%20Belle%20C%C3%B4te%20pour%20mon%20projet%20web"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-xl text-base font-semibold text-blue-600 hover:text-blue-700 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-blue-500/10"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.43-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.893 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.773 11.773 0 005.683 1.48h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                <span>Café Technique à Cocody Belle Côte</span>
              </a>
            </div>

            {/* Direct Contact Bar */}
            <div className="pt-6 dark:border-slate-700 border-t border-slate-200 flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs dark:text-slate-400 text-slate-600">
              <a
                href="tel:+2252722000000"
                className="flex items-center gap-2 hover:text-blue-400 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-blue-400" />
                <span>Ligne directe : <strong>+225 27 22 00 00 00</strong></span>
              </a>

              <a
                href="https://wa.me/2250700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-blue-400 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>WhatsApp Pro : <strong>+225 07 00 00 00 00</strong></span>
              </a>

              <div className="flex items-center gap-2 dark:text-slate-400 text-slate-400">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Abidjan Cocody Danga & Plateau</span>
              </div>
            </div>

            {/* Guarantees */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Étude de faisabilité sous 24h</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Accord de confidentialité (NDA) signé d'office</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Sans engagement</span>
              </span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};