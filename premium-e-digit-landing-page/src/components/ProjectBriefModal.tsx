import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Send,
  MessageSquare,
  Phone,
  Mail,
  Building,
  User,
  CheckCircle2,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

interface ProjectBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export const ProjectBriefModal: React.FC<ProjectBriefModalProps> = ({
  isOpen,
  onClose,
  initialData
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectType: 'SaaS & Plateforme B2B',
    selectedFeatures: [] as string[],
    budgetRange: '2 500 000 - 5 000 000 FCFA',
    timeline: 'Standard (6 à 8 semaines)',
    description: '',
    fullName: '',
    company: '',
    phone: '',
    email: '',
    location: 'Abidjan (Côte d\'Ivoire)'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync initialData if provided from Estimator or Pricing
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        projectType: initialData.projectType || initialData.planName || prev.projectType,
        budgetRange: initialData.estimatedBudgetFCFA
          ? `Env. ${new Intl.NumberFormat('fr-FR').format(initialData.estimatedBudgetFCFA)} FCFA`
          : prev.budgetRange,
        timeline: initialData.estimatedWeeks
          ? `${initialData.estimatedWeeks} semaines`
          : prev.timeline,
        selectedFeatures: initialData.features || prev.selectedFeatures
      }));
    }
  }, [initialData]);

  // Accessibility: Handle keyboard navigation (Escape key) and focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const modalElement = modalRef.current;
    if (!modalElement) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'Tab') {
        const focusableElements = modalElement.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Set initial focus on the first focusable element
    const firstFocusableElement = modalElement.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    // The close button is a good candidate for initial focus
    firstFocusableElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error(err);
      }
    }, 1000);
  };

  const generateWhatsAppMessage = () => {
    const text = `*NOUVEAU BRIEF PROJET E-DIGIT CI*\n\n` +
      `👤 *Nom:* ${formData.fullName}\n` +
      `🏢 *Entreprise:* ${formData.company || 'Non renseigné'}\n` +
      `📍 *Localisation:* ${formData.location}\n` +
      `🚀 *Projet:* ${formData.projectType}\n` +
      `💰 *Budget Estimé:* ${formData.budgetRange}\n` +
      `⏱️ *Délai Souhaité:* ${formData.timeline}\n` +
      `📱 *Contact:* ${formData.phone}\n` +
      `✉️ *Email:* ${formData.email}\n` +
      `📝 *Détails:* ${formData.description || 'Non précisé'}`;

    return `https://wa.me/2250700000000?text=${encodeURIComponent(text)}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl my-8 rounded-3xl dark:bg-slate-900 bg-white dark:border-blue-500/40 border border-blue-500/30 shadow-2xl overflow-hidden"
      >

        {/* Top Header */}
        <div className="px-6 py-4 dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 id="modal-title" className="text-sm font-bold dark:text-white text-slate-900">
                Cadrage de Projet Web • E-DIGIT Abidjan
              </h3>
              <p className="text-[11px] dark:text-slate-400 text-slate-500">
                Devis personnalisé et étude technique sous 24h
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg dark:text-slate-400 text-slate-400 hover:dark:text-white hover:text-white hover:dark:bg-slate-700 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {!isSuccess ? (
            <div>
              {/* Stepper Indicators */}
              <div className="flex items-center justify-between mb-8 pb-4 dark:border-slate-700 border-b border-slate-200">
                {[
                  { num: 1, label: 'Votre Projet' },
                  { num: 2, label: 'Budget & Délais' },
                  { num: 3, label: 'Vos Coordonnées' }
                ].map((s) => (
                  <div key={s.num} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s.num
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                      : step > s.num
                        ? 'bg-blue-500 text-white'
                        : 'dark:bg-slate-700 bg-slate-200 dark:text-slate-400 text-slate-500'
                      }`}>
                      {step > s.num ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                    </div>
                    <span className={`text-xs font-medium hidden sm:inline ${step === s.num ? 'dark:text-white font-bold text-slate-900 font-bold' : 'dark:text-slate-400 text-slate-500'
                      }`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Form Steps */}
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-xs font-bold dark:text-white text-slate-700 mb-1.5">
                        Quel type d'application web souhaitez-vous construire ?
                      </label>
                      <select
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 dark:text-white text-slate-900 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="SaaS & Plateforme B2B">SaaS & Plateforme B2B Sur-Mesure</option>
                        <option value="FinTech & Paiement Mobile Money">FinTech, Portails Marchands & Mobile Money</option>
                        <option value="E-Commerce & Marketplace Abidjan">Marketplace & E-Commerce Haute Vitesse</option>
                        <option value="ERP Métier & Gestion Stocks">Application Métier, ERP & CRM Dédié</option>
                        <option value="PWA Mobile-First Résiliente">Web App PWA Terrain (Mode Hors-Ligne)</option>
                        <option value="Refonte & Modernisation Legacy">Modernisation / Refonte Système Existant</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold dark:text-white text-slate-700 mb-1.5">
                        Décrivez brièvement vos objectifs clés et le problème à résoudre :
                      </label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Ex: Nous souhaitons une plateforme web permettant à nos 500 clients à Abidjan de commander nos produits et payer par Wave avec rapprochement automatique..."
                        className="w-full px-4 py-3 rounded-xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-slate-500 placeholder-slate-500 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-xs font-bold dark:text-white text-slate-700 mb-1.5">
                        Fourchette budgétaire envisagée (FCFA) :
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          'Moins de 3 000 000 FCFA',
                          '3 000 000 - 6 000 000 FCFA',
                          '6 000 000 - 12 000 000 FCFA',
                          'Plus de 12 000 000 FCFA (Enterprise)'
                        ].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setFormData({ ...formData, budgetRange: b })}
                            className={`p-3 rounded-xl border text-xs text-left transition-all ${formData.budgetRange === b
                              ? 'dark:bg-blue-500/20 bg-blue-500/20 dark:border-blue-500 border-blue-500 dark:text-white text-slate-900 font-bold ring-1 ring-blue-500'
                              : 'dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 dark:text-slate-300 text-slate-700 hover:dark:border-slate-600 hover:border-slate-300'
                              }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-bold dark:text-white text-slate-700 mb-1.5">
                        Délai souhaité de mise en ligne :
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {[
                          'Express (3 à 4 semaines)',
                          'Standard (6 à 8 semaines)',
                          'Flexible (8 à 12 semaines)'
                        ].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormData({ ...formData, timeline: t })}
                            className={`p-3 rounded-xl border text-xs text-center transition-all ${formData.timeline === t
                              ? 'dark:bg-blue-500/20 bg-blue-500/20 dark:border-blue-500 border-blue-500 dark:text-white text-slate-900 font-bold'
                              : 'dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 dark:text-slate-300 text-slate-700 hover:dark:border-slate-600 hover:border-slate-300'
                              }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl dark:bg-blue-500/10 bg-blue-50 dark:border-blue-500/20 border border-blue-100 text-xs dark:text-slate-400 text-slate-700 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Rappel : Paiement échelonné 40% / 30% / 30% après validation de chaque jalon.</span>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold dark:text-white text-slate-700 mb-1">
                          Nom & Prénom *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 dark:text-slate-400 text-slate-500" />
                          <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="Kouadio Michel"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 dark:text-white text-slate-900 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold dark:text-white text-slate-700 mb-1">
                          Nom de l'Entreprise ou Projet
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 w-4 h-4 dark:text-slate-400 text-slate-500" />
                          <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            placeholder="Ivoire Logistics SARL"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 dark:text-white text-slate-900 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold dark:text-white text-slate-700 mb-1">
                          Numéro WhatsApp / Téléphone *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-4 h-4 dark:text-slate-400 text-slate-500" />
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+225 07 00 00 00 00"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 dark:text-white text-slate-900 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold dark:text-white text-slate-700 mb-1">
                          Email professionnel *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 dark:text-slate-400 text-slate-500" />
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="direction@entreprise.ci"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 dark:text-white text-slate-900 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold dark:text-white text-slate-700 mb-1">
                        Votre localisation :
                      </label>
                      <select
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 dark:text-white text-slate-900 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="Abidjan (Cocody / Plateau / Marcory)">Abidjan (Cocody, Plateau, Marcory, etc.)</option>
                        <option value="Intérieur de la Côte d'Ivoire (San Pedro, Bouaké...)">Intérieur de la Côte d'Ivoire (San Pedro, Bouaké, Yamoussoukro...)</option>
                        <option value="Diaspora Ivoirienne (France, USA, Canada...)">Diaspora Ivoirienne (France, USA, Canada...)</option>
                        <option value="Autre pays UEMOA (Sénégal, Bénin, Togo...)">Autre pays sous-région UEMOA</option>
                      </select>
                    </div>

                    <div className="pt-2 flex items-center gap-2 text-[11px] dark:text-slate-400 text-slate-600">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Vos données sont strictement confidentielles et protégées conformément à l'ARTCI.</span>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="pt-6 dark:border-slate-700 border-t border-slate-200 flex items-center justify-between gap-4">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold dark:text-slate-300 text-slate-700 hover:dark:text-white hover:text-slate-900 dark:bg-slate-700 bg-slate-100 hover:dark:bg-slate-600 hover:bg-slate-200 transition flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Précédent</span>
                    </button>
                  ) : <div />}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 transition flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20"
                    >
                      <span>Continuer</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 rounded-xl text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 transition flex items-center gap-2 cursor-pointer shadow-xl shadow-blue-500/25 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Transmission en cours...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Envoyer ma Demande de Devis</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            /* Success State */
            <div className="text-center py-8 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold dark:text-white text-slate-900">
                  Demande reçue avec succès, {formData.fullName} !
                </h3>
                <p className="text-sm dark:text-slate-400 text-slate-600 max-w-md mx-auto">
                  J'ai bien reçu votre brief pour <strong className="text-blue-600">{formData.projectType}</strong>. En tant qu'ingénieur senior basé à Cocody Belle Côte, j'analyse votre demande et vous recontacte sous 24h.
                </p>
              </div>

              {/* Direct Instant WhatsApp Trigger */}
              <div className="p-5 rounded-2xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 space-y-3 max-w-md mx-auto">
                <div className="text-xs font-bold dark:text-white text-slate-700">
                  Accélérez la réponse en envoyant directement ce récapitulatif sur WhatsApp :
                </div>

                <a
                  href={generateWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/30 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Envoyer mon brief sur WhatsApp (+225)</span>
                </a>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                Fermer cette fenêtre
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};