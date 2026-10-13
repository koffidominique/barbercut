"use client";

import {
    Activity,
    AlertTriangle,
    BarChart3,
    CalendarDays,
    ChevronRight,
    Clock,
    Coins,
    Factory,
    Home,
    Package,
    PackageCheck,
    PackageX,
    Receipt,
    ShoppingBag,
    Truck,
    TrendingDown,
    TrendingUp,
    User,
    Users,
    Wallet,
    Building2,
    CreditCard,
    PackageMinus,
} from "lucide-react";
import type { SalesMetrics } from "@/lib/sales/metrics";
import { FullDashboardCharts } from "./FullDashboardCharts";

function formatFCFA(value: number | undefined) {
    if (!value) return "0 FCFA";
    return `${value.toLocaleString("fr-FR").replace(/,/g, " ")} FCFA`;
}

type MetricTile = {
    label: string;
    value: string;
    caption: string;
    icon: React.ReactNode;
    tone: string;
};

function MetricCard({ metric }: { metric: MetricTile }) {
    return (
        <div className="glass-card p-6 rounded-2xl group hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${metric.tone}`}>{metric.icon}</div>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-1">{metric.label}</p>
            <h3 className="text-2xl font-black dark:text-white text-neutral-900">{metric.value}</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{metric.caption}</p>
        </div>
    );
}

