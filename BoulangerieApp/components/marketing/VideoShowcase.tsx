"use client";

import { motion } from "framer-motion";

const showcaseVideos = [
    {
        title: "Analyse des données",
        description: "Visualisez les performances de vos ventes en temps réel.",
        src: "/videos/analyzing-business-data-animation-gif-download-9435609.mp4",
    },
    {
        title: "Pilotage financier",
        description: "Suivez marges, chiffre d'affaires et tendances du marché.",
        src: "/videos/business-analyst-reviewing-financial-data-visualization-on-large-computer-monitor-showing-market-research-animation-gif-download-14339262.mp4",
    },
    {
        title: "Croissance des ventes",
        description: "Boostez votre production avec des objectifs mesurables.",
        src: "/videos/business-increase-animation-gif-download-10318409.mp4",
    },
    {
        title: "Paiements digitaux",
        description: "Cash, mobile money et crédit suivis depuis un seul tableau de bord.",
        src: "/videos/e-money-animation-gif-download-11971516.mp4",
    },
];

export function VideoShowcase() {
    return (
        <section className="px-6 py-16 lg:px-40 lg:py-20" aria-label="Démonstration vidéo">
            <div className="layout-content-container max-w-[1200px] mx-auto">
                <div className="mb-10 text-center">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-3">
                        En action
                    </p>
                    <h2 className="text-3xl md:text-5xl font-black dark:text-white text-neutral-900 mb-4">
                        Votre boulangerie, pilotée en vidéo
                    </h2>
                    <p className="text-lg text-neutral-500 max-w-[700px] mx-auto">
                        Un aperçu concret : analyse des ventes, suivi financier, croissance et
                        encaissements digitaux.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {showcaseVideos.map((video, idx) => (
                        <motion.figure
                            key={video.src}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.45, delay: idx * 0.08 }}
                            className="group overflow-hidden rounded-[2rem] border border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-xl"
                        >
                            <div className="overflow-hidden bg-black">
                                <video
                                    src={video.src}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="metadata"
                                    aria-label={video.title}
                                    className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <figcaption className="p-5">
                                <h3 className="text-lg font-bold dark:text-white text-neutral-900 mb-1">
                                    {video.title}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                    {video.description}
                                </p>
                            </figcaption>
                        </motion.figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
