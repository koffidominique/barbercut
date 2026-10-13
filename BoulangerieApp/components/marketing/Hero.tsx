"use client";

import Link from "next/link";
import { Zap, Activity, Infinity, Mountain, BarChart3, X } from "lucide-react";
import { useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import { FullDashboardCharts } from "@/components/dashboard/FullDashboardCharts";
import { BakeryImageCard } from "@/components/examples/c-card-8";

const services = [
    {
        title: "Gestion du stock",
        description: "Suivez farine, levure, sucre et ingrédients avant tout risque de rupture.",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",
        video: "/videos/analyzing-business-data-animation-gif-download-9435609.mp4",
    },
    {
        title: "Caisse & paiements",
        description: "Contrôlez les ventes cash, mobile money et crédit à partir d’un seul tableau de bord.",
        image: "/illustrations/service-sales.svg",
        video: "/videos/e-money-animation-gif-download-11971516.mp4",
    },
    {
        title: "Production & planification",
        description: "Organisez les commandes, les capacités de cuisson et les objectifs de fabrication.",
        image: "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=900&q=85",
        video: "/videos/business-increase-animation-gif-download-10318409.mp4",
    },
];

export function Hero() {
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

    // Données mockées pour les graphiques du modal
    const demoStats = {
        caByHour: [
            { hour: "07h", value: 15000 },
            { hour: "08h", value: 28000 },
            { hour: "09h", value: 35000 },
            { hour: "10h", value: 42000 },
            { hour: "11h", value: 38000 },
            { hour: "12h", value: 29500 },
        ],
        caByDay: [
            { date: "Lun", value: 120000 },
            { date: "Mar", value: 145000 },
            { date: "Mer", value: 132000 },
            { date: "Jeu", value: 158000 },
            { date: "Ven", value: 187500 },
            { date: "Sam", value: 215000 },
            { date: "Dim", value: 95000 },
        ],
        caByCategory: [
            { category: "Pains", value: 320000 },
            { category: "Viennoiseries", value: 450000 },
            { category: "Pâtisseries", value: 280000 },
            { category: "Sandwichs", value: 200000 },
        ],
        caByProduct: [
            { name: "Baguette", value: 180000 },
            { name: "Croissant", value: 127500 },
            { name: "Pain Chocolat", value: 117000 },
            { name: "Brioche", value: 85000 },
            { name: "Éclair", value: 68000 },
        ],
        stockEvolution: [
            { date: "01/10", stock: 5200 },
            { date: "02/10", stock: 4800 },
            { date: "03/10", stock: 5100 },
            { date: "04/10", stock: 4500 },
            { date: "05/10", stock: 4900 },
        ],
        salesEvolution: [
            { month: "01/10", sales: 120000 },
            { month: "02/10", sales: 145000 },
            { month: "03/10", sales: 132000 },
            { month: "04/10", sales: 158000 },
            { month: "05/10", sales: 187500 },
        ],
        marginEvolution: [
            { date: "01/10", value: 32 },
            { date: "02/10", value: 34 },
            { date: "03/10", value: 31 },
            { date: "04/10", value: 35 },
            { date: "05/10", value: 36 },
        ],
        lossEvolution: [
            { date: "01/10", value: 8500 },
            { date: "02/10", value: 7200 },
            { date: "03/10", value: 9100 },
            { date: "04/10", value: 6800 },
            { date: "05/10", value: 5900 },
        ],
        caByStore: [
            { name: "Plateau", value: 680000 },
            { name: "Cocody", value: 570000 },
        ],
        caByChannel: [
            { channel: "Sur place", value: 450000 },
            { channel: "Livraison", value: 320000 },
            { channel: "Click & Collect", value: 280000 },
        ],
        totals: { caDay: 187500, caWeek: 850000, caMonth: 1250000, linesDay: 58, ticketsDay: 42, ticketsMonth: 287 },
        items: { linesMonth: 1245, unitsMonth: 3120, revenueMonth: 1250000, profitMonth: 375000 },
        basket: 4464,
        grossMargin: 30,
        topSellers: [],
        topProfitable: [],
        unsoldCount: 3,
        hasSales: true,
        lowStockProducts: [],
        criticalMaterials: [],
        productionToday: 450,
        orders: { pending: 8, toPrepare: 12, toDeliver: 5, inDelivery: 3 },
        financials: { returns: 2, losses: 15000, waste: 8500, expenses: 245000, cashIn: 172000, receivables: 85000, payables: 120000, cashBalance: 345000 },
        staffPerformance: [],
        boutiquePerformance: [],
        cashRegisters: [],
    };

    return (
        <MotionConfig reducedMotion="user">
            <section className="relative px-6 py-12 lg:px-40 lg:py-20 overflow-hidden">
                {/* Background Blur */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

                <div className="layout-content-container max-w-[1200px] mx-auto flex flex-col items-center text-center">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 mb-8 backdrop-blur-sm">
                        <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-xs font-bold text-primary tracking-wide uppercase">La solution premium pour boulangeries ivoiriennes</span>
                    </motion.div>

                    <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }} className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-6 max-w-[900px] dark:text-white text-neutral-900">
                        Faites croître votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">boulangerie</span> avec plus de rentabilité
                    </motion.h1>

                    <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }} className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed max-w-[700px] mb-10 text-balance">
                        Un outil de gestion pensé pour les boulangers exigeants qui veulent <span className="text-primary font-bold">optimiser les ventes, maîtriser le stock et gagner du temps chaque jour</span>.
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }} className="flex flex-wrap justify-center gap-4 mb-8 w-full">
                        <Link
                            href="/demande-acces"
                            className="flex items-center justify-center h-12 px-8 rounded-full bg-primary hover:bg-emerald-400 text-[#003322] text-base font-bold transition-all transform hover:-translate-y-0.5 shadow-[0_12px_30px_rgba(16,185,129,0.35)]"
                        >
                            Demander une démonstration
                        </Link>
                        <button
                            onClick={() => setIsStatsModalOpen(true)}
                            className="flex items-center justify-center h-12 px-8 rounded-full border border-primary/30 dark:border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-base font-bold transition-all backdrop-blur-sm gap-2"
                        >
                            <BarChart3 className="h-5 w-5" />
                            Voir les statistiques
                        </button>
                        <Link
                            href="#features"
                            className="flex items-center justify-center h-12 px-8 rounded-full border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-900 dark:text-white text-base font-bold transition-all backdrop-blur-sm"
                        >
                            Découvrir la solution
                        </Link>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-6 mb-16 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                        <span className="px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">+120 boulangeries accompagnées</span>
                        <span className="px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">+35% de marge sur la production</span>
                        <span className="px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">Accompagnement local</span>
                    </div>

                    {/* Dashboard Preview */}
                    <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="relative w-full max-w-[1000px] group perspective-[2000px]">
                        <div className="relative w-full aspect-[16/9] bg-neutral-900 rounded-2xl overflow-hidden border border-white/10 transform transition-all duration-700 hover:rotate-x-2 rotate-x-6 shadow-2xl dark:shadow-[0_20px_50px_rgba(16,185,129,0.15)] shadow-neutral-200">
                            <div className="absolute inset-0 bg-[#0a0a0a] p-6 flex flex-col gap-4">
                                <div className="h-8 w-full flex justify-between items-center border-b border-white/5 pb-4">
                                    <div className="flex gap-2">
                                        <div className="size-3 rounded-full bg-[#ff5f57]"></div>
                                        <div className="size-3 rounded-full bg-[#febc2e]"></div>
                                        <div className="size-3 rounded-full bg-[#28c840]"></div>
                                    </div>
                                    <div className="w-1/3 h-2 bg-white/10 rounded-full"></div>
                                </div>
                                <div className="flex-1 grid grid-cols-12 gap-4 mt-2">
                                    <div className="hidden sm:flex col-span-2 flex-col gap-3">
                                        <div className="h-8 w-full bg-white/5 rounded-lg"></div>
                                        <div className="h-8 w-3/4 bg-white/5 rounded-lg"></div>
                                        <div className="h-8 w-full bg-white/5 rounded-lg"></div>
                                    </div>
                                    <div className="col-span-12 sm:col-span-7 flex flex-col gap-4">
                                        <div className="h-40 w-full bg-gradient-to-br from-white/5 to-transparent rounded-xl border border-white/5 p-4 relative overflow-hidden group-hover:border-primary/20 transition-colors">
                                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary/10 to-transparent clip-path-polygon"></div>
                                            <svg className="absolute bottom-0 left-0 right-0 w-full h-full text-primary opacity-20" preserveAspectRatio="none" viewBox="0 0 100 50">
                                                <path d="M0,50 Q25,10 50,30 T100,10 V50 H0 Z" fill="currentColor"></path>
                                            </svg>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="h-32 flex-1 bg-white/5 rounded-xl border border-white/5"></div>
                                            <div className="h-32 flex-1 bg-white/5 rounded-xl border border-white/5"></div>
                                        </div>
                                    </div>
                                    <div className="hidden sm:block col-span-3 flex-col gap-3">
                                        <div className="h-full w-full bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col gap-2">
                                            <div className="size-10 rounded-full bg-primary/20 mb-2"></div>
                                            <div className="h-2 w-1/2 bg-white/20 rounded-full"></div>
                                            <div className="h-2 w-3/4 bg-white/10 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -inset-4 bg-primary/20 blur-[50px] -z-10 rounded-[3rem] opacity-50 dark:opacity-100 transition-opacity"></div>
                    </motion.div>
                </div>

                <div className="mt-20 max-w-[1200px] mx-auto">
                    <div className="mb-8 text-center">
                        <p className="text-sm font-medium text-neutral-500 mb-3 uppercase tracking-widest">Visuelles de l’application</p>
                        <h2 className="text-3xl md:text-5xl font-black dark:text-white text-neutral-900">Une solution pensée pour les boulangers</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.55 }} className="overflow-hidden rounded-[2rem] border border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-xl">
                            {/* eslint-disable-next-line @next/next/no-img-element -- SVG vectoriel local : next/image ne peut pas l'optimiser (dangerouslyAllowSVG) */}
                            <img
                                src="/illustrations/bakery-dashboard.svg"
                                alt="Interface de gestion de boulangerie"
                                className="h-full w-full object-cover"
                            />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.55, delay: 0.12 }} className="overflow-hidden rounded-[2rem] shadow-xl">
                            <BakeryImageCard
                                image="/illustrations/baker-team.svg"
                                alt="Équipe de boulangers en pleine production"
                                title="Une équipe alignée"
                                description="De la préparation aux ventes, suivez la journée de votre fournil."
                            />
                        </motion.div>
                    </div>

                    <div className="overflow-x-auto pb-4">
                        <div className="flex gap-6 min-w-max md:justify-center">
                            {services.map((service) => (
                                <motion.div
                                    key={service.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.45 }}
                                    className="group w-[330px] snap-start overflow-hidden rounded-[2rem] border border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-lg transition-transform duration-300 hover:-translate-y-1"
                                >
                                    <div className="overflow-hidden">
                                        <video
                                            src={service.video}
                                            poster={service.image}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            preload="metadata"
                                            aria-label={service.title}
                                            className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-xl font-bold dark:text-white text-neutral-900 mb-2">{service.title}</h3>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-300">{service.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Social Proof */}
                <div className="mt-20 py-10 border-y border-white/5 bg-white/50 dark:bg-black/20">
                    <div className="max-w-[1200px] mx-auto px-6 text-center">
                        <p className="text-sm font-medium text-neutral-500 mb-8 uppercase tracking-widest">Déjà adopté par des boulangeries modernes</p>
                        <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="flex items-center gap-2 group">
                                <Zap className="text-3xl group-hover:text-primary transition-colors h-8 w-8" />
                                <span className="text-xl font-bold dark:text-white text-neutral-900">Pain d’Or</span>
                            </div>
                            <div className="flex items-center gap-2 group">
                                <Activity className="text-3xl group-hover:text-primary transition-colors h-8 w-8" />
                                <span className="text-xl font-bold dark:text-white text-neutral-900">Boulangerie Koffi</span>
                            </div>
                            <div className="flex items-center gap-2 group">
                                <Infinity className="text-3xl group-hover:text-primary transition-colors h-8 w-8" />
                                <span className="text-xl font-bold dark:text-white text-neutral-900">Le Petit Délice</span>
                            </div>
                            <div className="flex items-center gap-2 group">
                                <Mountain className="text-3xl group-hover:text-primary transition-colors h-8 w-8" />
                                <span className="text-xl font-bold dark:text-white text-neutral-900">Côte Boulangerie</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL STATISTIQUES */}
                {isStatsModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsStatsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-7xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-neutral-900 shadow-2xl"
                        >
                            {/* Header du modal */}
                            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-neutral-200 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm">
                                <div>
                                    <h2 className="text-2xl font-black dark:text-white text-neutral-900">Statistiques en temps réel</h2>
                                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">Toutes les performances de votre boulangerie en un coup d’œil</p>
                                </div>
                                <button
                                    onClick={() => setIsStatsModalOpen(false)}
                                    className="p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                                >
                                    <X className="h-6 w-6 dark:text-white text-neutral-900" />
                                </button>
                            </div>

                            {/* Contenu des graphiques */}
                            <div className="p-6">
                                <FullDashboardCharts metrics={demoStats} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </section>
        </MotionConfig>
    );
}