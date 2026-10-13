import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
    items: React.ReactNode[];
    className?: string;
}

export const CarouselScale: React.FC<CarouselProps> = ({ items, className }) => {
    const [activeIndex, setActiveIndex] = React.useState(0);

    const next = () => {
        setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    };

    const prev = () => {
        setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    };

    return (
        <div className={cn("relative w-full", className)}>
            <div className="overflow-hidden">
                <motion.div
                    className="flex"
                    animate={{ x: `-${activeIndex * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {items.map((item, index) => (
                        <motion.div
                            key={index}
                            className="min-w-full px-4"
                            animate={{
                                scale: index === activeIndex ? 1 : 0.9,
                                opacity: index === activeIndex ? 1 : 0.5,
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            {item}
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
                <button
                    onClick={prev}
                    aria-label="Précédent"
                    className="p-3 rounded-full dark:bg-slate-800 bg-slate-100 hover:bg-blue-500 dark:text-slate-300 text-slate-600 hover:text-white dark:border-slate-700 border border-slate-200 transition-all cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all",
                                index === activeIndex
                                    ? "bg-blue-500 w-6"
                                    : "dark:bg-slate-600 bg-slate-300 hover:dark:bg-slate-500 hover:bg-slate-400"
                            )}
                            aria-label={`Aller au témoignage ${index + 1}`}
                        />
                    ))}
                </div>
                <button
                    onClick={next}
                    aria-label="Suivant"
                    className="p-3 rounded-full dark:bg-slate-800 bg-slate-100 hover:bg-blue-500 dark:text-slate-300 text-slate-600 hover:text-white dark:border-slate-700 border border-slate-200 transition-all cursor-pointer"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};