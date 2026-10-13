"use client";

import { useMemo, useState } from "react";
import { Package, Coins, Percent } from "lucide-react";
import { RecipeCards } from "@/components/recettes/RecipeCards";
import { ProductionPlanner } from "@/components/recettes/ProductionPlanner";
import { INGREDIENTS, RECIPES, formatFCFA, marginPerUnit } from "@/components/recettes/recipe-data";

export default function RecettesPage() {
    const [stocks, setStocks] = useState<Record<string, number>>(
        Object.fromEntries(INGREDIENTS.map((i) => [i.id, i.stockQty]))
    );
    const [recipeId, setRecipeId] = useState(RECIPES[0].id);
    const [quantity, setQuantity] = useState("200");
    const [lastProduction, setLastProduction] = useState<string | null>(null);
    const stats = useMemo(() => {
        const lowStock = INGREDIENTS.filter((i) => (stocks[i.id] ?? 0) <= i.alertThreshold).length;
        const avgMargin = Math.round(
            RECIPES.reduce((sum, r) => sum + (marginPerUnit(r) / r.salePrice) * 100, 0) / RECIPES.length
        );
        const stockValue = INGREDIENTS.reduce((sum, i) => sum + (stocks[i.id] ?? 0) * i.unitPrice, 0);
        return { lowStock, avgMargin, stockValue };
    }, [stocks]);

    function handleProduce() {
        const recipe = RECIPES.find((r) => r.id === recipeId) ?? RECIPES[0];
        const qty = Number(quantity) || 0;
        if (qty <= 0) return;
        setStocks((prev) => {
            const next = { ...prev };
            for (const ri of recipe.ingredients) {
                const used = (ri.quantityPerBatch / ri.batchYield) * qty;
                next[ri.ingredientId] = Math.max(0, (next[ri.ingredientId] ?? 0) - used);
            }
            return next;
        });
        setLastProduction(`${qty} × ${recipe.productName} — ${formatFCFA(qty * recipe.salePrice)} de CA estimé`);
    }

    return (
        <div className="relative min-h-screen w-full px-6 py-10 lg:px-12">
            <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

            <div className="mb-10">
                <p className="text-sm uppercase tracking-[0.2em] text-primary mb-2 font-bold">Étape 3 — Recettes</p>
                <h1 className="text-3xl md:text-4xl font-black mb-2 dark:text-white text-neutral-900">
                    Fiches recettes &amp; stock
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400">Chaque vente décrémente farine, levure, beurre et sucre.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Package className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Ingrédients sous seuil</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{stats.lowStock}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><Percent className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Marge moyenne</p>
                    </div>
                    <p className="text-2xl font-black text-emerald-500">{stats.avgMargin}%</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500"><Coins className="h-6 w-6" /></div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Valeur du stock</p>
                    </div>
                    <p className="text-2xl font-black dark:text-white text-neutral-900">{formatFCFA(stats.stockValue)}</p>
                </div>
            </div>

            <div className="mb-10">
                <h2 className="text-xl font-bold dark:text-white text-neutral-900 mb-4">Fiches recettes</h2>
                <RecipeCards recipes={RECIPES} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
                <ProductionPlanner recipeId={recipeId} onRecipeChange={setRecipeId} quantity={quantity} onQuantityChange={setQuantity} onProduce={handleProduce} />
                <div className="glass-card rounded-3xl p-6 sm:p-8">
                    <h2 className="text-xl font-bold dark:text-white text-neutral-900 mb-2">Stock d’ingrédients</h2>
                    <p className="text-sm text-neutral-500 mb-6">Mis à jour à chaque production lancée.</p>
                    <div className="space-y-3">
                        {INGREDIENTS.map((ing) => {
                            const qty = stocks[ing.id] ?? 0;
                            const low = qty <= ing.alertThreshold;
                            return (
                                <div key={ing.id} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${low ? "border-red-500/30 bg-red-500/5" : "border-neutral-200 dark:border-white/10"}`}>
                                    <div>
                                        <p className="font-bold text-neutral-900 dark:text-white">{ing.name}</p>
                                        <p className="text-xs text-neutral-500">Seuil d’alerte : {ing.alertThreshold} {ing.unit}</p>
                                    </div>
                                    <p className={`font-black ${low ? "text-red-500" : "text-neutral-900 dark:text-white"}`}>
                                        {qty.toFixed(1)} {ing.unit}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                    {lastProduction && (
                        <p className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            Dernière production : {lastProduction}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

