
import React, { useState, useMemo } from 'react';
import { Currency } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Calculator,
  Clock,
  Check,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

interface ProjectEstimatorProps {
  currency: Currency;
  onOpenBriefModalWithData: (data: any) => void;
}

export const ProjectEstimator: React.FC<ProjectEstimatorProps> = ({
  currency,
  onOpenBriefModalWithData
}) => {
  // Selection states
  const [projectType, setProjectType] = useState<'mvp' | 'saas' | 'ecommerce' | 'erp' | 'pwa'>('saas');

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'wave_om',
    'dashboard',
    'whatsapp_alerts'
  ]);

  const [deliverySpeed, setDeliverySpeed] = useState<'standard' | 'express' | 'flexible'>('standard');
  const [maintenancePlan, setMaintenancePlan] = useState<'included' | 'pro6' | 'enterprise12'>('pro6');

  // Definitions
  const projectTypes = [
    {
      id: 'mvp',
      name: 'MVP Startup Rapide',
      basePrice: 2450000,
      baseWeeks: 3.5,
      desc: 'Idéal pour valider un nouveau concept sur le marché ivoirien'
    },
    {
      id: 'saas',
      name: 'Plateforme SaaS B2B',
      basePrice: 4800000,
      baseWeeks: 6,
      desc: 'Gestion d\'abonnements, multi-utilisateurs et portail client'
    },
    {
      id: 'ecommerce',
      name: 'E-Commerce & Marketplace',
      basePrice: 5200000,
      baseWeeks: 7,
      desc: 'Catalogue haute vitesse, paniers optimisés et dispatching'
    },
    {
      id: 'erp',
      name: 'ERP & Logiciel Métier',
      basePrice: 7500000,
      baseWeeks: 9,
      desc: 'Centralisation des flux, stocks, flottes et finances SYSCOHADA'
    },
    {
      id: 'pwa',
      name: 'Web App PWA Terrain',
      basePrice: 3800000,
      baseWeeks: 5,
      desc: 'Mobile-first résilient avec fonctionnement hors-ligne'
    }
  ];

  const optionalFeatures = [
    {
      id: 'wave_om',
      name: 'Paiement Wave, Orange & MTN',
      price: 650000,
      desc: 'Webhooks directs, réconciliation et QR codes',
      recommended: true
    },
    {
      id: 'dashboard',
      name: 'Tableaux de Bord & Export SYSCOHADA',
      price: 500000,
      desc: 'Métriques en temps réel et exports Excel / PDF',
      recommended: true
    },
    {
      id: 'whatsapp_alerts',
      name: 'Alertes Automatiques WhatsApp Business',
      price: 450000,
      desc: 'Confirmations de commandes et notifications clients instantanées',
      recommended: true
    },
    {
      id: 'offline_mode',
      name: 'Mode Hors-Ligne & Sync PWA',
      price: 600000,
      desc: 'Fonctionne même sans connexion internet dans l\'intérieur du pays'
    },
    {
      id: 'multi_roles',
      name: 'Gestion Multi-Rôles Granulaire',
      price: 400000,
      desc: 'Super admin, managers, agents terrain et accès clients isolés'
    },
    {
      id: 'otp_sms',
      name: 'Double Authentification OTP SMS CI',
      price: 350000,
      desc: 'Vérification par code SMS sur numéros Orange, MTN et Moov'
    }
  ];

  const speeds = [
    { id: 'flexible', name: 'Planifié (8 à 12 sem.)', multiplier: 0.95, weeksMultiplier: 1.3, badge: 'Économique' },
    { id: 'standard', name: 'Agile Standard (5 à 8 sem.)', multiplier: 1.0, weeksMultiplier: 1.0, badge: 'Recommandé' },
    { id: 'express', name: 'Sprint Express (3 à 5 sem.)', multiplier: 1.25, weeksMultiplier: 0.65, badge: 'Équipe Dédiée' }
  ];

  const maintenances = [
    { id: 'included', name: 'Garantie 3 Mois (Incluse)', price: 0, desc: 'Correction de bugs & support réactif' },
    { id: 'pro6', name: 'Support & Évolutions 6 Mois', price: 550000, desc: 'Astreinte prioritaire + 10h d\'évolutions mensuelles' },
    { id: 'enterprise12', name: 'SLA Haute Disponibilité 12 Mois', price: 1200000, desc: 'Intervention < 1h 24/7 + sauvegardes redondées' }
  ];

  const toggleFeature = (id: string) => {
    if (selectedFeatures.includes(id)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== id));
    } else {
      setSelectedFeatures([...selectedFeatures, id]);
    }
  };

  // Calculation
  const calculation = useMemo(() => {
    const selectedTypeObj = projectTypes.find(t => t.id === projectType) || projectTypes[1];
    const featuresCost = selectedFeatures.reduce((acc, featId) => {
      const feat = optionalFeatures.find(f => f.id === featId);
      return acc + (feat ? feat.price : 0);
    }, 0);

    const speedObj = speeds.find(s => s.id === deliverySpeed) || speeds[1];
    const maintObj = maintenances.find(m => m.id === maintenancePlan) || maintenances[0];

    const subtotal = (selectedTypeObj.basePrice + featuresCost) * speedObj.multiplier;
    const total = Math.round(subtotal + maintObj.price);
    const estimatedWeeks = Math.max(3, Math.round(selectedTypeObj.baseWeeks * speedObj.weeksMultiplier));

    return {
      totalFCFA: total,
      totalEUR: Math.round(total / 655.957),
      estimatedWeeks,
      selectedTypeName: selectedTypeObj.name,
      speedName: speedObj.name
    };
  }, [projectType, selectedFeatures, deliverySpeed, maintenancePlan]);

  const handleSendToModal = () => {
    onOpenBriefModalWithData({
      projectType: calculation.selectedTypeName,
      features: selectedFeatures,
      estimatedBudgetFCFA: calculation.totalFCFA,
      estimatedWeeks: calculation.estimatedWeeks,
      deliverySpeed,
      maintenancePlan
    });
  };

  return (
    <section id="estimateur" className="relative py-24 lg:py-32 dark:bg-slate-950 bg-white overflow-hidden">
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs font-bold tracking-wider uppercase">
            <Calculator className="w-3.5 h-3.5" />
            <span>Simulateur Transparent & Sans Engagement</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            Estimez le budget de votre application web{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              en 60 secondes
            </span>
          </h2>

          <p className="text-base sm:text-lg dark:text-slate-400 text-slate-600">
            Fini le flou tarifaire. Obtenez instantanément une projection budgétaire réaliste basée sur nos barèmes de développement en Côte d'Ivoire.
          </p>
        </div>

        {/* Main Grid: Configurator on Left, Live Quote Summary on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Configurator Form */}
          <div className="lg:col-span-7 space-y-8 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 backdrop-blur-xl shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 text-xs flex items-center justify-center font-extrabold">1</span>
                  <span>Type d'Application Web</span>
                </label>
                <span className="text-xs text-slate-400">Fondation architecturale</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projectTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setProjectType(type.id as any)}
                    className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${projectType === type.id
                      ? 'bg-blue-500/15 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-300 text-slate-600'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{type.name}</span>
                      {projectType === type.id && (
                        <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{type.desc}</p>
                    <div className="mt-2 text-xs font-bold text-blue-600 font-mono">
                      Dès {formatCurrency(type.basePrice, currency)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Modules & Features */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 text-xs flex items-center justify-center font-extrabold">2</span>
                  <span>Fonctionnalités & Modules Clés</span>
                </label>
                <span className="text-xs text-slate-400">Cochez vos priorités</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {optionalFeatures.map((feat) => {
                  const isChecked = selectedFeatures.includes(feat.id);
                  return (
                    <button
                      key={feat.id}
                      type="button"
                      onClick={() => toggleFeature(feat.id)}
                      className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${isChecked
                        ? 'bg-blue-500/15 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">{feat.name}</span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 ${isChecked ? 'bg-blue-500 text-white' : 'border border-slate-400'
                          }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{feat.desc}</p>
                      <div className="mt-2 text-[11px] font-bold text-blue-600 font-mono">
                        +{formatCurrency(feat.price, currency)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Speed & Delivery Pace */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 text-xs flex items-center justify-center font-extrabold">3</span>
                <span>Délai de Livraison Souhaité</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {speeds.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => setDeliverySpeed(sp.id as any)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${deliverySpeed === sp.id
                      ? 'bg-blue-500/20 border-blue-500 text-slate-900 shadow-md'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-1">
                      {sp.badge}
                    </div>
                    <div className="text-xs font-bold text-slate-900">{sp.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Maintenance Plan */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 text-xs flex items-center justify-center font-extrabold">4</span>
                <span>Garantie & Maintenance Après Mise en Ligne</span>
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {maintenances.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMaintenancePlan(m.id as any)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${maintenancePlan === m.id
                      ? 'bg-blue-500/15 border-blue-500'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                      }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{m.name}</div>
                      <div className="text-[11px] text-slate-500">{m.desc}</div>
                    </div>
                    <div className="text-xs font-bold font-mono text-blue-600">
                      {m.price === 0 ? 'Inclus' : `+${formatCurrency(m.price, currency)}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Sticky Summary Card on Right */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xl relative overflow-hidden">

              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] pointer-events-none" />

              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Estimation Prévisionnelle
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-600 font-bold">
                    VALIDITÉ IMMÉDIATE
                  </span>
                </div>

                {/* Big Estimated Price */}
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">Investissement estimé :</div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 font-['Space_Grotesk']">
                    {formatCurrency(calculation.totalFCFA, currency)}
                  </div>
                  {currency === 'FCFA' && (
                    <div className="text-xs text-slate-500 font-mono">
                      (Équivalent approx. ~{calculation.totalEUR.toLocaleString('fr-FR')} € HT)
                    </div>
                  )}
                </div>

                {/* Timeline badge */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Délai estimé de livraison</div>
                      <div className="text-[11px] text-slate-500">Méthodologie agile par sprints</div>
                    </div>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 font-mono bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-500/30">
                    {calculation.estimatedWeeks} semaines
                  </div>
                </div>

                {/* Breakdown List */}
                <div className="space-y-2.5 text-xs border-y border-slate-200 py-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Base applicative :</span>
                    <span className="font-semibold text-slate-900">{calculation.selectedTypeName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Modules optionnels cochés :</span>
                    <span className="font-semibold text-blue-600">{selectedFeatures.length} actif(s)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Rythme d'ingénierie :</span>
                    <span className="font-semibold text-slate-900">{calculation.speedName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Code source & IP :</span>
                    <span className="font-semibold text-blue-600">100% Cédé au client</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Échelonnement recommandé :</span>
                    <span className="font-mono text-slate-700">40% / 30% / 30%</span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleSendToModal}
                    className="w-full py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Recevoir ce Devis par WhatsApp / Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={`https://wa.me/2250700000000?text=Bonjour%20E-DIGIT,%20j'ai%20simul%C3%A9%20mon%20projet%20${encodeURIComponent(calculation.selectedTypeName)}%20pour%20un%20budget%20d'environ%20${calculation.totalFCFA}%20FCFA.%20Pouvons-nous%20en%20parler%20?`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Envoyer cette simulation sur WhatsApp (+225)</span>
                  </a>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Devis formel garanti sous 24h ouvrées</span>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};