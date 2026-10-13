"use client";

import { useEffect, useState } from "react";
import { Activity, ShoppingBasket, Wallet } from "lucide-react";
import { SaleEntryForm, CartLine, SaleProduct, formatFCFA } from "@/components/ventes/SaleEntryForm";
import { SalesHistory, SaleRecord } from "@/components/ventes/SalesHistory";

export default function VentesPage() {
    const [products, setProducts] = useState<SaleProduct[]>([]);
    const [sales, setSales] = useState<SaleRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [saveError, setSaveError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const [productsResponse, salesResponse] = await Promise.all([
                    fetch("/api/products"),
                    fetch("/api/sales"),
                ]);
                const productsResult = await productsResponse.json().catch(() => ({}));
                const salesResult = await salesResponse.json().catch(() => ({}));
                if (!productsResponse.ok) throw new Error(productsResult.error ?? "Produits indisponibles.");
                if (!salesResponse.ok) throw new Error(salesResult.error ?? "Chargement impossible.");
                setProducts(productsResult.products ?? []);
                setSales(salesResult.sales ?? []);
            } catch (error) {
                setLoadError(error instanceof Error ? error.message : "Chargement impossible.");
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    const todayLabel = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const todayTotal = sales
        .filter((sale) => sale.date === todayLabel)
        .reduce((sum, sale) => sum + sale.total, 0);
    const allTimeTotal = sales.reduce((sum, sale) => sum + sale.total, 0);

    async function handleSubmit(items: CartLine[], paymentMethod: string) {
        setSaveError("");
        setIsSaving(true);
        try {
            const response = await fetch("/api/sales", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentMethod, items }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error ?? "Enregistrement impossible.");

            const freshResponse = await fetch("/api/sales");
            const freshResult = await freshResponse.json();
            if (freshResponse.ok) {
                setSales(freshResult.sales ?? []);
            }
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : "Enregistrement impossible.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="relative min-h-screen w-full px-6 py-10 lg:px-12">
            <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

            <div className="mb-10">
                <p className="text-sm uppercase tracking-[0.2em] text-primary mb-2 font-bold">Boulangerie CI</p>
                <h1 className="text-3xl md:text-4xl font-black mb-2 dark:text-white text-neutral-900">Ventes</h1>
                <p className="text-neutral-500 dark:text-neutral-400">
                    Enregistrez chaque ticket ligne par ligne — le dashboard se met à jour en temps réel.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><Wallet className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">CA du jour</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{formatFCFA(todayTotal)}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><ShoppingBasket className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Tickets enregistrés</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{sales.length}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500"><Activity className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">CA cumulé</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{formatFCFA(allTimeTotal)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-6">
                <div>
                    {isLoading ? (
                        <div className="glass-card rounded-3xl p-6 sm:p-8">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Chargement des produits…</p>
                        </div>
                    ) : (
                        <SaleEntryForm
                            products={products}
                            isSubmitting={isSaving}
                            error={saveError}
                            onSubmit={handleSubmit}
                        />
                    )}
                </div>
                <div>
                    {isLoading ? (
                        <div className="glass-card rounded-3xl p-6 sm:p-8">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Chargement des ventes…</p>
                        </div>
                    ) : loadError ? (
                        <div className="glass-card rounded-3xl p-6 sm:p-8">
                            <p role="alert" className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
                        </div>
                    ) : sales.length === 0 ? (
                        <div className="glass-card rounded-3xl p-6 sm:p-8">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Aucune vente enregistrée. Créez votre premier ticket avec le formulaire.
                            </p>
                        </div>
                    ) : (
                        <SalesHistory sales={sales} />
                    )}
                </div>
            </div>
        </div>
    );
}