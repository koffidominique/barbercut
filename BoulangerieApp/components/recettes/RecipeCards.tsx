"use client";

import { ChefHat, Flame } from "lucide-react";
import { Recipe, costPerUnit, formatFCFA, ingredientById, marginPerUnit } from "./recipe-data";

export function RecipeCards({ recipes }: { recipes: Recipe[] }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => {
                const cost = costPerUnit(recipe);
                const margin = marginPerUnit(recipe);
                const marginPct = recipe.salePrice > 0 ? Math.round((margin / recipe.salePrice) * 100) : 0;
                return (
                    <div key={recipe.id} className="glass-card rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary"><ChefHat className="h-6 w-6" /></div>
                            <div>
                                <h3 className="text-lg font-bold dark:text-white text-neutral-900">{recipe.productName}</h3>
                                <p className="text-xs text-neutral-500">Prix de vente : {formatFCFA(recipe.salePrice)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span>Cuisson {recipe.bakeTemp} — {recipe.bakeTime}</span>
                        </div>
                        <div className="space-y-2 mb-4">
                            {recipe.ingredients.map((ri) => {
                                const ing = ingredientById(ri.ingredientId);
                                const perUnit = (ri.quantityPerBatch / ri.batchYield).toFixed(3);
                                return (
                                    <div key={ri.ingredientId} className="flex items-center justify-between text-sm rounded-xl border border-neutral-200 dark:border-white/10 px-3 py-2">
                                        <span className="text-neutral-600 dark:text-neutral-300">{ing.name}</span>
                                        <span className="font-semibold text-neutral-900 dark:text-white">{perUnit} {ing.unit}/u</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-neutral-100 dark:bg-white/5 p-3">
                                <p className="text-xs text-neutral-500">Coût / unité</p>
                                <p className="font-black text-neutral-900 dark:text-white">{formatFCFA(cost)}</p>
                            </div>
                            <div className="rounded-xl bg-emerald-500/10 p-3">
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">Marge / unité ({marginPct}%)</p>
                                <p className="font-black text-emerald-600 dark:text-emerald-400">{formatFCFA(margin)}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
