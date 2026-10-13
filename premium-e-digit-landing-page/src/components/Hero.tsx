import React, { useState } from 'react';
import { Currency } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Sparkles,
  ArrowRight,
  Calculator,
  ShieldCheck,
  Zap,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Building2,
  Smartphone,
  Globe2,
  Lock,
  MessageSquare
} from 'lucide-react';

interface HeroProps {
  currency: Currency;
  onOpenBriefModal: () => void;
  onScrollToCaseStudy: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  currency,
  onOpenBriefModal,
  onScrollToCaseStudy
}) => {
  const [activeTab, setActiveTab] = useState<'fintech' | 'saas' | 'ecommerce'>('fintech');
  const [simulatedPaymentCount, setSimulatedPaymentCount] = useState(148);
  const [simulatedRevenue, setSimulatedRevenue] = useState(4825000);
  const [justSimulated, setJustSimulated] = useState(false);

  const handleSimulatePayment = () => {
    setSimulatedPaymentCount(prev => prev + 1);
    setSimulatedRevenue(prev => prev + 25000);
    setJustSimulated(true);
    setTimeout(() => setJustSimulated(false), 2500);
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-600/10 dark:via-slate-900/5 via-slate-100/5 to-blue-400/10 blur-[130px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Badges & Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-6">

          {/* Badge de confiance */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full dark:bg-slate-800/80 bg-slate-50 border border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            <span className="text-xs font-semibold dark:text-slate-300 text-slate-700 tracking-wide">
              🇨🇮 Cocody Belle Côte · FCFA · Pour les entreprises d'ici
            </span>
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight dark:text-white text-slate-900 leading-[1.12]">
            Digitalisez votre entreprise.<br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
              Pilotez-la depuis votre téléphone.
            </span>
          </h1>

          {/* Sous-titre */}
          <p className="text-lg sm:text-xl dark:text-slate-400 text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Je crée des applications web sur mesure pour les PME et PMI ivoiriennes. Stocks, ventes, clients, employés, marges : tout devient clair, en temps réel, accessible partout. Même sans être informaticien.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenBriefModal}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-xl shadow-blue-500/30 transition-all duration-200 transform hover:-translate-y-1 flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Sparkles className="w-5 h-5 text-blue-200 group-hover:rotate-12 transition-transform" />
              <span>Demander un diagnostic gratuit</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onScrollToCaseStudy}
              className="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-semibold dark:text-slate-300 text-slate-700 dark:hover:text-white dark:bg-slate-800 hover:bg-slate-200 dark:border-slate-700 border border-slate-200 backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg"
            >
              <Calculator className="w-5 h-5 text-blue-600" />
              <span>Voir une réalisation concrète</span>
            </button>

            <a
              href="https://wa.me/2250700000000?text=Bonjour%20E-DIGIT,%20je%20souhaite%20un%20rendez-vous%20pour%20mon%20projet%20web%20en%20C%C3%B4te%20d'Ivoire"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-4 rounded-xl text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>WhatsApp Direct</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            </a>
          </div>

          {/* Microcopy */}
          <p className="pt-4 text-xs dark:text-slate-500 text-slate-500 italic">
            30 minutes. Sans engagement. En français simple. On parle de votre activité, pas de technique.
          </p>

          {/* Local Guarantees Row */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs dark:text-slate-400 text-slate-600">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Code source 100% cédé</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Chargement &lt; 1.2s sur 4G Abidjan</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Bureaux à Cocody & Plateau</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Conforme ARTCI CI</span>
            </span>
          </div>
        </div>

        {/* Interactive Floating Product & Live Mockup Showcase */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="relative rounded-2xl p-1 bg-gradient-to-b from-white/20 dark:from-slate-800/20 via-white/5 dark:via-slate-900/5 to-transparent shadow-2xl">
            <div className="rounded-[15px] dark:bg-slate-900/90 bg-slate-50 dark:border-slate-700 border border-slate-200 overflow-hidden backdrop-blur-2xl">

              {/* Browser / App Header Bar */}
              <div className="px-4 py-3 dark:bg-slate-800 bg-white dark:border-slate-700 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-blue-500/80"></div>
                  </div>
                  <span className="text-xs font-mono dark:text-slate-400 text-slate-600 pl-2 hidden sm:inline-block">
                    https://app.entreprise-abidjan.ci/dashboard
                  </span>
                </div>

                {/* View switcher tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg text-xs">
                  <button
                    onClick={() => setActiveTab('fintech')}
                    className={`px-3 py-1 rounded-md font-medium transition-all ${activeTab === 'fintech'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    FinTech & Mobile Money
                  </button>
                  <button
                    onClick={() => setActiveTab('saas')}
                    className={`px-3 py-1 rounded-md font-medium transition-all ${activeTab === 'saas'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    SaaS B2B & Opérations
                  </button>
                  <button
                    onClick={() => setActiveTab('ecommerce')}
                    className={`px-3 py-1 rounded-md font-medium transition-all ${activeTab === 'ecommerce'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    E-Commerce Abidjan
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-600 border border-blue-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    API En Ligne
                  </span>
                </div>
              </div>

              {/* Interactive Dashboard Interior */}
              <div className="p-5 sm:p-6 space-y-6">

                {/* Top Metrics Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-sm">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Volume Aujourd'hui</span>
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                      {formatCurrency(simulatedRevenue, currency)}
                    </div>
                    <div className="text-[11px] text-blue-600 flex items-center gap-1 font-medium">
                      <span>+28.4% vs hier</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-sm">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Transactions Réussies</span>
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                      {simulatedPaymentCount}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      99.8% taux de succès Wave/MoMo
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-sm">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Temps de Réponse API</span>
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                      128 ms
                    </div>
                    <div className="text-[11px] text-blue-600">
                      Serveur Edge Abidjan
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-sm">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Utilisateurs Connectés</span>
                      <Globe2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                      1 420
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Abidjan, San Pedro, Paris
                    </div>
                  </div>
                </div>

                {/* Main Content Area based on Tab */}
                {activeTab === 'fintech' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Live Transactions Feed */}
                    <div className="lg:col-span-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <span>Flux de Paiements Récents (Abidjan)</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            Temps Réel
                          </span>
                        </h4>
                        <span className="text-xs text-slate-500">Mise à jour instantanée</span>
                      </div>

                      <div className="space-y-2">
                        {justSimulated && (
                          <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-between animate-bounce">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-600">
                                W
                              </span>
                              <div>
                                <p className="text-xs font-bold text-slate-900">Nouveau Paiement Wave Reçu !</p>
                                <p className="text-[10px] text-blue-600">Client Cocody Deux Plateaux • Webhook Validé</p>
                              </div>
                            </div>
                            <span className="text-xs font-extrabold text-blue-600 font-mono">
                              +{formatCurrency(25000, currency)}
                            </span>
                          </div>
                        )}

                        <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-600">
                              WAVE
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-700">Facture Proforma #CI-8924</p>
                              <p className="text-[10px] text-slate-500">Kouassi Traiteur • Marcory Zone 4</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-blue-600 font-mono">+{formatCurrency(145000, currency)}</p>
                            <p className="text-[10px] text-slate-500">Il y a 32 sec</p>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-600">
                              OM
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-700">Abonnement Entreprise Annuel</p>
                              <p className="text-[10px] text-slate-500">Société Ivoirienne de BTP • Plateau</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-blue-600 font-mono">+{formatCurrency(350000, currency)}</p>
                            <p className="text-[10px] text-slate-500">Il y a 2 min</p>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-600">
                              MTN
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-700">Commande Gros Anacarde</p>
                              <p className="text-[10px] text-slate-500">Coopérative San Pedro Ouest</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-blue-600 font-mono">+{formatCurrency(780000, currency)}</p>
                            <p className="text-[10px] text-slate-500">Il y a 6 min</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Test Panel */}
                    <div className="p-4 rounded-xl bg-white border border-blue-500/20 flex flex-col justify-between shadow-sm">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">
                            Tester l'Interactivité
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Chaque application web E-DIGIT gère les webhooks Mobile Money en tâche de fond avec tolérance aux pannes réseau.
                        </p>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-[11px] font-mono text-slate-500">
                          <div className="text-blue-600">&gt; POST /api/v1/wave/webhook</div>
                          <div className="text-slate-600">&gt; Status: 200 OK (38ms)</div>
                          <div className="text-blue-600">&gt; Sync: Base PostgreSQL SYSCOHADA</div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={handleSimulatePayment}
                          className="w-full py-2.5 px-3 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Simuler un paiement Wave (+25k)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'saas' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider text-blue-400">Gestion des Stocks</h4>
                      <p className="text-xs text-slate-300">Synchronisation entre entrepôt Vridi Port et dépôts Yopougon.</p>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-blue-500 w-[78%]"></div>
                      </div>
                      <span className="text-[11px] text-slate-400">78% de capacité utilisée</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider text-blue-400">Facturation SYSCOHADA</h4>
                      <p className="text-xs text-slate-300">Génération automatique des bordereaux avec QR Code DGI.</p>
                      <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Conforme DGI Côte d'Ivoire</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider text-blue-400">Portail Client Sécurisé</h4>
                      <p className="text-xs text-slate-300">Accès extranet pour vos partenaires et distributeurs agréés.</p>
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                        99.98% SLA
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 'ecommerce' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                      <div className="text-xs text-slate-400">Panier Moyen Abidjan</div>
                      <div className="text-xl font-bold text-white">{formatCurrency(38500, currency)}</div>
                      <p className="text-[11px] text-blue-400">+14% avec paiement Wave direct</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                      <div className="text-xs text-slate-400">Livraisons Communes</div>
                      <div className="text-xl font-bold text-white">Cocody, Marcory, Yop</div>
                      <p className="text-[11px] text-slate-400">Calcul automatique du coursier</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                      <div className="text-xs text-slate-400">Vitesse de Navigation</div>
                      <div className="text-xl font-bold text-blue-400">0.82 sec</div>
                      <p className="text-[11px] text-slate-400">Sur réseau 3G/4G Orange CI</p>
                    </div>
                  </div>
                )}

                {/* Footer Micro-Bar */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                      <span>Interface 100% PWA Responsive</span>
                    </span>
                    <span className="hidden sm:inline text-slate-600">•</span>
                    <span className="hidden sm:inline flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Chiffrement SSL 256 bits</span>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Construit par E-DIGIT • Abidjan, Côte d'Ivoire
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};