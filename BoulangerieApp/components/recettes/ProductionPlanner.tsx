"use client";

import { CalendarClock, TriangleAlert } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { INGREDIENTS, RECIPES, formatFCFA, ingredientById } from "./recipe-data";

type PlanProps = {
    recipeId: string;
    onRecipeChange: (value: string) => void;
    quantity: string;
    onQuantityChange: (value: string) => void;
    onProduce: () => void;
};

export function ProductionPlanner(props: PlanProps) {
    const recipe = RECIPES.find((r) => r.id === props.recipeId) ?? RECIPES[0];
    const qty = Number(props.quantity) || 0;

    const needs = recipe.ingredients.map((ri) => {
        const ing = ingredientById(ri.ingredientId);
        const required = (ri.quantityPerBatch / ri.batchYield) * qty;
        const missing = Math.max(0, required - ing.stockQty);
        return { ing, required, missing, ok: missing <= 0 };
    });
    const allOk = needs.every((n) => n.ok);
    const revenue = qty * recipe.salePrice;

    return (
        <div className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500"><CalendarClock className="h-6 w-6" /></div>
                <div>
                    <h2 className="text-xl font-bold dark:text-white text-neutral-900">Planifier une production</h2>
                    <p className="text-sm text-neutral-500">Vérifiez le stock avant de lancer la fournée.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Field>
                    <FieldLabel htmlFor="prod-recipe">Produit</FieldLabel>
                    <Select value={props.recipeId} onValueChange={(v) => v && props.onRecipeChange(v)}>
                        <SelectTrigger id="prod-recipe">
                            <SelectValue placeholder="Choisir le produit" />
                        </SelectTrigger>
                        <SelectContent>
                            {RECIPES.map((r) => (
                                <SelectItem key={r.id} value={r.id}>{r.productName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Field>
                    <FieldLabel htmlFor="prod-qty">Quantité à produire</FieldLabel>
                    <Input id="prod-qty" inputMode="numeric" value={props.quantity} onChange={(e) => props.onQuantityChange(e.target.value)} placeholder="200" />
                </Field>
            </div>
            {qty > 0 && (
                <div className="space-y-2 mb-6">
                    {needs.map(({ ing, required, missing, ok }) => (
                        <div key={ing.id} className={`flex items-center justify-between text-sm rounded-xl border px-3 py-2 ${ok ? "border-neutral-200 dark:border-white/10" : "border-red-500/30 bg-red-500/5"}`}>
                            <span className="text-neutral-600 dark:text-neutral-300">
                                {ing.name} — besoin {required.toFixed(2)} {ing.unit} (stock {ing.stockQty} {ing.unit})
                            </span>
                            {ok ? (
                                <span className="font-bold text-emerald-500">OK</span>
                            ) : (
                                <span className="font-bold text-red-500">Manque {missing.toFixed(2)} {ing.unit}</span>
                            )}
                        </div>
                    ))}
                    <p className="text-sm text-neutral-500">Chiffre d’affaires estimé : <span className="font-bold text-neutral-900 dark:text-white">{formatFCFA(revenue)}</span></p>
                </div>
            )}
            {!allOk && qty > 0 && (
                <p className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
                    <TriangleAlert className="h-4 w-4" /> Stock insuffisant : réduisez la quantité ou réapprovisionnez.
                </p>
            )}
            <Button
                type="button"
                onClick={props.onProduce}
                disabled={qty <= 0 || !allOk}
                className="h-11 w-full bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
                Lancer la production ({qty > 0 ? qty : "—"} unités)
            </Button>
            <p className="mt-4 text-xs text-neutral-500">
                Stock actuel : {INGREDIENTS.map((i) => `${i.name} ${i.stockQty} ${i.unit}`).join(" · ")}
            </p>
        </div>
    );
}
