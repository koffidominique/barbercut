import DashboardClientLayout from "../(dashboard)/client-layout";
import type { SalesMetrics } from "@/lib/sales/metrics";
import { SalesMetricsGrid } from "@/components/dashboard/SalesMetricsGrid";
import { FullDashboardCharts } from "@/components/dashboard/FullDashboardCharts";

// Page 100% démo, aucune vérification d'authentification
export default async function DemoPage() {
    console.log("🎯 Page démo affichée directement !");

    // Données mockées complètes conformes au type SalesMetrics étendu
    const demoMetrics: SalesMetrics = {
        // Données core (requises par SalesMetricsGrid)
        totals: {
            caDay: 187500,
            caWeek: 850000,
            caMonth: 1250000,
            linesDay: 58,
            ticketsDay: 42,
            ticketsMonth: 287,
        },
        items: {
            linesMonth: 1245,
            unitsMonth: 3120,
            revenueMonth: 1250000,
            profitMonth: 375000,
        },
        basket: 4464, // 187500 / 42
        grossMargin: 30, // 375000 / 1250000 * 100
        topSellers: [
            { productId: "1", name: "Baguette Tradition", qty: 120, profit: 18000 },
            { productId: "2", name: "Croissant Beurre", qty: 85, profit: 21250 },
            { productId: "3", name: "Pain au Chocolat", qty: 78, profit: 19500 },
            { productId: "4", name: "Brioche", qty: 45, profit: 13500 },
            { productId: "5", name: "Éclair Café", qty: 32, profit: 12800 },
        ],
        topProfitable: [
            { productId: "2", name: "Croissant Beurre", qty: 85, profit: 21250 },
            { productId: "3", name: "Pain au Chocolat", qty: 78, profit: 19500 },
            { productId: "1", name: "Baguette Tradition", qty: 120, profit: 18000 },
        ],
        unsoldCount: 3,
        hasSales: true,

        // NOUVELLES MÉTRIQUES AJOUTÉES
        lowStockProducts: [
            { productId: "6", name: "Beurre AOP", currentStock: 8, minThreshold: 20 },
            { productId: "7", name: "Farine T55", currentStock: 12, minThreshold: 50 },
            { productId: "8", name: "Chocolat Noir", currentStock: 5, minThreshold: 15 },
        ],
        criticalMaterials: [
            { name: "Farine T55", currentStock: 45, minThreshold: 100, unit: "kg" },
            { name: "Beurre AOP", currentStock: 12, minThreshold: 30, unit: "kg" },
            { name: "Levure fraîche", currentStock: 3, minThreshold: 10, unit: "unités" },
        ],
        productionToday: 450, // unités produites aujourd'hui
        orders: {
            pending: 8,
            toPrepare: 12,
            toDeliver: 5,
            inDelivery: 3,
        },
        financials: {
            returns: 2,
            losses: 15000,
            waste: 8500,
            expenses: 245000,
            cashIn: 172000,
            receivables: 85000,
            payables: 120000,
            cashBalance: 345000,
        },
        staffPerformance: [
            { id: "s1", name: "Marie K.", salesCount: 18, revenue: 78500, role: "vendeur" },
            { id: "s2", name: "Pierre D.", salesCount: 15, revenue: 65200, role: "caissier" },
            { id: "s3", name: "Jean L.", salesCount: 9, revenue: 43800, role: "livreur" },
        ],
        boutiquePerformance: [
            { id: "b1", name: "Boulangerie Plateau", caDay: 98000, caMonth: 680000, ticketCount: 156 },
            { id: "b2", name: "Boulangerie Cocody", caDay: 89500, caMonth: 570000, ticketCount: 131 },
        ],
        cashRegisters: [
            { id: "c1", name: "Caisse Principale", balance: 187500 },
            { id: "c2", name: "Caisse Secondaire", balance: 0 },
        ],

        // DONNÉES POUR LES GRAPHIQUES
        caByHour: [
            { hour: "07h", value: 15000 },
            { hour: "08h", value: 28000 },
            { hour: "09h", value: 35000 },
            { hour: "10h", value: 42000 },
            { hour: "11h", value: 38000 },
            { hour: "12h", value: 29500 },
        ],
        caByDay: [
            { date: "Lun", value: 120000 },
            { date: "Mar", value: 145000 },
            { date: "Mer", value: 132000 },
            { date: "Jeu", value: 158000 },
            { date: "Ven", value: 187500 },
            { date: "Sam", value: 215000 },
            { date: "Dim", value: 95000 },
        ],
        caByCategory: [
            { category: "Pains", value: 320000 },
            { category: "Viennoiseries", value: 450000 },
            { category: "Pâtisseries", value: 280000 },
            { category: "Sandwichs", value: 200000 },
        ],
        caByProduct: [
            { name: "Baguette", value: 180000 },
            { name: "Croissant", value: 127500 },
            { name: "Pain Chocolat", value: 117000 },
            { name: "Brioche", value: 85000 },
            { name: "Éclair", value: 68000 },
        ],
        stockEvolution: [
            { date: "01/10", stock: 5200 },
            { date: "02/10", stock: 4800 },
            { date: "03/10", stock: 4500 },
            { date: "04/10", stock: 4200 },
            { date: "05/10", stock: 3900 },
            { date: "06/10", stock: 3650 },
        ],
        marginEvolution: [
            { date: "01/10", value: 28 },
            { date: "02/10", value: 29 },
            { date: "03/10", value: 30 },
            { date: "04/10", value: 30 },
            { date: "05/10", value: 31 },
            { date: "06/10", value: 30 },
        ],
        lossEvolution: [
            { date: "01/10", value: 12000 },
            { date: "02/10", value: 8500 },
            { date: "03/10", value: 15000 },
            { date: "04/10", value: 9800 },
            { date: "05/10", value: 11000 },
            { date: "06/10", value: 8500 },
        ],
        salesEvolution: [
            { month: "Mai", sales: 950000 },
            { month: "Juin", sales: 1050000 },
            { month: "Juillet", sales: 1120000 },
            { month: "Août", sales: 1080000 },
            { month: "Sept", sales: 1180000 },
            { month: "Oct", sales: 1250000 },
        ],
        caByChannel: [
            { channel: "Sur place", value: 650000 },
            { channel: "Livraison", value: 350000 },
            { channel: "Click & Collect", value: 250000 },
        ],
    };

    return (
        <DashboardClientLayout userEmail="demo@boulangerie.ci">
            <div className="space-y-6">
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-bold">Bienvenue sur la démo ! 👋</h1>
                    <p className="text-neutral-500">Vous utilisez la version démo de BoulangerieApp. Toutes les fonctionnalités sont accessibles en lecture seule.</p>
                </div>

                {/* Grille des métriques principales (existante + nouvelles) */}
                <SalesMetricsGrid metrics={demoMetrics} />

                {/* Tous les graphiques demandés */}
                <FullDashboardCharts metrics={demoMetrics} />
            </div>
        </DashboardClientLayout>
    );
}