function RankingCard({
    title,
    icon,
    entries,
    renderValue,
    emptyLabel,
}: {
    title: string;
    icon: React.ReactNode;
    entries: { productId: string; name: string; qty: number; profit: number }[];
    renderValue: (entry: { qty: number; profit: number }) => string;
    emptyLabel: string;
}) {
    return (
        <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold dark:text-white text-neutral-900">{title}</h3>
                <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>
            </div>
            {entries.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{emptyLabel}</p>
            ) : (
                <ol className="space-y-3">
                    {entries.map((entry, index) => (
                        <li
                            key={entry.productId}
                            className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-white/10 px-4 py-3 text-sm"
                        >
                            <span className="flex items-center gap-3 min-w-0">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                                    {index + 1}
                                </span>
                                <span className="truncate font-bold text-neutral-900 dark:text-white">{entry.name}</span>
                            </span>
                            <span className="shrink-0 font-black text-primary">{renderValue(entry)}</span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}

export function SalesMetricsGrid({ metrics }: { metrics: SalesMetrics | null | undefined }) {
    if (!metrics) {
        return (
            <div className="glass-card p-8 rounded-2xl text-center">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="h-12 w-12 text-neutral-400" />
                    <div>
                        <h3 className="text-lg font-bold dark:text-white text-neutral-900 mb-1">Aucune donnée disponible</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Les statistiques apparaîtront dès que vous aurez enregistré vos premières ventes.</p>
                    </div>
                </div>
            </div>
        );
    }

    const tiles: MetricTile[] = [
        // 💰 FINANCES & VENTES (les 10 premiers existants)
        {
            label: "CA du jour",
            value: formatFCFA(metrics.totals.caDay),
            caption: `${metrics.totals.ticketsDay} ticket${metrics.totals.ticketsDay > 1 ? "s" : ""} aujourd’hui`,
            icon: <Wallet className="h-6 w-6" />,
            tone: "bg-emerald-500/10 text-emerald-500",
        },
        {
            label: "CA de la semaine",
            value: formatFCFA(metrics.totals.caWeek),
            caption: "Depuis lundi",
            icon: <CalendarDays className="h-6 w-6" />,
            tone: "bg-cyan-500/10 text-cyan-500",
        },
        {
            label: "CA du mois",
            value: formatFCFA(metrics.totals.caMonth),
            caption: `${metrics.totals.ticketsMonth} ticket${metrics.totals.ticketsMonth > 1 ? "s" : ""} ce mois-ci`,
            icon: <BarChart3 className="h-6 w-6" />,
            tone: "bg-violet-500/10 text-violet-500",
        },
        {
            label: "Nombre de ventes",
            value: String(metrics.totals.ticketsDay),
            caption: "Transactions du jour",
            icon: <ShoppingBag className="h-6 w-6" />,
            tone: "bg-amber-500/10 text-amber-500",
        },
        {
            label: "Nombre de tickets",
            value: String(metrics.items.linesMonth),
            caption: "Lignes de ticket ce mois-ci",
            icon: <Receipt className="h-6 w-6" />,
            tone: "bg-pink-500/10 text-pink-500",
        },
        {
            label: "Panier moyen",
            value: formatFCFA(metrics.basket),
            caption: "Moyenne des tickets du jour",
            icon: <Wallet className="h-6 w-6" />,
            tone: "bg-teal-500/10 text-teal-500",
        },
        {
            label: "Bénéfice estimé",
            value: formatFCFA(metrics.items.profitMonth),
            caption: "Marge sur ventes du mois",
            icon: <TrendingUp className="h-6 w-6" />,
            tone: "bg-emerald-500/10 text-emerald-500",
        },
        {
            label: "Marge brute",
            value: `${metrics.grossMargin}%`,
            caption: `Sur ${formatFCFA(metrics.items.revenueMonth)} de CA`,
            icon: <Activity className="h-6 w-6" />,
            tone: "bg-lime-500/10 text-lime-500",
        },
        {
            label: "Produits vendus",
            value: `${metrics.items.unitsMonth} unités`,
            caption: `${metrics.items.linesMonth} ligne${metrics.items.linesMonth > 1 ? "s" : ""} de vente ce mois-ci`,
            icon: <PackageCheck className="h-6 w-6" />,
            tone: "bg-blue-500/10 text-blue-500",
        },
        {
            label: "Produits invendus",
            value: String(metrics.unsoldCount),
            caption: "Aucune vente ce mois-ci",
            icon: <PackageX className="h-6 w-6" />,
            tone: "bg-red-500/10 text-red-500",
        },
        // 🚨 STOCKS & PRODUCTION
        {
            label: "Produits en rupture",
            value: String(metrics.lowStockProducts.length),
            caption: "Proches de la rupture de stock",
            icon: <AlertTriangle className="h-6 w-6" />,
            tone: "bg-orange-500/10 text-orange-500",
        },
        {
            label: "Matières critiques",
            value: String(metrics.criticalMaterials.length),
            caption: "Stock en dessous du seuil",
            icon: <AlertTriangle className="h-6 w-6" />,
            tone: "bg-red-500/10 text-red-500",
        },
        {
            label: "Production du jour",
            value: String(metrics.productionToday),
            caption: "Unités produites aujourd'hui",
            icon: <Factory className="h-6 w-6" />,
            tone: "bg-blue-500/10 text-blue-500",
        },
        // 📦 COMMANDES
        {
            label: "Commandes en attente",
            value: String(metrics.orders.pending),
            caption: "À traiter",
            icon: <Clock className="h-6 w-6" />,
            tone: "bg-amber-500/10 text-amber-500",
        },
        {
            label: "Commandes à préparer",
            value: String(metrics.orders.toPrepare),
            caption: "Préparation en cours",
            icon: <Package className="h-6 w-6" />,
            tone: "bg-cyan-500/10 text-cyan-500",
        },
        {
            label: "Commandes à livrer",
            value: String(metrics.orders.toDeliver),
            caption: "En attente de livraison",
            icon: <Truck className="h-6 w-6" />,
            tone: "bg-purple-500/10 text-purple-500",
        },
        {
            label: "Livraisons en cours",
            value: String(metrics.orders.inDelivery),
            caption: "En route vers les clients",
            icon: <Truck className="h-6 w-6" />,
            tone: "bg-teal-500/10 text-teal-500",
        },
        // 💸 FINANCES COMPLÈTES
        {
            label: "Retours clients",
            value: String(metrics.financials.returns),
            caption: "Produits retournés ce mois",
            icon: <PackageMinus className="h-6 w-6" />,
            tone: "bg-yellow-500/10 text-yellow-500",
        },
        {
            label: "Pertes",
            value: formatFCFA(metrics.financials.losses),
            caption: "Pertes financières",
            icon: <TrendingDown className="h-6 w-6" />,
            tone: "bg-red-500/10 text-red-500",
        },
        {
            label: "Gaspillage",
            value: formatFCFA(metrics.financials.waste),
            caption: "Gaspillage alimentaire",
            icon: <PackageX className="h-6 w-6" />,
            tone: "bg-red-500/10 text-red-500",
        },
        {
            label: "Dépenses totales",
            value: formatFCFA(metrics.financials.expenses),
            caption: "Toutes charges confondues",
            icon: <CreditCard className="h-6 w-6" />,
            tone: "bg-neutral-500/10 text-neutral-500",
        },
        {
            label: "Encaissements",
            value: formatFCFA(metrics.financials.cashIn),
            caption: "Encaissements du mois",
            icon: <Coins className="h-6 w-6" />,
            tone: "bg-emerald-500/10 text-emerald-500",
        },
        {
            label: "Créances clients",
            value: formatFCFA(metrics.financials.receivables),
            caption: "À percevoir des clients",
            icon: <Users className="h-6 w-6" />,
            tone: "bg-orange-500/10 text-orange-500",
        },
        {
            label: "Dettes fournisseurs",
            value: formatFCFA(metrics.financials.payables),
            caption: "À payer aux fournisseurs",
            icon: <Building2 className="h-6 w-6" />,
            tone: "bg-red-500/10 text-red-500",
        },
        // 🏦 CAISSES
        {
            label: "Total des caisses",
            value: formatFCFA(metrics.cashRegisters.reduce((sum, c) => sum + c.balance, 0)),
            caption: `${metrics.cashRegisters.length} caisse${metrics.cashRegisters.length > 1 ? "s" : ""}`,
            icon: <Home className="h-6 w-6" />,
            tone: "bg-emerald-500/10 text-emerald-500",
        },
    ];

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Temps réel</p>
                    <h2 className="text-xl font-bold dark:text-white text-neutral-900">Indicateurs de vente</h2>
                </div>
                <ChevronRight className="h-5 w-5 text-primary" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 mb-8">
                {tiles.map((metric) => (
                    <MetricCard key={metric.label} metric={metric} />
                ))}
            </div>

            {/* 🥇 Classements supplémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <RankingCard
                    title="Produits les plus vendus"
                    icon={<ShoppingBag className="h-5 w-5" />}
                    entries={metrics.topSellers}
                    renderValue={(entry) => `${entry.qty} vendus`}
                    emptyLabel="Aucune vente produit ce mois-ci."
                />
                <RankingCard
                    title="Produits les plus rentables"
                    icon={<TrendingUp className="h-5 w-5" />}
                    entries={metrics.topProfitable}
                    renderValue={(entry) => formatFCFA(entry.profit)}
                    emptyLabel="Aucun bénéfice calculable pour le moment."
                />
                <div className="glass-card rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold dark:text-white text-neutral-900">Produits en rupture</h3>
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                    </div>
                    {metrics.lowStockProducts.length === 0 ? (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Tous les produits ont suffisamment de stock.
                        </p>
                    ) : (
                        <ol className="space-y-3">
                            {metrics.lowStockProducts.map((product, index) => (
                                <li
                                    key={product.productId}
                                    className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-white/10 px-4 py-3 text-sm"
                                >
                                    <span className="flex items-center gap-3 min-w-0">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-black text-orange-500">
                                            {index + 1}
                                        </span>
                                        <span className="truncate font-bold text-neutral-900 dark:text-white">{product.name}</span>
                                    </span>
                                    <span className="shrink-0 font-black text-orange-500">{product.currentStock} restants</span>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>

            {/* 👥 Performances équipes & boutiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold dark:text-white text-neutral-900">Performance vendeurs</h3>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <User className="h-5 w-5" />
                        </div>
                    </div>
                    <ol className="space-y-3">
                        {metrics.staffPerformance.filter(s => s.role === "vendeur").slice(0, 5).map((staff, index) => (
                            <li
                                key={staff.id}
                                className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-white/10 px-4 py-3 text-sm"
                            >
                                <span className="flex items-center gap-3 min-w-0">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-black text-blue-500">
                                        {index + 1}
                                    </span>
                                    <span className="truncate font-bold text-neutral-900 dark:text-white">{staff.name}</span>
                                </span>
                                <span className="shrink-0 font-black text-blue-500">{staff.salesCount} ventes</span>
                            </li>
                        ))}
                    </ol>
                </div>
                <div className="glass-card rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold dark:text-white text-neutral-900">Performance livreurs</h3>
                        <div className="p-2 bg-teal-500/10 rounded-lg text-teal-500">
                            <Truck className="h-5 w-5" />
                        </div>
                    </div>
                    <ol className="space-y-3">
                        {metrics.staffPerformance.filter(s => s.role === "livreur").slice(0, 5).map((staff, index) => (
                            <li
                                key={staff.id}
                                className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-white/10 px-4 py-3 text-sm"
                            >
                                <span className="flex items-center gap-3 min-w-0">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-xs font-black text-teal-500">
                                        {index + 1}
                                    </span>
                                    <span className="truncate font-bold text-neutral-900 dark:text-white">{staff.name}</span>
                                </span>
                                <span className="shrink-0 font-black text-teal-500">{staff.salesCount} livraisons</span>
                            </li>
                        ))}
                    </ol>
                </div>
                <div className="glass-card rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold dark:text-white text-neutral-900">Performance boutiques</h3>
                        <div className="p-2 bg-violet-500/10 rounded-lg text-violet-500">
                            <Home className="h-5 w-5" />
                        </div>
                    </div>
                    <ol className="space-y-3">
                        {metrics.boutiquePerformance.slice(0, 5).map((boutique, index) => (
                            <li
                                key={boutique.id}
                                className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-white/10 px-4 py-3 text-sm"
                            >
                                <span className="flex items-center gap-3 min-w-0">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-black text-violet-500">
                                        {index + 1}
                                    </span>
                                    <span className="truncate font-bold text-neutral-900 dark:text-white">{boutique.name}</span>
                                </span>
                                <span className="shrink-0 font-black text-violet-500">{formatFCFA(boutique.caMonth)}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>

            {/* 📈 Tous les graphiques */}
            <FullDashboardCharts metrics={metrics} />
        </div>
    );
}