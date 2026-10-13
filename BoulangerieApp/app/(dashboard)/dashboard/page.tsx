"use client";
import { useState, useEffect } from "react";
import {
    AlertTriangle,
    X,
    BarChart3,
    BellRing,
} from "lucide-react";
import { SalesMetricsGrid } from "@/components/dashboard/SalesMetricsGrid";
import { useStatsPanel } from "@/contexts/StatsPanelContext";
import type { SalesMetrics } from "@/lib/sales/metrics";

type ClosureSummary = {
    id: string;
    closure_date: string;
    cashier: string;
    opening_fund: number;
    cash_sales: number;
    mobile_sales: number;
    card_sales: number;
    expenses: number;
    counted_cash: number;
    created_at: string;
};

function firstName(fullName: string, fallback: string) {
    const first = fullName.trim().split(/\s+/)[0];
    return first || fallback;
}

export default function DashboardPage() {
    const { statsPanelOpen, setStatsPanelOpen } = useStatsPanel();
    const [user, setUser] = useState<{ email: string; fullName?: string }>({ email: "" });
    const [closures, setClosures] = useState<ClosureSummary[]>([]);
    const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    // Chargement correct avec useEffect (pas useMemo pour async)
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch("/api/dashboard-metrics");
                const result = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(result.error ?? "Chargement impossible.");

                setUser(result.user);
                setClosures(result.closures || []);
                setSalesMetrics(result.salesMetrics);
            } catch (error) {
                console.error("Erreur chargement dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const totals = closures.map((row) => ({
        ...row,
        totalSales: row.cash_sales + row.mobile_sales + row.card_sales,
        expectedCash: row.opening_fund + row.cash_sales - row.expenses,
    }));
    const withDiff = totals.map((row) => ({
        ...row,
        difference: row.counted_cash - row.expectedCash,
    }));

    const unbalanced = withDiff.filter((row) => row.difference !== 0);
    const alertCount = unbalanced.length;

    if (loading) {
        return (
            <div className="relative min-h-screen w-full px-6 py-10 lg:px-12 flex items-center justify-center">
                <div className="animate-pulse">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full">
            {/* Overlay qui assombrit quand le panneau est ouvert */}
            {statsPanelOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setStatsPanelOpen(false)}
                />
            )}

            {/* Panneau latéral des statistiques qui coulisse depuis la droite */}
            <div
                className={`fixed inset-y-0 right-0 w-full md:w-[850px] bg-white dark:bg-[#0a0a0a] border-l border-neutral-200 dark:border-white/10 z-50 transform transition-transform duration-300 overflow-y-auto ${statsPanelOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="p-6 lg:p-10">
                    {/* Header du panneau stats */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="text-sm uppercase tracking-[0.2em] text-primary mb-2 font-bold">Statistiques</p>
                            <h2 className="text-2xl font-bold dark:text-white">Toutes vos métriques</h2>
                        </div>
                        <button
                            onClick={() => setStatsPanelOpen(false)}
                            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                        >
                            <X className="h-6 w-6 dark:text-white" />
                        </button>
                    </div>

                    {/* TOUTES LES STATISTIQUES DANS LE PANNEAU */}
                    {alertCount > 0 && (
                        <div className="mb-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 backdrop-blur-sm flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500 shrink-0">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-amber-600 dark:text-amber-400 text-sm mb-1">Écarts de caisse à vérifier</h3>
                                <p className="text-amber-600/80 dark:text-amber-400/80 text-sm">
                                    {alertCount} clôture{alertCount > 1 ? "s" : ""} avec un écart de comptage. Consultez la page Caisse pour contrôler les montants.
                                </p>
                            </div>
                        </div>
                    )}

                    <section className="mb-10" id="ventes-metrics">
                        {salesMetrics && <SalesMetricsGrid metrics={salesMetrics} />}
                    </section>
                </div>
            </div>

            {/* PAGE D'ACCUEIL SOBRE - SEULEMENT L'ESSENTIEL */}
            < div className="relative min-h-screen w-full px-6 py-10 lg:px-12" >
                <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-primary mb-2 font-bold">Boulangerie CI</p>
                        <h1 className="text-3xl md:text-4xl font-black mb-2 dark:text-white text-neutral-900">
                            Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">{firstName("fullName" in user && user.fullName ? user.fullName : user.email, "Chef d’équipe")}</span>
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            {withDiff.length === 0
                                ? "Enregistrez votre première clôture de caisse pour commencer."
                                : `Gérez votre activité — ${withDiff.length} clôture${withDiff.length > 1 ? "s" : ""} enregistrée${withDiff.length > 1 ? "s" : ""}.`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 rounded-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-bold text-neutral-700 dark:text-white">
                            <BellRing className="h-4 w-4 text-primary" />
                            Alertes ({alertCount})
                        </button>
                        <button
                            onClick={() => setStatsPanelOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-[#003322] font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        >
                            <BarChart3 className="h-4 w-4" />
                            Voir les statistiques
                        </button>
                    </div>
                </div>

                {/* Message central */}
                {
                    withDiff.length === 0 ? (
                        <div className="max-w-2xl p-6 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-start gap-4">
                            <div>
                                <h3 className="font-bold text-lg mb-2 dark:text-white text-neutral-900">Bienvenue dans votre tableau de bord</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                                    Cliquez sur <strong>« Statistiques »</strong> dans la sidebar de gauche ou sur le bouton ci-dessus pour consulter toutes vos métriques.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <a href="/caisse" className="px-4 py-2 bg-primary text-[#003322] font-semibold rounded-full text-sm">
                                        Aller à la caisse
                                    </a>
                                    <a href="/ventes" className="px-4 py-2 border border-neutral-200 dark:border-white/10 rounded-full text-sm font-semibold dark:text-white">
                                        Créer une vente
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-2xl p-6 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-start gap-4">
                            <div>
                                <h3 className="font-bold text-lg mb-2 dark:text-white text-neutral-900">Votre activité est en cours</h3>
                                <p className="text-neutral-500 dark:text-neutral-400">
                                    Accédez à toutes vos statistiques, graphiques et rapports en cliquant sur <strong>« Statistiques »</strong> dans la navigation latérale.
                                </p>
                            </div>
                        </div>
                    )
                }

                {/* Alerte des écarts si nécessaire */}
                {
                    alertCount > 0 && (
                        <div className="max-w-2xl mt-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 backdrop-blur-sm flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500 shrink-0">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-amber-600 dark:text-amber-400 text-sm mb-1">Écarts de caisse à vérifier</h3>
                                <p className="text-amber-600/80 dark:text-amber-400/80 text-sm">
                                    {alertCount} clôture{alertCount > 1 ? "s" : ""} avec un écart de comptage. Ouvrez le panneau des statistiques pour plus de détails.
                                </p>
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
}