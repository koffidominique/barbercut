"use client";

import { cn } from "@/utils/cn";
import React, {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect,
} from "react";
import { motion } from "framer-motion";

const MouseEnterContext = createContext<
    [boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined
>(undefined);

export const CardContainer = ({
    children,
    className,
    containerClassName,
}: {
    children?: React.ReactNode;
    className?: string;
    containerClassName?: string;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMouseEntered, setIsMouseEntered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const { left, top, width, height } =
            containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / 25;
        const y = (e.clientY - top - height / 2) / 25;
        containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    };

    const handleMouseEnter = () => {
        setIsMouseEntered(true);
    };

    const handleMouseLeave = () => {
        if (!containerRef.current) return;
        setIsMouseEntered(false);
        containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
    };

    return (
        <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
            <div
                className={cn(
                    "flex items-center justify-center",
                    containerClassName
                )}
                style={{
                    perspective: "1000px",
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1]
                    }}
                    ref={containerRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className={cn(
                        "relative transition-all duration-300 ease-linear",
                        className
                    )}
                    style={{
                        transformStyle: "preserve-3d",
                        perspective: "1200px",
                    }}
                >
                    {children}
                </motion.div>
            </div>
        </MouseEnterContext.Provider >
    );
};

export const CardBody = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "w-full [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]",
                className
            )}
        >
            {children}
        </div>
    );
};

export const CardItem = ({
    as: Tag = "div",
    children,
    className,
    translateX = 0,
    translateY = 0,
    translateZ = 0,
    rotateX = 0,
    rotateY = 0,
    rotateZ = 0,
    ...rest
}: {
    as?: React.ElementType;
    children: React.ReactNode;
    className?: string;
    translateX?: number | string;
    translateY?: number | string;
    translateZ?: number | string;
    rotateX?: number | string;
    rotateY?: number | string;
    rotateZ?: number | string;
    [key: string]: any;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    // Les hooks React doivent être déclarés au début du composant
    const useMouseEnter = () => {
        const context = useContext(MouseEnterContext);
        if (context === undefined) {
            throw new Error("useMouseEnter must be used within a MouseEnterProvider");
        }
        return context;
    };

    const [isMouseEntered] = useMouseEnter();

    useEffect(() => {
        if (!ref.current) return;
        if (isMouseEntered) {
            ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
        } else {
            ref.current.style.transform = `translateX(0) translateY(0) translateZ(0) rotateX(0) rotateY(0) rotateZ(0)`;
        }
    }, [isMouseEntered, translateX, translateY, translateZ, rotateX, rotateY, rotateZ]);

    return (
        <Tag
            ref={ref}
            className={cn("w-fit transition duration-200 ease-linear", className)}
            {...rest}
        >
            {children}
        </Tag>
    );
};

// Wrapper pour intégrer directement dans la section tarifs
interface Pricing3DCardProps {
    children: React.ReactNode;
    popular?: boolean;
}

export const Pricing3DCard = ({ children, popular }: Pricing3DCardProps) => {
    return (
        <CardContainer className={popular ? "lg:-translate-y-2" : ""}>
            <CardBody className={cn(
                "rounded-3xl p-8 flex flex-col justify-between w-full h-full transition-all duration-500",
                popular
                    ? "dark:from-slate-800 dark:to-slate-900 bg-gradient-to-b from-slate-50 to-white dark:border-2 dark:border-blue-500 border-2 border-blue-500"
                    : "dark:bg-slate-900 bg-white dark:border-slate-700 border border-slate-200 hover:dark:border-blue-500/50 hover:border-blue-500/50",
                // Mêmes ombres 3D uniformes pour toutes les cartes
                "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.03),0_20px_25px_-5px_rgba(0,0,0,0.08)]",
                "hover:shadow-[0_10px_15px_-3px_rgba(59,130,246,0.12),0_4px_6px_-2px_rgba(59,130,246,0.05),0_35px_40px_-15px_rgba(59,130,246,0.25)]"
            )}>
                {children}
            </CardBody>
        </CardContainer >
    );
};