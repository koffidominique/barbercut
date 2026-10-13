"use client";
import { createContext, useContext, useState } from "react";

type StatsPanelContextType = {
    statsPanelOpen: boolean;
    setStatsPanelOpen: (open: boolean) => void;
};

const StatsPanelContext = createContext<StatsPanelContextType | undefined>(undefined);

export function StatsPanelProvider({ children }: { children: React.ReactNode }) {
    const [statsPanelOpen, setStatsPanelOpen] = useState(false);

    return (
        <StatsPanelContext.Provider value={{ statsPanelOpen, setStatsPanelOpen }}>
            {children}
        </StatsPanelContext.Provider>
    );
}

// Version safe qui ne throw pas, retourne des valeurs par défaut si hors provider
export function useStatsPanelSafe() {
    const context = useContext(StatsPanelContext);
    // Les hooks sont appelés AVANT tout early-return (règle des hooks)
    const [fallbackOpen, setFallbackOpen] = useState(false);
    if (context) return context;

    // Fallback si le provider n'est pas dans l'arbre
    return { statsPanelOpen: fallbackOpen, setStatsPanelOpen: setFallbackOpen };
}

export function useStatsPanel() {
    const context = useContext(StatsPanelContext);
    // Les hooks sont appelés AVANT tout early-return (règle des hooks)
    const [fallbackOpen, setFallbackOpen] = useState(false);
    if (!context) {
        // Ne plus throw pour éviter les crashs sur les pages qui utilisent client-layout directement
        console.warn("useStatsPanel used outside StatsPanelProvider, using local state fallback");
        return { statsPanelOpen: fallbackOpen, setStatsPanelOpen: setFallbackOpen };
    }
    return context;
}