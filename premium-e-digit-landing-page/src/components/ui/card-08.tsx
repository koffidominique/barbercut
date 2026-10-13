import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface CardSoftDemoProps {
    icon: React.ReactNode;
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    features: string[];
    metrics: string;
    technologies?: string[];
    onSelectService: () => void;
    className?: string;
    index?: number;
}

export const CardSoftDemo: React.FC<CardSoftDemoProps> = ({
    icon,
    badge,
    title,
    subtitle,
    description,
    features,
    metrics,
    technologies,
    onSelectService,
    className,
    index = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.9,
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1] // Même courbe d'accélération que card-16
            }}
            whileHover={{
                y: -15,
                scale: 1.02,
                transition: { duration: 0.4 } // Même durée de transition que card-16
            }}
            className={cn(
                "group relative rounded-2xl p-7 dark:bg-slate-900 bg-white dark:border-slate-800 border border-slate-200 hover:border-blue-500/50 transition-all duration-500 flex flex-col justify-between space-y-6",
                // Ombres 3D profondes (ombre portée + ombre interne + glow)
                "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.03),0_20px_25px_-5px_rgba(0,0,0,0.08)]",
                "hover:shadow-[0_10px_15px_-3px_rgba(59,130,246,0.12),0_4px_6px_-2px_rgba(59,130,246,0.05),0_35px_40px_-15px_rgba(59,130,246,0.25)]",
                // Rotation 3D subtile au hover
                "transform-gpu perspective-[1000px] hover:rotateX(2deg) hover:rotateY(-1deg)",
                className
            )}>
            <div className="space-y-4">
                {/* Header Icon + Badge */}
                <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border border-slate-200 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/10 transition-all">
                        {icon}
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-bold dark:text-slate-300 text-slate-600 dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border border-slate-200 rounded-full">
                        {badge}
                    </span>
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-1">
                    <h3 className="text-xl font-bold dark:text-white text-slate-900 group-hover:text-blue-600 transition-colors">
                        {title}
                    </h3>
                    <p className="text-xs dark:text-slate-400 text-slate-600/80 font-medium">
                        {subtitle}
                    </p>
                </div>

                {/* Description */}
                <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed font-normal">
                    {description}
                </p>

                {/* Feature bullets */}
                <div className="pt-2 space-y-2 dark:border-slate-800 border-t border-slate-100">
                    {features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs dark:text-slate-400 text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Metrics + Tech Tags + CTA */}
            <div className="pt-4 space-y-4 dark:border-slate-800 border-t border-slate-100">
                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    <span>{metrics}</span>
                </div>

                {/* Tech Pills */}
                {technologies && (
                    <div className="flex flex-wrap gap-1.5">
                        {technologies.map((tech, tIdx) => (
                            <span
                                key={tIdx}
                                className="px-2 py-0.5 text-[10px] font-mono text-slate-600 bg-slate-100 rounded border border-slate-200"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                )}

                {/* Action button */}
                <button
                    onClick={onSelectService}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 border border-blue-500 hover:border-blue-600 transition-all flex items-center justify-center gap-2 group/btn cursor-pointer shadow-lg shadow-blue-500/20"
                >
                    <span>Demander un devis pour ce service</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
};