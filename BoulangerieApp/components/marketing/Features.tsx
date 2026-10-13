"use client";

import { LineChart, PackageCheck, Wallet, Moon, Activity } from "lucide-react";
import { MotionConfig, motion } from "framer-motion";
import { FEATURES_LIST } from "@/lib/constants";
import { BakeryWorkflowCard } from "@/components/examples/c-card-7";

export function Features() {
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case "LineChart": return <LineChart className="text-4xl text-primary mb-4 bg-primary/10 p-3 rounded-xl box-content h-8 w-8" />;
            case "PackageCheck": return <PackageCheck className="text-4xl text-primary mb-4 bg-primary/10 p-3 rounded-xl box-content h-8 w-8" />;
            case "Wallet": return <Wallet className="text-4xl text-primary mb-4 bg-primary/10 p-3 rounded-xl box-content h-8 w-8" />;
            default: return <Activity className="text-4xl text-primary mb-4 bg-primary/10 p-3 rounded-xl box-content h-8 w-8" />;
        }
    };

    return (
        <MotionConfig reducedMotion="user">
            <section className="py-20 px-6 lg:px-40" id="features">
                <div className="layout-content-container max-w-[1200px] mx-auto">
                    <div className="mb-12">
                        <h2 className="text-3xl md:text-5xl font-black mb-4 dark:text-white text-neutral-900">Tout ce qu’il faut pour piloter une boulangerie moderne</h2>
                        <p className="text-lg text-neutral-500 max-w-[700px]">Suivez vos ventes, maîtrisez les matières premières, évitez les ruptures de stock et prenez de meilleures décisions commerciales chaque jour.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
                        {/* Dynamic Features Loop */}
                        {FEATURES_LIST.map((feature, idx) => (
                            <motion.div key={feature.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45, delay: idx * 0.08 }} className={`glass-card p-8 rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors ${idx === 0 ? "md:col-span-2" : ""}`}>
                                {getIcon(feature.icon)}
                                <h3 className="text-2xl font-bold mb-2 dark:text-white text-neutral-900">{feature.title}</h3>
                                <p className="text-neutral-400">{feature.description}</p>
                                {/* Visual embellishments based on ID for demo purposes */}
                                {feature.id === "tracking" && (
                                    <div className="mt-8 relative h-40 w-full bg-black/40 rounded-xl border border-white/10 overflow-hidden">
                                        <div className="absolute bottom-0 left-0 right-0 h-3/4 flex items-end justify-around px-4 pb-2 gap-2">
                                            <div className="w-full bg-primary/40 h-[40%] rounded-t-sm group-hover:h-[60%] transition-all duration-500"></div>
                                            <div className="w-full bg-primary/60 h-[70%] rounded-t-sm group-hover:h-[90%] transition-all duration-500 delay-75"></div>
                                            <div className="w-full bg-primary/30 h-[50%] rounded-t-sm group-hover:h-[40%] transition-all duration-500 delay-100"></div>
                                            <div className="w-full bg-primary/80 h-[80%] rounded-t-sm group-hover:h-[95%] transition-all duration-500 delay-150"></div>
                                            <div className="w-full bg-primary/50 h-[60%] rounded-t-sm group-hover:h-[75%] transition-all duration-500 delay-200"></div>
                                        </div>
                                    </div>
                                )}
                                {feature.id === "diet" && (
                                    <div className="mt-6 flex gap-2">
                                        <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center text-xs font-bold dark:text-white text-neutral-900">75%</div>
                                        <div className="flex flex-col justify-center gap-1">
                                            <div className="h-2 w-20 bg-white/10 rounded-full"></div>
                                            <div className="h-2 w-12 bg-white/10 rounded-full"></div>
                                        </div>
                                    </div>
                                )}
                                {feature.id === "payments" && (
                                    <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="h-3 w-8 bg-white/20 rounded"></div>
                                            <div className="h-3 w-12 bg-primary/40 rounded"></div>
                                        </div>
                                        <div className="h-8 w-full bg-white/10 rounded mb-2"></div>
                                        <div className="h-8 w-1/2 bg-primary rounded flex items-center justify-center text-[10px] font-bold text-black">Pay Now</div>
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5, delay: 0.2 }} className="md:col-span-1">
                            <BakeryWorkflowCard />
                        </motion.div>

                        {/* Hardcoded Dark Mode Feature (Visual heavy) */}
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5 }} className="md:col-span-2 relative glass-card p-8 rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors">
                            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center h-full">
                                <div>
                                    <Moon className="text-4xl text-primary mb-4 bg-primary/10 p-3 rounded-xl box-content h-8 w-8" />
                                    <h3 className="text-2xl font-bold mb-2 dark:text-white text-neutral-900">Interface de travail premium</h3>
                                    <p className="text-neutral-400">Un espace de gestion fluide, lisible et optimisé pour les équipes de production, de vente et de comptabilité.</p>
                                </div>
                                <div className="relative bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-lg group-hover:-translate-y-2 transition-transform">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-bold dark:text-white text-neutral-900">Settings</span>
                                        <div className="w-10 h-5 bg-primary rounded-full relative">
                                            <div className="absolute right-1 top-1 w-3 h-3 bg-black rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-2 w-full bg-neutral-100 dark:bg-white/10 rounded"></div>
                                        <div className="h-2 w-2/3 bg-neutral-100 dark:bg-white/10 rounded"></div>
                                        <div className="h-2 w-3/4 bg-neutral-100 dark:bg-white/10 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </MotionConfig>
    );
}
