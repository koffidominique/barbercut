import React from 'react';
import { motion } from "framer-motion";
import { AlertCircle, TrendingDown, FileText, Package, Clock } from 'lucide-react';

export const ProblemSection: React.FC = () => {
    const painPoints = [
        {
            icon: <TrendingDown className="w-6 h-6 text-blue-600" />,
            text: "Vous découvrez vos pertes en fin de mois, jamais à temps pour réagir."
        },
        {
            icon: <FileText className="w-6 h-6 text-blue-600" />,
            text: "Vos stocks, vos ventes et vos clients vivent sur des cahiers, des fichiers Excel et des messages WhatsApp."
        },
        {
            icon: <Package className="w-6 h-6 text-blue-600" />,
            text: "Vous ne savez pas quel produit, quel employé, quelle boutique vous fait vraiment gagner de l'argent."
        },
        {
            icon: <AlertCircle className="w-6 h-6 text-blue-600" />,
            text: "Vous voulez digitaliser, mais les logiciels importés sont trop chers, trop compliqués, inadaptés au FCFA et à votre réalité."
        },
        {
            icon: <Clock className="w-6 h-6 text-blue-600" />,
            text: "Chaque mois qui passe, c'est du temps, de l'argent et des opportunités perdus."
        }
    ];

    return (
        <section className="relative py-24 lg:py-32 overflow-hidden dark:bg-slate-900/50 bg-slate-50 dark:border-slate-800 border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-3xl mx-auto text-center space-y-6"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold dark:text-white text-slate-900 tracking-tight">
                        Votre entreprise tourne. Mais vous la pilotez à l'aveugle.
                    </h2>
                </motion.div>

                {/* Pain Points Grid */}
                <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
                    {painPoints.map((point, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ x: 8, transition: { duration: 0.3 } }}
                            className="flex items-start gap-5 p-6 rounded-2xl dark:bg-slate-800 bg-white dark:border-slate-700 border border-slate-200 transform-gpu perspective-[1000px]
                         shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgb(59,130,246,0.15)]
                         transition-all duration-500 hover:border-blue-500/50"
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                {point.icon}
                            </div>
                            <p className="text-lg font-medium dark:text-slate-300 text-slate-700 pt-2">
                                {point.text}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Transition Statement */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center pt-8"
                >
                    <h3 className="text-2xl sm:text-3xl font-bold dark:text-white text-slate-900">
                        Et si votre entreprise avait enfin un tableau de bord clair, comme les grandes ?
                    </h3>
                </motion.div>
            </div>
        </section>
    );
};