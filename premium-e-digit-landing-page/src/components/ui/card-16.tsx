"use client";

import { cn } from "@/utils/cn";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export const Spotlight = ({
    className,
    fill = "white",
}: {
    className?: string;
    fill?: string;
}) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const div = divRef.current;
        const rect = div.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "absolute inset-0 overflow-hidden pointer-events-none",
                className
            )}
        >
            <div
                className="absolute w-full h-full bg-gradient-to-r from-blue-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${fill}, transparent 40%)`,
                }}
            />
        </div>
    );
};

// Wrapper pour intégrer directement dans la section études de cas
interface CaseStudySpotlightCardProps {
    children: React.ReactNode;
    index?: number; // Pour l'animation en cascade
}

export const CaseStudySpotlightCard = ({ children, index = 0 }: CaseStudySpotlightCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.9,
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1] // Courbe d'accélération fluide
            }}
            whileHover={{
                y: -15,
                scale: 1.02,
                transition: { duration: 0.4 }
            }}
            className={cn(
                "rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden transform-gpu perspective-[1200px]",
                // Mêmes ombres 3D que card-08 pour uniformité
                "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.03),0_20px_25px_-5px_rgba(0,0,0,0.08)]",
                "hover:shadow-[0_10px_15px_-3px_rgba(59,130,246,0.12),0_4px_6px_-2px_rgba(59,130,246,0.05),0_35px_40px_-15px_rgba(59,130,246,0.25)]",
                // Même rotation 3D subtile au hover
                "hover:rotateX(2deg) hover:rotateY(-1deg)",
                "transition-all duration-500 hover:border-blue-500/60"
            )}
            style={{
                transformStyle: "preserve-3d"
            }}
        >
            <Spotlight fill="rgba(59, 130, 246, 0.15)" />
            {children}
        </motion.div>
    );
};