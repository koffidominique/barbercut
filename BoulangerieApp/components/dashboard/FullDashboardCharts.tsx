"use client";

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from "recharts";
import type { SalesMetrics } from "@/lib/sales/metrics";

// Couleurs modernes pour les graphiques
const COLORS = [
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#8b5cf6", // violet
    "#f59e0b", // amber
    "#ec4899", // pink
    "#3b82f6", // blue
];

function formatFCFA(value: number) {
    return `${value.toLocaleString("fr-FR").replace(/,/g, " ")} FCFA`;
}

export function FullDashboardCharts({ metrics }: { metrics: SalesMetrics }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 📊 CA par jour */}
            <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold dark:text-white text-neutral-900 mb-4">CA par jour (semaine)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.caByDay}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value) => formatFCFA(Number(value))} />
                        <Legend />
                        <Bar dataKey="value" name="Chiffre d'affaires" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* ⏰ CA par heure */}
            <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold dark:text-white text-neutral-900 mb-4">CA par heure (journée)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={metrics.caByHour}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="hour" />
                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value) => formatFCFA(Number(value))} />
                        <Legend />
                        <Area type="monotone" dataKey="value" name="CA par heure" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* 🏪 CA par produit */}
            <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold dark:text-white text-neutral-900 mb-4">CA par produit</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.caByProduct} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis type="number" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip formatter={(value) => formatFCFA(Number(value))} />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 🗂️ CA par catégorie */}
            <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold dark:text-white text-neutral-900 mb-4">CA par catégorie</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={metrics.caByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        >
                            {metrics.caByCategory.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatFCFA(Number(value))} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* 🏭 CA par boutique */}
            <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold dark:text-white text-neutral-900 mb-4">CA par boutique</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.boutiquePerformance.map((b) => ({ name: b.name, value: b.caMonth }))}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value) => formatFCFA(Number(value))} />
                        <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 🚚 CA par canal */}
            <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold dark:text-white text-neutral-900 mb-4">CA par canal</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={metrics.caByChannel}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        >
                            {metrics.caByChannel.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatFCFA(Number(value))} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* 📈 Évolution des ventes */}
            <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold dark:text-white text-neutral-900 mb-4">Évolution des ventes (6 mois)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics.salesEvolution}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value) => formatFCFA(Number(value))} />
                        <Legend />
                        <Line type="monotone" dataKey="sales" name="Ventes" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 💹 Évolution des marges */}
            <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold dark:text-white text-neutral-900 mb-4">Évolution des marges</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics.marginEvolution}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="date" />
                        <YAxis domain={[20, 40]} />
                        <Tooltip formatter={(value) => `${Number(value)}%`} />
                        <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 📉 Évolution des pertes */}
            <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold dark:text-white text-neutral-900 mb-4">Évolution des pertes</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={metrics.lossEvolution}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value) => formatFCFA(Number(value))} />
                        <Area type="monotone" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}