import React, { useState } from 'react';
import { Currency } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Smartphone,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  QrCode,
  Download,
  Zap,
  Activity
} from 'lucide-react';

interface InteractiveLivePreviewProps {
  currency: Currency;
  onOpenBriefModal: () => void;
}

export const InteractiveLivePreview: React.FC<InteractiveLivePreviewProps> = ({
  currency,
  onOpenBriefModal
}) => {
  const [activeModule, setActiveModule] = useState<'payment' | 'cart' | 'erp'>('payment');

  // Payment Simulator State
  const [selectedGateway, setSelectedGateway] = useState<'wave' | 'om' | 'mtn'>('wave');
  const [paymentAmount, setPaymentAmount] = useState(35000);
  const [clientPhone, setClientPhone] = useState('07 88 45 12 90');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  // E-commerce Commune State
  const [selectedCommune, setSelectedCommune] = useState('Cocody (Deux Plateaux, Angré)');
  const [deliveryFee, setDeliveryFee] = useState(2000);
  const cartSubtotal = 45000;
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // ERP State
  const stockLevels = [
    { item: 'Cacao Fèves Grade A (Sacs 60kg)', depot: 'San Pedro Zone Portuaire', qty: 1450, status: 'Optimal' },
    { item: 'Noix de Cajou Brute (Tonnes)', depot: 'Entrepôt Vridi Abidjan', qty: 320, status: 'Attention stock' },
    { item: 'Conditionnements Export', depot: 'Magasin Yopougon Zone Ind.', qty: 8900, status: 'Optimal' }
  ];
  const [erpExportSuccess, setErpExportSuccess] = useState(false);

  const handleTriggerPayment = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
    }, 1200);
  };

  const handleCommuneChange = (commune: string, fee: number) => {
    setSelectedCommune(commune);
    setDeliveryFee(fee);
  };

  const handleExportERP = () => {
    setErpExportSuccess(true);
    setTimeout(() => setErpExportSuccess(false), 3000);
  };

  return (
    <section id="live-demo" className="relative py-24 dark:bg-slate-950 bg-white dark:border-slate-800 border-y border-slate-200 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-96 h-96 bg-blue-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full dark:bg-blue-500/20 bg-blue-500/10 dark:border-blue-500/20 border border-blue-500/20 text-blue-600 text-xs font-bold tracking-wider uppercase">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>Environnement Démo Interactif</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            Touchez du doigt la performance d'une application{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              E-DIGIT
            </span>
          </h2>

          <p className="text-base sm:text-lg dark:text-slate-400 text-slate-600">
            Simulez ci-dessous les flux réels d'une application conçue pour les réalités du marché ivoirien : vitesse foudroyante, webhooks Wave instantanés et gestion des communes d'Abidjan.
          </p>
        </div>

        {/* Demo Device Frame */}
        <div className="max-w-5xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-blue-500/30 via-slate-200 dark:via-slate-700 to-blue-400/30 shadow-2xl">
          <div className="rounded-[22px] dark:bg-slate-900 bg-white dark:border-slate-700 border border-slate-200 overflow-hidden">

            {/* Top Toolbar */}
            <div className="px-5 py-4 dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                <span className="text-xs font-mono dark:text-slate-400 text-slate-600 ml-2 font-medium">
                  demo-sandbox.edigit.ci
                </span>
              </div>

              {/* Module selection buttons */}
              <div className="flex items-center gap-1.5 p-1 dark:bg-slate-700 bg-slate-100 rounded-xl text-xs">
                <button
                  onClick={() => { setActiveModule('payment'); setPaymentStatus('idle'); }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeModule === 'payment'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'dark:text-slate-400 text-slate-500 hover:dark:text-white hover:text-slate-900'
                    }`}
                >
                  1. Encaissement Wave / MoMo
                </button>
                <button
                  onClick={() => setActiveModule('cart')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeModule === 'cart'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'dark:text-slate-400 text-slate-500 hover:dark:text-white hover:text-slate-900'
                    }`}
                >
                  2. Checkout Communes Abidjan
                </button>
                <button
                  onClick={() => setActiveModule('erp')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeModule === 'erp'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'dark:text-slate-400 text-slate-500 hover:dark:text-white hover:text-slate-900'
                    }`}
                >
                  3. ERP Stocks & SYSCOHADA
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-blue-600">
                <Zap className="w-3.5 h-3.5" />
                <span>Latence : 42ms (Abidjan)</span>
              </div>
            </div>

            {/* Sandbox Interior */}
            <div className="p-6 sm:p-8 min-h-[460px] dark:bg-slate-900 bg-white">

              {/* MODULE 1: FINTECH / MOBILE MONEY */}
              {activeModule === 'payment' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

                  {/* Left Form: Payment Trigger */}
                  <div className="md:col-span-7 space-y-5">
                    <div>
                      <h3 className="text-lg font-bold dark:text-white text-slate-900 flex items-center gap-2">
                        <span>Émission d'un Paiement Mobile Money</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-600">
                          Passerelle Directe
                        </span>
                      </h3>
                      <p className="text-xs dark:text-slate-400 text-slate-600 mt-1">
                        Générez un ordre de paiement instantané avec redirection ou notification push sur le smartphone du client.
                      </p>
                    </div>

                    {/* Gateway Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold dark:text-slate-300 text-slate-700">
                        Choisir la passerelle ivoirienne :
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedGateway('wave')}
                          className={`p-3 rounded-xl border text-center transition-all ${selectedGateway === 'wave'
                            ? 'dark:bg-blue-500/15 bg-blue-500/15 dark:border-blue-500 border-blue-500 dark:text-white text-slate-900 shadow-lg shadow-blue-500/10'
                            : 'dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 dark:text-slate-400 text-slate-600 hover:dark:border-blue-500/30 hover:border-blue-500/30'
                            }`}
                        >
                          <div className="text-xs font-bold text-[#1da1f2]">WAVE CI</div>
                          <div className="text-[10px] dark:text-slate-500 text-slate-500 mt-0.5">0% frais client</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedGateway('om')}
                          className={`p-3 rounded-xl border text-center transition-all ${selectedGateway === 'om'
                            ? 'dark:bg-blue-500/15 bg-blue-500/15 dark:border-blue-500 border-blue-500 dark:text-white text-slate-900 shadow-lg shadow-blue-500/10'
                            : 'dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 dark:text-slate-400 text-slate-600 hover:dark:border-blue-500/30 hover:border-blue-500/30'
                            }`}
                        >
                          <div className="text-xs font-bold dark:text-white text-slate-700">Orange Money</div>
                          <div className="text-[10px] dark:text-slate-500 text-slate-500 mt-0.5">OTP & WebPay</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedGateway('mtn')}
                          className={`p-3 rounded-xl border text-center transition-all ${selectedGateway === 'mtn'
                            ? 'dark:bg-blue-500/15 bg-blue-500/15 dark:border-blue-500 border-blue-500 dark:text-white text-slate-900 shadow-lg shadow-blue-500/10'
                            : 'dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 dark:text-slate-400 text-slate-600 hover:dark:border-blue-500/30 hover:border-blue-500/30'
                            }`}>
                          <div className="text-xs font-bold text-slate-700">MTN MoMo</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Push USSD prompt</div>
                        </button>
                      </div>
                    </div>

                    {/* Amount & Phone Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold dark:text-slate-300 text-slate-700">Montant à encaisser :</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 rounded-lg dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 dark:text-white text-slate-900 text-sm font-semibold focus:border-blue-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-bold dark:text-slate-500 text-slate-500">
                            FCFA
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold dark:text-slate-300 text-slate-700">Numéro de téléphone CI :</label>
                        <input
                          type="text"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="07 XX XX XX XX"
                          className="w-full px-3.5 py-2.5 rounded-lg dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 dark:text-white text-slate-900 text-sm font-semibold focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Submit Simulation Button */}
                    <button
                      type="button"
                      onClick={handleTriggerPayment}
                      disabled={paymentStatus === 'processing'}
                      className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {paymentStatus === 'processing' ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Appel API Webhook en cours...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-blue-100" />
                          <span>Tester l'encaissement direct de {formatCurrency(paymentAmount, currency)}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right: Live Device Simulation / Receipt */}
                  <div className="md:col-span-5 p-5 rounded-2xl dark:from-slate-800 dark:to-slate-900 bg-gradient-to-b from-slate-50 to-white dark:border-slate-700 border border-slate-200 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between dark:border-slate-700 border-b border-slate-200 pb-3">
                      <span className="text-xs font-bold dark:text-white text-slate-700 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-blue-600" />
                        <span>Réception Smartphone Client</span>
                      </span>
                      <span className="text-[10px] dark:text-slate-500 text-slate-500 font-mono">Abidjan (+225)</span>
                    </div>

                    {paymentStatus === 'idle' && (
                      <div className="py-10 text-center space-y-3">
                        <div className="w-14 h-14 mx-auto rounded-full dark:bg-slate-800 bg-slate-100 flex items-center justify-center dark:text-slate-400 text-slate-400">
                          <QrCode className="w-7 h-7" />
                        </div>
                        <p className="text-xs dark:text-slate-400 text-slate-600 max-w-xs mx-auto">
                          Cliquez sur le bouton pour simuler l'expérience instantanée de paiement d'un acheteur à Abidjan.
                        </p>
                      </div>
                    )}

                    {paymentStatus === 'processing' && (
                      <div className="py-10 text-center space-y-3">
                        <div className="w-14 h-14 mx-auto rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-600">
                          <RefreshCw className="w-7 h-7 animate-spin" />
                        </div>
                        <p className="text-xs font-semibold dark:text-white text-slate-900">
                          Envoi de la notification push au {clientPhone}...
                        </p>
                        <p className="text-[11px] dark:text-slate-500 text-slate-500">
                          Chiffrement SSL 256 bits vers le serveur {selectedGateway.toUpperCase()} CI
                        </p>
                      </div>
                    )}

                    {paymentStatus === 'success' && (
                      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-3 animate-fade-in">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">Paiement Validé en 1.1s !</h4>
                            <p className="text-[11px] text-blue-600">Rapprochement comptable automatique</p>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-blue-500/20 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>ID Transaction :</span>
                            <span className="font-mono text-slate-900">CI-WAVE-89312</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Montant perçu :</span>
                            <span className="font-bold text-slate-900">{formatCurrency(paymentAmount, currency)}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Statut Webhook :</span>
                            <span className="text-blue-600 font-mono">200 OK (Event captured)</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setPaymentStatus('idle')}
                          className="w-full mt-2 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg transition"
                        >
                          Réinitialiser la démo
                        </button>
                      </div>
                    )}

                    <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 space-y-1 text-[10px] font-mono text-slate-600">
                      <div className="text-slate-500">// Audit Trail E-DIGIT Core Engine</div>
                      <div className="text-blue-600">&gt; DB Insert: transactions_ci</div>
                      <div className="text-blue-500">&gt; SMS & WhatsApp Notification: Triggered</div>
                    </div>
                  </div>

                </div>
              )}

              {/* MODULE 2: E-COMMERCE CHECKOUT */}
              {activeModule === 'cart' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  {/* Left: Cart Summary */}
                  <div className="md:col-span-5 space-y-5">
                    <h3 className="text-lg font-bold dark:text-white text-slate-900 flex items-center gap-2">
                      <span>Récapitulatif de votre commande</span>
                    </h3>
                    <div className="p-4 rounded-2xl dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="dark:text-slate-400 text-slate-600">Sous-total</span>
                        <span className="font-bold dark:text-white text-slate-900">{formatCurrency(cartSubtotal, currency)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="dark:text-slate-400 text-slate-600">Livraison ({selectedCommune.split(' ')[0]})</span>
                        <span className="font-bold dark:text-white text-slate-900">{formatCurrency(deliveryFee, currency)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="dark:text-slate-400 text-slate-600">Frais Wave/Orange Money</span>
                        <span className="font-bold dark:text-white text-slate-900">{formatCurrency(paymentFee, currency)}</span>
                      </div>
                      <div className="pt-3 dark:border-slate-700 border-t border-slate-200 flex justify-between items-center text-base">
                        <span className="font-bold dark:text-white text-slate-900">Total</span>
                        <span className="font-extrabold text-blue-600">{formatCurrency(cartTotal, currency)}</span>
                      </div>
                    </div>

                    <button className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition shadow-lg shadow-blue-500/25">
                      Valider la commande
                    </button>
                  </div>

                  {/* Right: Checkout Form */}
                  <div className="md:col-span-7 space-y-5">
                    <h3 className="text-lg font-bold dark:text-white text-slate-900 flex items-center gap-2">
                      <span>Informations de livraison</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Nom complet"
                        className="px-4 py-3 rounded-xl dark:bg-slate-800 bg-white dark:border-slate-700 border border-slate-200 dark:text-white text-slate-900 text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="email"
                        placeholder="Email professionnel"
                        className="px-4 py-3 rounded-xl dark:bg-slate-800 bg-white dark:border-slate-700 border border-slate-200 dark:text-white text-slate-900 text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { name: 'Cocody (Deux Plateaux, Angré)', fee: 2000, delay: '24h' },
                          { name: 'Yopougon (Tout Yopougon)', fee: 1500, delay: '24h' },
                          { name: 'Plateau (Centre des Affaires)', fee: 1000, delay: '12h' },
                          { name: 'Abobo (Toute commune)', fee: 2500, delay: '48h' }
                        ].map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => handleCommuneChange(c.name, c.fee)}
                            className={`p-3 rounded-xl border text-left transition-all ${selectedCommune === c.name
                              ? 'bg-blue-500/15 border-blue-500 dark:text-white text-slate-900 shadow-lg shadow-blue-500/10'
                              : 'dark:bg-slate-800 bg-slate-50 dark:border-slate-700 border-slate-200 dark:text-slate-400 text-slate-600 hover:border-blue-500/30'
                              }`}
                          >
                            <div className="text-xs font-bold dark:text-white text-slate-900">{c.name}</div>
                            <div className="flex items-center justify-between mt-1 text-[11px] dark:text-slate-500 text-slate-500">
                              <span className="text-blue-600 font-semibold">{formatCurrency(c.fee, currency)}</span>
                              <span>{c.delay}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
              )}

                  {/* MODULE 3: ERP / STOCKS */}
                  {activeModule === 'erp' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                      {/* Left: Stock Overview Table */}
                      <div className="md:col-span-7 space-y-5">
                        <div>
                          <h3 className="text-lg font-bold dark:text-white text-slate-900 flex items-center gap-2">
                            <span>Tableau de bord Stocks SYSCOHADA</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-600">Comptabilité exportable</span>
                          </h3>
                          <p className="text-xs dark:text-slate-400 text-slate-600 mt-1">Gestion multi-dépôts conforme aux normes comptables ouest-africaines.</p>
                        </div>
                        <div className="overflow-x-auto rounded-2xl dark:border-slate-700 border border-slate-200 dark:bg-slate-900 bg-white">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b dark:border-slate-700 border-slate-200 dark:bg-slate-800 bg-slate-50">
                                <th className="p-3 text-left text-xs font-bold dark:text-slate-300 text-slate-700">Article</th>
                                <th className="p-3 text-left text-xs font-bold dark:text-slate-300 text-slate-700">Dépôt</th>
                                <th className="p-3 text-left text-xs font-bold dark:text-slate-300 text-slate-700">Qté</th>
                                <th className="p-3 text-left text-xs font-bold dark:text-slate-300 text-slate-700">Statut</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stockLevels.map((row, idx) => (
                                <tr key={idx} className="border-b dark:border-slate-700 border-slate-100 dark:hover:bg-blue-500/10 hover:bg-blue-50/50 transition-colors">
                                  <td className="p-3 font-medium dark:text-white text-slate-900">{row.item}</td>
                                  <td className="p-3 dark:text-slate-400 text-slate-600">{row.depot}</td>
                                  <td className="p-3 font-mono font-bold text-blue-600">{row.qty}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.status === 'Optimal'
                                      ? 'bg-blue-500/15 text-blue-600'
                                      : 'bg-amber-500/15 text-amber-600'
                                      }`}>
                                      {row.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right: Export Actions */}
                      <div className="md:col-span-5 space-y-5">
                        <h3 className="text-lg font-bold text-slate-900">Actions Rapides</h3>
                        <div className="space-y-3">
                          <button
                            onClick={handleExportERP}
                            disabled={erpExportSuccess}
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-500/30 transition-all flex items-center gap-4 cursor-pointer disabled:opacity-50"
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <Download className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-left flex-1">
                              <div className="text-sm font-bold text-slate-900">Exporter Bilan SYSCOHADA</div>
                              <div className="text-[11px] text-slate-500">PDF + CSV conforme</div>
                            </div>
                            {erpExportSuccess && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

            {/* Bottom callout bar */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-600 text-center sm:text-left">
                  <span className="font-semibold text-slate-900">Impressionné par cette fluidité ?</span> Nous concevons votre propre système avec le même niveau de perfection.
                </div>
                <button
                  onClick={onOpenBriefModal}
                  className="shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>Demander une démo personnalisée</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>
    </section>
  );
};