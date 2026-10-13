"use client";

import { Check } from "lucide-react";
import { MotionConfig, motion } from "framer-motion";
import { PRICING_PLANS } from "@/lib/constants";

export function Pricing() {
    return (
        <MotionConfig reducedMotion="user">
            <section className="py-20 px-6 lg:px-40" id="pricing">
                <div className="layout-content-container max-w-[1200px] mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-black mb-4 dark:text-white text-neutral-900">Des formules pensées pour votre activité</h2>
                    <p className="text-lg text-neutral-500 mb-16 max-w-[700px] mx-auto">Que vous soyez une petite boulangerie familiale ou une boutique à forte cadence, nous vous accompagnons avec une solution pensée pour la croissance.</p>

                    <div className="grid md:grid-cols-3 gap-8 items-start">
                        {PRICING_PLANS.map((plan) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 22 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.15 }}
                                transition={{ duration: 0.5, delay: plan.isPopular ? 0.1 : 0 }}
                                className={`relative p-8 rounded-3xl flex flex-col gap-6 text-left transition-all duration-300 
                ${plan.isPopular
                                        ? "border-2 border-primary bg-[#062e1e] shadow-[0_0_40px_rgba(16,185,129,0.15)] md:scale-105 z-10 dark:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] shadow-emerald-100 ring-1 ring-primary/50"
                                        : "border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-neutral-50 dark:hover:bg-white/10"
                                    }`}
                            >
                                {plan.isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}

                                <div>
                                    <h3 className={`text-xl font-bold ${plan.isPopular ? "text-primary" : "dark:text-white text-neutral-900"}`}>
                                        {plan.name}
                                    </h3>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className={`text-4xl font-black ${plan.isPopular ? "text-white" : "dark:text-white text-neutral-900"}`}>
                                            {plan.price.toLocaleString("fr-CI")}
                                        </span>
                                        <span className={plan.isPopular ? "text-neutral-400" : "text-neutral-500"}>XOF</span>
                                    </div>
                                </div>

                                <p className={`text-sm h-10 ${plan.isPopular ? "text-neutral-300" : "text-neutral-400"}`}>
                                    {plan.description}
                                </p>

                                <a
                                    href={`/demande-acces?plan=${plan.id}`}
                                    className={`w-full py-3 rounded-xl font-bold transition-colors text-center inline-flex items-center justify-center
                    ${plan.isPopular
                                            ? "bg-primary hover:bg-[#00cc6d] text-black shadow-lg shadow-primary/20"
                                            : "border border-neutral-200 dark:border-white/20 hover:bg-neutral-100 dark:hover:bg-white/10 dark:text-white text-neutral-900"
                                        }`}
                                >
                                    {plan.buttonText}
                                </a>

                                <ul className="space-y-3 text-sm font-medium">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className={`flex gap-2 ${plan.isPopular ? "text-white" : "text-neutral-600 dark:text-neutral-300"}`}>
                                            <Check className="text-primary h-5 w-5 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }} className="mt-16 rounded-[2rem] border border-primary/20 bg-gradient-to-r from-primary/10 via-transparent to-cyan-400/10 p-8 md:p-12 text-left shadow-[0_20px_60px_rgba(16,185,129,0.12)]">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="max-w-[560px]">
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-3">Devis sur mesure</p>
                                <h3 className="text-2xl md:text-4xl font-black dark:text-white text-neutral-900 mb-3">Besoin d’une solution adaptée à votre boulangerie ?</h3>
                                <p className="text-neutral-600 dark:text-neutral-300 text-lg">Nous vous accompagnons pour définir le bon module, la bonne mise en place et le bon accompagnement pour votre activité.</p>
                            </div>

                            <div className="flex flex-wrap gap-3 md:justify-end">
                                <a
                                    href="/demande-acces?plan=enterprise"
                                    className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary hover:bg-emerald-400 text-[#003322] text-base font-bold transition-all shadow-[0_12px_30px_rgba(16,185,129,0.35)]"
                                >
                                    Demander un devis
                                </a>
                                <a
                                    href="/auth/login"
                                    className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-neutral-900 dark:text-white text-base font-bold transition-all"
                                >
                                    Déjà client ? Connexion
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </MotionConfig>
    );
}
