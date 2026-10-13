import React, { useState } from 'react';
import {
  Code2,
  MapPin,
  PhoneCall,
  Mail,
  MessageSquare,
  ShieldCheck,
  Send,
  CheckCircle2,
  ArrowUp
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setTimeout(() => {
        setNewsletterSubscribed(false);
        setNewsletterEmail('');
      }, 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative dark:bg-slate-950 bg-white dark:border-slate-800 border-t border-slate-200 pt-16 pb-12 overflow-hidden">

      {/* Background ambient light */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 dark:border-slate-800 border-b border-slate-200">

          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-[1.5px]">
                <div className="w-full h-full dark:bg-slate-900 bg-white rounded-[10px] flex items-center justify-center shadow-sm">
                  <Code2 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div>
                <div>
                  <span className="text-xl font-extrabold dark:text-white text-slate-900 font-['Space_Grotesk'] tracking-tight">
                    E-DIGIT<span className="text-blue-500">.</span>
                  </span>
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-500/10 border border-blue-500/20 rounded">
                    CI 🇨🇮
                  </span>
                </div>
              </div>

              <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed max-w-sm">
                Freelance indépendant en ingénierie logiciel basé à Cocody Belle Côte. Je conçois, développe et maintiens des applications web sur-mesure pour les PME et entrepreneurs ivoiriens.
              </p>

              {/* Live Status indicator */}
              <div className="p-3 rounded-xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 inline-flex items-center gap-2.5 text-xs dark:text-slate-400 text-slate-600 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span>Disponible pour vos projets depuis Cocody Belle Côte</span>
              </div>
            </div>

            {/* Column 2: Services Web */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider dark:text-white text-slate-900">
                Construction Web
              </h4>
              <ul className="space-y-2 text-xs dark:text-slate-400 text-slate-600">
                <li><a href="#services" className="hover:text-blue-600 transition">SaaS & Plateformes B2B</a></li>
                <li><a href="#services" className="hover:text-blue-600 transition">Portails FinTech & Wave/OM</a></li>
                <li><a href="#services" className="hover:text-blue-600 transition">E-Commerce & Marketplaces</a></li>
                <li><a href="#services" className="hover:text-blue-600 transition">Applications ERP / CRM</a></li>
                <li><a href="#services" className="hover:text-blue-600 transition">Web Apps PWA Résilientes</a></li>
                <li><a href="#services" className="hover:text-blue-600 transition">Audit & Modernisation Legacy</a></li>
              </ul>
            </div>

            {/* Column 3: Contact Abidjan */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider dark:text-white text-slate-900">
                Bureaux à Abidjan
              </h4>
              <div className="space-y-2.5 text-xs dark:text-slate-400 text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Boulevard Hassan II, Cocody Danga & Immeuble Postel 2001, Plateau, Abidjan</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>+225 27 22 00 00 00</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>WhatsApp : +225 07 00 00 00 00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>contact@edigit.ci</span>
                </div>
              </div>
            </div>

            {/* Column 4: Newsletter & Veille Tech */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider dark:text-white text-slate-900">
                Veille Tech Ivoirienne
              </h4>
              <p className="text-xs dark:text-slate-400 text-slate-600">
                Recevez nos analyses exclusives sur la tech, le Mobile Money et l'ingénierie logicielle en Côte d'Ivoire.
              </p>

              {newsletterSubscribed ? (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Merci ! Vous êtes inscrit à la veille.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="space-y-2">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="votre-email@entreprise.ci"
                    className="w-full px-3 py-2 rounded-lg dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 dark:text-white text-slate-900 text-xs placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-sm"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>S'inscrire</span>
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Bottom Legal & Copyright Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs dark:text-slate-400 text-slate-600">
            <div className="flex flex-wrap items-center gap-4 text-center sm:text-left">
              <span>© 2026 E-DIGIT Côte d'Ivoire SARL. Tous droits réservés.</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Conforme Réglementation ARTCI N° 2013-450</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition">Mentions Légales</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition">Politique de Confidentialité</a>
              <button
                onClick={scrollToTop}
                className="p-2 rounded-lg dark:bg-slate-800 bg-slate-50 hover:dark:bg-slate-700 hover:bg-slate-100 dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900 dark:border-slate-700 border border-slate-200 transition cursor-pointer shadow-sm"
                title="Retour en haut"
                aria-label="Retour en haut"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
    </footer>
  );
};